"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/lib/useReveal";
import { renderInlineMarkdown } from "@/lib/inline-markdown";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import MedicalDisclaimer from "@/components/ui/MedicalDisclaimer";
import { FaqSchema } from "@/components/seo/FaqSchema";
import type { Locale } from "@/i18n/routing";
import type { FaqPageGroup } from "@/lib/db/queries";
import type { FaqCategoryKey } from "@/lib/db/queries/faq";
import type { UiStringsData } from "@/lib/db/types";

interface Props {
  groups: FaqPageGroup[];
  faqUi: UiStringsData["faq"];
  disclaimer?: string;
  locale: Locale;
}

function FaqCategorySection({
  category,
  label,
  items,
  openKey,
  onToggle,
}: {
  category: string;
  label: string;
  items: { question: string; answer: string }[];
  openKey: string | null;
  onToggle: (key: string) => void;
}) {
  const { ref, visible } = useScrollReveal();

  if (!items.length) return null;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`mt-16 first:mt-0 ${visible ? "revealed" : ""}`}>
      <h2 className="reveal heading-3 text-black mb-6">{label}</h2>
      <div className="reveal d1 border-t border-line">
        {items.map((item, i) => {
          const key = `${category}-${i}`;
          const isOpen = openKey === key;
          return (
            <div key={key} className="border-b border-line">
              <button
                onClick={() => onToggle(key)}
                className="w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer group"
                aria-expanded={isOpen}
              >
                <span className="body-strong text-black group-hover:text-main transition-colors pr-4 text-lg">
                  {item.question}
                </span>
                <span className={`faq-icon text-muted text-2xl leading-none shrink-0 ${isOpen ? "open" : ""}`}>+</span>
              </button>
              <div className={`accordion-body ${isOpen ? "open" : ""}`}>
                <div>
                  <p className="body-l text-muted pb-6 pr-8">{renderInlineMarkdown(item.answer)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FaqPage({ groups, faqUi, disclaimer, locale }: Props) {
  const tLabels = useTranslations("labels");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const allItems = groups.flatMap((g) => g.items);

  return (
    <>
      {allItems.length > 0 && <FaqSchema items={allItems} />}
      <section className="bg-champagne">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-10 lg:pb-16">
          <Breadcrumbs
            items={[
              { label: tLabels("home"), href: "/" },
              { label: faqUi.heading || faqUi.title, href: "/faq" },
            ]}
            locale={locale}
          />
          <h1 className="heading-1 text-black mt-6">{faqUi.heading}</h1>
          {faqUi.subtitle && <p className="heading-3 text-main mt-4">{faqUi.subtitle}</p>}
        </div>
      </section>

      <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20">
        {groups.map((group) => (
          <FaqCategorySection
            key={group.category}
            category={group.category}
            label={faqUi.categories[group.category as FaqCategoryKey] || group.category}
            items={group.items}
            openKey={openKey}
            onToggle={(key) => setOpenKey(openKey === key ? null : key)}
          />
        ))}

        {disclaimer && <MedicalDisclaimer text={disclaimer} />}
      </section>
    </>
  );
}
