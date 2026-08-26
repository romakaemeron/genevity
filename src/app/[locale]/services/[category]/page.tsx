import { notFound } from "next/navigation";
import { getCategoryBySlug, getServicesByCategory, getAllCategorySlugs, getAllDoctors, getUiStringsData, getCategoryReviews } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import CategoryHubTemplate from "@/components/templates/CategoryHubTemplate";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { JsonLdImageObject } from "@/components/seo/JsonLdImageObject";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return routing.locales.flatMap((locale) =>
    categories.map(({ slug }) => ({ locale, category: slug }))
  );
}

/** Map category slugs to the doctors shown on the hub, keyed by doctor slug
 *  (`_id` is a database UUID and must not be hardcoded). */
const categoryDoctorSlugs: Record<string, string[]> = {
  "injectable-cosmetology": ["beliyanushkin-viktor", "sepkina-hanna", "polunina-veronika"],
  "apparatus-cosmetology": ["beliyanushkin-viktor", "sepkina-hanna"],
  "intimate-rejuvenation": ["kroshka-iryna", "beliyanushkin-viktor"],
  "laser-hair-removal": ["sepkina-hanna", "beliyanushkin-viktor"],
  "longevity": ["poleshko-kateryna", "minchuk-yevheniia", "tolstykova-tetiana"],
  "plastic-surgery": ["detsyk-dmytro", "harmash-serhii"],
  "diagnostics": ["fedorenko-svitlana", "poleshko-kateryna"],
  "podology": ["kyrylenko-anzhela"],
  "gynaecology": ["kroshka-iryna"],
};

const DEFAULT_HERO = { src: "/clinic/semi1737-hdr.webp", position: "center" };

const DEFAULT_PHOTOS = [
  "/clinic/semi1737-hdr.webp",
  "/clinic/semi1287-hdr.webp",
  "/clinic/semi1256-hdr.webp",
  "/clinic/hydrafacial.webp",
  "/clinic/acupulse.webp",
];

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const cat = await getCategoryBySlug(locale, slug);
  if (!cat) return {};
  return generatePageMetadata({
    title: cat.seoTitle || cat.title,
    description: cat.seoDescription || cat.summary || `${cat.title} у центрі GENEVITY, Дніпро`,
    locale: locale as Locale,
    path: `/services/${slug}`,
    noindex: cat.seoNoindex,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category: slug } = await params;
  const [category, services, doctors, uiStrings, reviews] = await Promise.all([
    getCategoryBySlug(locale, slug),
    getServicesByCategory(locale, slug),
    getAllDoctors(locale),
    getUiStringsData(locale),
    getCategoryReviews(slug, locale),
  ]);

  if (!category) notFound();

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const servicesLabel = locale === "ru" ? "Услуги" : locale === "en" ? "Services" : "Послуги";

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: servicesLabel, url: `https://genevity.com.ua${localePrefix}/services` },
        { name: category.title, url: `https://genevity.com.ua${localePrefix}/services/${slug}` },
      ]} />
      <JsonLdImageObject
        url={category.heroImage || DEFAULT_HERO.src}
        caption={category.title}
      />
      {/* Sticky solid header — slides in after hero scrolls past */}
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="category-hero-sentinel" />
      <CategoryHubTemplate
        category={category}
        services={services}
        locale={locale as Locale}
        heroImage={category.heroImage ? { src: category.heroImage, position: "center" } : DEFAULT_HERO}
        heroVariant="light"
        images={category.gallery?.length ? category.gallery : DEFAULT_PHOTOS}
        doctors={
          categoryDoctorSlugs[slug]
            ? (() => {
                const picked = doctors.filter((d) => d.slug && categoryDoctorSlugs[slug].includes(d.slug));
                return picked.length ? picked : doctors.slice(0, 4);
              })()
            : doctors.slice(0, 4)
        }
        doctorsUi={uiStrings?.doctors}
        detailsLabel={uiStrings?.equipment?.details}
        reviews={reviews}
      />
    </>
  );
}
