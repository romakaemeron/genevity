"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

interface GalleryItem {
  src: string;
  alt: string;
  label: string;
  sublabel?: string;
  description?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: GalleryItem[];
  height?: string;
}

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * ALL items live in a fixed DOM order (by origIdx) forever — no elements are
 * ever mounted or unmounted mid-animation, so Safari never has to paint a
 * new <img> element. CSS `order` controls visual position; CSS transitions
 * on `flex` / `padding-left` control size.
 *
 * Ghost effect without a new DOM node:
 *  - When active changes 0→2: origIdx=0 keeps CSS order=0 for the duration of
 *    the collapse, so it stays visually on the left and collapses there.
 *    origIdx=2 gets order=0 (same order → DOM order wins → origIdx=2 comes
 *    after origIdx=0 = to its right), grows from its current size.
 *  - After the collapse finishes, origIdx=0 gets its final order and grows
 *    to its stripe size at the new position.
 *
 * Blink-free in Safari: the previously active image is already painted in the
 * compositor. No new element, no deferred image decode, no blank frame.
 */

interface StripeState {
  order: number;
  flex: number;
  pad: number;
  isActive: boolean;
  isGhosting: boolean; // collapsing at order=0 before settling
}

function useStripeStyles(
  ref: React.RefObject<HTMLDivElement | null>,
  state: StripeState,
  duration: number,
) {
  const mounted = useRef(false);
  const prev = useRef<StripeState>(state);
  const rafId = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const next = state;
    const p = prev.current;
    const fullTx = `flex ${duration}s 0s ${EASE}, padding-left ${duration}s 0s ${EASE}`;

    if (!mounted.current) {
      mounted.current = true;
      prev.current = next;
      el.style.cssText += `; order:${next.order}; flex:${next.flex} ${next.flex} 0px; padding-left:${next.pad}px; transition:none;`;
      // Enable transition after first paint so subsequent changes animate
      rafId.current = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transition = fullTx;
      });
      return;
    }

    cancelAnimationFrame(rafId.current!);

    const flexChanged = next.flex !== p.flex || next.pad !== p.pad;
    const orderChanged = next.order !== p.order;

    if (!flexChanged && !orderChanged) return;

    prev.current = next;

    // Always apply order immediately (it can't be transitioned anyway)
    el.style.order = String(next.order);

    if (!flexChanged) return;

    // Read the element's ACTUAL current animated position rather than the
    // previous target. This prevents the visible jump when a new hover
    // interrupts a running transition mid-way.
    const cs = getComputedStyle(el);
    const currentFlex = parseFloat(cs.flexGrow) || p.flex;
    const currentPad = parseFloat(cs.paddingLeft) || p.pad;

    // Snap to actual current position (no visual change), then rAF to target.
    // This is the only Safari-reliable way to trigger CSS transitions.
    el.style.transition = "none";
    el.style.flex = `${currentFlex} ${currentFlex} 0px`;
    el.style.paddingLeft = `${currentPad}px`;
    void el.getBoundingClientRect();

    rafId.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.transition = fullTx;
      ref.current.style.flex = `${next.flex} ${next.flex} 0px`;
      ref.current.style.paddingLeft = `${next.pad}px`;
    });
  });

  useLayoutEffect(() => () => cancelAnimationFrame(rafId.current!), []);
}

