import { getAllCategories } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { categoryIllustrations } from "@/components/ui/illustrations";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "ru" ? "Услуги — косметология и longevity в Днепре" : locale === "en" ? "Services — Cosmetology & Longevity in Dnipro" : "Послуги — косметологія та longevity у Дніпрі",
    description: locale === "ru" ? "Полный спектр услуг центра эстетической медицины и долголетия GENEVITY в Днепре" : locale === "en" ? "Full range of aesthetic medicine and longevity services at GENEVITY center in Dnipro" : "Повний спектр послуг центру естетичної медицини та довголіття GENEVITY у Дніпрі",
    locale: locale as Locale,
    path: "/services",
  });
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [categories, t] = await Promise.all([
    getAllCategories(locale),
    getTranslations("labels"),
  ]);
  const topLevel = categories.filter((c) => !c.parent);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20">
        <div className="animate-enter animate-enter-1">
          <Breadcrumbs
            items={[
              { label: t("home"), href: "/" },
              { label: t("services"), href: "/services" },
            ]}
            locale={locale as Locale}
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
