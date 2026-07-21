import { getHomepageData, getHeroSlides, getStaticPageSeo, getGalleryItems, getMediaMentions } from "@/lib/db/queries";
import { getClinicReviews, getReviewsSummary } from "@/lib/db/queries/reviews";
import { generatePageMetadata } from "@/lib/seo";
import { getTranslations , setRequestLocale} from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";

// All below-fold sections are dynamically imported — keeps initial bundle minimal
const About        = dynamic(() => import("@/components/home/About"));
const Equipment    = dynamic(() => import("@/components/home/Equipment"));
const Advantages   = dynamic(() => import("@/components/home/Advantages"));
const Doctors      = dynamic(() => import("@/components/home/Doctors"));
const ReviewsBlock = dynamic(() => import("@/components/reviews/ReviewsBlock"));
const HomeFaq      = dynamic(() => import("@/components/home/HomeFaq"));
const MediaCoverage = dynamic(() => import("@/components/home/MediaCoverage"));
const Contacts     = dynamic(() => import("@/components/home/Contacts"));
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seo = await getStaticPageSeo(locale, "home");
  return generatePageMetadata({
    title: seo?.title || "",
    description: seo?.description || "",
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [data, tLabels, heroSlides, homepageAboutGallery, advantagesBentoItems, reviews, reviewsSummary, mediaMentions] = await Promise.all([
    getHomepageData(locale),
    getTranslations("labels"),
    getHeroSlides(locale),
    getGalleryItems("homepage_about", locale),
    getGalleryItems("advantages_bento", locale),
    getClinicReviews(),
    getReviewsSummary(),
    getMediaMentions(locale),
  ]);

  return (
    <>
      <OrganizationSchema locale={locale} />
      {/* Sticky solid header — slides in once the hero scrolls past */}
      <MegaMenuHeader variant="solid" position="fixed" hideUntilScrollPastId="hero-end-sentinel" />
      <div className="flex flex-col gap-16 lg:gap-[120px]">
        <Hero data={data.hero} slides={heroSlides} />
        <div id="about"><About data={data.about} gallery={homepageAboutGallery} /></div>
        <div id="equipment" className="cv-auto">
          <Equipment items={data.equipment} ui={data.ui.equipment} />
        </div>
        <div id="advantages" className="cv-auto">
          <Advantages bentoImage={advantagesBentoItems[0] ?? null} />
        </div>
        <div id="doctors" className="cv-auto">
          <Doctors doctors={data.doctors} ui={data.ui.doctors} detailsLabel={data.ui.equipment.details} />
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 mt-6">
            <Link href="/doctors">
              <Button variant="outline" size="sm">
                {tLabels("allDoctors")}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        {reviews.length > 0 && (
          <div id="reviews" className="cv-auto">
            <ReviewsBlock
              reviews={reviews}
              summary={reviewsSummary}
              heading={data.ui.eeat.reviewsHeading}
              countLabel={data.ui.eeat.reviewsCount}
            />
          </div>
        )}
        <div id="faq" className="cv-auto">
          <HomeFaq />
        </div>
        {mediaMentions.length > 0 && (
          <div id="media" className="cv-auto">
            <MediaCoverage mentions={mediaMentions} locale={locale} />
          </div>
        )}
        <div id="contacts" className="cv-auto">
          <Contacts data={{ settings: data.settings, ui: data.ui.contacts }} />
        </div>
      </div>
    </>
  );
}
