import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLegalDocBySlug, getLegalDocs } from "@/lib/db/queries";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import ArticleBody, { processBody } from "@/components/blog/ArticleBody";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { buildAlternates } from "@/lib/url";
import type { Locale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const revalidate = 86400;

export async function generateStaticParams() {
  const docs = await getLegalDocs("ua");
  return routing.locales.flatMap((locale) =>
    docs.map(({ slug }) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await getLegalDocBySlug(locale, slug);
  return {
    title: doc?.seoTitle ?? doc?.title ?? slug,
    description: doc?.seoDesc ?? undefined,
    alternates: buildAlternates(`/legal/${slug}`, locale as Locale),
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = await getLegalDocBySlug(locale, slug);

  if (!doc || !doc.body) notFound();

  const backLabel: Record<string, string> = {
    ua: "Повернутися на головну",
    ru: "Вернуться на главную",
    en: "Back to home",
  };

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const html = processBody(doc.body);

  return (
    <>
      <JsonLdBreadcrumbList
        items={[
          { name: "GENEVITY", url: "https://genevity.com.ua/" },
          { name: doc.title, url: `https://genevity.com.ua${localePrefix}/legal/${slug}` },
        ]}
      />
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="pt-32 pb-24 bg-champagne">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 body-s text-black-40 hover:text-main transition-colors mb-16"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel[locale] || backLabel.ua}
          </Link>

          <article>
            <h1 className="heading-2 text-black mb-10 text-balance">{doc.title}</h1>
            <ArticleBody html={html} />
          </article>
        </div>
      </div>
    </>
  );
}
