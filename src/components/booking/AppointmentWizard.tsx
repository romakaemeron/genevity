"use client";

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
 * Step-by-step online appointment form (TZ #10 §2).
 *
 * Specialist → service → date → time → contact details → confirmation, with a
 * progress rail the visitor can click to jump back to any completed step.
 *
 * Honest by design: the clinic has no synced practitioner calendar, so the
 * time step offers the clinic's opening slots and says plainly that the
 * administrator confirms the exact time by phone. It never claims a slot is
 * reserved.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  listAppointmentOptions,
  submitAppointment,
  type AppointmentOptions,
  type AppointmentDoctor,
  type AppointmentService,
} from "@/lib/actions/appointment";
import {
  bookableDates,
  slotsForDate,
  groupSlots,
  formatSlotDate,
  formatFullDate,
  type SlotPeriod,
} from "@/lib/booking-slots";
import { isPreOptimized } from "@/lib/image-src";

const STEPS = ["doctor", "service", "date", "time", "contact", "confirm"] as const;
type Step = (typeof STEPS)[number];

const fieldCls =
  "w-full px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-ink text-[15px] outline-none transition-colors duration-150 ease-out placeholder:text-stone hover:border-stone-light focus:border-main focus:ring-2 focus:ring-main/15";

/** Group typed digits as `XX XXX XX XX`, stripping a pasted country code —
 *  same treatment as the site-wide BookingForm so both feel identical. */
