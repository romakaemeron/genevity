"use client";

import { useEffect } from "react";

interface SearchTriggerProps {
  onOpen: () => void;
  className?: string;
}

export default function SearchTrigger({ onOpen, className = "" }: SearchTriggerProps) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);

  return (
    <button
      onClick={onOpen}
      className={`flex items-center justify-center w-8 h-8 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/8 transition-colors duration-200 ${className}`}
      aria-label="Пошук"
      title="⌘K"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}
