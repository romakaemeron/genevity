import { useRef, useEffect } from "react";

type RevealPreset = "slide-y" | "slide-x-blur" | "scale";

const ease = "cubic-bezier(0.23,1,0.32,1)";

/**
 * Triggers a reveal animation on a DOM element whenever `trigger` changes.
 * Skips the first render.
 *
 * Presets:
 * - "slide-y" — fade + translateY (default)
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

    const dur = preset === "scale" ? "0.4s" : "0.45s";

    const from: Record<string, string> = {
      "slide-y": "translateY(14px)",
      "slide-x-blur": "translateX(24px)",
      "scale": "scale(0.97)",
    };

    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = from[preset];
    el.style.filter = preset === "slide-x-blur" ? "blur(4px)" : "none";

    void el.getBoundingClientRect();

    const timer = setTimeout(() => {
      el.style.transition = `opacity ${dur} ${ease}, transform ${dur} ${ease}, filter ${dur} ${ease}`;
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    }, 20);

    return () => clearTimeout(timer);
  }, [trigger, preset]);

  return ref;
}

/**
 * Direction-aware slide+blur for tab-like switching.
 * Pass the numeric index of the active tab — animation direction
 * is determined by whether the new index is greater or less than the previous.
 */
export function useDirectionalReveal(tabIndex: number) {
  const ref = useRef<HTMLDivElement>(null);
  const prevIndex = useRef(tabIndex);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      prevIndex.current = tabIndex;
      return;
    }
    const el = ref.current;
    if (!el) return;

    const direction = tabIndex > prevIndex.current ? 1 : -1;
    prevIndex.current = tabIndex;

    el.style.transition = "none";
    el.style.opacity = "0.6";
    el.style.transform = `translateX(${direction * 16}px)`;
    el.style.filter = "blur(3px)";

    void el.getBoundingClientRect();

    const timer = setTimeout(() => {
      el.style.transition = `opacity 0.45s ${ease}, transform 0.45s ${ease}, filter 0.45s ${ease}`;
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    }, 20);

    return () => clearTimeout(timer);
  }, [tabIndex]);

  return ref;
}
