"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";

/**
 * Contact stripe above the mega menu: address, opening hours and both phone
 * numbers. Values come from `site_settings` through the context the locale
 * layout already provides, so admin edits reach it with no prop threading
 * through the 25 places that render the header.
 *
 * The parent owns visibility: `hidden` collapses the row to zero height rather
 * than unmounting it, so the header shrinks and the nav slides up to meet the
 * viewport edge in one motion.
 *
 * On phones only the number and the hours survive — the address is too long to
 * share a 32px row with them, and it is one tap away in the footer anyway.
 */
export default function UtilityBar({
  hidden,
  lightText,
}: {
  hidden: boolean;
  /** Matches the header's transparent variant, where the bar sits on a photo. */
  lightText: boolean;
}) {
  const settings = useSiteSettings();
  if (!settings) return null;

  const { phone1, phone2, address, hours, mapsUrl } = settings;
  if (!phone1 && !address && !hours) return null;

  const textClass = lightText ? "text-champagne/85" : "text-black-60";
  const hoverClass = lightText ? "hover:text-white" : "hover:text-main";
  const iconClass = lightText ? "text-champagne/70" : "text-main";
  const borderClass = lightText ? "border-white/15" : "border-black-10";

  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

  return (
    <div
      className={`overflow-hidden border-b transition-[height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${borderClass} ${
        hidden ? "h-0 opacity-0 border-b-0" : "h-8 lg:h-9 opacity-100"
      }`}
      // The row is decorative duplication of the footer's contact block for
      // sighted users; keep it out of the a11y tree while collapsed.
      aria-hidden={hidden}
    >
      <div className="max-w-[var(--container-max)] mx-auto h-full px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <div className={`flex h-full items-center justify-between gap-4 body-s ${textClass}`}>
          <div className="flex items-center gap-5 min-w-0">
            {address && (
              <a
                href={mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden lg:flex items-center gap-1.5 min-w-0 transition-colors ${hoverClass}`}
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
                <span className="truncate">{address}</span>
              </a>
            )}
            {hours && (
              <span className="flex items-center gap-1.5 min-w-0">
                <Clock className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
                <span className="truncate">{hours}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {phone1 && (
              /* Icon stays outside the anchor: Binotel only rewrites the href of
                 the element carrying the binct class, so the class must sit on
                 the <a>. Same reasoning as the footer's contact block. */
              <span className="flex items-center gap-1.5">
                <Phone className={`w-3.5 h-3.5 shrink-0 ${iconClass}`} aria-hidden="true" />
                <a href={tel(phone1)} className={`binct-phone-number-1 whitespace-nowrap transition-colors ${hoverClass}`}>
                  {phone1}
                </a>
              </span>
            )}
            {phone2 && (
              <a
                href={tel(phone2)}
                className={`binct-phone-number-2 hidden md:inline whitespace-nowrap transition-colors ${hoverClass}`}
              >
                {phone2}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
