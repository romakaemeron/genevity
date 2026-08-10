"use server";

/* ─────────────────────────────────────────────────────────────────────────
 * DORMANT — NOT ROUTED. Built for Inweb TZ #10 §2 (online appointment form),
 * then parked at the client's request pending a decision on how automated
 * booking should work. Nothing imports this: the /booking route was removed
 * and the nav link with it, so the site behaves exactly as before (the short
 * name/phone CTA form in BookingCTA/BookingForm is the live path).
 *
 * To re-enable: recreate src/app/[locale]/(pages)/booking/page.tsx rendering
 * BookingPage, re-add the `booking` entry to navConfig, and re-insert the
 * `booking` row in static_pages (see git history for all three).
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Server actions for the step-by-step online appointment form (TZ #10 §2).
 *
 * Deliberately separate from `booking.ts` (the short name/phone CTA form):
 * this one carries a specialist, a service, a requested date and time and an
 * optional comment. Both land in `form_submissions` so /admin/forms stays the
 * single inbox, distinguished by `form_type`.
 *
 * There is no practitioner-calendar integration, so a submission is a
 * *request*, not a confirmed slot — the administrator calls back to confirm.
 * The UI states this; don't change the copy without changing that fact.
 */

import { sql } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";

export interface AppointmentDoctor {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  photoFocalPoint: string;
  /** Service ids this doctor performs — drives the service step. */
  serviceIds: string[];
}

export interface AppointmentService {
  id: string;
  slug: string;
  title: string;
  category: string;
  priceFrom: string | null;
}

export interface AppointmentOptions {
  doctors: AppointmentDoctor[];
  services: AppointmentService[];
}

function lang(locale: string) { return locale === "ua" ? "uk" : locale; }
function pick(row: Record<string, unknown>, field: string, l: string): string {
  const v = (row[`${field}_${l}`] ?? row[`${field}_uk`]) as string | null;
  return v || "";
}

/** Published doctors + all services, with the doctor→service links that let
 *  the wizard narrow the service list once a specialist is chosen. */
export async function listAppointmentOptions(locale: string): Promise<AppointmentOptions> {
  const l = lang(locale);
  const [doctorRows, serviceRows, linkRows] = await Promise.all([
    sql`
      SELECT id, name_uk, name_ru, name_en, role_uk, role_ru, role_en,
             photo_circle, photo_card, circle_focal_point, card_position
      FROM doctors
      WHERE is_published = true
      ORDER BY sort_order
    `,
    sql`
      SELECT s.id, s.slug,
             s.title_uk, s.title_ru, s.title_en,
             s.price_from_uk, s.price_from_ru, s.price_from_en,
             c.title_uk AS cat_title_uk, c.title_ru AS cat_title_ru, c.title_en AS cat_title_en
      FROM services s
      JOIN service_categories c ON c.id = s.category_id
      ORDER BY c.sort_order, s.sort_order
    `,
    sql`SELECT doctor_id, service_id FROM service_doctors`,
  ]);

  const byDoctor = new Map<string, string[]>();
  for (const r of linkRows) {
    const key = r.doctor_id as string;
    const list = byDoctor.get(key) ?? [];
    list.push(r.service_id as string);
    byDoctor.set(key, list);
  }

  return {
    doctors: doctorRows.map((r) => ({
      id: r.id as string,
      name: pick(r, "name", l),
      role: pick(r, "role", l),
      photo: (r.photo_circle as string | null) || (r.photo_card as string | null) || null,
      photoFocalPoint:
        (r.circle_focal_point as string | null) || (r.card_position as string | null) || "50% 50%",
      serviceIds: byDoctor.get(r.id as string) ?? [],
    })),
    services: serviceRows.map((r) => ({
      id: r.id as string,
      slug: r.slug as string,
      title: pick(r, "title", l),
      category: pick(r, "cat_title", l),
      priceFrom: pick(r, "price_from", l) || null,
    })),
  };
}

export interface AppointmentInput {
  name: string;
  phone: string;
  /** Empty string = "any available specialist". */
  doctorId: string;
  doctorName: string;
  /** Empty string = "not sure yet / needs a consultation". */
  serviceId: string;
  serviceName: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  time: string;
  comment: string;
  pageUrl?: string;
  locale?: string;
}

export interface AppointmentResult {
  ok: boolean;
  errorKey?: "name" | "phone" | "generic";
}

/* ── Sanitizers ─────────────────────────────────────────────────────────
 *  DB writes are parameterized, so this is about input *shape* — we don't
 *  want junk in the admin inbox or the notification email. */

const NAME_MIN = 2;
const NAME_MAX = 100;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const COMMENT_MAX = 1000;

