"use client";

/**
 * Site-wide booking form — name, phone and an "interested in" search
 * combobox grouped into Services / Doctors. Values are submitted via the
 * `submitBookingForm` server action which inserts a row into
 * `form_submissions` and fires a notification email via Resend.
 *
 * Intentionally quiet: labels above inputs, design-token colors, fast
 * CSS-only hover / focus / active transitions. No Framer-driven stagger,
 * ripples or shimmer — those were visibly laggy and didn't fit the
 * brand's restrained feel.
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
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
 *  Show digits as "+380 XX XXX XX XX" while the user types so the
 *  field self-documents Ukrainian formatting; non-UA numbers keep the
 *  user's raw digits with a leading + when they included one.          */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.startsWith("380")) {
    const d = digits.slice(3);
    const parts = ["+380", d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    return parts.join(" ");
  }
  if (raw.trim().startsWith("+") || digits.length > 10) return `+${digits}`;
  return digits;
}

// Shared input class — champagne-dark surface, line border, taupe main
// focus ring. All transitions kept under 200ms so the field feels
// immediate rather than animated.
const fieldCls =
  "w-full px-4 py-3 rounded-[var(--radius-button)] bg-champagne-dark border border-line text-ink text-[15px] outline-none transition-colors duration-150 ease-out placeholder:text-stone hover:border-stone-light focus:border-main focus:ring-2 focus:ring-main/15";

export default function BookingForm({
  initialInterest = "", submitLabel, className, onSubmitted,
}: Props) {
  const t = useTranslations("ctaForm");
  const locale = useLocale();
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<string[]>(initialInterest ? [initialInterest] : []);
  const [interestLabels, setInterestLabels] = useState<Record<string, string>>({});
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
  // Keep a map of value→label in sync so submissions carry the exact
  // display text the visitor saw, even if a slug later changes.
  useEffect(() => {
    if (!interests.length) { setInterestLabels({}); return; }
    setInterestLabels((prev) => {
      const next: Record<string, string> = {};
      for (const v of interests) {
        const match = allOptions.find((o) => o.value === v);
        next[v] = match?.label ?? prev[v] ?? v;
      }
      return next;
    });
  }, [interests, allOptions]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const labels = interests.map((v) => interestLabels[v] || v);
      const res = await submitBookingForm({
        name: name.trim(),
        phone: phone.trim(),
        interestValues: interests,
        interestLabels: labels,
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
      <div className={`flex flex-col items-center gap-3 py-6 text-center ${className || ""}`}>
        <div className="w-12 h-12 rounded-full bg-main/10 border border-main/25 text-main flex items-center justify-center">
          <Check className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <p className="body-l text-ink max-w-xs">{t("success")}</p>
      </div>
    );
  }

  const searchSelectOptions = options
    ? [
        ...options.services.map((s) => ({
          value: s.value, label: s.label, sub: s.sub, group: "service",
          rightText: s.rightText,
        })),
        ...options.doctors.map((d) => ({
          value: d.value, label: d.label, sub: d.sub, group: "doctor",
          rightImage: d.rightImage,
          rightImageFocalPoint: d.rightImageFocalPoint,
          rightImageScale: d.rightImageScale,
        })),
      ]
    : [];

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className || ""}`}>
      <Field label={t("name")} htmlFor="booking-name">
        <input
          id="booking-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          className={fieldCls}
        />
      </Field>

      <Field label={t("phone")} htmlFor="booking-phone">
        <input
          id="booking-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          autoComplete="tel"
          required
          placeholder="+380 __ ___ __ __"
          className={fieldCls}
        />
      </Field>

      <Field label={t("interestLabel")} htmlFor="booking-interest-label" isLabelId>
        <SearchSelect
          multiple
          options={searchSelectOptions}
          groupHeadings={[
            { key: "service", label: t("interestGroupServices") },
            { key: "doctor",  label: t("interestGroupDoctors") },
          ]}
          value={interests}
          onChange={(next) => setInterests(next)}
          placeholder={t("interestPlaceholder")}
          searchPlaceholder={t("interestSearchPlaceholder")}
          emptyLabel={t("interestEmpty")}
          clearLabel={t("interestClear")}
          labelId="booking-interest-label"
          disabled={!options}
        />
      </Field>

      {error && (
        <p className="text-xs text-error bg-error-light rounded-[var(--radius-button)] px-3 py-2">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="w-full justify-center"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {t("sendingLabel")}
          </span>
        ) : (
          submitLabel || t("submit")
        )}
      </Button>

      <p className="text-[11px] text-stone leading-relaxed">{t("privacyNote")}</p>
    </form>
  );
}

/* ─── Stacked label + field helper ───────────────────────────────── */
function Field({
  label, htmlFor, isLabelId, children,
}: {
  label: string;
  htmlFor?: string;
  /** When true, pass `htmlFor` as an `id` on the label instead of `for` —
   *  used by the combobox which points to the label via aria-labelledby. */
  isLabelId?: boolean;
  children: React.ReactNode;
}) {
  const labelProps = isLabelId ? { id: htmlFor } : { htmlFor };
  return (
    <div className="flex flex-col gap-1.5">
      <label {...labelProps} className="text-[11px] font-semibold text-stone uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
