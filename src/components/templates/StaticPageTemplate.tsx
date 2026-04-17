"use client";

import type { StaticPageData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { ui } from "@/lib/ui-strings";

interface Props {
  data: StaticPageData;
  locale: Locale;
}

export default function StaticPageTemplate({ data, locale }: Props) {
  const breadcrumbs = [
    { label: ui("home", locale), href: "/" },
    { label: data.title, href: `/${data.slug}` },
  ];

  return (
    <>
      {data.faq?.length > 0 && (
        <FaqSchema items={data.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-20">
        <Breadcrumbs items={breadcrumbs} locale={locale} />

        <div className="mt-8 mb-12">
          <h1 className="heading-1 text-black">{data.h1 || data.title}</h1>
          {data.summary && (
            <p className="body-l text-muted mt-4 max-w-3xl">{data.summary}</p>
          )}
        </div>

        <SectionRenderer sections={data.sections || []} />

        {/* FAQ */}
        {data.faq?.length > 0 && (
          <div className="mt-16">
            <h2 className="heading-2 text-black mb-8">{ui("faq", locale)}</h2>
            <div className="flex flex-col gap-4">
              {data.faq.map((item, i) => (
                <details
                  key={i}
                  className="group border border-line rounded-[var(--radius-card)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer body-strong text-black hover:text-main transition-colors">
                    {item.question}
                    <span className="ml-4 text-muted group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <div className="px-5 pb-5 body-l text-muted">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
