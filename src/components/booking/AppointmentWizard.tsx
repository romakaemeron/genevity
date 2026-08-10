"use client";

/**
 * Online appointment booking (Inweb TZ #10 §2), backed by RoApp.
 *
 * Five steps — specialist, service, date & time, contacts, confirmation. Date
 * and time are one step because they're one decision: you pick a day *in order
 * to* pick an hour, and splitting them doubles the back-and-forth when a
 * specialist's schedule is sparse.
 *
 * Every slot shown is genuinely free: RoApp computes them from the specialist's
 * work schedule minus their existing bookings. The slot is re-checked
 * server-side immediately before writing, because RoApp has no slot locking.
 *
 * If RoApp is unreachable the wizard doesn't dead-end — it points at the
 * clinic's own booking page instead.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
  Check, ChevronLeft, ChevronRight, Loader2, Search, Clock, CalendarX,
} from "lucide-react";
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
  kyivDateKey, kyivTime, formatKyivDateLong, periodOf, type SlotPeriod,
} from "@/lib/booking-time";

const STEPS = ["doctor", "service", "when", "contact", "confirm"] as const;
type Step = (typeof STEPS)[number];

const fieldCls =
  "w-full px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-ink text-[15px] outline-none transition-colors duration-150 ease-out placeholder:text-stone hover:border-stone-light focus:border-main focus:ring-2 focus:ring-main/15";

/** Group typed digits as `XX XXX XX XX`, stripping any pasted country code. */
function formatPhoneLocal(raw: string): string {
  let d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  d = d.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

function priceLabel(v: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(v)} грн`;
}

function durationLabel(mins: number, hourShort: string, minShort: string): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} ${hourShort} ${m} ${minShort}`;
  if (h) return `${h} ${hourShort}`;
  return `${m} ${minShort}`;
}

