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
  // Lock page scroll when open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        const savedY = scrollY;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        // Restore scroll instantly — bypass smooth scroll behavior
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, savedY);
        // Re-enable smooth scroll on next frame
        requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = "";
        });
      };
    }
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
      {/* Scrollable overlay — the whole overlay scrolls, not the panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1000] overflow-y-auto"
      >
        {/* Backdrop — click to close */}
        <div className="fixed inset-0 bg-black/80 z-[1000]" onClick={onClose} />

        {/* Centering wrapper — click outside panel to close */}
        <div
          className="relative z-[1001] min-h-full flex items-center justify-center p-4 sm:p-8"
          onClick={onClose}
        >
          {/* Panel — auto height, hugs content */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} bg-champagne rounded-[var(--radius-card)] shadow-xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" icon size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {children}
          </motion.div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
