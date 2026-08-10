"use client";

/**
 * Online appointment booking (Inweb TZ #10 §2), backed by RoApp.
 *
 * Five steps, with the first two ordered by where the visitor chose to start —
 * a service or a specialist. Date and time are one step because they're one
 * decision; splitting them doubles the back-and-forth when a schedule is sparse.
 *
 * Every slot shown is genuinely free: RoApp computes them from the specialist's
 * work schedule minus their bookings. The slot is re-checked server-side
 * immediately before writing, because RoApp has no slot locking — which is also
 * why nothing here claims a slot is held or reserved.
 *
 * If RoApp is unreachable the flow doesn't dead-end; it offers the phone number
 * and the clinic's own booking page.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import AvailabilityCalendar from "./AvailabilityCalendar";
import {
  getBookingDoctors,
  getDoctorServices,
  getDoctorSlots,
  submitAppointment,
  type ServiceOption,
} from "@/lib/actions/appointment";
import type { BookingDoctor, BookingSlot } from "@/lib/roapp/types";
import {
  kyivDateKey, kyivTime, formatKyivDateLong, formatDayMonth, periodOf, type SlotPeriod,
} from "@/lib/booking-time";
import { buildIcs, downloadIcs } from "@/lib/booking-ics";

type Step = "doctor" | "service" | "when" | "contact" | "confirm";
type EntryMode = "service" | "doctor";

/**
 * The visitor picks where to start and the first two steps follow.
 *
 * Worth knowing: RoApp returns the same 232 bookable services regardless of
 * `employee_id` — verified, even a non-existent id returns the identical list —
 * because services aren't linked to employees in the account. So neither order
 * narrows the other yet. This shape already supports it: the moment the clinic
 * links them in RoApp, both directions start filtering with no code change.
 */
const STEP_ORDER: Record<EntryMode, readonly Step[]> = {
  doctor: ["doctor", "service", "when", "contact", "confirm"],
  service: ["service", "doctor", "when", "contact", "confirm"],
};

const fieldCls =
  "w-full px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-ink text-[15px] outline-none transition-colors duration-150 placeholder:text-stone hover:border-stone-light focus:border-main focus:ring-2 focus:ring-main/15";

