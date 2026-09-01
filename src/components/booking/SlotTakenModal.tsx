"use client";

/**
 * The alert shown when a slot is lost between choosing it and confirming.
 *
 * RoApp has no slot locking, so the server re-checks availability immediately
 * before writing and can come back with "someone else took it". That answer
 * used to arrive silently: the wizard stepped back to the calendar and the
 * visitor was left guessing why. This says it out loud.
 *
 * It dismisses itself after `duration`, because the message is a notice rather
 * than a decision — the countdown pill at the top makes that visible instead of
 * making the modal vanish without warning. Closeable four ways all the same:
 * the CTA, the ✕, the backdrop, and Escape.
 */

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { CalendarX2, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  open: boolean;
  title: string;
  text: string;
  ctaLabel: string;
  closeLabel: string;
  onClose: () => void;
  /** Milliseconds on screen, counted from the moment it's actually painted. */
  duration?: number;
}

export default function SlotTakenModal({
  open, title, text, ctaLabel, closeLabel, onClose, duration = 4500,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    if (!open) return;

    // Take focus so the countdown isn't the only thing telling a keyboard or
    // screen-reader user that something happened, and give it back on close.
    restoreFocus.current = document.activeElement as HTMLElement | null;
    ctaRef.current?.querySelector("button")?.focus();

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  /**
   * The countdown: started on first paint, paused while the tab is hidden.
   *
   * Opening the modal is a state change, not a paint. The same submit also
   * refetches the slot list, and on a slow connection or a cheap phone the
   * browser can be busy for a good part of a second before it composites the
   * frame — time the visitor would never see. Two frames deep, because the
   * first only guarantees the render was scheduled. rAF is also idle in a
   * background tab, so a modal opened behind another tab waits instead of
   * expiring unseen.
   *
   * The bar is driven from here rather than from React state: one effect owns
   * both clocks, so the animation and the dismiss timer cannot drift apart, and
   * pausing means pausing both in the same breath.
   */
  useEffect(() => {
    if (!open) return;

    const bar = barRef.current;
    let remaining = duration;
    let startedAt = 0;
    let started = false;
    // Whether the clock is currently running. Both transitions have to be
    // idempotent: a second `hold` while already held would bill the visitor
    // for time the countdown was never spending, and with `startedAt` still 0
    // that bill is "everything since the page loaded" — which zeroes the
    // remaining time and makes the modal vanish the instant it's looked at.
    let ticking = false;
    let timer = 0;
    let firstFrame = 0;
    let secondFrame = 0;

    const resume = () => {
      if (ticking) return;
      ticking = true;
      startedAt = performance.now();
      timer = window.setTimeout(onClose, remaining);
      if (bar) bar.style.animationPlayState = "running";
    };
    const hold = () => {
      if (!ticking) return;
      ticking = false;
      window.clearTimeout(timer);
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
      if (bar) bar.style.animationPlayState = "paused";
    };
    const begin = () => {
      started = true;
      bar?.classList.add("bk-fill");
      if (document.hidden) { if (bar) bar.style.animationPlayState = "paused"; }
      else resume();
    };

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(begin);
    });

    const onVisibility = () => {
      if (!started) return;
      if (document.hidden) hold(); else resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      // The bar is reused on the next open; hand it back empty.
      bar?.classList.remove("bk-fill");
      if (bar) bar.style.animationPlayState = "";
    };
  }, [open, duration, onClose]);

  // Unmounted rather than hidden, so the countdown restarts from full every
  // time. The wizard is loaded with `ssr: false`, so `document` is always here;
  // the guard is only insurance against that changing.
  if (!open || typeof document === "undefined") return null;

  // Portalled to <body>: the header is `position: fixed` at z-999 and lives
  // outside the wizard's stacking context, so an overlay nested in the page
  // slides *under* it however high its z-index goes. z-1000/1001 is the site's
  // existing overlay tier (see PhotoSlideshow, Modal).
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bk-fade"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className="relative w-full max-w-[400px] rounded-[var(--radius-card)] bg-champagne shadow-[0_16px_48px_rgba(0,0,0,0.18)] px-7 pt-5 pb-7 text-center bk-modal-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* How long it's been up, filling as the countdown runs. Shaped like
            the grab handle it sits where. */}
        <div
          className="mx-auto w-12 h-1 rounded-[var(--radius-pill)] bg-black-10 overflow-hidden"
          aria-hidden="true"
        >
          <div
            ref={barRef}
            className="h-full w-full origin-left rounded-[var(--radius-pill)] bg-main"
            // Empty until the countdown starts. Set as `transform`, not
            // Tailwind's `scale-x-0`: v4 compiles that to the independent
            // `scale` property, which *multiplies* with the animation's own
            // transform and would pin the bar at zero width for good.
            style={{ transform: "scaleX(0)", animationDuration: `${duration}ms` }}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute top-3.5 right-3.5 w-8 h-8 inline-flex items-center justify-center rounded-full text-stone hover:text-black hover:bg-black-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto mt-6 w-12 h-12 rounded-full bg-warning-light inline-flex items-center justify-center">
          <CalendarX2 className="w-6 h-6 text-warning" aria-hidden="true" />
        </div>

        <h2 id={titleId} className="heading-4 text-black mt-5">{title}</h2>
        <p id={textId} className="body-m text-muted mt-2.5">{text}</p>

        <div ref={ctaRef} className="mt-6">
          <Button variant="primary" onClick={onClose} className="w-full justify-center">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