function Stripe({
  state,
  duration,
  item,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  state: StripeState;
  duration: number;
  item: GalleryItem;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useStripeStyles(ref, state, duration);

  return (
    <div
      ref={ref}
      className={`relative ${!state.isActive ? "cursor-pointer" : ""}`}
      style={{ minWidth: 0, overflow: "hidden" }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-full h-full rounded-[var(--radius-card)] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ width: "800px", left: "50%", transform: "translateX(-50%)" }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className={`object-cover transition-transform duration-700 ${
              !state.isActive ? "scale-[1.02]" : "scale-100"
            }`}
            sizes="800px"
          />
        </div>
        {!state.isActive && (
          <div className="absolute inset-0 bg-black/15" />
        )}
      </div>
    </div>
  );
}

export default function StripeGallery({ title, subtitle, items, height = "600px" }: Props) {
  const n = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  // ghostIdx: the origIdx currently playing the ghost (collapsing at order=0)
  const [ghostIdx, setGhostIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const getFlex = useCallback((pos: number, hovered: number | null): number => {
    if (pos === 0) return 10;
    if (pos === hovered) {
      const base = Math.max(0.3, 1.8 - (pos - 1) * 0.25);
      return base * 1.6;
    }
    if (pos === 1) return 1.8;
    if (pos === 2) return 1.2;
    if (pos === 3) return 0.7;
    if (pos === 4) return 0.5;
    return 0.35;
  }, []);

  const goTo = useCallback((newIdx: number) => {
    if (newIdx === activeIndex) return;
    setHoveredPos(null);
    setGhostIdx(activeIndex);   // old active ghosts in place
    setActiveIndex(newIdx);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setGhostIdx(null), 800);
  }, [activeIndex]);

  const goPrev = useCallback(() => goTo((activeIndex - 1 + n) % n), [activeIndex, n, goTo]);
  const goNext = useCallback(() => goTo((activeIndex + 1) % n), [activeIndex, n, goTo]);

  // Build visual order: active first, then rest wrapping around, ghost excluded from ordering
  const visibleOrder: number[] = [];
  for (let j = 0; j < n; j++) visibleOrder.push((activeIndex + j) % n);

  // Compute per-item state
  const stripeStates: StripeState[] = items.map((_, origIdx) => {
    const isActive = origIdx === activeIndex;
    const isGhosting = origIdx === ghostIdx;

    if (isGhosting) {
      // Ghost: collapses at order=0 (leftmost), before the new active
      return { order: 0, flex: 0, pad: 0, isActive: false, isGhosting: true };
    }

    const pos = visibleOrder.indexOf(origIdx);
    const flex = getFlex(pos, hoveredPos);
    const pad = pos === 0 ? 0 : 10;

    // During ghost phase: new active and all others are shifted one position right
    // visually (ghost occupies order=0). Give them order = pos + 1 so ghost sorts first.
    const order = ghostIdx !== null ? pos + 1 : pos;

    return { order, flex, pad, isActive, isGhosting: false };
  });

  const dur = 0.75;
  const active = items[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {title && <h2 className="heading-2 text-black">{title}</h2>}
            {subtitle && <p className="body-l text-muted mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" icon size="sm" onClick={goPrev}><ChevronLeft size={18} /></Button>
            <Button variant="secondary" icon size="sm" onClick={goNext}><ChevronRight size={18} /></Button>
          </div>
        </div>
      )}

      {/* All items rendered in fixed DOM order — no mounts/unmounts */}
      <div className="hidden md:flex overflow-hidden" style={{ height }}>
        {items.map((item, origIdx) => (
          <Stripe
            key={origIdx}
            state={stripeStates[origIdx]}
            duration={dur}
            item={item}
            onMouseEnter={() => {
              const pos = visibleOrder.indexOf(origIdx);
              if (pos > 0) setHoveredPos(pos);
            }}
            onMouseLeave={() => setHoveredPos(null)}
            onClick={() => {
              const pos = visibleOrder.indexOf(origIdx);
              if (pos > 0) goTo(origIdx);
            }}
          />
        ))}
      </div>

      {/* Mobile slideshow */}
      <div className="md:hidden">
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ opacity: i === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="100vw" />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full cursor-pointer transition-all ${i === activeIndex ? "w-6 h-2 bg-main" : "w-2 h-2 bg-black-20"}`}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <p className="body-strong text-black text-lg">{active.label}</p>
        {active.description && <p className="body-m text-muted mt-1">{active.description}</p>}
      </motion.div>
    </div>
  );
}
