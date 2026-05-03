"use client";

import { useEffect } from "react";

/**
 * Injects a <style> tag that hides third-party floating widgets (Binotel chat,
 * call-back buttons, etc.) while the admin panel is mounted, then removes it
 * when the user navigates away from /admin.
 */
export default function HideWidgets() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "__admin-hide-widgets";
    // Target Binotel widget containers by every selector pattern they're known to use.
    // Using visibility:hidden + pointer-events:none instead of display:none so the
    // widget's internal JS doesn't throw errors from trying to measure hidden elements.
    style.textContent = `
      [id*="binotel"], [class*="binotel"],
      [id*="bcw"], [class*="bcw"],
      [id*="bch"], [class*="bch"],
      iframe[src*="binotel.com"],
      iframe[src*="widgets.binotel"] {
        visibility: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("__admin-hide-widgets")?.remove();
  }, []);

  return null;
}