function formatPhoneLocal(raw: string): string {
  let d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  d = d.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

/** Selectable row used by the specialist and service steps. */
function OptionCard({
  selected, onClick, title, subtitle, right, image, imageFocal,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  right?: string | null;
  image?: string | null;
  imageFocal?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-card)] border transition-colors duration-150 cursor-pointer ${
        selected
          ? "border-main bg-main/[0.06]"
          : "border-line bg-champagne-dark hover:border-stone-light"
      }`}
    >
      {image !== undefined && (
        image ? (
          <Image
            src={image} unoptimized={isPreOptimized(image)}
            alt=""
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover shrink-0"
            style={{ objectPosition: imageFocal }}
          />
        ) : (
          <span className="w-11 h-11 rounded-full bg-champagne-darker shrink-0 inline-flex items-center justify-center body-strong text-main">
            {title.charAt(0)}
          </span>
        )
      )}
      <span className="flex-1 min-w-0">
        <span className="block body-strong text-black text-[15px]">{title}</span>
        {subtitle && <span className="block body-s text-muted mt-0.5">{subtitle}</span>}
      </span>
      {right && <span className="body-s text-main whitespace-nowrap shrink-0">{right}</span>}
      <span
        className={`w-5 h-5 rounded-full border shrink-0 inline-flex items-center justify-center ${
          selected ? "border-main bg-main text-champagne" : "border-stone-light"
        }`}
      >
        {selected && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

export default function AppointmentWizard({
  /** Preselects the service step, e.g. when opened from a service page. */
  initialServiceSlug,
}: {
  initialServiceSlug?: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("doctor");
  const [options, setOptions] = useState<AppointmentOptions | null>(null);
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; generic?: string }>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // Safe to compute during render: BookingPage loads this component with
  // `ssr: false`, so there's no server pass to mismatch against around midnight.
  const dates = useMemo(() => bookableDates(), []);

  useEffect(() => {
    listAppointmentOptions(locale)
      .then((o) => {
        setOptions(o);
        if (initialServiceSlug) {
          const match = o.services.find((s) => s.slug === initialServiceSlug);
          if (match) setServiceId(match.id);
        }
      })
      .catch(() => setOptions({ doctors: [], services: [] }));
  }, [locale, initialServiceSlug]);

  const doctor: AppointmentDoctor | undefined = useMemo(
    () => options?.doctors.find((d) => d.id === doctorId),
    [options, doctorId],
  );
  const service: AppointmentService | undefined = useMemo(
    () => options?.services.find((s) => s.id === serviceId),
    [options, serviceId],
  );

  // Once a specialist is picked, only show what they actually perform.
  const visibleServices = useMemo(() => {
    if (!options) return [];
    if (!doctor || doctor.serviceIds.length === 0) return options.services;
    const allowed = new Set(doctor.serviceIds);
    return options.services.filter((s) => allowed.has(s.id));
  }, [options, doctor]);

  const slots = useMemo(() => (date ? slotsForDate(date) : []), [date]);
  const grouped = useMemo(() => groupSlots(slots), [slots]);

  /** Picking a different specialist can invalidate the chosen service. */
  function chooseDoctor(id: string) {
    setDoctorId(id);
    if (!serviceId) return;
    const next = options?.doctors.find((d) => d.id === id);
    // No id, or a doctor with no linked services, means "everything is offered".
    if (!next || next.serviceIds.length === 0) return;
    if (!next.serviceIds.includes(serviceId)) setServiceId("");
  }

  /** Picking a different date can invalidate the chosen time slot. */
  function chooseDate(d: string) {
    setDate(d);
    if (time && !slotsForDate(d).includes(time)) setTime("");
  }

  const stepIndex = STEPS.indexOf(step);
  const contactValid = name.trim().length >= 2 && phoneLocal.replace(/\D+/g, "").length >= 9;

  /** A step is reachable once everything before it has been answered. */
  const completed: Record<Step, boolean> = {
    doctor: true,               // "any specialist" is a valid answer
    service: true,              // "not sure yet" is a valid answer
    date: Boolean(date),
    time: Boolean(time),
    contact: contactValid,
    confirm: false,
  };
  const canAdvance =
    step === "date" ? Boolean(date)
    : step === "time" ? Boolean(time)
    : step === "contact" ? contactValid
    : true;

  const go = (next: Step) => { setStep(next); setErrors({}); };
  const back = () => stepIndex > 0 && go(STEPS[stepIndex - 1]);
  const next = () => stepIndex < STEPS.length - 1 && canAdvance && go(STEPS[stepIndex + 1]);

  function handleSubmit() {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t("errorName");
    if (phoneLocal.replace(/\D+/g, "").length < 9) nextErrors.phone = t("errorPhone");
    if (nextErrors.name || nextErrors.phone) {
      setErrors(nextErrors);
      go("contact");
      return;
    }
    setErrors({});

    startTransition(async () => {
      const res = await submitAppointment({
        name: name.trim(),
        phone: `380${phoneLocal.replace(/\D+/g, "")}`,
        doctorId,
        doctorName: doctor?.name ?? "",
        serviceId,
        serviceName: service?.title ?? "",
        date,
        time,
        comment: comment.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        locale,
      });
      if (!res.ok) {
        if (res.errorKey === "name") { setErrors({ name: t("errorName") }); go("contact"); }
        else if (res.errorKey === "phone") { setErrors({ phone: t("errorPhone") }); go("contact"); }
        else setErrors({ generic: t("errorGeneric") });
        return;
      }
      setDone(true);
    });
  }

  function reset() {
    setDoctorId(""); setServiceId(""); setDate(""); setTime("");
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
        <p className="body-m text-muted max-w-md mx-auto">{t("successText")}</p>
        <div className="mt-7">
          <Button variant="outline" size="sm" onClick={reset}>{t("successAgain")}</Button>
        </div>
      </div>
    );
  }

  const stepLabels: Record<Step, string> = {
    doctor: t("stepDoctor"),
    service: t("stepService"),
    date: t("stepDate"),
    time: t("stepTime"),
    contact: t("stepContact"),
    confirm: t("stepConfirm"),
  };
  const periodLabels: Record<SlotPeriod, string> = {
    morning: t("morning"),
    afternoon: t("afternoon"),
    evening: t("evening"),
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress rail — completed steps are clickable */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {STEPS.map((s, i) => {
          const isCurrent = s === step;
          const isPast = i < stepIndex;
          const reachable = i <= stepIndex || STEPS.slice(0, i).every((p) => completed[p]);
          return (
            <li key={s} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && go(s)}
                className={`flex items-center gap-2 text-[13px] transition-colors ${
                  isCurrent ? "text-main body-strong"
                  : isPast ? "text-black-70 hover:text-main cursor-pointer"
                  : "text-black-40"
                } ${reachable && !isCurrent ? "cursor-pointer" : ""} disabled:cursor-default`}
              >
                <span
                  className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] shrink-0 ${
                    isCurrent ? "bg-main text-champagne"
                    : isPast ? "bg-main/15 text-main"
                    : "bg-champagne-darker text-black-40"
                  }`}
                >
                  {isPast ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[s]}</span>
              </button>
              {i < STEPS.length - 1 && <span className="text-black-20" aria-hidden="true">·</span>}
            </li>
          );
        })}
      </ol>

      {!options ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="min-h-[320px]">
          {step === "doctor" && (
            <fieldset>
              <legend className="heading-3 text-black mb-5">{t("doctorHeading")}</legend>
              <div className="flex flex-col gap-2.5">
                <OptionCard
                  selected={doctorId === ""}
                  onClick={() => chooseDoctor("")}
                  title={t("anyDoctor")}
                />
                {options.doctors.map((d) => (
                  <OptionCard
                    key={d.id}
                    selected={doctorId === d.id}
                    onClick={() => chooseDoctor(d.id)}
                    title={d.name}
                    subtitle={d.role}
                    image={d.photo}
                    imageFocal={d.photoFocalPoint}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {step === "service" && (
            <fieldset>
              <legend className="heading-3 text-black mb-2">{t("serviceHeading")}</legend>
              {doctor && doctor.serviceIds.length === 0 && (
                <p className="body-s text-muted mb-4">{t("noServicesForDoctor")}</p>
              )}
              <div className="flex flex-col gap-2.5 mt-3">
                <OptionCard
                  selected={serviceId === ""}
                  onClick={() => setServiceId("")}
                  title={t("anyService")}
                />
                {visibleServices.map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={serviceId === s.id}
                    onClick={() => setServiceId(s.id)}
                    title={s.title}
                    subtitle={s.category}
                    right={s.priceFrom}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {step === "date" && (
            <fieldset>
              <legend className="heading-3 text-black mb-5">{t("dateHeading")}</legend>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2.5">
                {dates.map((d, i) => {
                  const { weekday, day } = formatSlotDate(d, locale);
                  const label = i === 0 ? t("today") : i === 1 ? t("tomorrow") : weekday;
                  const isFull = slotsForDate(d).length === 0;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={isFull}
                      onClick={() => chooseDate(d)}
                      aria-pressed={date === d}
                      className={`flex flex-col items-center gap-0.5 py-3 rounded-[var(--radius-button)] border text-center transition-colors duration-150 ${
                        date === d
                          ? "border-main bg-main text-champagne"
                          : isFull
                            ? "border-line bg-champagne-dark text-black-30 cursor-not-allowed"
                            : "border-line bg-champagne-dark hover:border-stone-light cursor-pointer"
                      }`}
                    >
                      <span className="body-s capitalize opacity-80">{label}</span>
                      <span className="body-strong text-[14px]">{day}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === "time" && (
            <fieldset>
              <legend className="heading-3 text-black mb-2">{t("timeHeading")}</legend>
              <p className="body-s text-muted mb-5">{t("slotsNote")}</p>
              {slots.length === 0 ? (
                <p className="body-m text-muted">{t("noSlots")}</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {(Object.keys(grouped) as SlotPeriod[]).map((period) =>
                    grouped[period].length === 0 ? null : (
                      <div key={period}>
                        <p className="body-s text-black-50 mb-2.5">{periodLabels[period]}</p>
                        <div className="flex flex-wrap gap-2">
                          {grouped[period].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setTime(s)}
                              aria-pressed={time === s}
                              className={`px-4 py-2 rounded-[var(--radius-pill)] border text-[14px] transition-colors duration-150 cursor-pointer ${
                                time === s
                                  ? "border-main bg-main text-champagne"
                                  : "border-line bg-champagne-dark text-ink hover:border-stone-light"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </fieldset>
          )}

          {step === "contact" && (
            <fieldset>
              <legend className="heading-3 text-black mb-5">{t("contactHeading")}</legend>
              <div className="flex flex-col gap-4 max-w-lg">
                <div>
                  <label htmlFor="appt-name" className="block body-s text-black-70 mb-1.5">{t("nameLabel")}</label>
                  <input
                    id="appt-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldCls}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="body-s text-red-600 mt-1.5">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="appt-phone" className="block body-s text-black-70 mb-1.5">{t("phoneLabel")}</label>
                  <div className="flex items-stretch rounded-[var(--radius-button)] bg-champagne-dark border border-line focus-within:border-main focus-within:ring-2 focus-within:ring-main/15 transition-colors">
                    <span className="px-4 py-3 text-ink text-[15px] border-r border-line select-none">+380</span>
                    <input
                      id="appt-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="XX XXX XX XX"
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(formatPhoneLocal(e.target.value))}
                      className="flex-1 min-w-0 px-4 py-3 bg-transparent text-ink text-[15px] outline-none placeholder:text-stone"
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </div>
                  {errors.phone && <p className="body-s text-red-600 mt-1.5">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="appt-comment" className="block body-s text-black-70 mb-1.5">{t("commentLabel")}</label>
                  <textarea
                    id="appt-comment"
                    rows={3}
                    value={comment}
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
                {([
                  ["doctor", t("stepDoctor"), doctor?.name || t("anyDoctor")],
                  ["service", t("stepService"), service?.title || t("anyService")],
                  ["date", t("stepDate"), date ? formatFullDate(date, locale) : "—"],
                  ["time", t("stepTime"), time || "—"],
                  ["contact", t("nameLabel"), name],
                  ["contact", t("phoneLabel"), `+380 ${phoneLocal}`],
                ] as [Step, string, string][]).map(([target, label, value], i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <dt className="body-s text-black-50 w-32 shrink-0">{label}</dt>
                    <dd className="body-m text-black flex-1 min-w-0 break-words">{value}</dd>
                    <button
                      type="button"
                      onClick={() => go(target)}
                      className="body-s text-main hover:underline shrink-0 cursor-pointer"
                    >
                      {t("change")}
                    </button>
                  </div>
                ))}
                {comment && (
                  <div className="flex items-start gap-4 px-5 py-3">
                    <dt className="body-s text-black-50 w-32 shrink-0">{t("commentLabel")}</dt>
                    <dd className="body-m text-black flex-1 min-w-0 break-words whitespace-pre-line">{comment}</dd>
                  </div>
                )}
              </dl>
              <p className="body-s text-muted mt-4 max-w-lg">{t("slotsNote")}</p>
              <p className="body-s text-black-40 mt-2 max-w-lg">{t("privacyNote")}</p>
              {errors.generic && <p className="body-s text-red-600 mt-3">{errors.generic}</p>}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
        <Button variant="outline" size="sm" onClick={back} disabled={stepIndex === 0 || pending}>
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("back")}
        </Button>
        {step === "confirm" ? (
          <Button variant="primary" size="lg" onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? t("sending") : t("confirm")}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={next} disabled={!canAdvance || !options}>
            {t("next")}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
