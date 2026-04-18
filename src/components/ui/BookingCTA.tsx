"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const PHONE = "+380730000150";
const PHONE_DISPLAY = "+380 73 000 0150";
const MAPS_URL = "https://www.google.com/maps/place/Genevity+Longevity+Medical+Center/@48.4541478,35.0584843,17z";

interface BookingCTAProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
}

export default function BookingCTA({
  variant = "primary",
  size = "md",
  className,
  children,
}: BookingCTAProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslations("contacts");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <Button variant={variant} size={size} href={`tel:${PHONE}`} className={className}>
        {children}
      </Button>
    );
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setModalOpen(true)} className={className}>
        {children}
      </Button>

      <AnimatePresence>
        {modalOpen && (
          <Modal open onClose={() => setModalOpen(false)} maxWidth="sm:max-w-md">
            <div className="p-6 sm:p-8 pt-12 flex flex-col gap-6">
              <h3 className="heading-3 text-black">{t("title")}</h3>

              {/* Map */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full aspect-[16/9] rounded-[var(--radius-card)] overflow-hidden skeleton relative group"
              >
                <iframe
                  src="https://maps.google.com/maps?q=вул.+Олеся+Гончара+12,+Дніпро,+Україна&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Genevity on Google Maps"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors pointer-events-none" />
              </a>

              {/* Address */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 body-l text-black hover:text-main transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                {t("address")}
              </a>

              {/* Phones */}
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-3 body-l text-black hover:text-main transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  {PHONE_DISPLAY}
                </a>
                <a
                  href="tel:+380930000150"
                  className="flex items-center gap-3 body-l text-black hover:text-main transition-colors pl-[52px]"
                >
                  {t("phone2")}
                </a>
              </div>

              {/* Direct call CTA */}
              <Button variant="primary" href={`tel:${PHONE}`} className="w-full text-center">
                {children}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