function sanitizeName(raw: string): string | null {
  const collapsed = (raw || "").trim().replace(/\s+/g, " ");
  if (collapsed.length < NAME_MIN || collapsed.length > NAME_MAX) return null;
  if (/<[^>]*>/.test(collapsed)) return null;
  if (/\bhttps?:\/\//i.test(collapsed)) return null;
  if (/[\x00-\x1f\x7f]/.test(collapsed)) return null;
  return collapsed;
}

function sanitizePhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D+/g, "");
  if (digits.length < 9 || digits.length > 15) return null;
  if (digits.startsWith("380")) {
    let d = digits.slice(3);
    if (d.startsWith("0") && d.length === 10) d = d.slice(1);
    if (d.length !== 9) return null;
    return `+380 (${d.slice(0, 2)}) ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
  }
  return `+${digits}`;
}

function sanitizeText(raw: string | undefined | null, max: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, "").trim();
  if (!cleaned) return null;
  return cleaned.slice(0, max);
}

function sanitizeUrl(raw: string | undefined): string | null {
  const s = (raw || "").trim().slice(0, 500);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString().slice(0, 500);
  } catch {
    return null;
  }
}

export async function submitAppointment(input: AppointmentInput): Promise<AppointmentResult> {
  const name = sanitizeName(input.name || "");
  if (!name) return { ok: false, errorKey: "name" };

  const phone = sanitizePhone(input.phone || "");
  if (!phone) return { ok: false, errorKey: "phone" };

  // Ids are only trusted after a shape check *and* a DB lookup — the labels
  // that reach the admin come from the DB, never from the client payload.
  const doctorId = UUID.test(input.doctorId || "") ? input.doctorId : null;
  const serviceId = UUID.test(input.serviceId || "") ? input.serviceId : null;

  const [doctorRows, serviceRows] = await Promise.all([
    doctorId
      ? sql`SELECT name_uk FROM doctors WHERE id = ${doctorId} AND is_published = true LIMIT 1`
      : Promise.resolve([]),
    serviceId
      ? sql`SELECT id, title_uk FROM services WHERE id = ${serviceId} LIMIT 1`
      : Promise.resolve([]),
  ]);
  const doctorName = (doctorRows[0]?.name_uk as string | undefined) ?? null;
  const resolvedServiceId = (serviceRows[0]?.id as string | undefined) ?? null;
  const serviceName = (serviceRows[0]?.title_uk as string | undefined) ?? null;

  const date = DATE_RE.test(input.date || "") ? input.date : null;
  const time = TIME_RE.test(input.time || "") ? input.time : null;
  const preferredTime = date && time ? `${date} ${time}` : date || null;

  const comment = sanitizeText(input.comment, COMMENT_MAX);
  const pageUrl = sanitizeUrl(input.pageUrl);

  // `direction` mirrors the booking form's "Цікавиться" column so both form
  // types read the same way in the admin list.
  const direction = [serviceName, doctorName].filter(Boolean).join(" · ") || null;

  try {
    await sql`
      INSERT INTO form_submissions (
        form_type, name, phone, message, direction, preferred_time,
        page_url, service_id, status, form_label
      ) VALUES (
        'appointment', ${name}, ${phone}, ${comment}, ${direction}, ${preferredTime},
        ${pageUrl}, ${resolvedServiceId}, 'new', 'Онлайн-запис на прийом'
      )
    `;
  } catch (err) {
    console.error("[appointment] insert failed:", err);
    return { ok: false, errorKey: "generic" };
  }

  await notifyAdmin({
    name, phone, doctorName, serviceName, date, time, comment, pageUrl,
    locale: input.locale,
  });

  return { ok: true };
}

async function notifyAdmin(s: {
  name: string;
  phone: string;
  doctorName: string | null;
  serviceName: string | null;
  date: string | null;
  time: string | null;
  comment: string | null;
  pageUrl: string | null;
  locale?: string;
}) {
  const to = "helyos1nfo@outlook.com";
  const subject = `Genevity — Онлайн-запис — ${s.name}`;
  const dateKyiv = new Date().toLocaleString("uk-UA", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv",
  });
  const missing = "— не вказано";
  const anySpecialist = "Будь-який спеціаліст";
  const needsConsult = "Потрібна консультація";

  const rows: Array<{ label: string; value: string; mono?: boolean; dim?: boolean }> = [
    { label: "Дата заявки",     value: dateKyiv },
    { label: "Ім'я клієнта",    value: s.name },
    { label: "Телефон клієнта", value: s.phone, mono: true },
    { label: "Спеціаліст",      value: s.doctorName || anySpecialist, dim: !s.doctorName },
    { label: "Послуга",         value: s.serviceName || needsConsult, dim: !s.serviceName },
    {
      label: "Бажаний час",
      value: s.date ? `${s.date}${s.time ? ` о ${s.time}` : ""}` : missing,
      dim: !s.date,
    },
    { label: "Коментар",        value: s.comment || missing, dim: !s.comment },
    { label: "Сторінка",        value: s.pageUrl || missing, dim: !s.pageUrl },
    { label: "Клініка",         value: "GENEVITY" },
  ];

  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n\n");
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; color: #2A2520; margin: 0 0 8px; font-size: 22px;">Онлайн-запис на прийом</h2>
      <p style="margin: 0 0 16px; font-size: 13px; color: #6b6b6b;">
        Час обраний пацієнтом і потребує підтвердження — зателефонуйте, щоб узгодити візит.
      </p>
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
  if (!result.ok) console.warn("[appointment] email notify failed:", result.reason);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
