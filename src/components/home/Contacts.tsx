"use client";

import { useScrollReveal } from "@/lib/useReveal";
import { MapPin, Phone, Instagram } from "@/components/ui/Icons";
import type { SiteSettingsData } from "@/lib/db/types";

export default function Contacts({ data }: { data: { settings: SiteSettingsData; ui: { title: string; instagramLabel: string } } }) {
  const { settings, ui } = data;
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={`max-w-container mx-auto px-4 sm:px-6 lg:px-12 ${visible ? "revealed" : ""}`}>
      <div className="flex flex-col gap-8">
        <h2 className="reveal heading-2 text-black">{ui.title}</h2>

        <div className="reveal d1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <a
              href={settings.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(settings.address || "GENEVITY")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="body-l text-black hover:text-main transition-colors"
            >
              {settings.address}
            </a>
          </div>

          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <a href={`tel:${settings.phone1.replace(/\s/g, "")}`} className="binct-phone-number-1 body-l text-black hover:text-main transition-colors">{settings.phone1}</a>
              <a href={`tel:${settings.phone2.replace(/\s/g, "")}`} className="binct-phone-number-2 body-l text-black hover:text-main transition-colors">{settings.phone2}</a>
            </div>
          </div>

          <div className="bg-champagne-dark rounded-[var(--radius-card)] p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-main/10 flex items-center justify-center text-main shrink-0">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="body-s text-black-40">{ui.instagramLabel}</p>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="body-l text-black hover:text-main transition-colors"
              >
                @{settings.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
