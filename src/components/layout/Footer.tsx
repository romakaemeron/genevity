"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Clock } from "@/components/ui/Icons";
import {
  serviceCategoriesForFooter,
  infoLinksForFooter,
  type NavCategory,
  type NavLeaf,
} from "./navConfig";

interface LegalLink {
  _id: string;
  slug: string;
  label: string;
}

interface FooterSettings {
  phone1: string;
  phone2: string;
  address: string;
  hours: string;
  instagram: string;
  mapsUrl?: string;
}

function CategoryColumn({ cat }: { cat: NavCategory }) {
  const tNav = useTranslations("nav_mega");
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={cat.href}
        className="body-strong text-black-60 hover:text-main transition-colors"
      >
        {tNav(cat.key)}
      </Link>
      <ul className="flex flex-col gap-2">
        {cat.items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              className="body-m text-black hover:text-main transition-colors"
            >
              {tNav(leaf.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkListColumn({ headingKey, items }: { headingKey: string; items: NavLeaf[] }) {
  const tNav = useTranslations("nav_mega");
  return (
    <div className="flex flex-col gap-3">
      <p className="body-strong text-black-60">{tNav(headingKey)}</p>
      <ul className="flex flex-col gap-2">
        {items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              className="body-m text-black hover:text-main transition-colors"
            >
              {tNav(leaf.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ legalDocs = [], settings }: { legalDocs?: LegalLink[]; settings?: FooterSettings }) {
  const t = useTranslations("footer");

  const [injectable, apparatus, intimate, laser, longevity] = serviceCategoriesForFooter;
  const moreServicesItems: NavLeaf[] = [
    { key: "care", label: { ua: "", ru: "", en: "" }, href: "/services/skincare" },
    { key: "podology", label: { ua: "", ru: "", en: "" }, href: "/services/podology" },
    { key: "diagnostics", label: { ua: "", ru: "", en: "" }, href: "/services/diagnostics" },
    { key: "plastic", label: { ua: "", ru: "", en: "" }, href: "/services/plastic-surgery" },
  ];

  return (
    <footer className="border-t border-black-10 mt-[var(--spacing-block)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-14 lg:py-20">
        {/* Main grid: brand + contacts on the left, service columns on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Col 1: Brand + contacts */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="block" style={{ width: "fit-content" }}>   
              <Image
                src="/brand/LogoFullDark.svg"
                alt="GENEVITY"
                width={180}
                height={48}
                className="block"
              />
            </Link>
            <p className="body-m text-black-60 max-w-[32ch]">{t("description")}</p>

            <div className="flex flex-col gap-2.5 mt-1">
              <a
                href={settings?.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(settings?.address || "GENEVITY")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 body-m text-black hover:text-main transition-colors"
              >
                <MapPin className="w-4 h-4 text-main shrink-0 mt-1" />
                <span>{settings?.address || ""}</span>
              </a>
              {settings?.phone1 && (
                <a
                  href={`tel:${settings.phone1.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 body-m text-black hover:text-main transition-colors"
                >
                  <Phone className="w-4 h-4 text-main shrink-0" />
                  <span>{settings.phone1}</span>
                </a>
              )}
              <div className="flex items-start gap-2 body-m text-black">
                <Clock className="w-4 h-4 text-main shrink-0 mt-1" />
                <span>{settings?.hours || ""}</span>
              </div>
            </div>

            <Link
              href="/legal/license"
              className="body-s text-black-40 mt-1 hover:text-main transition-colors"
            >
              {t("license")}
            </Link>
          </div>

          {/* Col 2: Ін'єкційна (full list) */}
          {injectable && <CategoryColumn cat={injectable} />}

          {/* Col 3: Апаратна + Лазерна (stacked) */}
          <div className="flex flex-col gap-8">
            {apparatus && <CategoryColumn cat={apparatus} />}
            {laser && <CategoryColumn cat={laser} />}
          </div>

          {/* Col 4: Longevity + Інтимне (stacked) */}
          <div className="flex flex-col gap-8">
            {longevity && <CategoryColumn cat={longevity} />}
            {intimate && <CategoryColumn cat={intimate} />}
          </div>

          {/* Col 5: More services + Info (stacked) */}
          <div className="flex flex-col gap-8">
            <LinkListColumn headingKey="more" items={moreServicesItems} />
            <LinkListColumn headingKey="info" items={infoLinksForFooter} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black-10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="body-s text-black-40">
            &copy; {new Date().getFullYear()} Genevity. {t("rights")}
          </p>
          {legalDocs.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center">
              {legalDocs.map((doc) => (
                <Link
                  key={doc._id}
                  href={`/legal/${doc.slug}`}
                  className="body-s text-black-40 hover:text-main transition-colors"
                >
                  {doc.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
