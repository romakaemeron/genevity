import { getAllCategories } from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: "Послуги — GENEVITY",
    description: "Повний спектр послуг центру естетичної медицини та довголіття GENEVITY у Дніпрі",
    locale: locale as Locale,
    path: "/services",
  });
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const categories = await getAllCategories(locale);
  const topLevel = categories.filter((c) => !c.parent);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-20">
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Послуги", href: "/services" },
          ]}
          locale={locale as Locale}
        />

        <h1 className="heading-1 text-black mt-8 mb-12">Послуги</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map((cat) => (
            <Link
              key={cat._id}
              href={`/services/${cat.slug}`}
              className="group flex flex-col gap-4 p-6 rounded-[var(--radius-card)] border border-line hover:border-main hover:shadow-[var(--shadow-card-hover)] transition-all"
            >
              <h2 className="heading-3 text-black group-hover:text-main transition-colors">
                {cat.title}
              </h2>
              {cat.summary && (
                <p className="body-m text-muted line-clamp-3">{cat.summary}</p>
              )}
              <span className="inline-flex items-center gap-1 body-m text-main mt-auto">
                Детальніше
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
