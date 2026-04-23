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
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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

/* ── Phone input ───────────────────────────────────────────────────────
 *  Country-code chip (`+380`) sits to the left of the field — it's
 *  not editable, visually separated by a border, and the actual
 *  input only holds the 9 subscriber digits grouped as `XX XXX XX XX`
 *  while the user types. Native placeholder handles the "empty state"
 *  colouring (stone-on-champagne via `placeholder:text-stone`).
 *
 *  This is the pattern used by Stripe, Google Pay checkout, Revolut,
 *  etc. — clear separation between country code and local part, easy
 *  to validate, easy to paste into, no overlay tricks required.       */

/** Group typed digits into the Ukrainian local format `XX XXX XX XX`,
 *  stripping any country code / trunk-zero the visitor happens to
 *  paste so everything lands in the same shape. */
function formatPhoneLocal(raw: string): string {
  let d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
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
  // Only the local part (post-+380) lives in state, grouped as
  // `XX XXX XX XX`. The +380 chip is rendered separately in the JSX.
  const [phoneLocal, setPhoneLocal] = useState("");
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
        // Ship the digits only — server sanitizer will rebuild the
        // canonical "+380 (XX) XXX XX XX" mask for storage.
        phone: "+380" + phoneLocal.replace(/\D+/g, ""),
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
      <div className={`flex flex-col items-center gap-4 py-10 text-center ${className || ""}`}>
        {/* Sequence:
              1) icon enters lower (where the text will eventually land)
              2) the checkmark path is drawn via strokeDashoffset
              3) icon translates up to its final slot
              4) copy blur-reveals in from below
           The delays chain so each step finishes before the next begins. */}
        <motion.div
          initial={{ y: 36, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-14 h-14 rounded-full bg-main/10 border border-main/25 text-main flex items-center justify-center"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 12.5 L10 17.5 L19 7.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { delay: 0.1, duration: 0.45, ease: [0.65, 0, 0.35, 1] },
                opacity: { delay: 0.1, duration: 0.1 },
              }}
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="body-l text-ink max-w-xs"
        >
          {t("success")}
        </motion.p>
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
          onChange={(e) => setName(e.target.value.slice(0, 100))}
          autoComplete="name"
          maxLength={100}
          minLength={2}
          required
          className={fieldCls}
        />
      </Field>

      <Field label={t("phone")} htmlFor="booking-phone">
        <div className="group flex items-stretch rounded-[var(--radius-button)] bg-champagne-dark border border-line transition-colors duration-150 ease-out hover:border-stone-light focus-within:border-main focus-within:ring-2 focus-within:ring-main/15">
          {/* +380 chip — inline styles so padding can't get lost to any
              arbitrary-value CSS purge or flex shrink surprises. Aligned
              at 16 px from the field's left edge, with an 8 px air gap
              to the right before the typed digits / placeholder begin. */}
          <span
            className="inline-flex items-center text-ink text-[15px] select-none shrink-0"
            style={{ paddingLeft: 16, paddingRight: 3 }}
          >
            +380
          </span>
          <input
            id="booking-phone"
            type="tel"
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(formatPhoneLocal(e.target.value))}
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="67 123 45 67"
            required
            style={{ paddingLeft: 4, paddingRight: 16 }}
            className="flex-1 min-w-0 py-3 bg-transparent text-ink text-[15px] outline-none placeholder:text-stone-light"
          />
        </div>
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
      <label {...labelProps} className="text-[13px] font-medium text-stone">
        {label}
      </label>
      {children}
    </div>
  );
}
