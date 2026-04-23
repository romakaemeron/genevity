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
             c.slug  AS cat_slug,
             c.title_uk AS cat_title_uk, c.title_ru AS cat_title_ru, c.title_en AS cat_title_en
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      ORDER BY c.sort_order, s.sort_order
    `,
    sql`
      SELECT id, slug, name_uk, name_ru, name_en, role_uk, role_ru, role_en
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
  }));
  const doctors: BookingOption[] = doctorRows.map((r) => ({
    // Prefer slug for a human-readable `direction` string on the admin
    // portal, but fall back to the DB id so doctors without a slug still
    // produce unique combobox keys (React crashes on duplicate keys).
    value: `doctor:${r.slug || r.id}`,
    label: pick(r, "name", l),
    sub: pick(r, "role", l) || undefined,
    group: "doctor",
  }));

  return { services, doctors };
}

export interface BookingSubmissionInput {
  name: string;
  phone: string;
  /** Either a value from BookingOption.value or the empty string. */
  interestValue: string;
  /** Visible label captured at submit time so the admin sees exactly what
   *  the user picked even if the slug later changes. */
  interestLabel: string;
  pageUrl?: string;
  locale?: string;
}

export interface BookingSubmissionResult {
  ok: boolean;
  /** Error key that the form UI maps to a localized message via ui_strings. */
  errorKey?: "name" | "phone" | "generic";
}

/** Bare-minimum Ukrainian / international phone sanity check — strips
 *  non-digits then requires 9+ digits. We don't reject legitimate numbers
 *  for a ~10% validation win; the clinic can always ignore junk leads. */
function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D+/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export async function submitBookingForm(input: BookingSubmissionInput): Promise<BookingSubmissionResult> {
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();
  if (!name) return { ok: false, errorKey: "name" };
  if (!isValidPhone(phone)) return { ok: false, errorKey: "phone" };

  const interestValue = (input.interestValue || "").trim();
  const interestLabel = (input.interestLabel || "").trim();
  const pageUrl = (input.pageUrl || "").slice(0, 500);

  // Map service:<slug> back to a services.id so the admin can click through
  // to the related service (doctors don't have an FK target on this table).
  let serviceId: string | null = null;
  if (interestValue.startsWith("service:")) {
    const slug = interestValue.slice("service:".length);
    const rows = await sql`SELECT id FROM services WHERE slug = ${slug} LIMIT 1`;
    if (rows[0]) serviceId = rows[0].id as string;
  }

  try {
    await sql`
      INSERT INTO form_submissions (form_type, name, phone, direction, page_url, service_id, status)
      VALUES ('consultation', ${name}, ${phone}, ${interestLabel || null}, ${pageUrl || null}, ${serviceId}, 'new')
    `;
  } catch (err) {
    console.error("[booking] insert failed:", err);
    return { ok: false, errorKey: "generic" };
  }

  // Fire-and-forget notification. Errors are swallowed (the submission is
  // already in the DB) but surfaced to server logs for ops visibility.
  void notifyAdmin({ name, phone, interestLabel, pageUrl, locale: input.locale });

  return { ok: true };
}

async function notifyAdmin(s: {
  name: string;
  phone: string;
  interestLabel: string;
  pageUrl: string;
  locale?: string;
}) {
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  if (!to) return;

  const subject = `New booking request — ${s.name}`;
  const rows = [
    { label: "Name", value: s.name },
    { label: "Phone", value: s.phone },
    { label: "Interested in", value: s.interestLabel || "— (no preference)" },
    { label: "Page", value: s.pageUrl || "—" },
    { label: "Locale", value: s.locale || "—" },
  ];
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; color: #2A2520; margin: 0 0 16px;">New booking request</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${rows.map((r) => `
          <tr>
            <td style="padding: 10px 12px; background: #F0EDE7; width: 140px; color: #6b6b6b; vertical-align: top;">${r.label}</td>
            <td style="padding: 10px 12px; background: #FAF9F6; color: #2A2520;">${escapeHtml(r.value)}</td>
          </tr>
        `).join("")}
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        GENEVITY · submitted via the site booking form
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
