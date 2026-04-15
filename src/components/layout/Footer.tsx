"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Clock } from "@/components/ui/Icons";
import { serviceCategoriesForFooter, infoLinksForFooter, t as navT } from "./navConfig";

interface LegalLink {
  _id: string;
  slug: string;
  label: string;
}

const servicesHeading = {
  ua: "Послуги",
  ru: "Услуги",
  en: "Services",
};

const infoHeading = {
  ua: "Інформація",
  ru: "Информация",
  en: "Information",
};

export default function Footer({ legalDocs = [] }: { legalDocs?: LegalLink[] }) {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t border-black-10 mt-[var(--spacing-block)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/">
              <Image
                src="/brand/LogoFullDark.svg"
                alt="GENEVITY"
                width={160}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="body-m text-black-60">{t("description")}</p>
            <Link
              href="/legal/license"
              className="body-s text-black-40 mt-2 hover:text-main transition-colors"
            >
              {t("license")}
            </Link>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-3">
            <p className="body-strong text-black-60">{navT(servicesHeading, locale)}</p>
            <div className="flex flex-col gap-2.5">
              {serviceCategoriesForFooter.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="body-m text-black hover:text-main transition-colors"
                >
                  {navT(cat.label, locale)}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3">
            <p className="body-strong text-black-60">{navT(infoHeading, locale)}</p>
            <div className="flex flex-col gap-2.5">
              {infoLinksForFooter.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="body-m text-black hover:text-main transition-colors"
                >
                  {navT(link.label, locale)}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="body-strong text-black-60">{t("contact")}</p>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://www.google.com/maps/search/вул.+Олеся+Гончара+12,+Дніпро"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 body-m text-black hover:text-main transition-colors"
              >
                <MapPin className="w-4 h-4 text-main shrink-0" />
                {t("address")}
              </a>
              <a
                href={`tel:${t("phone").replace(/\s/g, "")}`}
                className="flex items-center gap-2 body-m text-black hover:text-main transition-colors"
              >
                <Phone className="w-4 h-4 text-main shrink-0" />
                {t("phone")}
              </a>
              <div className="flex items-center gap-2 body-m text-black">
                <Clock className="w-4 h-4 text-main shrink-0" />
                {t("hours")}
              </div>
              {/* <div className="flex items-center gap-3 mt-2">
                <a href="#" className="text-main hover:text-main-dark transition-colors" aria-label="Instagram">
                  <Instagram />
                </a>
                <a href="#" className="text-main hover:text-main-dark transition-colors" aria-label="Facebook">
                  <Facebook />
                </a>
                <a href="#" className="text-main hover:text-main-dark transition-colors" aria-label="YouTube">
                  <YouTube />
                </a>
              </div> */}
            </div>
          </div>
        </div>

        <div className="border-t border-black-10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
