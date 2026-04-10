"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Instagram, Facebook, YouTube, MapPin, Phone, Clock } from "@/components/ui/Icons";

export default function Footer() {
  const t = useTranslations("footer");

  const usefulLinks = [
    { label: t("usefulLinks.0.label"), href: t("usefulLinks.0.href") },
    { label: t("usefulLinks.1.label"), href: t("usefulLinks.1.href") },
    { label: t("usefulLinks.2.label"), href: t("usefulLinks.2.href") },
    { label: t("usefulLinks.3.label"), href: t("usefulLinks.3.href") },
  ];

  return (
    <footer className="border-t border-black-10 mt-[var(--spacing-block)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
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
            <p className="body-s text-black-40 mt-2">{t("license")}</p>
          </div>

          {/* Useful Links */}
          <div className="flex flex-col gap-3">
            <p className="body-strong text-black-60">{t("useful")}</p>
            <div className="flex flex-col gap-2.5">
              {usefulLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="body-m text-black hover:text-main transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="body-strong text-black-60">{t("contact")}</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 body-m text-black">
                <MapPin className="w-4 h-4 text-main shrink-0" />
                {t("address")}
              </div>
              <div className="flex items-center gap-2 body-m text-black">
                <Phone className="w-4 h-4 text-main shrink-0" />
                {t("phone")}
              </div>
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
          {/* <div className="flex items-center gap-6">
            <Link href="#" className="body-s text-black-40 hover:text-main transition-colors">
              {t("privacy")}
            </Link>
            <Link href="#" className="body-s text-black-40 hover:text-main transition-colors">
              {t("terms")}
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
