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

/* ── Phone masked input ────────────────────────────────────────────────
 *  Visitor-facing input always renders the Ukrainian mobile mask
 *  `+380 (XX) XXX XX XX` with `_` placeholders for every slot that
 *  hasn't been typed yet. As digits come in they replace the left-
 *  most `_`; backspace goes in reverse.
 *
 *  Internal state is the 0–9 subscriber digit string (`phoneDigits`).
 *  `buildPhoneDisplay` derives the masked string from that — so the
 *  value is always well-formed and we don't have to parse the mask
 *  back out each keystroke.
 */
const PHONE_PREFIX = "+380 (";
const PHONE_MASK_LENGTH = 19; // "+380 (XX) XXX XX XX"

/** Caret positions of each digit slot inside the mask. Given N digits
 *  already typed, we want the caret at DIGIT_SLOTS[N] so the next
 *  keystroke lands in the first empty slot — even across parens and
 *  spaces between groups. */
const DIGIT_SLOTS = [6, 7, 10, 11, 12, 14, 15, 17, 18];

function buildPhoneDisplay(d: string): string {
  const p = d.padEnd(9, "_");
  return `+380 (${p[0]}${p[1]}) ${p[2]}${p[3]}${p[4]} ${p[5]}${p[6]} ${p[7]}${p[8]}`;
}

/** Extract the subscriber digits from whatever the visitor typed /
 *  pasted — handles "+380 67…", "067…", or just "67…" uniformly. */
function extractPhoneDigits(raw: string): string {
  let d = (raw || "").replace(/\D+/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  return d.slice(0, 9);
}

function caretForDigits(n: number): number {
  if (n <= 0) return DIGIT_SLOTS[0];
  if (n >= 9) return PHONE_MASK_LENGTH;
  return DIGIT_SLOTS[n];
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
  // Only the 9 subscriber digits live in state — the mask itself is
  // derived at render time via buildPhoneDisplay so the input always
  // has a well-formed "+380 (XX) XXX XX XX" template visible, with
  // `_` placeholders for empty slots.
  const [phoneDigits, setPhoneDigits] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);
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

  // After every digit change, park the caret at the first empty slot
  // (or the end when all 9 are filled) so consecutive keystrokes feel
  // continuous across mask literals.
  useEffect(() => {
    const el = phoneInputRef.current;
    if (!el || document.activeElement !== el) return;
    const pos = caretForDigits(phoneDigits.length);
    el.setSelectionRange(pos, pos);
  }, [phoneDigits]);

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
        // Send the digits only — server sanitizer will rebuild the
        // canonical "+380 (XX) XXX XX XX" mask for storage.
        phone: phoneDigits,
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
          onChange={(e) => setName(e.target.value.slice(0, 100))}
          autoComplete="name"
          maxLength={100}
          minLength={2}
          required
          className={fieldCls}
        />
      </Field>

      <Field label={t("phone")} htmlFor="booking-phone">
        <input
          ref={phoneInputRef}
          id="booking-phone"
          type="tel"
          value={buildPhoneDisplay(phoneDigits)}
          onChange={(e) => setPhoneDigits(extractPhoneDigits(e.target.value))}
          onFocus={(e) => {
            // Drop the caret in the next empty slot when focusing —
            // clicking an already-filled digit would otherwise let the
            // user overwrite it in place which is rarely what they want.
            const el = e.currentTarget;
            requestAnimationFrame(() => {
              const pos = caretForDigits(phoneDigits.length);
              el.setSelectionRange(pos, pos);
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              // Remove the last entered digit — bypasses the default
              // mask-literal deletion which would otherwise leave a
              // weird value that the formatter has to untangle.
              if (phoneDigits.length > 0) {
                e.preventDefault();
                setPhoneDigits(phoneDigits.slice(0, -1));
              } else {
                // Nothing to remove — block default so the input's
                // value doesn't lose mask characters.
                e.preventDefault();
              }
            }
          }}
          autoComplete="tel"
          inputMode="tel"
          // No maxLength — the displayed value is always PHONE_MASK_LENGTH
          // chars long (the mask), so a typed digit would make it
          // 1 char longer and the browser would reject the input before
          // onChange could replace it back. Our controlled state already
          // clamps to 9 subscriber digits.
          required
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
