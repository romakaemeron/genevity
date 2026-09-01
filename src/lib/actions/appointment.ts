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
import { getSiteSettingsData } from "@/lib/db/queries/homepage";
import { sendEmail } from "@/lib/email";
import { sendTelegram, escapeHtml as tgEscape } from "@/lib/telegram";
import { sendWhatsAppTemplate, type WhatsAppOutcome } from "@/lib/whatsapp";
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
  /** Patient consented to a WhatsApp confirmation. Unticked by default. */
  whatsappOptIn?: boolean;
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

/** The clinic's address for the patient's message, from the CMS so it can't
 *  drift from the address shown everywhere else on the site. */
async function clinicAddress(locale: string): Promise<string> {
  try {
    const settings = await getSiteSettingsData(locale);
    return settings.address || "м. Дніпро, вул. Олеся Гончара, 12";
  } catch {
    return "м. Дніпро, вул. Олеся Гончара, 12";
  }
}

/** The approved Meta template. Its text lives in docs/whatsapp-setup.md. */
const WA_TEMPLATE = process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation";

/** Locales the template is approved in; anything else falls back to Ukrainian. */
const WA_LANGUAGES: Record<string, string> = { ua: "uk", ru: "ru", en: "en" };

/** "11 серпня 2026, 14:00" — the clinic reads Kyiv time, RoApp stores UTC. */
function kyivDateTime(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv",
  });
}

/** "+380 67 123 45 67" — spaced, no brackets, so Telegram's clients recognise
 *  it as a phone number and make it tappable-to-call. The bracketed `pretty`
 *  form used in email and the admin portal defeats that detection. */
function telegramPhone(e164: string): string {
  const d = e164.replace(/\D+/g, "");
  if (d.length !== 12 || !d.startsWith("380")) return `+${d}`;
  const n = d.slice(3);
  return `+380 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7, 9)}`;
}

/** RoApp's name for a specialist. Best-effort: the notification is more useful
 *  with it, but never worth failing a booking over. */
