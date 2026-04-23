"use client";

/**
 * Compact status dropdown used on the form_submissions list + detail
 * pages. Two states only:
 *
 *   • new       — red dot, "Нова"
 *   • processed — green dot, "Оброблено"
 *
 * The dropdown panel is portaled to <body> with fixed positioning
 * anchored to the trigger's bounding rect — lets it sit above the
 * table's overflow-x-auto clip. Outside-click closes, and the panel
 * also repositions on scroll/resize.
 */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
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
  { key: "new",       label: "Нова",      dot: "bg-error",   bg: "bg-error-light",   text: "text-error" },
  { key: "processed", label: "Оброблено", dot: "bg-success", bg: "bg-success-light", text: "text-success" },
];

/** Inline-styled dot — block + shrink-0 + explicit w/h so flex parents
 *  and nested text line-heights can't stretch it into a line. */
function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      style={{ width: 8, height: 8 }}
      className={`block shrink-0 rounded-full ${className}`}
    />
  );
}

export default function FormStatusDropdown({ id, current, stopRowNavigation }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const router = useRouter();

  // Position the portaled panel beneath the trigger.
  useEffect(() => {
    if (!open) { setAnchor(null); return; }
    const PANEL_WIDTH = 180;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setAnchor({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, PANEL_WIDTH) });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Outside-click closes — accept clicks on either the trigger's root
  // or the portaled panel.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const active = STATUSES.find((s) => s.key === current) ?? STATUSES[0];

  const handlePick = useCallback((key: FormStatus, e: React.MouseEvent) => {
    if (stopRowNavigation) e.stopPropagation();
    if (key === current) { setOpen(false); return; }
    startTransition(async () => {
      await setFormStatus(id, key);
      setOpen(false);
      router.refresh();
    });
  }, [current, id, router, stopRowNavigation]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          if (stopRowNavigation) e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-70 ${active.bg} ${active.text}`}
      >
        <Dot className={active.dot} />
        <span>{active.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && anchor && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: anchor.top,
              left: anchor.left,
              width: anchor.width,
              zIndex: 9999,
            }}
            className="rounded-[var(--radius-card)] bg-white border border-line shadow-lg overflow-hidden"
            onClick={(e) => { if (stopRowNavigation) e.stopPropagation(); }}
          >
            {STATUSES.map((s) => {
              const isActive = s.key === current;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={(e) => handlePick(s.key, e)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer hover:bg-champagne-dark transition-colors"
                >
                  <Dot className={s.dot} />
                  <span className="flex-1 text-ink">{s.label}</span>
                  {isActive && <Check size={13} className="text-main" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
