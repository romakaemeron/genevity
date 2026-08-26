"use server";

/**
 * Online appointment booking (Inweb TZ #10 §2) — backed by RoApp.
 *
 * Availability and the specialist/service catalogue come from RoApp's booking
 * API; the confirmed appointment is written into RoApp's calendar and mirrored
 * into `form_submissions` so /admin/forms stays the single inbox for every lead
 * the site produces.
 *
 * Distinct from `booking.ts`, which handles the short name/phone callback CTA.
 * That form remains the fallback whenever RoApp is unreachable — a visitor must
 * always be able to reach the clinic, even if the integration is down.
 */

import { sql } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";
import {
  listEmployees,
  listServicesGrouped,
  listSlots,
  findOrCreatePerson,
  createBooking,
  isRoappConfigured,
  roappBookingPageUrl,
  RoappError,
} from "@/lib/roapp/client";
import { mergeDoctors } from "@/lib/roapp/doctors";
import type { BookingDoctor, BookingSlot } from "@/lib/roapp/types";

/* ── Reads ─────────────────────────────────────────────────────────────── */

export interface DoctorsResult {
  ok: boolean;
  doctors: BookingDoctor[];
  /** Where to send the visitor if we can't serve the wizard ourselves. */
  fallbackUrl?: string;
}

export async function getBookingDoctors(locale: string): Promise<DoctorsResult> {
  try {
    const employees = await listEmployees();
    const doctors = await mergeDoctors(employees, locale);
    return { ok: true, doctors };
  } catch (e) {
    console.error("[appointment] listEmployees failed:", e);
    return { ok: false, doctors: [], fallbackUrl: roappBookingPageUrl() };
  }
}

export interface ServiceOption {
  id: number;
  title: string;
  durationMinutes: number;
  price: number;
  category: string | null;
}

/**
 * Bookable services.
 *
 * `employeeId` is accepted and forwarded, but RoApp ignores it — the same 232
 * services come back for every specialist, and even for an id that doesn't
 * exist (verified against the live account). Services simply aren't linked to
 * employees in this account yet. Pass 0 to ask for the catalogue outright.
 */
export async function getDoctorServices(employeeId: number): Promise<{
  ok: boolean;
  services: ServiceOption[];
}> {
  if (!Number.isInteger(employeeId) || employeeId < 0) {
    return { ok: false, services: [] };
  }
  try {
    const services = await listServicesGrouped(employeeId || undefined);
    return {
      ok: true,
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        durationMinutes: s.durationMinutes,
        price: s.price,
        category: s.categoryTitle,
      })),
    };
  } catch (e) {
    console.error("[appointment] listServices failed:", e);
    return { ok: false, services: [] };
  }
}

export async function getDoctorSlots(
  employeeId: number,
  slotMinutes?: number,
): Promise<{ ok: boolean; slots: BookingSlot[] }> {
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return { ok: false, slots: [] };
  }
  try {
    const slots = await listSlots(employeeId, { periodDays: 31, slotMinutes });
    return {
      ok: true,
      slots: slots.map((s) => ({ start: s.dateStart, end: s.dateEnd })),
    };
  } catch (e) {
    console.error("[appointment] listSlots failed:", e);
    return { ok: false, slots: [] };
  }
}

/* ── Write ─────────────────────────────────────────────────────────────── */

export interface AppointmentInput {
  name: string;
  /** Local subscriber digits; the country code is added server-side. */
  phone: string;
  employeeId: number;
  /** 0 = "not sure yet / needs a consultation". */
  serviceId: number;
  /** ISO UTC instant, must match a currently-free slot. */
  start: string;
  end: string;
  comment: string;
  pageUrl?: string;
  locale?: string;
}

export interface AppointmentResult {
  ok: boolean;
  /** Localized by the caller via the `booking` ui_strings namespace. */
  errorKey?: "name" | "phone" | "slotTaken" | "unavailable" | "generic";
  /** Echoed back so the confirmation screen can show what was booked. */
  bookingId?: number;
}

