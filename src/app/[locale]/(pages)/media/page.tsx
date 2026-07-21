import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/seo";
import { getMediaMentions } from "@/lib/db/queries";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import MediaPage from "@/components/pages/MediaPage";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

const META = {
  ua: { title: "ЗМІ про GENEVITY ➦ Публікації та згадки про центр GENEVITY",
    description: "ЗМІ про GENEVITY ☝ Публікації, інтерв'ю та згадки про центр й експертів GENEVITY у зовнішніх джерелах." },
  ru: { title: "СМИ о GENEVITY ➦ Публикации и упоминания о центре GENEVITY",
    description: "СМИ о GENEVITY ☝ Публикации, интервью и упоминания о центре и экспертах GENEVITY во внешних источниках." },
  en: { title: "Media Coverage of GENEVITY ➦ Publications and Mentions of the GENEVITY Center",
    description: "Media Coverage of GENEVITY ☝ Publications, interviews, and mentions of the GENEVITY Center and its experts in external sources." },
} as const;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = META[(locale as keyof typeof META)] ?? META.ua;
  return generatePageMetadata({
    title: m.title, description: m.description,
    locale: locale as Locale, path: "/media",
  });
}

export default async function Page({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const mentions = await getMediaMentions(locale);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: mentions.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: m.url,
      name: m.title,
    })),
  };

  return (
    <>
      {mentions.length > 0 && <JsonLd data={itemList} />}
      <MegaMenuHeader variant="solid" position="fixed" />
      <MediaPage mentions={mentions} locale={locale} />
    </>
  );
}
