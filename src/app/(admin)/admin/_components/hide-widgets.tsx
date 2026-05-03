"use client";

import { useEffect } from "react";

export default function HideWidgets() {
  useEffect(() => {
    const hidden: HTMLElement[] = [];

    function hide(el: HTMLElement) {
      if (el.dataset.adminHidden) return;
      el.dataset.adminHidden = "1";
      el.style.setProperty("display", "none", "important");
      hidden.push(el);
    }

    function scan() {
      // Find any iframe pointing to binotel and walk up to its top-level body child
      document.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
        const src = iframe.src || iframe.getAttribute("src") || "";
        if (!src.includes("binotel")) return;
        let el: Element | null = iframe;
        while (el?.parentElement && el.parentElement !== document.body) el = el.parentElement;
        if (el instanceof HTMLElement) hide(el);
        hide(iframe);
      });

      // Also sweep known selector patterns (belt-and-suspenders)
      const patterns = [
        '[id*="binotel"],[class*="binotel"]',
        '[id*="bch"],[class*="bch"]',
        '[id*="bcw"],[class*="bcw"]',
        '[id*="bingocall"],[class*="bingocall"]',
      ];
      patterns.forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach(hide);
      });
    }

    // Initial sweep (widget may already be in the DOM)
    scan();

    // Watch for widgets injected after mount (async script)
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: false });

    return () => {
      observer.disconnect();
      // Restore visibility so the widget works when navigating back to public pages
      hidden.forEach((el) => {
        delete el.dataset.adminHidden;
        el.style.removeProperty("display");
      });
    };
  }, []);

  return null;
}
