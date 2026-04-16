"use client";

import type { ServiceCategoryData, ServiceCardData, FaqItemData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RelatedServicesGrid from "@/components/ui/RelatedServicesGrid";
import { FaqSchema } from "@/components/seo/FaqSchema";
import BookingCTA from "@/components/ui/BookingCTA";

interface Props {
  category: ServiceCategoryData;
  services: ServiceCardData[];
  faq?: FaqItemData[];
  siblingCategories?: ServiceCategoryData[];
  locale: Locale;
}

export default function CategoryHubTemplate({ category, services, faq, locale }: Props) {
  const breadcrumbs = [
    { label: "Головна", href: "/" },
    { label: "Послуги", href: "/services" },
    { label: category.title, href: `/services/${category.slug}` },
  ];

  return (
    <>
      {faq && faq.length > 0 && (
        <FaqSchema items={faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-20">
        <Breadcrumbs items={breadcrumbs} locale={locale} />

        {/* Hero */}
        <div className="mt-8 mb-12">
          <h1 className="heading-1 text-black">{category.title}</h1>
          {category.summary && (
            <p className="body-l text-muted mt-4 max-w-3xl">{category.summary}</p>
          )}
          <div className="mt-6">
            <BookingCTA variant="primary" size="lg">
              Записатися на консультацію
            </BookingCTA>
          </div>
        </div>

        {/* Service grid */}
        {services.length > 0 && (
          <RelatedServicesGrid
            title="Процедури"
            services={services}
            categorySlug={category.slug}
          />
        )}

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <div className="mt-16">
            <h2 className="heading-2 text-black mb-8">Часті запитання</h2>
            <div className="flex flex-col gap-4">
              {faq.map((item, i) => (
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

        {/* CTA */}
        <div className="mt-20 bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">Запишіться на консультацію</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">
            Наші спеціалісти підберуть оптимальну програму саме для вас
          </p>
          <BookingCTA
            variant="secondary"
            size="lg"
            className="bg-champagne text-black hover:bg-champagne-dark"
          >
            Записатися
          </BookingCTA>
        </div>
      </div>
    </>
  );
}
