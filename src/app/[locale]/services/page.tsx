import { getAllCategories } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import { getTranslations , setRequestLocale} from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { categoryIllustrations } from "@/components/ui/illustrations";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const titles: Record<string, string> = {
    ua: "Послуги GENEVITY — естетична медицина, діагностика та косметологія в Дніпрі",
    ru: "Услуги GENEVITY — эстетическая медицина, диагностика и косметология в Днепре",
    en: "GENEVITY Services — Aesthetic Medicine, Diagnostics, and Cosmetology in Dnipro",
  };
  const descs: Record<string, string> = {
    ua: "Повний спектр медичних та естетичних послуг в 🤍 GENEVITY 💫 Ін'єкційна та апаратна косметологія, діагностика, пластична хірургія та програми довголіття в Дніпрі.",
    ru: "Полный спектр медицинских и эстетических услуг в 🤍 GENEVITY 💫 Инъекционная и аппаратная косметология, диагностика, пластическая хирургия и программы долголетия в Днепре.",
    en: "A full range of medical and aesthetic services at 🤍 GENEVITY 💫 Injectable and non-invasive cosmetology, diagnostics, plastic surgery, and longevity programs in Dnipro.",
  };
  return generatePageMetadata({
    title: titles[locale] ?? titles.ua,
    description: descs[locale] ?? descs.ua,
    locale: locale as Locale,
    path: "/services",
  });
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [categories, t] = await Promise.all([
    getAllCategories(locale),
    getTranslations("labels"),
  ]);
  const topLevel = categories.filter((c) => !c.parent);

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const servicesLabel = locale === "ru" ? "Услуги" : locale === "en" ? "Services" : "Послуги";

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: servicesLabel, url: `https://genevity.com.ua${localePrefix}/services` },
      ]} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20">
        <div className="animate-enter animate-enter-1">
          <Breadcrumbs
            items={[
              { label: t("home"), href: "/" },
              { label: t("services"), href: "/services" },
            ]}
            locale={locale as Locale}
            noSchema
          />
        </div>

        <h1 className="heading-1 text-black mt-8 mb-12 animate-enter animate-enter-2">{t("services")}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map((cat, i) => {
            const Illustration = categoryIllustrations[cat.slug];
            return (
              <Link
                key={cat._id}
                href={`/services/${cat.slug}`}
                className={`group flex flex-col rounded-[var(--radius-card)] bg-champagne-dark hover:border-main/30 hover:shadow-[var(--shadow-md)] transition-all duration-300 overflow-hidden animate-enter animate-enter-${Math.min(i + 3, 6)}`}
              >
                {Illustration && (
                  <div className="flex items-center justify-center h-56 p-4 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    <Illustration className="w-full h-full text-black-60 group-hover:text-main illustration-draw transition-colors duration-500" />
                  </div>
                )}
                <div className="flex flex-col gap-3 p-6 flex-1">
                  <h2 className="heading-3 text-black group-hover:text-main transition-colors">
                    {cat.title}
                  </h2>
                  {cat.summary && (
                    <p className="body-m text-muted line-clamp-3">{cat.summary}</p>
                  )}
                  <div className="mt-auto pt-2">
                    <Button variant="outline" size="sm">
                      {t("learnMore")}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
