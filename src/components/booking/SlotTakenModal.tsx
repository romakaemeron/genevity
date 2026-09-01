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
 * making the modal vanish without warning. Closeable three ways all the same:
 * the CTA, the ✕, the backdrop, and Escape.
 */

import { useEffect, useId, useRef, useState } from "react";
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
  /** Milliseconds before it closes itself. */
  duration?: number;
}

export default function SlotTakenModal({
  open, title, text, ctaLabel, closeLabel, onClose, duration = 4500,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const textId = useId();

  // The modal renders through a portal, so it can only be built client-side.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    // Take focus so the countdown isn't the only thing telling a keyboard or
    // screen-reader user that something happened, and give it back on close.
    restoreFocus.current = document.activeElement as HTMLElement | null;
    ctaRef.current?.querySelector("button")?.focus();

    const timer = setTimeout(onClose, duration);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      restoreFocus.current?.focus?.();
    };
  }, [open, duration, onClose]);

  // Unmounted rather than hidden, so the drain animation restarts every time.
  if (!open || !mounted) return null;

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
        {/* How long is left, in the shape of the grab handle it sits where. */}
        <div
          className="mx-auto w-12 h-1 rounded-[var(--radius-pill)] bg-black-10 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full w-full origin-left rounded-[var(--radius-pill)] bg-main bk-drain"
            style={{ animationDuration: `${duration}ms` }}
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
