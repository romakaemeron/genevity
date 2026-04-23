"use client";

/**
 * Site-wide booking form — name, phone and an "interested in" search
 * combobox grouped into Services / Doctors. On submit, runs the
 * `submitBookingForm` server action which inserts a row into
 * `form_submissions` (visible at /admin/forms) and fires a notification
 * email to BOOKING_NOTIFY_EMAIL via Resend.
 *
 * Visual system:
 *   — Floating labels animate up when a field has focus or value
 *   — Leading icons shift color to match the field's focus state
 *   — Fields stagger in on mount so the modal feels "assembled" rather
 *     than dropped
 *   — Phone formatter lays digits out as a Ukrainian number while typing
 *     (+380 XX XXX XX XX) so the field self-documents
 *   — Submit button animates through idle → sending → success states
 *   — Success state replaces the whole form with an animated checkmark
 *     and the localized thank-you copy
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import SearchSelect from "@/components/ui/SearchSelect";
import {
  listBookingOptions,
  submitBookingForm,
  type BookingOption,
  type BookingOptions,
} from "@/lib/actions/booking";

interface Props {
  initialInterest?: string;
  submitLabel?: React.ReactNode;
  className?: string;
  onSubmitted?: () => void;
}

/* ── Phone display formatting ─────────────────────────────────────────
 *  Show digits grouped as "+380 XX XXX XX XX" while the user types so
 *  the field self-documents Ukrainian formatting without being strict
 *  (admins can still enter international numbers).                      */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  // Prefer a '+' if the input originally had one OR if the digits start
  // with a country-code-looking prefix (380, 1, etc.).
  const hasPlus = raw.trim().startsWith("+") || digits.length > 10;
  if (digits.startsWith("380")) {
    const d = digits.slice(3);
    const parts = [
      "+380",
      d.slice(0, 2),
      d.slice(2, 5),
      d.slice(5, 7),
      d.slice(7, 9),
    ].filter(Boolean);
    return parts.join(" ");
  }
  if (hasPlus) return `+${digits}`;
  return digits;
}

/** Animation variants — stagger children by 70ms so the form feels alive. */
const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

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

  useEffect(() => {
    if (firstLoadFired.current) return;
    firstLoadFired.current = true;
    listBookingOptions(locale).then(setOptions).catch(() => setOptions({ services: [], doctors: [] }));
  }, [locale]);

  const allOptions: BookingOption[] = useMemo(
    () => (options ? [...options.services, ...options.doctors] : []),
    [options],
  );

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
        initial="hidden"
        animate="visible"
        variants={stagger}
        className={`flex flex-col items-center gap-4 py-6 text-center ${className || ""}`}
      >
        <motion.div
          variants={rise}
          className="relative"
        >
          {/* Ripple rings — animate outward once on success */}
          <motion.span
            className="absolute inset-0 rounded-full bg-main/20"
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-full bg-main/20"
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.05 }}
            className="relative w-16 h-16 rounded-full bg-main text-champagne flex items-center justify-center shadow-[0_8px_32px_rgba(139,123,107,0.25)]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 16 }}
            >
              <Check className="w-8 h-8" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.p variants={rise} className="body-l text-ink max-w-xs">{t("success")}</motion.p>
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
    <motion.form
      onSubmit={onSubmit}
      initial="hidden"
      animate="visible"
      variants={stagger}
      className={`flex flex-col gap-3.5 ${className || ""}`}
    >
      <motion.div variants={rise}>
        <FloatingInput
          id="booking-name"
          type="text"
          value={name}
          onChange={setName}
          label={t("name")}
          autoComplete="name"
          icon={User}
          required
        />
      </motion.div>

      <motion.div variants={rise}>
        <FloatingInput
          id="booking-phone"
          type="tel"
          value={phone}
          onChange={(v) => setPhone(formatPhone(v))}
          label={t("phone")}
          autoComplete="tel"
          icon={Phone}
          placeholder="+380 __ ___ __ __"
          required
        />
      </motion.div>

      <motion.div variants={rise} className="flex flex-col gap-1.5">
        <label
          id="booking-interest-label"
          className="text-[11px] font-semibold text-stone uppercase tracking-wider inline-flex items-center gap-1.5"
        >
          <Sparkles size={12} className="text-main" />
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
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-error bg-error-light rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={rise}>
        <SubmitButton pending={pending}>
          {submitLabel || t("submit")}
        </SubmitButton>
      </motion.div>

      <motion.p variants={rise} className="text-[11px] text-stone leading-relaxed">
        {t("privacyNote")}
      </motion.p>
    </motion.form>
  );
}

/* ─── Floating-label text input ──────────────────────────────────────── */
function FloatingInput({
  id, type, value, onChange, label, icon: Icon, autoComplete, placeholder, required,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;

  return (
    <div className="group relative">
      <Icon
        size={16}
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
          focused ? "text-main" : "text-stone"
        }`}
      />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        placeholder={floated ? placeholder || "" : ""}
        required={required}
        className={`w-full pl-11 pr-4 pt-5 pb-2 rounded-xl bg-champagne border text-ink text-[15px] outline-none transition-all placeholder:text-stone/60 ${
          focused
            ? "border-main ring-2 ring-main/20 bg-white"
            : "border-stone-lighter hover:border-stone"
        }`}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 pointer-events-none transition-all duration-200 ${
          floated
            ? "top-1.5 text-[10px] font-semibold uppercase tracking-wider " + (focused ? "text-main" : "text-stone")
            : "top-1/2 -translate-y-1/2 text-sm text-stone"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

/* ─── Submit button with states ──────────────────────────────────────── */
function SubmitButton({ children, pending }: { children: React.ReactNode; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full overflow-hidden rounded-xl bg-main text-champagne px-6 py-3.5 text-base font-medium transition-all duration-300 cursor-pointer disabled:opacity-80 disabled:cursor-wait hover:shadow-[0_10px_30px_-10px_rgba(139,123,107,0.6)] active:scale-[0.99]"
    >
      {/* Shimmer sweep on hover */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
        }}
      />
      <span className="relative flex items-center justify-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.span
              key="pending"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" />
              {/* Reuse children so the pending label can be customised per CTA */}
              <span>{children}</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <span>{children}</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
}
