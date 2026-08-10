import { getUiStringsData, getSiteSettingsData, getStaticPageSeo } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import BookingPage from "@/components/pages/BookingPage";
import { setRequestLocale } from "next-intl/server";

// The wizard itself is client-only and reads live availability; this shell is
// just copy and chrome, so it can cache like every other static page.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [seo, uiStrings] = await Promise.all([
    getStaticPageSeo(locale, "booking"),
    getUiStringsData(locale),
  ]);
  return generatePageMetadata({
    title: seo?.title || uiStrings.booking?.title || "",
    description: seo?.description || uiStrings.booking?.subtitle || "",
    ogImage: seo?.ogImage,
    noindex: seo?.noindex,
    locale: locale as Locale,
    path: "/booking",
  });
}

export default async function OnlineBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [uiStrings, settings] = await Promise.all([
    getUiStringsData(locale),
    getSiteSettingsData(locale),
  ]);

  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <BookingPage
        locale={locale as Locale}
        ui={uiStrings.booking}
        phone={settings.phone1}
        hours={settings.hours}
      />
    </>
  );
}