const NAME_MIN = 2;
const NAME_MAX = 100;
const COMMENT_MAX = 1000;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

function sanitizeName(raw: string): string | null {
  const collapsed = (raw || "").trim().replace(/\s+/g, " ");
  if (collapsed.length < NAME_MIN || collapsed.length > NAME_MAX) return null;
  if (/<[^>]*>/.test(collapsed)) return null;
  if (/\bhttps?:\/\//i.test(collapsed)) return null;
  if (/[\x00-\x1f\x7f]/.test(collapsed)) return null;
  return collapsed;
}

/** → "+380XXXXXXXXX" for RoApp, which stores digits with the country code. */
function sanitizePhone(raw: string): { e164: string; pretty: string } | null {
  const digits = (raw || "").replace(/\D+/g, "");
  if (digits.length < 9 || digits.length > 15) return null;
  let d = digits;
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  if (d.length !== 9) return null;
  return {
    e164: `380${d}`,
    pretty: `+380 (${d.slice(0, 2)}) ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`,
  };
}

function sanitizeText(raw: string | undefined, max: number): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[\x00-\x1f\x7f]/g, "").trim();
  return cleaned ? cleaned.slice(0, max) : null;
}

function sanitizeUrl(raw: string | undefined): string | null {
  const s = (raw || "").trim().slice(0, 500);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString().slice(0, 500) : null;
  } catch {
    return null;
  }
}

/** RoApp has no first/last split on the form, so take the first token as the
 *  given name and the rest as the surname — matching how their own page does it. */
