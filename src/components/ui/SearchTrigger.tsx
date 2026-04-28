"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

interface SearchTriggerProps {
  onOpen: () => void;
  variant?: "ghost" | "outline-light" | "secondary" | "outline";
  size?: "xs" | "sm" | "md";
}

export default function SearchTrigger({ onOpen, variant = "ghost", size = "sm" }: SearchTriggerProps) {
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
    <Button
      icon
      variant={variant}
      size={size}
      onClick={onOpen}
      ariaLabel="Пошук"
      title="⌘K"
    >
      <svg
        width="15"
        height="15"
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
    </Button>
  );
}
