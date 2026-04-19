import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import HomeV2Page from "@/components/pages/HomeV2Page";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({
    title: "Homepage V2 Concept",
    description: "Conceptual redesign of the GENEVITY homepage",
    locale: locale as Locale,
    path: "/v2",
  });
}

export default async function HomeV2Route({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomeV2Page locale={locale as Locale} />;
}
