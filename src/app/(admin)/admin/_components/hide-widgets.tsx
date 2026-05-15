"use client";

import { useEffect } from "react";

export default function HideWidgets() {
  useEffect(() => {
    const hidden: { el: HTMLElement; prev: string }[] = [];

    function scan() {
      // The admin app root is marked with data-admin-root so we don't hide it
      const adminRoot = document.querySelector("[data-admin-root]");

      Array.from(document.body.children).forEach((child) => {
        const el = child as HTMLElement;
        if (["SCRIPT", "NOSCRIPT", "STYLE", "LINK", "META"].includes(el.tagName)) return;
        if (adminRoot && el.contains(adminRoot)) return;
        if (el.dataset.adminHidden) return;
        if (el.dataset.adminPortal) return;  // admin modal portals — never hide
        const pos = el.style.position || getComputedStyle(el).position;
        if (pos === "fixed") {
          hidden.push({ el, prev: el.style.display });
          el.dataset.adminHidden = "1";
          el.style.setProperty("display", "none", "important");
        }
      });
    }

    scan();

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

  return null;
}
