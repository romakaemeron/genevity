"use client";

/**
 * Universal booking call-to-action button. Clicking opens a modal with
 * the booking form (name / phone / interest search). Submissions land in
 * /admin/forms + fire an email via Resend.
 *
 * Each usage identifies itself with a `ctaKey` matching an entry in
 * CTA_REGISTRY so admins can independently override this specific
 * instance's copy (button label / modal title / modal subtitle / submit
 * label) from /admin/settings/cta. Unspecified overrides fall back to
 * the global ctaForm.* defaults; a missing override object for any
 * given key means "use defaults everywhere".
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMessages, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import type { CtaKey } from "@/lib/cta-registry";

const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });
const BookingForm = dynamic(() => import("@/components/ui/BookingForm"), { ssr: false });

interface BookingCTAProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
  ctaKey?: CtaKey;
  initialInterest?: string;
}

function readOverride(
  messages: Record<string, unknown> | null,
  ctaKey: string | undefined,
  field: string,
): string | undefined {
  if (!messages || !ctaKey) return undefined;
  const cta = messages.cta as Record<string, unknown> | undefined;
  const entry = cta?.[ctaKey] as Record<string, unknown> | undefined;
  const v = entry?.[field];
  return typeof v === "string" && v.trim() ? v : undefined;
}

export default function BookingCTA({
  variant = "primary",
  size = "md",
  className,
  children,
  ctaKey,
  initialInterest,
}: BookingCTAProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("ctaForm");
  const messages = useMessages() as Record<string, unknown>;

  const override = (field: string) => readOverride(messages, ctaKey, field);
  const buttonLabel = override("buttonLabel");
  const modalTitle = override("modalTitle") || t("modalTitle");
  const modalSubtitle = override("modalSubtitle") || t("modalSubtitle");
  const submitLabel = override("submitLabel") || t("submit");

  const handleClose = () => {
    setModalOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setModalOpen(true)} className={className}>
        {buttonLabel || children}
      </Button>

      {modalOpen && (
        <Modal open onClose={handleClose} maxWidth="sm:max-w-md">
          <div className="p-6 sm:p-8 pt-10 flex flex-col gap-5">
            {!submitted && (
              <div className="flex flex-col gap-1">
                <h3 className="heading-3 text-ink">{modalTitle}</h3>
                <p className="body-m text-stone">{modalSubtitle}</p>
              </div>
            )}
            <BookingForm
              initialInterest={initialInterest}
              submitLabel={submitLabel}
              ctaKey={ctaKey}
              onSubmitted={() => setSubmitted(true)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