async function doctorNameOf(employeeId: number): Promise<string | null> {
  try {
    const employees = await listEmployees();
    return employees.find((e) => e.id === employeeId)?.name ?? null;
  } catch {
    return null;
  }
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
    await notifyBookingFailure({
      name,
      phone: telegramPhone(phone.e164),
      start: input.start,
      reason: "Обраний час уже минув (застаріла сторінка)",
    });
    return { ok: false, errorKey: "slotTaken" };
  }

  if (!isRoappConfigured()) {
    console.error("[appointment] ROAPP_API_KEY missing — cannot write booking");
    await notifyBookingFailure({
      name,
      phone: telegramPhone(phone.e164),
      start: input.start,
      reason: "Інтеграцію з RoApp не налаштовано (немає ROAPP_API_KEY)",
    });
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
      await notifyBookingFailure({
        name,
        phone: telegramPhone(phone.e164),
        start: input.start,
        reason: "Слот зайняли, поки пацієнт заповнював форму",
      });
      return { ok: false, errorKey: "slotTaken" };
    }
  } catch (e) {
    console.error("[appointment] slot re-check failed:", e);
    await notifyBookingFailure({
      name,
      phone: telegramPhone(phone.e164),
      start: input.start,
      reason: "RoApp не відповів на перевірку вільного часу",
    });
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
    await notifyBookingFailure({
      name,
      phone: telegramPhone(phone.e164),
      start: input.start,
      reason: "RoApp відхилив запис",
    });
    return {
      ok: false,
      errorKey: e instanceof RoappError && e.status === 409 ? "slotTaken" : "unavailable",
    };
  }

  // Confirm to the patient. Runs before the clinic's own notifications so the
  // Telegram alert can carry the outcome — "no WhatsApp, phone them" is an
  // instruction the front desk acts on, and it's useless an hour later. The
  // booking is already written, so nothing here can cost the appointment; the
  // 6s cap in the client bounds what the visitor waits for.
  const doctorName = await doctorNameOf(input.employeeId);
  let whatsapp: WhatsAppOutcome = "skipped";
  if (input.whatsappOptIn) {
    const address = await clinicAddress(input.locale ?? "ua");
    const res = await sendWhatsAppTemplate({
      to: phone.e164,
      template: WA_TEMPLATE,
      language: WA_LANGUAGES[input.locale ?? "ua"] ?? "uk",
      bodyParams: [
        name,
        kyivDateTime(input.start),
        doctorName ?? "—",
        serviceTitle ?? "Консультація",
        address,
      ],
    });
    whatsapp = res.outcome;
    if (res.outcome !== "sent") {
      console.warn(`[appointment] whatsapp ${res.outcome}:`, res.reason);
    }
  }

  // Mirror into our own inbox. A failure here must not lose the appointment —
  // it already exists in RoApp, which is the system the clinic actually works
  // from — so it's logged and swallowed.
  try {
    await sql`
      INSERT INTO form_submissions (
        form_type, name, phone, message, direction, preferred_time,
        page_url, status, form_label, whatsapp_opt_in, whatsapp_status
      ) VALUES (
        'appointment', ${name}, ${phone.pretty}, ${comment},
        ${serviceTitle}, ${input.start},
        ${pageUrl}, 'new', ${`Онлайн-запис (RoApp #${bookingId})`},
        ${Boolean(input.whatsappOptIn)}, ${whatsapp}
      )
    `;
  } catch (e) {
    console.error("[appointment] form_submissions mirror failed:", e);
  }

  // Both notifications run after the write, so neither can lose an appointment;
  // allSettled keeps a failing channel from suppressing the other one.
  await Promise.allSettled([
    notifyAdmin({
      name,
      phone: phone.pretty,
      serviceTitle,
      start: input.start,
      comment,
      bookingId,
      locale: input.locale,
    }),
    notifyTelegram({
      name,
      phone: telegramPhone(phone.e164),
      doctorName,
      serviceTitle,
      start: input.start,
      comment,
      bookingId,
      whatsapp,
    }),
  ]);

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

/* ── Telegram ──────────────────────────────────────────────────────────── */

/**
 * What the front desk should do about the patient's WhatsApp confirmation.
 *
 * Phrased as an instruction rather than a status: "unreachable" is a patient to
 * phone, "failed" is an integration to fix, and the person reading the alert
 * only cares about the first.
 */
const WHATSAPP_NOTE: Record<WhatsAppOutcome, string> = {
  sent: "✅ підтвердження надіслано",
  unreachable: "⚠️ немає WhatsApp — підтвердьте дзвінком",
  failed: "⚠️ не вдалося надіслати — підтвердьте дзвінком",
  skipped: "— пацієнт не давав згоди",
};

/**
 * Notify the clinic's Telegram group about a confirmed appointment.
 *
 * Ukrainian only: this goes to the front desk, not to patients, and the clinic
 * works in Ukrainian regardless of which locale the visitor booked in.
 *
 * The phone is deliberately plain text rather than a link — Telegram's HTML
 * mode rejects `tel:` hrefs, but its mobile clients auto-detect a spaced
 * international number and make it tappable-to-call on their own.
 */
async function notifyTelegram(s: {
  name: string;
  phone: string;
  doctorName: string | null;
  serviceTitle: string | null;
  start: string;
  comment: string | null;
  bookingId: number;
  whatsapp: WhatsAppOutcome;
}) {
  const rows: [string, string][] = [
    ["Час візиту", kyivDateTime(s.start)],
    ["Пацієнт", s.name],
    ["Телефон", s.phone],
    ...(s.doctorName ? ([["Лікар", s.doctorName]] as [string, string][]) : []),
    ["Послуга", s.serviceTitle || "Потрібна консультація"],
    ...(s.comment ? ([["Коментар", s.comment]] as [string, string][]) : []),
    ["Запис у RoApp", `#${s.bookingId}`],
    ["WhatsApp", WHATSAPP_NOTE[s.whatsapp]],
  ];
  const text = [
    "🗓 <b>Новий онлайн-запис</b>",
    "",
    ...rows.map(([label, value]) => `<b>${label}:</b> ${tgEscape(value)}`),
    "",
    "<i>Запис уже створено в RoApp — підтвердьте його дзвінком пацієнту.</i>",
  ].join("\n");

  const result = await sendTelegram({ text });
  if (!result.ok) console.warn("[appointment] telegram notify failed:", result.reason);
}

/**
 * Notify when a visitor tried to book and got nothing.
 *
 * Worth the noise: whatever went wrong, someone wanted an appointment and left
 * without one, and the clinic can still call them back. Only fired once the
 * name and phone have passed validation — a half-filled form isn't a lost lead.
 *
 * `slotTaken` is a genuine race (RoApp has no slot locking), so this will fire
 * occasionally in normal operation, not only when something is broken.
 */
async function notifyBookingFailure(s: {
  name: string;
  phone: string;
  start: string;
  reason: string;
}) {
  const text = [
    "⚠️ <b>Онлайн-запис не вдався</b>",
    "",
    `<b>Пацієнт:</b> ${tgEscape(s.name)}`,
    `<b>Телефон:</b> ${tgEscape(s.phone)}`,
    `<b>Бажаний час:</b> ${tgEscape(kyivDateTime(s.start))}`,
    `<b>Причина:</b> ${tgEscape(s.reason)}`,
    "",
    "<i>Запису в RoApp НЕМАЄ. Зателефонуйте пацієнту, щоб записати вручну.</i>",
  ].join("\n");

  const result = await sendTelegram({ text });
  if (!result.ok) console.warn("[appointment] telegram failure notify failed:", result.reason);
}
