"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";

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
  const settings = useSiteSettings();

  // All "clinic contact" values flow through context so they stay in sync with
  // the admin's Contact Info tab. Fallbacks exist only as a safety net.
  const phone1 = settings?.phone1 || "+380 73 000 0150";
  const phone2 = settings?.phone2 || "+380 93 000 0150";
  const phone1Tel = `tel:${phone1.replace(/\s/g, "")}`;
  const phone2Tel = `tel:${phone2.replace(/\s/g, "")}`;
  const mapsUrl = settings?.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(settings?.address || "GENEVITY")}`;
  const mapsEmbed = settings?.mapsEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(settings?.address || "GENEVITY")}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const address = settings?.address || t("address");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <Button variant={variant} size={size} href={phone1Tel} className={className}>
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
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full aspect-[16/9] rounded-[var(--radius-card)] overflow-hidden skeleton relative group"
              >
                <iframe
                  src={mapsEmbed}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Genevity on Google Maps"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors pointer-events-none" />
              </a>

              {/* Address */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 body-l text-black hover:text-main transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                {address}
              </a>

              {/* Phones */}
              <div className="flex flex-col gap-2">
                <a
                  href={phone1Tel}
                  className="flex items-center gap-3 body-l text-black hover:text-main transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  {phone1}
                </a>
                <a
                  href={phone2Tel}
                  className="flex items-center gap-3 body-l text-black hover:text-main transition-colors pl-[52px]"
                >
                  {phone2}
                </a>
              </div>

              {/* Direct call CTA */}
              <Button variant="primary" href={phone1Tel} className="w-full text-center">
                {children}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
