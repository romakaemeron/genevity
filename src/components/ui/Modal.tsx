"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class, defaults to sm:max-w-lg */
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  maxWidth = "sm:max-w-lg",
}: ModalProps) {
  // Lock page scroll — reference-counted so nested modals share the lock
  useEffect(() => {
    if (!open) return;

    type WindowWithLock = typeof window & { __modalLock?: { count: number; scrollY: number } };
    const w = window as WindowWithLock;

    if (!w.__modalLock) {
      const scrollY = window.scrollY;
      w.__modalLock = { count: 0, scrollY };
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    }
    w.__modalLock.count++;

    return () => {
      if (!w.__modalLock) return;
      w.__modalLock.count--;
      if (w.__modalLock.count <= 0) {
        const savedY = w.__modalLock.scrollY;
        delete w.__modalLock;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, savedY);
        requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = "";
        });
      }
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1000]"
      >
        {/* Backdrop — click to close */}
        <div className="fixed inset-0 bg-black/80 z-[1000]" onClick={onClose} />

        {/* Centering wrapper — click outside panel to close. Not
             scrollable itself; the panel handles its own overflow so
             the close button can stick to the top while content scrolls. */}
        <div
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] bg-champagne rounded-[var(--radius-card)] shadow-xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky close — a zero-height wrapper pinned to the top
                 of the scrolling panel. The absolute-positioned button
                 inside it sits at the panel's top-right and stays
                 visible as content scrolls, without pushing the rest
                 of the modal down. pointer-events trick keeps the
                 invisible wrapper transparent to clicks. */}
            <div className="sticky top-0 z-10 h-0 pointer-events-none">
              <div className="absolute top-3 right-3 pointer-events-auto">
                <Button variant="ghost" icon size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {children}
          </motion.div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
