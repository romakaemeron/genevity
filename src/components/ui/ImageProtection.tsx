"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    const prevent = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };
    document.addEventListener("dragstart", prevent);
    return () => document.removeEventListener("dragstart", prevent);
  }, []);

  return null;
}
