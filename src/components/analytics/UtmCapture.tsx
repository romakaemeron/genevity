"use client";

/**
 * Mount-once UTM capture. Reads utm_* from the current URL and parks
 * them in sessionStorage so form submissions deeper into the visit
 * can still attribute to the landing source.
 *
 * Rendered near the root of the locale layout so every page captures
 * on first paint — idempotent and silent if nothing's there.
 */

import { useEffect } from "react";
import { captureFromLocation } from "@/lib/analytics/utm";

export default function UtmCapture() {
  useEffect(() => {
    captureFromLocation();
  }, []);
  return null;
}