export default function AppointmentWizard() {
  const t = useTranslations("booking");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("doctor");
  const [doctors, setDoctors] = useState<BookingDoctor[] | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [services, setServices] = useState<ServiceOption[] | null>(null);
  const [serviceId, setServiceId] = useState<number>(0);
  const [serviceQuery, setServiceQuery] = useState("");

  const [slots, setSlots] = useState<BookingSlot[] | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; generic?: string }>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const hourShort = t("hourShort");
  const minShort = t("minShort");

  useEffect(() => {
    let alive = true;
    getBookingDoctors(locale).then((r) => {
      if (!alive) return;
      setDoctors(r.doctors);
      if (!r.ok) setFallbackUrl(r.fallbackUrl ?? null);
    });
    return () => { alive = false; };
  }, [locale]);

  const doctor = useMemo(
    () => doctors?.find((d) => d.id === doctorId) ?? null,
    [doctors, doctorId],
  );
  const service = useMemo(
    () => services?.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  /**
   * Load a specialist's catalogue and availability.
   *
   * Also preselects the first day that has slots, straight off the response —
   * the common case is "soonest possible", and it means the slot panel is never
   * empty on arrival. The visitor can still browse the whole calendar.
   */
  const loadForDoctor = useCallback((id: number) => {
    setServices(null);
    setSlots(null);
    setDateKey(null);
    setSlotStart(null);
    getDoctorServices(id).then((r) => setServices(r.services));
    getDoctorSlots(id).then((r) => {
      setSlots(r.slots);
      if (r.slots.length) setDateKey(kyivDateKey(r.slots[0].start));
    });
  }, []);

  const groupedServices = useMemo(() => {
    if (!services) return [];
    const q = serviceQuery.trim().toLowerCase();
    const filtered = q ? services.filter((s) => s.title.toLowerCase().includes(q)) : services;
    const groups = new Map<string, ServiceOption[]>();
    for (const s of filtered) {
      const key = s.category ?? "￿"; // uncategorised sorts last
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "uk"));
  }, [services, serviceQuery]);

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

  const stepIndex = STEPS.indexOf(step);
  const contactValid = name.trim().length >= 2 && phoneLocal.replace(/\D+/g, "").length >= 9;
  const canAdvance =
    step === "doctor" ? doctorId != null
    : step === "service" ? services != null
    : step === "when" ? Boolean(slotStart)
    : step === "contact" ? contactValid
    : true;

  const go = useCallback((next: Step) => {
    setStep(next);
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  function chooseDoctor(id: number) {
    setDoctorId(id);
    setServiceId(0);
    setServiceQuery("");
    loadForDoctor(id);
  }

  function chooseDate(key: string) {
    setDateKey(key);
    setSlotStart(null);
  }

  function handleSubmit() {
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
        serviceId,
        start: selectedSlot.start,
        end: selectedSlot.end,
        comment: comment.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        locale,
      });
      if (res.ok) { setDone(true); return; }
      if (res.errorKey === "name") { setErrors({ name: t("errorName") }); go("contact"); }
      else if (res.errorKey === "phone") { setErrors({ phone: t("errorPhone") }); go("contact"); }
      else if (res.errorKey === "slotTaken") {
        // Someone took it first — refresh availability and send them back.
        setErrors({ generic: t("errorSlotTaken") });
        setSlotStart(null);
        getDoctorSlots(doctorId).then((r) => setSlots(r.slots));
        go("when");
      } else if (res.errorKey === "unavailable") setErrors({ generic: t("errorUnavailable") });
      else setErrors({ generic: t("errorGeneric") });
    });
  }

  function reset() {
    setDoctorId(null); setServiceId(0); setServiceQuery("");
    setSlots(null); setDateKey(null); setSlotStart(null);
    setName(""); setPhoneLocal(""); setComment("");
    setErrors({}); setDone(false); setStep("doctor");
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-card)] bg-champagne-dark p-8 sm:p-12 text-center">
        <span className="w-14 h-14 rounded-full bg-main text-champagne inline-flex items-center justify-center mb-5">
          <Check className="w-7 h-7" strokeWidth={2.5} />
        </span>
        <h2 className="heading-3 text-black mb-3">{t("successTitle")}</h2>
        {selectedSlot && (
          <p className="body-l text-main mb-3 first-letter:uppercase">
            {formatKyivDateLong(selectedSlot.start, locale)}, {kyivTime(selectedSlot.start)}
            {doctor ? ` · ${doctor.name}` : ""}
          </p>
        )}
        <p className="body-m text-muted max-w-md mx-auto">{t("successText")}</p>
        <div className="mt-7">
          <Button variant="outline" size="sm" onClick={reset}>{t("successAgain")}</Button>
        </div>
      </div>
    );
  }

  if (doctors !== null && doctors.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-champagne-dark p-8 text-center">
        <CalendarX className="w-8 h-8 text-main mx-auto mb-4" aria-hidden="true" />
        <h2 className="heading-3 text-black mb-3">{t("unavailableTitle")}</h2>
        <p className="body-m text-muted max-w-md mx-auto mb-6">{t("unavailableText")}</p>
        {fallbackUrl && (
          <Button variant="outline" size="sm" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
            {t("unavailableCta")}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
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

  return (
    <div className="flex flex-col gap-8" ref={topRef}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {STEPS.map((s, i) => {
          const isCurrent = s === step;
          const isPast = i < stepIndex;
          return (
            <li key={s} className="flex items-center gap-2">
              <button
                type="button"
                disabled={i > stepIndex}
                onClick={() => i <= stepIndex && go(s)}
                className={`flex items-center gap-2 text-[13px] transition-colors ${
                  isCurrent ? "text-main body-strong"
                  : isPast ? "text-black-70 hover:text-main cursor-pointer"
                  : "text-black-40 cursor-default"
                }`}
              >
                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] shrink-0 ${
                  isCurrent ? "bg-main text-champagne"
                  : isPast ? "bg-main/15 text-main"
                  : "bg-champagne-darker text-black-40"
                }`}>
                  {isPast ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[s]}</span>
              </button>
              {i < STEPS.length - 1 && <span className="text-black-20" aria-hidden="true">·</span>}
            </li>
          );
        })}
      </ol>

      <div className="min-h-[340px]">
        {step === "doctor" && (
          doctors === null ? <StepLoader /> : (
            <fieldset>
              <legend className="heading-3 text-black mb-5">{t("doctorHeading")}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => chooseDoctor(d.id)}
                    aria-pressed={doctorId === d.id}
                    className={`text-left flex items-center gap-4 p-4 rounded-[var(--radius-card)] border transition-colors duration-150 cursor-pointer ${
                      doctorId === d.id
                        ? "border-main bg-main/[0.06]"
                        : "border-line bg-champagne-dark hover:border-stone-light"
                    }`}
                  >
                    {d.photo ? (
                      <Image
                        src={d.photo} alt="" width={52} height={52}
                        className="w-[52px] h-[52px] rounded-full object-cover shrink-0"
                        style={{ objectPosition: d.photoFocalPoint }}
                      />
                    ) : (
                      <span className="w-[52px] h-[52px] rounded-full bg-champagne-darker shrink-0 inline-flex items-center justify-center body-strong text-main text-lg">
                        {d.name.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block body-strong text-black text-[15px] leading-tight">{d.name}</span>
                      <span className="block body-s text-muted mt-1">{d.role}</span>
                      {d.nextSlot && (
                        <span className="block body-s text-main mt-1.5 first-letter:uppercase">
                          {t("nextAvailable")} {formatKyivDateLong(d.nextSlot, locale)}, {kyivTime(d.nextSlot)}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )
        )}

        {step === "service" && (
          services === null ? <StepLoader /> : (
            <fieldset>
              <legend className="heading-3 text-black mb-2">{t("serviceHeading")}</legend>
              <p className="body-s text-muted mb-4">{t("serviceHint")}</p>

              <div className="relative mb-4">
                <Search className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search" value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder={t("serviceSearch")} aria-label={t("serviceSearch")}
                  className={`${fieldCls} pl-11`}
                />
              </div>

              <button
                type="button"
                onClick={() => { setServiceId(0); setSlotStart(null); }}
                aria-pressed={serviceId === 0}
                className={`w-full text-left px-4 py-3.5 mb-3 rounded-[var(--radius-card)] border transition-colors duration-150 cursor-pointer ${
                  serviceId === 0 ? "border-main bg-main/[0.06]" : "border-line bg-champagne-dark hover:border-stone-light"
                }`}
              >
                <span className="body-strong text-black text-[15px]">{t("anyService")}</span>
              </button>

              <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-5">
                {groupedServices.length === 0 && (
                  <p className="body-m text-muted py-6 text-center">{t("serviceNoMatch")}</p>
                )}
                {groupedServices.map(([category, items]) => (
                  <div key={category}>
                    <p className="body-s text-black-50 uppercase tracking-wider mb-2">
                      {category === "￿" ? t("otherServices") : category}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {items.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setServiceId(s.id); setSlotStart(null); }}
                          aria-pressed={serviceId === s.id}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] border transition-colors duration-150 cursor-pointer ${
                            serviceId === s.id ? "border-main bg-main/[0.06]" : "border-line bg-champagne-dark hover:border-stone-light"
                          }`}
                        >
                          <span className="flex-1 min-w-0 body-m text-black">{s.title}</span>
                          <span className="body-s text-black-40 whitespace-nowrap">
                            {durationLabel(s.durationMinutes, hourShort, minShort)}
                          </span>
                          {s.price > 0 && (
                            <span className="body-s text-main whitespace-nowrap">{priceLabel(s.price)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          )
        )}

        {step === "when" && (
          slots === null ? <StepLoader /> : slots.length === 0 ? (
            <div className="text-center py-10">
              <CalendarX className="w-8 h-8 text-main mx-auto mb-4" aria-hidden="true" />
              <p className="body-l text-black mb-2">{t("noSlotsTitle")}</p>
              <p className="body-m text-muted">{t("noSlotsText")}</p>
            </div>
          ) : (
            <fieldset>
              <legend className="heading-3 text-black mb-5">{t("whenHeading")}</legend>
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-6 items-start">
                <AvailabilityCalendar
                  slots={slots} selectedDate={dateKey} onSelectDate={chooseDate}
                  locale={locale} legend={t("calendarLegend")}
                />
                <div>
                  {!dateKey ? (
                    <p className="body-m text-muted py-4">{t("pickDayFirst")}</p>
                  ) : (
                    <>
                      <p className="body-strong text-black mb-4 first-letter:uppercase">
                        {daySlots[0] ? formatKyivDateLong(daySlots[0].start, locale) : ""}
                      </p>
                      <div className="flex flex-col gap-5">
                        {(Object.keys(slotsByPeriod) as SlotPeriod[]).map((period) =>
                          slotsByPeriod[period].length === 0 ? null : (
                            <div key={period}>
                              <p className="body-s text-black-50 mb-2.5">{periodLabels[period]}</p>
                              <div className="flex flex-wrap gap-2">
                                {slotsByPeriod[period].map((s) => (
                                  <button
                                    key={s.start}
                                    type="button"
                                    onClick={() => setSlotStart(s.start)}
                                    aria-pressed={slotStart === s.start}
                                    className={`px-4 py-2 rounded-[var(--radius-pill)] border text-[14px] transition-colors duration-150 cursor-pointer ${
                                      slotStart === s.start
                                        ? "border-main bg-main text-champagne"
                                        : "border-line bg-champagne-dark text-ink hover:border-stone-light"
                                    }`}
                                  >
                                    {kyivTime(s.start)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {errors.generic && (
                <p className="body-s text-error mt-4 bg-error-light rounded-[var(--radius-sm)] px-3 py-2">
                  {errors.generic}
                </p>
              )}
            </fieldset>
          )
        )}

        {step === "contact" && (
          <fieldset>
            <legend className="heading-3 text-black mb-5">{t("contactHeading")}</legend>
            <div className="flex flex-col gap-4 max-w-lg">
              <div>
                <label htmlFor="appt-name" className="block body-s text-black-70 mb-1.5">{t("nameLabel")}</label>
                <input
                  id="appt-name" type="text" autoComplete="name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldCls} aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="body-s text-error mt-1.5">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="appt-phone" className="block body-s text-black-70 mb-1.5">{t("phoneLabel")}</label>
                <div className="flex items-stretch rounded-[var(--radius-button)] bg-champagne-dark border border-line focus-within:border-main focus-within:ring-2 focus-within:ring-main/15 transition-colors">
                  <span className="px-4 py-3 text-ink text-[15px] border-r border-line select-none">+380</span>
                  <input
                    id="appt-phone" type="tel" inputMode="numeric" autoComplete="tel"
                    placeholder="XX XXX XX XX" value={phoneLocal}
                    onChange={(e) => setPhoneLocal(formatPhoneLocal(e.target.value))}
                    className="flex-1 min-w-0 px-4 py-3 bg-transparent text-ink text-[15px] outline-none placeholder:text-stone"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
                {errors.phone && <p className="body-s text-error mt-1.5">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="appt-comment" className="block body-s text-black-70 mb-1.5">{t("commentLabel")}</label>
                <textarea
                  id="appt-comment" rows={3} value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("commentPlaceholder")}
                  className={`${fieldCls} resize-y`}
                />
              </div>
            </div>
          </fieldset>
        )}

        {step === "confirm" && (
          <div>
            <h2 className="heading-3 text-black mb-5">{t("summaryHeading")}</h2>
            <dl className="rounded-[var(--radius-card)] bg-champagne-dark divide-y divide-black-10 max-w-lg">
              <SummaryRow label={t("stepDoctor")} value={doctor?.name ?? "—"} onChange={() => go("doctor")} changeLabel={t("change")} />
              <SummaryRow label={t("stepService")} value={service?.title ?? t("anyService")} onChange={() => go("service")} changeLabel={t("change")} />
              <SummaryRow
                label={t("stepWhen")}
                value={selectedSlot ? `${formatKyivDateLong(selectedSlot.start, locale)}, ${kyivTime(selectedSlot.start)}` : "—"}
                onChange={() => go("when")} changeLabel={t("change")}
              />
              <SummaryRow label={t("nameLabel")} value={name} onChange={() => go("contact")} changeLabel={t("change")} />
              <SummaryRow label={t("phoneLabel")} value={`+380 ${phoneLocal}`} onChange={() => go("contact")} changeLabel={t("change")} />
              {comment && <SummaryRow label={t("commentLabel")} value={comment} />}
            </dl>
            {service && service.price > 0 && (
              <p className="body-s text-muted mt-3 flex items-center gap-2 max-w-lg">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {durationLabel(service.durationMinutes, hourShort, minShort)} · {priceLabel(service.price)}
              </p>
            )}
            <p className="body-s text-muted mt-4 max-w-lg">{t("confirmNote")}</p>
            <p className="body-s text-black-40 mt-2 max-w-lg">{t("privacyNote")}</p>
            {errors.generic && (
              <p className="body-s text-error mt-3 bg-error-light rounded-[var(--radius-sm)] px-3 py-2 max-w-lg">
                {errors.generic}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        <Button
          variant="outline" size="sm"
          onClick={() => stepIndex > 0 && go(STEPS[stepIndex - 1])}
          disabled={stepIndex === 0 || pending}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("back")}
        </Button>
        {step === "confirm" ? (
          <Button variant="primary" size="lg" onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? t("sending") : t("confirm")}
          </Button>
        ) : (
          <Button
            variant="primary" size="sm"
            onClick={() => canAdvance && go(STEPS[stepIndex + 1])}
            disabled={!canAdvance}
          >
            {t("next")}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StepLoader() {
  return (
    <div className="flex items-center justify-center py-20 text-muted">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

function SummaryRow({
  label, value, onChange, changeLabel,
}: { label: string; value: string; onChange?: () => void; changeLabel?: string }) {
  return (
    <div className="flex items-start gap-4 px-5 py-3">
      <dt className="body-s text-black-50 w-28 sm:w-32 shrink-0 pt-0.5">{label}</dt>
      <dd className="body-m text-black flex-1 min-w-0 break-words first-letter:uppercase">{value}</dd>
      {onChange && (
        <button
          type="button" onClick={onChange}
          className="body-s text-main hover:underline shrink-0 cursor-pointer pt-0.5"
        >
          {changeLabel}
        </button>
      )}
    </div>
  );
}
