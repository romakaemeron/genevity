"use server";

/**
 * Server actions for the site-wide booking form (name / phone / interest).
 * Submissions land in `form_submissions` so they show up in the admin
 * portal at /admin/forms, and a notification email fires to
 * BOOKING_NOTIFY_EMAIL (when configured) via Resend.
 */

import { sql } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";

export interface BookingOption {
  /** Stable key persisted as `direction` on form_submissions, e.g.
   *  `service:botulinum-therapy` / `doctor:olena-fedorenko`. */
  value: string;
  /** Visible label (localized). */
  label: string;
  /** Secondary label — service category / doctor role. */
  sub?: string;
  /** "service" | "doctor" — used to group in the dropdown. */
  group: "service" | "doctor";
  /** Only for services — links the DB row when present. */
  serviceId?: string;
  /** Optional thumbnail shown on the right side of the dropdown row.
   *  Used for doctor photos so admins can match faces, not just names. */
  rightImage?: string | null;
  /** Focal point (object-position) applied to `rightImage`. */
  rightImageFocalPoint?: string;
  /** Zoom factor applied to `rightImage` — ≥ 1 crops tighter on the
   *  focal point, useful for faces inside a 36 px circle. */
  rightImageScale?: number;
  /** Optional short text on the right side of a row (currency, etc.). */
  rightText?: string;
}

export interface BookingOptions {
  services: BookingOption[];
  doctors: BookingOption[];
}

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: Record<string, unknown>, field: string, l: string): string {
  const v = (row[`${field}_${l}`] ?? row[`${field}_uk`]) as string | null;
  return v || "";
}

export async function listBookingOptions(locale: string): Promise<BookingOptions> {
  const l = lang(locale);
  const [serviceRows, doctorRows] = await Promise.all([
    sql`
      SELECT s.id, s.slug,
             s.title_uk, s.title_ru, s.title_en,
             s.price_from_uk, s.price_from_ru, s.price_from_en,
             c.slug  AS cat_slug,
             c.title_uk AS cat_title_uk, c.title_ru AS cat_title_ru, c.title_en AS cat_title_en
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      ORDER BY c.sort_order, s.sort_order
    `,
    sql`
      SELECT id, slug,
             photo_card, photo_circle, card_position, circle_focal_point, circle_scale,
             name_uk, name_ru, name_en, role_uk, role_ru, role_en
      FROM doctors
      ORDER BY sort_order
    `,
  ]);

  const services: BookingOption[] = serviceRows.map((r) => ({
    value: `service:${r.slug}`,
    label: pick(r, "title", l),
    sub: pick(r, "cat_title", l),
    group: "service",
    serviceId: r.id as string,
    rightText: pick(r, "price_from", l) || undefined,
  }));
  const doctors: BookingOption[] = doctorRows.map((r) => {
    // Circle photo takes precedence; fall back to the main card photo
    // if the admin hasn't uploaded a dedicated circle crop yet.
    const circleUrl = (r.photo_circle as string | null) || (r.photo_card as string | null) || null;
    const focal = (r.circle_focal_point as string | null) || (r.card_position as string | null) || "50% 50%";
    const rawScale = r.circle_scale;
    const scale = typeof rawScale === "number"
      ? rawScale
      : typeof rawScale === "string" ? parseFloat(rawScale) : NaN;
    return {
      // Prefer slug for a human-readable `direction` string on the admin
      // portal, but fall back to the DB id so doctors without a slug still
      // produce unique combobox keys (React crashes on duplicate keys).
      value: `doctor:${r.slug || r.id}`,
      label: pick(r, "name", l),
      sub: pick(r, "role", l) || undefined,
      group: "doctor" as const,
      rightImage: circleUrl,
      rightImageFocalPoint: focal,
      rightImageScale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    };
  });

  return { services, doctors };
}

export interface BookingSubmissionInput {
  name: string;
  phone: string;
  /** Array of BookingOption.value entries — multi-select. Empty array is
   *  fine (visitor didn't pick anything specific). */
  interestValues: string[];
  /** Visible labels captured at submit time, in the same order as
   *  interestValues. We persist these joined with " · " into
   *  form_submissions.direction so the admin sees exactly what the
   *  visitor picked even if slugs later change. */
  interestLabels: string[];
  pageUrl?: string;
  /** Analytics context captured at submit time for lead attribution. */
  pageTitle?: string;
  referrer?: string;
  ctaKey?: string;
  ctaLabel?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  locale?: string;
}

