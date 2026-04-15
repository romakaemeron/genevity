"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Clock } from "@/components/ui/Icons";
import {
  serviceCategoriesForFooter,
  infoLinksForFooter,
  t as navT,
  type NavCategory,
  type NavLeaf,
} from "./navConfig";

interface LegalLink {
  _id: string;
  slug: string;
  label: string;
}

const L = (ua: string, ru: string, en: string) => ({ ua, ru, en });

const headings = {
  injectable: L("Ін'єкційна косметологія", "Инъекционная косметология", "Injectable cosmetology"),
  apparatus: L("Апаратна косметологія", "Аппаратная косметология", "Apparatus cosmetology"),
  intimate: L("Інтимне відновлення", "Интимное восстановление", "Intimate rejuvenation"),
  laser: L("Лазерна епіляція", "Лазерная эпиляция", "Laser hair removal"),
  longevity: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  more: L("Інші послуги", "Другие услуги", "More services"),
  info: L("Інформація", "Информация", "Information"),
};

function CategoryColumn({
  cat,
  locale,
}: {
  cat: NavCategory;
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={cat.href}
        className="body-strong text-black-60 hover:text-main transition-colors"
      >
        {navT(cat.label, locale)}
      </Link>
      <ul className="flex flex-col gap-2">
        {cat.items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              className="body-m text-black hover:text-main transition-colors"
            >
              {navT(leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkListColumn({
  heading,
  items,
  locale,
}: {
  heading: { ua: string; ru: string; en: string };
  items: NavLeaf[];
  locale: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="body-strong text-black-60">{navT(heading, locale)}</p>
      <ul className="flex flex-col gap-2">
        {items.map((leaf) => (
          <li key={leaf.key}>
            <Link
              href={leaf.href}
              className="body-m text-black hover:text-main transition-colors"
            >
              {navT(leaf.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ legalDocs = [] }: { legalDocs?: LegalLink[] }) {
  const t = useTranslations("footer");
  const locale = useLocale();

  const [injectable, apparatus, intimate, laser, longevity] = serviceCategoriesForFooter;
  const extraServices = (serviceCategoriesForFooter[0] ? [] : []) as NavLeaf[]; // placeholder, extras live in mega.extra
  // Pull extras directly from the mega menu definition for consistency
  const moreServicesItems: NavLeaf[] = [
    { key: "skincare", label: L("Доглядові процедури", "Уходовые процедуры", "Skincare treatments"), href: "/services/skincare" },
    { key: "podology", label: L("Подологія", "Подология", "Podology"), href: "/services/podology" },
    { key: "diagnostics", label: L("Діагностичні послуги", "Диагностические услуги", "Diagnostic services"), href: "/services/diagnostics" },
    { key: "plastic", label: L("Пластична хірургія", "Пластическая хирургия", "Plastic surgery"), href: "/services/plastic-surgery" },
  ];
  void extraServices;

  return (
    <footer className="border-t border-black-10 mt-[var(--spacing-block)]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] py-14 lg:py-20">
        {/* Main grid: brand + contacts on the left, service columns on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Col 1: Brand + contacts */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/LogoFullDark.svg"
                alt="GENEVITY"
                width={289}
                height={64}
                style={{ height: "64px", width: "auto" }}
                className="block"
              />
            </Link>
            <p className="body-m text-black-60 max-w-[32ch]">{t("description")}</p>

            <div className="flex flex-col gap-2.5 mt-1">
              <a
                href="https://www.google.com/maps/search/вул.+Олеся+Гончара+12,+Дніпро"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 body-m text-black hover:text-main transition-colors"
              >
                <MapPin className="w-4 h-4 text-main shrink-0 mt-1" />
                <span>{t("address")}</span>
              </a>
              <a
                href={`tel:${t("phone").replace(/\s/g, "")}`}
                className="flex items-center gap-2 body-m text-black hover:text-main transition-colors"
              >
                <Phone className="w-4 h-4 text-main shrink-0" />
                <span>{t("phone")}</span>
              </a>
              <div className="flex items-start gap-2 body-m text-black">
                <Clock className="w-4 h-4 text-main shrink-0 mt-1" />
                <span>{t("hours")}</span>
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
          {injectable && <CategoryColumn cat={injectable} locale={locale} />}

          {/* Col 3: Апаратна + Лазерна (stacked) */}
          <div className="flex flex-col gap-8">
            {apparatus && <CategoryColumn cat={apparatus} locale={locale} />}
            {laser && <CategoryColumn cat={laser} locale={locale} />}
          </div>

          {/* Col 4: Longevity + Інтимне (stacked) */}
          <div className="flex flex-col gap-8">
            {longevity && <CategoryColumn cat={longevity} locale={locale} />}
            {intimate && <CategoryColumn cat={intimate} locale={locale} />}
          </div>

          {/* Col 5: More services + Info (stacked) */}
          <div className="flex flex-col gap-8">
            <LinkListColumn heading={headings.more} items={moreServicesItems} locale={locale} />
            <LinkListColumn heading={headings.info} items={infoLinksForFooter} locale={locale} />
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
