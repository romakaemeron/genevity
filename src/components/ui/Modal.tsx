"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, maxWidth = "sm:max-w-lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    type WindowWithLock = typeof window & { __modalLock?: { count: number; scrollY: number } };
    const w = window as WindowWithLock;
    if (!w.__modalLock) {
      const scrollY = window.scrollY;
      w.__modalLock = { count: 0, scrollY };
      document.body.style.cssText = `position:fixed;top:-${scrollY}px;left:0;right:0;overflow:hidden`;
    }
    w.__modalLock.count++;
    return () => {
      if (!w.__modalLock) return;
      w.__modalLock.count--;
      if (w.__modalLock.count <= 0) {
        const savedY = w.__modalLock.scrollY;
        delete w.__modalLock;
        document.body.style.cssText = "";
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, savedY);
        requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[1000]">
      <div className="fixed inset-0 bg-black/80 z-[1000]" onClick={onClose} />
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
        <div
          className={`modal-panel relative w-full ${maxWidth} max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] bg-champagne rounded-[var(--radius-card)] shadow-xl overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 h-0 pointer-events-none">
            <div className="absolute top-3 right-3 pointer-events-auto">
              <Button variant="ghost" icon size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