export interface BookingSubmissionResult {
  ok: boolean;
  /** Error key that the form UI maps to a localized message via ui_strings. */
  errorKey?: "name" | "phone" | "generic";
}

/* ── Server-side sanitizers ────────────────────────────────────────
 *  DB writes are already parameterized (postgres tagged-template `${…}`
 *  never concatenates strings) so SQL injection isn't possible here —
 *  these checks focus on *input shape* (lengths, formats, slug safety)
 *  so we don't persist obvious garbage or create future XSS risk in
 *  email/admin renders. */

const NAME_MIN = 2;
const NAME_MAX = 100;
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 15;
const INTEREST_VALUE_PATTERN = /^(service|doctor):[a-zA-Z0-9-]{1,100}$/;
const INTEREST_LABEL_MAX = 200;
const MAX_INTERESTS = 20;

function sanitizeName(raw: string): string | null {
  const collapsed = (raw || "").trim().replace(/\s+/g, " ");
  if (collapsed.length < NAME_MIN || collapsed.length > NAME_MAX) return null;
  if (/<[^>]*>/.test(collapsed)) return null;        // no HTML tags
  if (/\bhttps?:\/\//i.test(collapsed)) return null;  // no URLs (spam lead smell)
  if (/[\x00-\x1f\x7f]/.test(collapsed)) return null; // no control chars
  return collapsed;
}

function sanitizePhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D+/g, "");
  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) return null;
  // Ukrainian path: strip +380 country prefix and a single leading "0"
  // (the trunk-dialing digit) so we arrive at the 9 subscriber digits
  // and can re-emit them in the canonical mask. Non-UA numbers fall
  // through to the generic `+digits` form.
  if (digits.startsWith("380")) {
    let d = digits.slice(3);
    if (d.startsWith("0") && d.length === 10) d = d.slice(1);
    if (d.length !== 9) return null;
    return `+380 (${d.slice(0, 2)}) ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
  }
  return `+${digits}`;
}

function sanitizeInterestValues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (!INTEREST_VALUE_PATTERN.test(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_INTERESTS) break;
  }
  return out;
}

function sanitizeInterestLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const trimmed = v.trim().replace(/[\x00-\x1f\x7f]/g, "");
    if (!trimmed) continue;
    out.push(trimmed.slice(0, INTEREST_LABEL_MAX));
    if (out.length >= MAX_INTERESTS) break;
  }
  return out;
}

function sanitizePageUrl(raw: string | undefined): string {
  const s = (raw || "").trim().slice(0, 500);
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.toString().slice(0, 500);
  } catch {
    return "";
  }
}

/** Generic short-string sanitizer for analytics text fields — trim,
 *  strip control characters, cap length. Empty / missing returns null
 *  so we never insert blank strings into the DB. */
function sanitizeShortText(raw: string | undefined | null, max: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!cleaned) return null;
  return cleaned.slice(0, max);
}

export async function submitBookingForm(input: BookingSubmissionInput): Promise<BookingSubmissionResult> {
  const name = sanitizeName(input.name || "");
  if (!name) return { ok: false, errorKey: "name" };

  const phone = sanitizePhone(input.phone || "");
  if (!phone) return { ok: false, errorKey: "phone" };

  const interestValues = sanitizeInterestValues(input.interestValues);
  const interestLabels = sanitizeInterestLabels(input.interestLabels);
  const joinedLabel = interestLabels.join(" · ");
  const pageUrl = sanitizePageUrl(input.pageUrl);
  const pageTitle = sanitizeShortText(input.pageTitle, 300);
  const referrer = sanitizePageUrl(input.referrer) || null;
  const formLabel = sanitizeShortText(input.ctaLabel, 120);
  const utmSource = sanitizeShortText(input.utmSource, 200);
  const utmMedium = sanitizeShortText(input.utmMedium, 200);
  const utmCampaign = sanitizeShortText(input.utmCampaign, 200);
  const utmTerm = sanitizeShortText(input.utmTerm, 200);
  const utmContent = sanitizeShortText(input.utmContent, 200);

  // Map the first service:<slug> back to a services.id so the admin list
  // can link through to the related service. If the visitor picked only
  // doctors, service_id stays null.
  let serviceId: string | null = null;
  const firstService = interestValues.find((v) => v.startsWith("service:"));
  if (firstService) {
    const slug = firstService.slice("service:".length);
    const rows = await sql`SELECT id FROM services WHERE slug = ${slug} LIMIT 1`;
    if (rows[0]) serviceId = rows[0].id as string;
  }

  try {
    await sql`
      INSERT INTO form_submissions (
        form_type, name, phone, direction, page_url, service_id, status,
        form_label, page_title, referrer,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content
      )
      VALUES (
        'consultation', ${name}, ${phone}, ${joinedLabel || null}, ${pageUrl || null}, ${serviceId}, 'new',
        ${formLabel}, ${pageTitle}, ${referrer},
        ${utmSource}, ${utmMedium}, ${utmCampaign}, ${utmTerm}, ${utmContent}
      )
    `;
  } catch (err) {
    console.error("[booking] insert failed:", err);
    return { ok: false, errorKey: "generic" };
  }

  void notifyAdmin({
    name, phone, interestLabel: joinedLabel, pageUrl, pageTitle,
    referrer, formLabel, locale: input.locale,
    utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
  });

  return { ok: true };
}

async function notifyAdmin(s: {
  name: string;
  phone: string;
  interestLabel: string;
  pageUrl: string;
  pageTitle: string | null;
  referrer: string | null;
  formLabel: string | null;
  locale?: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}) {
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  if (!to) return;

  const subject = `Нова заявка — ${s.name}`;
  const dateKyiv = new Date().toLocaleString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  });
  const missing = "— не вказано";

  // Every field is rendered regardless of value so ops can tell a
  // missing UTM apart from a genuinely-empty one — the visual
  // distinction is the italic "— не вказано" placeholder.
  const rows: Array<{ label: string; value: string; mono?: boolean; dim?: boolean }> = [
    { label: "Дата",             value: dateKyiv },
    { label: "Ім'я клієнта",     value: s.name },
    { label: "Телефон клієнта",  value: s.phone, mono: true },
    { label: "Спеціальність",    value: s.interestLabel || missing, dim: !s.interestLabel },
    { label: "Клініка",          value: "GENEVITY" },
    { label: "Сторінка",         value: s.pageTitle ? `${s.pageTitle}\n${s.pageUrl}` : (s.pageUrl || missing), dim: !s.pageUrl },
    { label: "Форма",            value: s.formLabel || missing, dim: !s.formLabel },
    { label: "Джерело переходу", value: s.referrer || missing, dim: !s.referrer },
    { label: "utm_source",       value: s.utmSource || missing, mono: true, dim: !s.utmSource },
    { label: "utm_medium",       value: s.utmMedium || missing, mono: true, dim: !s.utmMedium },
    { label: "utm_campaign",     value: s.utmCampaign || missing, mono: true, dim: !s.utmCampaign },
    { label: "utm_term",         value: s.utmTerm || missing, mono: true, dim: !s.utmTerm },
    { label: "utm_content",      value: s.utmContent || missing, mono: true, dim: !s.utmContent },
  ];
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n\n");
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; color: #2A2520; margin: 0 0 16px; font-size: 22px;">Нова заявка</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
        ${rows.map((r) => `
          <tr>
            <td style="padding: 10px 12px; background: #F0EDE7; width: 170px; color: #6b6b6b; vertical-align: top; border-top: 1px solid #E5E0D8;">${escapeHtml(r.label)}</td>
            <td style="padding: 10px 12px; background: #FAF9F6; color: ${r.dim ? "#9A9A9A; font-style: italic;" : "#2A2520;"} vertical-align: top; border-top: 1px solid #E5E0D8; ${r.mono ? "font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px;" : ""} white-space: pre-wrap; word-break: break-word;">${escapeHtml(r.value)}</td>
          </tr>
        `).join("")}
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        GENEVITY · надіслано з сайту${s.locale ? ` · мова: ${escapeHtml(s.locale)}` : ""}
      </p>
    </div>
  `;

  const result = await sendEmail({ to, subject, html, text });
  if (!result.ok) {
    console.warn("[booking] email notify failed:", result.reason);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