/** Group typed digits as `XX XXX XX XX`, stripping any pasted country code. */
function formatPhoneLocal(raw: string): string {
  let d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  d = d.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

function money(v: number, locale: string): string {
  const n = new Intl.NumberFormat("uk-UA").format(v);
  return locale === "en" ? `${n} UAH` : `${n} грн`;
}

function duration(mins: number, h: string, m: string): string {
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  if (hh && mm) return `${hh} ${h} ${mm} ${m}`;
  if (hh) return `${hh} ${h}`;
  return `${mm} ${m}`;
}

export default function AppointmentWizard({
  address, phone, aside,
}: { address: string; phone: string; aside?: React.ReactNode }) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const [mode, setMode] = useState<EntryMode>("service");
  const [step, setStep] = useState<Step>("service");
  const [doctors, setDoctors] = useState<BookingDoctor[] | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [services, setServices] = useState<ServiceOption[] | null>(null);
  // null = nothing picked yet; 0 is the explicit "just a consultation" choice.
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const [slots, setSlots] = useState<BookingSlot[] | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(0);

  const [name, setName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; generic?: string }>({});
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const hourShort = t("hourShort");
  const minShort = t("minShort");
  const done = bookingId !== null;

  useEffect(() => {
    let alive = true;
    getBookingDoctors(locale).then((r) => {
      if (!alive) return;
      setDoctors(r.doctors);
      if (!r.ok) setFallbackUrl(r.fallbackUrl ?? null);
    });
    // The catalogue is the same for every specialist, so fetch it once up front.
    getDoctorServices(0).then((r) => { if (alive) setServices(r.services); });
    return () => { alive = false; };
  }, [locale]);

  const doctor = useMemo(() => doctors?.find((d) => d.id === doctorId) ?? null, [doctors, doctorId]);
  const service = useMemo(() => services?.find((s) => s.id === serviceId) ?? null, [services, serviceId]);

  const loadSlots = useCallback((id: number) => {
    setSlots(null); setDateKey(null); setSlotStart(null); setWeekStart(0);
    getDoctorSlots(id).then((r) => {
      setSlots(r.slots);
      if (r.slots.length) setDateKey(kyivDateKey(r.slots[0].start));
    });
  }, []);

  const steps = STEP_ORDER[mode];
  const stepIndex = steps.indexOf(step);

  const go = useCallback((next: Step) => {
    setStep(next);
    setErrors({});
  }, []);

  // Scroll to the top of the flow when the step actually changes — a side
  // effect of the change, so it belongs in an effect rather than in every
  // step-change closure (which would read a ref during render).
  //
  // Compares against the previous value rather than using a "first render"
  // flag: React runs effects twice in development, which would consume the
  // flag on the first pass and scroll the page on load.
  const prevStep = useRef<Step | null>(null);
  useEffect(() => {
    if (prevStep.current !== null && prevStep.current !== step) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevStep.current = step;
  }, [step]);

  function chooseMode(next: EntryMode) {
    setMode(next);
    setStep(STEP_ORDER[next][0]);
  }

  function chooseDoctor(id: number) {
    setDoctorId(id);
    loadSlots(id);
  }

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const q = query.trim().toLowerCase();
    return q ? services.filter((s) => s.title.toLowerCase().includes(q)) : services;
  }, [services, query]);

  const daySlots = useMemo(
    () => (slots && dateKey ? slots.filter((s) => kyivDateKey(s.start) === dateKey) : []),
    [slots, dateKey],
  );
  const slotsByPeriod = useMemo(() => {
    const out: Record<SlotPeriod, BookingSlot[]> = { morning: [], afternoon: [], evening: [] };
    for (const s of daySlots) out[periodOf(s.start)].push(s);
    return out;
  }, [daySlots]);
  const selectedSlot = useMemo(
    () => daySlots.find((s) => s.start === slotStart) ?? null,
    [daySlots, slotStart],
  );

  const contactValid = name.trim().length >= 2 && phoneLocal.replace(/\D+/g, "").length >= 9;
  const canAdvance =
    step === "doctor" ? doctorId != null
    : step === "service" ? serviceId !== null
    : step === "when" ? Boolean(slotStart)
    : step === "contact" ? contactValid
    : true;

  const hint = canAdvance ? "" :
    step === "doctor" ? t("hintPickDoctor")
    : step === "service" ? t("hintPickService")
    : step === "when" ? t("hintPickWhen")
    : step === "contact" ? t("hintContact")
    : "";

  function submit() {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t("errorName");
    if (phoneLocal.replace(/\D+/g, "").length < 9) next.phone = t("errorPhone");
    if (next.name || next.phone) { setErrors(next); go("contact"); return; }
    if (!doctorId || !selectedSlot) { go("when"); return; }
    setErrors({});

    startTransition(async () => {
      const res = await submitAppointment({
        name: name.trim(),
        phone: phoneLocal.replace(/\D+/g, ""),
        employeeId: doctorId,
        serviceId: serviceId ?? 0,
        start: selectedSlot.start,
        end: selectedSlot.end,
        comment: comment.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        locale,
      });
      if (res.ok) { setBookingId(res.bookingId ?? 0); return; }
      if (res.errorKey === "name") { setErrors({ name: t("errorName") }); go("contact"); }
      else if (res.errorKey === "phone") { setErrors({ phone: t("errorPhone") }); go("contact"); }
      else if (res.errorKey === "slotTaken") {
        setErrors({ generic: t("errorSlotTaken") });
        setSlotStart(null);
        loadSlots(doctorId);
        go("when");
      } else if (res.errorKey === "unavailable") setErrors({ generic: t("errorUnavailable") });
      else setErrors({ generic: t("errorGeneric") });
    });
  }

  function restart() {
    setMode("service"); setStep("service");
    setDoctorId(null); setServiceId(null); setQuery("");
    setSlots(null); setDateKey(null); setSlotStart(null); setWeekStart(0);
    setName(""); setPhoneLocal(""); setComment("");
    setErrors({}); setBookingId(null);
  }

  function addToCalendar() {
    if (!selectedSlot) return;
    downloadIcs(
      "genevity-appointment.ics",
      buildIcs({
        start: selectedSlot.start,
        end: selectedSlot.end,
        title: `GENEVITY — ${service?.title ?? "запис"}`,
        description: doctor ? `${doctor.name}${doctor.role ? `, ${doctor.role}` : ""}` : undefined,
        location: address,
        uid: `genevity-${bookingId ?? Date.now()}@genevity.com.ua`,
      }),
    );
  }

  /* ── RoApp unreachable ── */
  if (doctors !== null && doctors.length === 0) {
    return (
      <div ref={topRef} className="bk-rise rounded-[var(--radius-card)] bg-champagne-dark p-8">
        <h2 className="heading-3 text-black">{t("unavailableTitle")}</h2>
        <p className="body-m text-muted mt-3 mb-6 max-w-md">{t("unavailableText")}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</Button>
          {fallbackUrl && (
            <Button variant="outline" size="sm" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
              {t("unavailableCta")}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ── Confirmed ── */
  if (done) {
    return (
      <div ref={topRef} className="bk-rise">
        <div className="relative w-[76px] h-[76px] mb-7">
          <span className="absolute inset-0 rounded-full bg-success opacity-35" style={{ animation: "bkHalo 2.4s ease-out infinite" }} />
          <span className="absolute inset-0 rounded-full bg-success flex items-center justify-center" style={{ animation: "bkPop .5s cubic-bezier(.2,.8,.2,1) both" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M9 17.5 14.5 23 25 12" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="64" style={{ animation: "bkDraw .6s .25s cubic-bezier(.2,.8,.2,1) both" }} />
            </svg>
          </span>
        </div>

        <h2 className="heading-2 text-black">{t("successTitle")}</h2>
        {selectedSlot && (
          <p className="body-l text-main mt-3 mb-7 first-letter:uppercase">
            {formatKyivDateLong(selectedSlot.start, locale)}, {kyivTime(selectedSlot.start)}
            {doctor ? ` · ${doctor.name}` : ""}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {bookingId ? (
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
              <p className="bk-eyebrow">{t("bookingNumber")}</p>
              <p className="heading-3 text-black text-[26px] mt-2.5">GN-{bookingId}</p>
            </div>
          ) : null}
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <p className="bk-eyebrow">{t("addressLabel")}</p>
            <p className="body-m text-black mt-2.5">{address}</p>
          </div>
        </div>

        <div className="mt-8 max-w-2xl">
          <p className="bk-eyebrow mb-4">{t("whatNext")}</p>
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex gap-4 items-start py-3.5 border-t border-line">
              <span className="w-6 h-6 rounded-full border border-main/45 text-main inline-flex items-center justify-center body-s shrink-0">
                {n}
              </span>
              <div>
                <p className="body-m text-black">{t(`next${n}Title`)}</p>
                <p className="body-s text-muted mt-0.5">{t(`next${n}Body`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" size="sm" onClick={addToCalendar}>{t("addToCalendar")}</Button>
          <Button variant="outline" size="sm" onClick={restart}>{t("successAgain")}</Button>
        </div>
      </div>
    );
  }

  const stepLabels: Record<Step, string> = {
    doctor: t("stepDoctor"), service: t("stepService"), when: t("stepWhen"),
    contact: t("stepContact"), confirm: t("stepConfirm"),
  };
  const periodLabels: Record<SlotPeriod, string> = {
    morning: t("morning"), afternoon: t("afternoon"), evening: t("evening"),
  };

  const railRows: { label: string; value: string; on: boolean }[] = [
    { label: t("stepService"),
      value: service?.title ?? t("railNotChosen"),
      on: serviceId !== null },
    { label: t("stepDoctor"), value: doctor?.name ?? t("railNotChosen"), on: Boolean(doctor) },
    { label: t("stepWhen"),
      value: selectedSlot
        ? `${formatKyivDateLong(selectedSlot.start, locale)}, ${kyivTime(selectedSlot.start)}`
        : t("railNotChosen"),
      on: Boolean(selectedSlot) },
    { label: t("railPatient"), value: name.trim() || t("railNotFilled"), on: Boolean(name.trim()) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start">
    <div ref={topRef} className="min-w-0 scroll-mt-28">
      {/* Stepper */}
      <ol className="flex items-center gap-2 flex-wrap mb-8">
        {steps.map((s, i) => {
          const current = s === step;
          const past = i < stepIndex;
          return (
            <li key={s} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!past && !current}
                onClick={() => (past || current) && go(s)}
                className={`flex items-center gap-2 text-[13px] transition-colors ${
                  current ? "text-main body-strong"
                  : past ? "text-black-70 hover:text-main cursor-pointer"
                  : "text-black-40 cursor-default"
                }`}
              >
                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] shrink-0 transition-colors ${
                  current ? "bg-main text-champagne"
                  : past ? "bg-main/15 text-main"
                  : "bg-champagne-darker text-black-40"
                }`}>
                  {past ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[s]}</span>
              </button>
              {i < steps.length - 1 && <span className="w-4 h-px bg-black-10" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* ── Step 1 ── */}
      {stepIndex === 0 && (
        <div className="bk-rise">
          <h2 className="heading-3 text-black">{t("startHeading")}</h2>

          <div className="inline-flex gap-1 p-0.5 rounded-[var(--radius-pill)] bg-champagne-dark mt-5 mb-6">
            {(["service", "doctor"] as EntryMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => chooseMode(m)}
                aria-pressed={mode === m}
                className={`px-4 py-1.5 rounded-[var(--radius-pill)] text-[13px] cursor-pointer transition-colors duration-200 ${
                  mode === m ? "bg-champagne text-black shadow-sm" : "text-muted hover:text-black"
                }`}
              >
                {m === "service" ? t("startWithService") : t("startWithDoctor")}
              </button>
            ))}
          </div>

          {mode === "service"
            ? <ServiceGrid services={filteredServices} all={services} selected={serviceId} onSelect={setServiceId} query={query} onQuery={setQuery} t={t} locale={locale} hourShort={hourShort} minShort={minShort} />
            : <DoctorList doctors={doctors} selected={doctorId} onSelect={chooseDoctor} t={t} locale={locale} />}
        </div>
      )}

      {/* ── Step 2 ── */}
      {stepIndex === 1 && (
        <div className="bk-rise">
          <h2 className="heading-3 text-black">
            {mode === "service" ? t("step2DoctorTitle") : t("step2ServiceTitle")}
          </h2>
          <p className="body-m text-muted mt-3 mb-6 max-w-xl">
            {mode === "service" ? t("step2DoctorSub") : t("step2ServiceSub")}
          </p>
          {mode === "service"
            ? <DoctorList doctors={doctors} selected={doctorId} onSelect={chooseDoctor} t={t} locale={locale} />
            : <ServiceGrid services={filteredServices} all={services} selected={serviceId} onSelect={setServiceId} query={query} onQuery={setQuery} t={t} locale={locale} hourShort={hourShort} minShort={minShort} />}
        </div>
      )}

      {/* ── Step 3: date & time ── */}
      {step === "when" && (
        <div className="bk-rise">
          <h2 className="heading-3 text-black">{t("whenHeading")}</h2>
          {doctor && <p className="body-m text-muted mt-3 mb-6">{t("whenSub")} {doctor.name}</p>}

          {slots === null ? <Loader /> : slots.length === 0 ? (
            <div className="rounded-[var(--radius-card)] bg-champagne-dark p-8">
              <p className="body-l text-black mb-2">{t("noSlotsTitle")}</p>
              <p className="body-m text-muted">{t("noSlotsText")}</p>
            </div>
          ) : (
            <>
              <AvailabilityCalendar
                slots={slots} selectedDate={dateKey}
                onSelectDate={(k) => { setDateKey(k); setSlotStart(null); }}
                weekStart={weekStart} onWeekStart={setWeekStart}
                locale={locale} legend={t("calendarLegend")}
              />
              <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
                {!dateKey || daySlots.length === 0 ? (
                  <p className="body-m text-muted">{t("pickDayFirst")}</p>
                ) : (
                  (Object.keys(slotsByPeriod) as SlotPeriod[]).map((period) =>
                    slotsByPeriod[period].length === 0 ? null : (
                      <div key={period} className="mb-5 last:mb-0">
                        <p className="bk-eyebrow mb-3">{periodLabels[period]}</p>
                        <div className="flex flex-wrap gap-2">
                          {slotsByPeriod[period].map((s) => {
                            const sel = slotStart === s.start;
                            return (
                              <button
                                key={s.start} type="button" onClick={() => setSlotStart(s.start)} aria-pressed={sel}
                                className={`px-4 py-2 rounded-[var(--radius-pill)] border text-[14px] cursor-pointer transition-colors duration-150 ${
                                  sel ? "border-main bg-main text-champagne"
                                      : "border-line bg-champagne-dark text-ink hover:border-stone-light"
                                }`}
                              >
                                {kyivTime(s.start)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </>
          )}
          {errors.generic && <ErrorNote>{errors.generic}</ErrorNote>}
        </div>
      )}

      {/* ── Step 4: contacts ── */}
      {step === "contact" && (
        <div className="bk-rise">
          <h2 className="heading-3 text-black">{t("contactHeading")}</h2>
          <p className="body-m text-muted mt-3 mb-6 max-w-xl">{t("contactSub")}</p>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="bk-eyebrow block mb-2.5">{t("nameLabel")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={fieldCls} aria-invalid={Boolean(errors.name)} />
              {errors.name && <span className="block body-s text-error mt-1.5">{errors.name}</span>}
            </label>
            <label className="block">
              <span className="bk-eyebrow block mb-2.5">{t("phoneLabel")}</span>
              <div className="flex items-stretch rounded-[var(--radius-button)] bg-champagne-dark border border-line focus-within:border-main focus-within:ring-2 focus-within:ring-main/15 transition-colors">
                <span className="px-4 py-3 text-ink text-[15px] border-r border-line select-none">+380</span>
                <input
                  value={phoneLocal} onChange={(e) => setPhoneLocal(formatPhoneLocal(e.target.value))}
                  type="tel" inputMode="numeric" autoComplete="tel" placeholder="XX XXX XX XX"
                  className="flex-1 min-w-0 px-4 py-3 bg-transparent text-ink text-[15px] outline-none placeholder:text-stone"
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>
              {errors.phone && <span className="block body-s text-error mt-1.5">{errors.phone}</span>}
            </label>
            <label className="block sm:col-span-2">
              <span className="bk-eyebrow block mb-2.5">{t("commentLabel")}</span>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("commentPlaceholder")} className={`${fieldCls} resize-y`} />
            </label>
          </div>
        </div>
      )}

      {/* ── Step 5: confirm ── */}
      {step === "confirm" && (
        <div className="bk-rise">
          <h2 className="heading-3 text-black">{t("summaryHeading")}</h2>
          <p className="body-m text-muted mt-3 mb-6">{t("summarySub")}</p>

          <div className="rounded-[var(--radius-card)] border border-line bg-white overflow-hidden">
            {([
              [t("stepService"), service?.title ?? "—", () => go("service")],
              [t("stepDoctor"), doctor ? `${doctor.name} · ${doctor.role}` : "—", () => go("doctor")],
              [t("stepWhen"), selectedSlot ? `${formatKyivDateLong(selectedSlot.start, locale)}, ${kyivTime(selectedSlot.start)}` : "—", () => go("when")],
              [t("nameLabel"), name || "—", () => go("contact")],
              [t("phoneLabel"), `+380 ${phoneLocal}`, () => go("contact")],
              ...(comment ? [[t("commentLabel"), comment, () => go("contact")]] : []),
            ] as [string, string, () => void][]).map(([label, value, edit], i) => (
              <div key={i} className="grid grid-cols-[minmax(0,104px)_1fr_auto] sm:grid-cols-[180px_1fr_auto] gap-4 items-center px-5 sm:px-6 py-4 border-b border-line last:border-b-0">
                <span className="bk-eyebrow leading-[1.3]">{label}</span>
                <span className="body-m text-black first-letter:uppercase break-words">{value}</span>
                <button type="button" onClick={edit} className="body-s text-main hover:underline cursor-pointer shrink-0">
                  {t("change")}
                </button>
              </div>
            ))}
            {service && service.price > 0 && (
              <div className="flex items-center justify-between px-5 sm:px-6 py-5 bg-champagne-dark">
                <span className="body-s text-muted">
                  {t("durationLabel")} · {duration(service.durationMinutes, hourShort, minShort)}
                </span>
                <span className="body-strong text-main text-[18px]">{money(service.price, locale)}</span>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3 items-start px-5 py-4 rounded-[var(--radius-card)] border border-dashed border-main/35">
            <span className="w-2 h-2 rounded-full bg-main mt-1.5 shrink-0" aria-hidden="true" />
            <p className="body-s text-muted max-w-lg">{t("confirmNote")}</p>
          </div>
          <p className="body-s text-black-40 mt-3 max-w-lg">{t("privacyNote")}</p>
          {errors.generic && <ErrorNote>{errors.generic}</ErrorNote>}
        </div>
      )}

      {/* ── Nav ── */}
      {/* Sticky so the way forward is always in reach — the service list runs to
          230 cards and the page, not a nested container, does the scrolling. */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 mt-8 pt-4 pb-4 border-t border-line bg-champagne/95 backdrop-blur-sm supports-[backdrop-filter]:bg-champagne/80">
        <div className={stepIndex > 0 ? "" : "invisible"}>
          <Button variant="outline" size="sm" onClick={() => stepIndex > 0 && go(steps[stepIndex - 1])} disabled={pending}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {t("back")}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {hint && <span className="hidden sm:inline body-s text-black-40">{hint}</span>}
          {step === "confirm" ? (
            <Button variant="primary" size="sm" onClick={submit} disabled={pending}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? t("sending") : t("confirm")}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => canAdvance && go(steps[stepIndex + 1])} disabled={!canAdvance}>
              {t("next")}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>

      <aside className="lg:sticky lg:top-28 flex flex-col gap-4 w-full order-first lg:order-last">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
          <p className="bk-eyebrow">{t("railTitle")}</p>
          <div className="mt-4 flex flex-col gap-3.5">
            {railRows.map((r) => (
              <div key={r.label} className={`flex gap-3 items-start transition-opacity ${r.on ? "opacity-100" : "opacity-55"}`}>
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 border transition-colors ${
                    r.on ? "bg-main border-main" : "border-black-20"
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block body-s text-black-40">{r.label}</span>
                  <span className={`block body-m mt-0.5 first-letter:uppercase break-words ${r.on ? "text-black" : "text-black-40"}`}>
                    {r.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
          {service && service.price > 0 && (
            <div className="bk-fade mt-5 pt-4 border-t border-line flex items-baseline justify-between gap-3">
              <span className="body-s text-muted">{t("railTotal")}</span>
              <span className="body-strong text-main text-[18px]">{money(service.price, locale)}</span>
            </div>
          )}
        </div>
        {aside}
      </aside>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function Loader() {
  return (
    <div className="flex items-center justify-center py-20 text-muted">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 px-4 py-3 rounded-[var(--radius-sm)] bg-error-light text-error body-s">{children}</p>;
}

function Tick({ on }: { on: boolean }) {
  return (
    <span
      className={`shrink-0 w-5 h-5 rounded-full inline-flex items-center justify-center border transition-colors ${
        on ? "bg-main border-main text-champagne" : "border-black-20"
      }`}
      aria-hidden="true"
    >
      {on && <Check className="w-3 h-3" strokeWidth={3} />}
    </span>
  );
}

/** Cards carry no border at rest — the surface does the work, and hover just
 *  deepens it. Only the selected card gets an outline, so selection stays the
 *  one thing an outline means here. */
const cardCls = (on: boolean) =>
  `text-left rounded-[var(--radius-card)] border p-5 cursor-pointer transition-colors duration-200 ${
    on ? "border-main bg-white"
       : "border-transparent bg-champagne-dark hover:bg-champagne-darker"
  }`;

function ServiceGrid({
  services, all, selected, onSelect, query, onQuery, t, locale, hourShort, minShort,
}: {
  services: ServiceOption[];
  all: ServiceOption[] | null;
  selected: number | null;
  onSelect: (id: number) => void;
  query: string;
  onQuery: (q: string) => void;
  t: (k: string) => string;
  locale: string;
  hourShort: string;
  minShort: string;
}) {
  if (all === null) return <Loader />;
  return (
    <div className="bk-fade">
      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          type="search" value={query} onChange={(e) => onQuery(e.target.value)}
          placeholder={t("serviceSearch")} aria-label={t("serviceSearch")}
          className={`${fieldCls} pl-11`}
        />
      </div>

      {services.length === 0 ? (
        <p className="body-m text-muted py-8 text-center">{t("serviceNoMatch")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((s) => {
            const on = selected === s.id;
            return (
              <button key={s.id} type="button" onClick={() => onSelect(s.id)} aria-pressed={on} className={cardCls(on)}>
                <div className="flex justify-between items-start gap-3">
                  <p className="bk-eyebrow">{s.category ?? t("otherServices")}</p>
                  <Tick on={on} />
                </div>
                <p className="body-strong text-black text-[16px] mt-2 leading-snug">{s.title}</p>
                <div className="mt-3 flex items-center gap-3 body-s text-muted">
                  <span>{duration(s.durationMinutes, hourShort, minShort)}</span>
                  {s.price > 0 && (
                    <>
                      <span className="w-[3px] h-[3px] rounded-full bg-stone-lighter" aria-hidden="true" />
                      <span className="body-strong text-black">{money(s.price, locale)}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DoctorList({
  doctors, selected, onSelect, t, locale,
}: {
  doctors: BookingDoctor[] | null;
  selected: number | null;
  onSelect: (id: number) => void;
  t: (k: string) => string;
  locale: string;
}) {
  if (doctors === null) return <Loader />;
  return (
    <div className="bk-fade flex flex-col gap-3">
      {doctors.map((d) => {
        const on = selected === d.id;
        return (
          <button key={d.id} type="button" onClick={() => onSelect(d.id)} aria-pressed={on} className={cardCls(on)}>
            <div className="flex gap-4 items-start">
              {d.photo ? (
                <Image
                  src={d.photo} alt="" width={64} height={64}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  style={{ objectPosition: d.photoFocalPoint }}
                />
              ) : (
                <span className={`shrink-0 w-12 h-12 rounded-full inline-flex items-center justify-center body-strong text-[15px] transition-colors ${
                  on ? "bg-main text-champagne" : "bg-champagne-darker text-main"
                }`}>
                  {d.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="body-strong text-black text-[16px] leading-snug">{d.name}</span>
                  <Tick on={on} />
                </div>
                <p className="body-s text-muted mt-1">{d.role}</p>
                {/* Deliberately not using .body-s here: the site's .body-*
                    classes set `text-wrap: balance`, which resets the wrap mode
                    and makes the browser balance this short label into a narrow
                    column — one word per line. Balancing is for prose; a chip is
                    one unbreakable label, so it gets its own type and an inline
                    white-space that no stylesheet rule can override. */}
                {d.nextSlot && (
                  <span
                    className="inline-flex w-fit items-center mt-2.5 px-3 py-1 rounded-[var(--radius-pill)] bg-success-light text-success text-[12px] font-medium leading-[1.5]"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {t("nextAvailable")} {formatDayMonth(d.nextSlot, locale)}, {kyivTime(d.nextSlot)}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
