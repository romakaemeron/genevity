"use client";

/**
 * Interactive "До / Після" comparison for a single case.
 *
 * The "after" image is revealed by a `clip-path` inset driven by a real
 * `<input type="range">` stretched across the frame. Using the native control
 * instead of hand-rolled pointer maths gives mouse drag, touch drag, keyboard
 * (arrows / Home / End) and screen-reader semantics for free — and it keeps
 * working if the drag handler ever fails to attach.
 *
 * The range sits above the images with `opacity-0`, so what the visitor sees is
 * the styled divider and grip rendered underneath it.
 */

import { useId, useState } from "react";
import Image from "next/image";
import { isPreOptimized } from "@/lib/image-src";

export interface BeforeAfterSliderLabels {
  before: string;
  after: string;
  /** Accessible name of the range control. */
  control: string;
  /** Hint shown on the frame until the visitor first moves the divider. */
  hint: string;
}

interface Props {
  beforeUrl: string;
  afterUrl: string;
  alt: string;
  labels: BeforeAfterSliderLabels;
  /** `priority` only for a block that can be above the fold. */
  priority?: boolean;
  sizes?: string;
}

export default function BeforeAfterSlider({
  beforeUrl, afterUrl, alt, labels, priority = false,
  sizes = "(max-width: 1024px) 100vw, 760px",
}: Props) {
  const [value, setValue] = useState(50);
  const [touched, setTouched] = useState(false);
  const id = useId();

  const onChange = (next: number) => {
    setValue(next);
    if (!touched) setTouched(true);
  };

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-champagne-dark select-none">
      {/* "Before" — the full frame underneath */}
      <Image
        src={beforeUrl}
        unoptimized={isPreOptimized(beforeUrl)}
        alt={alt ? `${labels.before}: ${alt}` : labels.before}
        title={alt || undefined}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover pointer-events-none"
        draggable={false}
      />

      {/* "After" — clipped to the right of the divider */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        aria-hidden
      >
        <Image
          src={afterUrl}
          unoptimized={isPreOptimized(afterUrl)}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Corner captions */}
      <span className="absolute left-3 bottom-3 z-10 pointer-events-none rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
        {labels.before}
      </span>
      <span className="absolute right-3 bottom-3 z-10 pointer-events-none rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
        {labels.after}
      </span>

      {/* Divider + grip */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.35)] pointer-events-none"
        style={{ left: `${value}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-main shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6 4 12l5 6M15 6l5 6-5 6" />
          </svg>
        </span>
      </div>

      {!touched && (
        <span className="absolute left-1/2 top-4 z-10 -translate-x-1/2 pointer-events-none rounded-full bg-black/45 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
          {labels.hint}
        </span>
      )}

      {/* The actual control — invisible, full-frame, native semantics. */}
      <label htmlFor={id} className="sr-only">{labels.control}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={labels.control}
        aria-valuetext={`${Math.round(value)}%`}
        className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  );
}
