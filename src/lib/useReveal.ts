import { useRef, useEffect } from "react";

/**
 * Triggers a soft reveal animation (fade + translateY) on a DOM element
 * whenever the `trigger` value changes. Skips the first render.
 *
 * Usage:
 *   const ref = useReveal(someStateValue);
 *   return <div ref={ref}>...</div>
 */
export function useReveal<T>(trigger: T) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";

    void el.getBoundingClientRect();

    const timer = setTimeout(() => {
      el.style.transition =
        "opacity 0.5s cubic-bezier(0.23,1,0.32,1), transform 0.5s cubic-bezier(0.23,1,0.32,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 20);

    return () => clearTimeout(timer);
  }, [trigger]);

  return ref;
}
