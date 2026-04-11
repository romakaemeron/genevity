import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { sanityClient } from "@/sanity/client";

export const revalidate = 60;

interface LegalDoc {
  title: string;
  content: string;
}

async function getLegalDoc(slug: string, locale: string): Promise<LegalDoc | null> {
  const l = locale === "ua" ? "uk" : locale;
  return sanityClient.fetch(
    `*[_type == "legalDoc" && slug.current == $slug][0] {
      "title": coalesce(title.${l}, title.uk),
      "content": coalesce(content.${l}, content.uk),
    }`,
    { slug }
  );
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doc = await getLegalDoc(slug, locale);

  if (!doc || !doc.content) notFound();

  const backLabel: Record<string, string> = {
    ua: "Повернутися на головну",
    ru: "Вернуться на главную",
    en: "Back to home",
  };

  // Split content into paragraphs
  const paragraphs = doc.content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-32 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 body-m text-main hover:text-main-dark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel[locale] || backLabel.ua}
      </Link>

      <article className="max-w-3xl">
        <h1 className="heading-2 text-black mb-8">{doc.title}</h1>

        <div className="flex flex-col gap-4">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="body-l text-black-80 whitespace-pre-wrap"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
