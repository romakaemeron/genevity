import { useRef, useEffect } from "react";

type RevealPreset = "slide-y" | "slide-x-blur" | "scale";

const presets: Record<RevealPreset, {
  from: Record<string, string>;
  to: Record<string, string>;
  duration: string;
}> = {
  "slide-y": {
    from: { opacity: "0", transform: "translateY(14px)", filter: "none" },
    to: { opacity: "1", transform: "translateY(0)", filter: "none" },
    duration: "0.5s",
  },
  "slide-x-blur": {
    from: { opacity: "0", transform: "translateX(24px)", filter: "blur(6px)" },
    to: { opacity: "1", transform: "translateX(0)", filter: "blur(0px)" },
    duration: "0.45s",
  },
  "scale": {
    from: { opacity: "0", transform: "scale(0.97)", filter: "none" },
    to: { opacity: "1", transform: "scale(1)", filter: "none" },
    duration: "0.4s",
  },
};

/**
 * Triggers a reveal animation on a DOM element whenever `trigger` changes.
 * Skips the first render.
 *
 * Presets:
 * - "slide-y" — fade + translateY (default, for general reveals)
 * - "slide-x-blur" — fade + translateX + blur (for tab switching)
 * - "scale" — fade + scale (for expand/collapse)
 */
export function useReveal<T>(trigger: T, preset: RevealPreset = "slide-y") {
  const ref = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;

    const p = presets[preset];
    const ease = "cubic-bezier(0.23,1,0.32,1)";

    el.style.transition = "none";
    Object.assign(el.style, p.from);

    void el.getBoundingClientRect();

    const timer = setTimeout(() => {
      el.style.transition = `opacity ${p.duration} ${ease}, transform ${p.duration} ${ease}, filter ${p.duration} ${ease}`;
      Object.assign(el.style, p.to);
    }, 20);

    return () => clearTimeout(timer);
  }, [trigger, preset]);

  return ref;
}
