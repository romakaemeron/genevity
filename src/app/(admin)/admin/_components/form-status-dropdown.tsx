"use client";

/**
 * Compact status dropdown used on the form_submissions list + detail
 * pages. Two states only:
 *
 *   • new       — red dot, "Нова"
 *   • processed — green dot, "Оброблено"
 *
 * Clicking the pill opens a small panel with both options; picking one
 * fires the `setFormStatus` server action and triggers a router refresh
 * so the page reflects the new state without a full reload.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { setFormStatus, type FormStatus } from "../_actions/forms";

interface Props {
  id: string;
  current: FormStatus;
  /** Block the outer row click (so clicking the dropdown doesn't also
   *  navigate to the detail page when rendered inside a table row). */
  stopRowNavigation?: boolean;
}

const STATUSES: { key: FormStatus; label: string; dot: string; bg: string; text: string }[] = [
  { key: "new",       label: "Нова",       dot: "bg-error",       bg: "bg-error-light",   text: "text-error" },
  { key: "processed", label: "Оброблено",  dot: "bg-success",     bg: "bg-success-light", text: "text-success" },
];

export default function FormStatusDropdown({ id, current, stopRowNavigation }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const active = STATUSES.find((s) => s.key === current) ?? STATUSES[0];

  const handlePick = (key: FormStatus, e: React.MouseEvent) => {
    if (stopRowNavigation) e.stopPropagation();
    if (key === current) { setOpen(false); return; }
    startTransition(async () => {
      await setFormStatus(id, key);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div
      ref={rootRef}
      className="relative inline-block"
      onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
    >
      <button
        type="button"
        onClick={(e) => {
          if (stopRowNavigation) e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-70 ${active.bg} ${active.text}`}
      >
        <span className={`inline-block w-[6px] h-[6px] rounded-full ${active.dot}`} />
        <span>{active.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-20 min-w-[160px] rounded-[var(--radius-card)] bg-white border border-line shadow-lg overflow-hidden">
          {STATUSES.map((s) => {
            const isActive = s.key === current;
            return (
              <button
                key={s.key}
                type="button"
                onClick={(e) => handlePick(s.key, e)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer hover:bg-champagne-dark transition-colors"
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className="flex-1 text-ink">{s.label}</span>
                {isActive && <Check size={13} className="text-main" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
