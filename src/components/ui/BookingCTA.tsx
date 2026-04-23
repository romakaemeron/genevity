"use client";

/**
 * Universal booking call-to-action button. Lives in the hero, final CTA
 * cards, the megamenu, and anywhere else the site asks someone to book.
 * Clicking opens a modal with the booking form (name / phone / interest
 * search). Submissions land in /admin/forms + fire an email via Resend.
 *
 * Previously this component opened a "contacts modal" with address / phone
 * info — the form replaces that entirely. Users who want to call the
 * clinic directly can still do so from the Contacts page or the Footer.
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import BookingForm from "@/components/ui/BookingForm";

interface BookingCTAProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
  /** Pre-select an option in the dropdown (e.g. a service-detail page
   *  pre-picks its own service when opening the form). Values look like
   *  `service:<slug>` or `doctor:<slug>`. */
  initialInterest?: string;
}

export default function BookingCTA({
  variant = "primary",
  size = "md",
  className,
  children,
  initialInterest,
}: BookingCTAProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslations("ctaForm");

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setModalOpen(true)} className={className}>
        {children}
      </Button>

      <AnimatePresence>
        {modalOpen && (
          <Modal open onClose={() => setModalOpen(false)} maxWidth="sm:max-w-md">
            <div className="p-6 sm:p-8 pt-10 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="heading-3 text-ink">{t("modalTitle")}</h3>
                <p className="body-s text-stone">{t("modalSubtitle")}</p>
              </div>
              <BookingForm initialInterest={initialInterest} />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