function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.split(" ");
  return parts.length === 1
    ? { firstName: parts[0], lastName: "" }
    : { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function submitAppointment(
  input: AppointmentInput,
): Promise<AppointmentResult> {
  const name = sanitizeName(input.name || "");
  if (!name) return { ok: false, errorKey: "name" };

  const phone = sanitizePhone(input.phone || "");
  if (!phone) return { ok: false, errorKey: "phone" };

  if (!Number.isInteger(input.employeeId) || input.employeeId <= 0) {
    return { ok: false, errorKey: "generic" };
  }
  if (!ISO_INSTANT.test(input.start || "") || !ISO_INSTANT.test(input.end || "")) {
    return { ok: false, errorKey: "generic" };
  }
  // Never write an appointment in the past, whatever the client sends.
  if (new Date(input.start).getTime() < Date.now() - 60_000) {
    return { ok: false, errorKey: "slotTaken" };
  }

  if (!isRoappConfigured()) {
    console.error("[appointment] ROAPP_API_KEY missing — cannot write booking");
    return { ok: false, errorKey: "unavailable" };
  }

  const comment = sanitizeText(input.comment, COMMENT_MAX);
  const pageUrl = sanitizeUrl(input.pageUrl);

  // Re-check the slot immediately before writing. RoApp has no slot locking, so
  // this narrows — but cannot close — the window where two visitors pick the
  // same time. The remaining risk is a double booking the clinic resolves by
  // phone, which is why the confirmation copy never promises a reserved seat.
  try {
    const slots = await listSlots(input.employeeId, {
      startDate: input.start.slice(0, 10),
      periodDays: 7,
    });
    if (!slots.some((s) => s.dateStart === input.start)) {
      return { ok: false, errorKey: "slotTaken" };
    }
  } catch (e) {
    console.error("[appointment] slot re-check failed:", e);
    return { ok: false, errorKey: "unavailable" };
  }

  // Resolve the service for the comment; a missing one is not fatal.
  let serviceTitle: string | null = null;
  if (Number.isInteger(input.serviceId) && input.serviceId > 0) {
    try {
      const { services } = await getDoctorServices(input.employeeId);
      serviceTitle = services.find((s) => s.id === input.serviceId)?.title ?? null;
    } catch {
      serviceTitle = null;
    }
  }

  let bookingId: number;
  let clientId: number;
  try {
    const { firstName, lastName } = splitName(name);
    clientId = await findOrCreatePerson({ firstName, lastName, phone: phone.e164 });
    const roappComment = [
      serviceTitle ? `Послуга: ${serviceTitle}` : "Потрібна консультація",
      comment ? `Коментар: ${comment}` : null,
      "Джерело: онлайн-запис на genevity.com.ua",
    ]
      .filter(Boolean)
      .join("\n");
    ({ bookingId } = await createBooking({
      employeeId: input.employeeId,
      clientId,
      start: input.start,
      end: input.end,
      comment: roappComment,
    }));
  } catch (e) {
    console.error("[appointment] RoApp write failed:", e);
    return {
      ok: false,
      errorKey: e instanceof RoappError && e.status === 409 ? "slotTaken" : "unavailable",
    };
  }

  // Mirror into our own inbox. A failure here must not lose the appointment —
  // it already exists in RoApp, which is the system the clinic actually works
  // from — so it's logged and swallowed.
  try {
    await sql`
      INSERT INTO form_submissions (
        form_type, name, phone, message, direction, preferred_time,
        page_url, status, form_label
      ) VALUES (
        'appointment', ${name}, ${phone.pretty}, ${comment},
        ${serviceTitle}, ${input.start},
        ${pageUrl}, 'new', ${`Онлайн-запис (RoApp #${bookingId})`}
      )
    `;
  } catch (e) {
    console.error("[appointment] form_submissions mirror failed:", e);
  }

  await notifyAdmin({
    name,
    phone: phone.pretty,
    serviceTitle,
    start: input.start,
    comment,
    bookingId,
    locale: input.locale,
  });

  return { ok: true, bookingId };
}

async function notifyAdmin(s: {
  name: string;
  phone: string;
  serviceTitle: string | null;
  start: string;
  comment: string | null;
  bookingId: number;
  locale?: string;
}) {
  const kyiv = (iso: string) =>
    new Date(iso).toLocaleString("uk-UA", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv",
    });
  const missing = "— не вказано";
  const rows: { label: string; value: string; mono?: boolean; dim?: boolean }[] = [
    { label: "Час візиту", value: kyiv(s.start) },
    { label: "Ім'я клієнта", value: s.name },
    { label: "Телефон клієнта", value: s.phone, mono: true },
    { label: "Послуга", value: s.serviceTitle || "Потрібна консультація", dim: !s.serviceTitle },
    { label: "Коментар", value: s.comment || missing, dim: !s.comment },
    { label: "Запис у RoApp", value: `#${s.bookingId}`, mono: true },
    { label: "Клініка", value: "GENEVITY" },
  ];
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n\n");
  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; color: #2A2520; margin: 0 0 8px; font-size: 22px;">Онлайн-запис на прийом</h2>
      <p style="margin: 0 0 16px; font-size: 13px; color: #6b6b6b;">
        Запис уже створено в RoApp — підтвердьте його дзвінком пацієнту.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5;">
        ${rows.map((r) => `
          <tr>
            <td style="padding: 10px 12px; background: #F0EDE7; width: 170px; color: #6b6b6b; vertical-align: top; border-top: 1px solid #E5E0D8;">${escapeHtml(r.label)}</td>
            <td style="padding: 10px 12px; background: #FAF9F6; color: ${r.dim ? "#9A9A9A; font-style: italic;" : "#2A2520;"} vertical-align: top; border-top: 1px solid #E5E0D8; ${r.mono ? "font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px;" : ""} white-space: pre-wrap; word-break: break-word;">${escapeHtml(r.value)}</td>
          </tr>`).join("")}
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        GENEVITY · надіслано з сайту${s.locale ? ` · мова: ${escapeHtml(s.locale)}` : ""}
      </p>
    </div>`;
  const result = await sendEmail({
    to: "helyos1nfo@outlook.com",
    subject: `Genevity — Онлайн-запис — ${s.name}`,
    html,
    text,
  });
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
