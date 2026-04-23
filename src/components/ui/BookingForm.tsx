"use client";

/**
 * Site-wide booking form — name, phone and an "interested in" search
 * combobox grouped into Services / Doctors. On submit, runs the
 * `submitBookingForm` server action which inserts a row into
 * `form_submissions` (visible at /admin/forms) and fires a notification
 * email to BOOKING_NOTIFY_EMAIL via Resend.
 *
 * Dropdown options are fetched lazily the first time the form mounts —
 * avoids shipping ~10KB of doctor/service data on every page load. The
 * fetch happens in parallel with the user starting to type name/phone
 * so the combobox almost always has data by the time they tab to it.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import SearchSelect from "@/components/ui/SearchSelect";
import {
  listBookingOptions,
  submitBookingForm,
  type BookingOption,
  type BookingOptions,
} from "@/lib/actions/booking";

interface Props {
  /** Dropdown default (pre-selected value key). Callers can use this to
   *  wire e.g. a service-page CTA that pre-picks its own service. */
  initialInterest?: string;
  /** Rendered inside the submit button. Falls back to ctaForm.submit. */
  submitLabel?: React.ReactNode;
  /** Optional extra class on the outer wrapper. */
  className?: string;
  /** Fires after a successful submit (the success state is rendered regardless). */
  onSubmitted?: () => void;
}

export default function BookingForm({
  initialInterest = "", submitLabel, className, onSubmitted,
}: Props) {
  const t = useTranslations("ctaForm");
  const locale = useLocale();
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(initialInterest);
  const [interestLabel, setInterestLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const firstLoadFired = useRef(false);

  // Lazy fetch of doctor + service lists. We only fire once per mount so
  // navigating within the modal doesn't thrash the DB.
  useEffect(() => {
    if (firstLoadFired.current) return;
    firstLoadFired.current = true;
    listBookingOptions(locale).then(setOptions).catch(() => setOptions({ services: [], doctors: [] }));
  }, [locale]);

  // Keep the label in sync when the user picks something so we can persist
  // it with the submission (for cases where the slug later changes).
  const allOptions: BookingOption[] = options ? [...options.services, ...options.doctors] : [];
  useEffect(() => {
    if (!interest) { setInterestLabel(""); return; }
    const match = allOptions.find((o) => o.value === interest);
    if (match) setInterestLabel(match.label);
  }, [interest, allOptions]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await submitBookingForm({
        name: name.trim(),
        phone: phone.trim(),
        interestValue: interest,
        interestLabel,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        locale,
      });
      if (!res.ok) {
        // Map server-side validation error keys to localized strings.
        const key = res.errorKey === "name"
          ? "errorNameRequired"
          : res.errorKey === "phone"
            ? "errorPhoneRequired"
            : "errorGeneric";
        setError(t(key));
        return;
      }
      setSuccess(true);
      onSubmitted?.();
    });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`flex flex-col items-center gap-3 py-8 text-center ${className || ""}`}
      >
        <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center">
          <Check className="w-6 h-6" />
        </div>
        <p className="body-l text-ink max-w-xs">{t("success")}</p>
      </motion.div>
    );
  }

  const searchSelectOptions = options
    ? [
        ...options.services.map((s) => ({ value: s.value, label: s.label, sub: s.sub, group: "service" })),
        ...options.doctors.map((d) => ({ value: d.value, label: d.label, sub: d.sub, group: "doctor" })),
      ]
    : [];

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className || ""}`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-name" className="text-[11px] font-semibold text-stone uppercase tracking-wider">
          {t("name")}
        </label>
        <input
          id="booking-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          className="px-4 py-3 rounded-xl bg-champagne border border-stone-lighter text-ink text-[15px] outline-none transition-colors focus:border-main focus:ring-2 focus:ring-main/20 placeholder:text-stone"
          placeholder={t("name")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-phone" className="text-[11px] font-semibold text-stone uppercase tracking-wider">
          {t("phone")}
        </label>
        <input
          id="booking-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          required
          className="px-4 py-3 rounded-xl bg-champagne border border-stone-lighter text-ink text-[15px] outline-none transition-colors focus:border-main focus:ring-2 focus:ring-main/20 placeholder:text-stone"
          placeholder="+380 …"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label id="booking-interest-label" className="text-[11px] font-semibold text-stone uppercase tracking-wider">
          {t("interestLabel")}
        </label>
        <SearchSelect
          options={searchSelectOptions}
          groupHeadings={[
            { key: "service", label: t("interestGroupServices") },
            { key: "doctor",  label: t("interestGroupDoctors") },
          ]}
          value={interest}
          onChange={(v, picked) => {
            setInterest(v);
            setInterestLabel(picked?.label ?? "");
          }}
          placeholder={t("interestPlaceholder")}
          searchPlaceholder={t("interestSearchPlaceholder")}
          emptyLabel={t("interestEmpty")}
          clearLabel={t("interestClear")}
          labelId="booking-interest-label"
          disabled={!options}
        />
      </div>

      {error && (
        <p className="text-xs text-error bg-error-light rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full justify-center">
        {pending ? t("sendingLabel") : (submitLabel || t("submit"))}
      </Button>

      <p className="text-[11px] text-stone leading-relaxed">{t("privacyNote")}</p>
    </form>
  );
}
