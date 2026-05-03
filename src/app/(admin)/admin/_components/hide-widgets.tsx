"use client";

import { useEffect, useRef } from "react";

/**
 * Hides third-party floating widgets (Binotel etc.) on admin pages.
 * Instead of guessing class names, we hide every fixed-position direct
 * child of <body> that doesn't contain our own admin layout root.
 */
export default function HideWidgets() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hidden: { el: HTMLElement; prev: string }[] = [];

    function scan() {
      Array.from(document.body.children).forEach((child) => {
        const el = child as HTMLElement;
        // Skip non-visual elements
        if (["SCRIPT", "NOSCRIPT", "STYLE", "LINK", "META"].includes(el.tagName)) return;
        // Skip our own admin app container (the one that contains this component)
        if (rootRef.current && el.contains(rootRef.current)) return;
        // Skip if already hidden by us
        if (el.dataset.adminHidden) return;
        // Hide if position:fixed (widget) — check both computed and inline style
        const pos = el.style.position || getComputedStyle(el).position;
        if (pos === "fixed") {
          hidden.push({ el, prev: el.style.display });
          el.dataset.adminHidden = "1";
          el.style.setProperty("display", "none", "important");
        }
      });
    }

    // Sweep immediately
    scan();

    // Watch for widgets injected after mount
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      hidden.forEach(({ el, prev }) => {
        delete el.dataset.adminHidden;
        el.style.display = prev;
      });
    };
  }, []);

  return <span ref={rootRef} style={{ display: "none" }} aria-hidden="true" />;
}
