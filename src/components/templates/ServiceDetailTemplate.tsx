"use client";

import type { ServiceData } from "@/sanity/types";
import type { Locale } from "@/i18n/routing";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import KeyFactsBar from "@/components/ui/KeyFactsBar";
import TocRail from "@/components/ui/TocRail";
import TocDropdown from "@/components/ui/TocDropdown";
import SectionRenderer from "@/components/sections/SectionRenderer";
import RelatedDoctorsStrip from "@/components/ui/RelatedDoctorsStrip";
import RelatedServicesGrid from "@/components/ui/RelatedServicesGrid";
import { FaqSchema } from "@/components/seo/FaqSchema";
import { JsonLdMedicalProcedure } from "@/components/seo/JsonLdMedicalProcedure";
import BookingCTA from "@/components/ui/BookingCTA";
import { absoluteUrl } from "@/lib/seo";
import { ui } from "@/lib/ui-strings";

interface Props {
  data: ServiceData;
  locale: Locale;
}

export default function ServiceDetailTemplate({ data, locale }: Props) {
  const tocItems = (data.sections || [])
    .filter((s) => "heading" in s && s.heading)
    .map((s) => ({
      key: s._key,
      label: (s as { heading: string }).heading,
    }));

  const breadcrumbs = [
    { label: ui("home", locale), href: "/" },
    { label: ui("services", locale), href: "/services" },
    { label: data.category.title, href: `/services/${data.category.slug}` },
    { label: data.title, href: `/services/${data.category.slug}/${data.slug}` },
  ];

  return (
    <>
      <JsonLdMedicalProcedure
        name={data.h1 || data.title}
        description={data.summary || ""}
        url={absoluteUrl(`/services/${data.category.slug}/${data.slug}`, locale)}
      />
      {data.faq?.length > 0 && (
        <FaqSchema items={data.faq.map((f) => ({ question: f.question, answer: f.answer }))} />
      )}

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] pt-28 pb-20">
        <Breadcrumbs items={breadcrumbs} locale={locale} />

        {/* Hero area */}
        <div className="mt-8 mb-6">
          <h1 className="heading-1 text-black">{data.h1 || data.title}</h1>
          {data.summary && (
            <p className="body-l text-muted mt-4 max-w-3xl">{data.summary}</p>
          )}
        </div>

        <KeyFactsBar
          procedureLength={data.procedureLength}
          effectDuration={data.effectDuration}
          sessionsRecommended={data.sessionsRecommended}
          priceFrom={data.priceFrom}
          priceUnit={data.priceUnit}
        />

        <div className="mt-4 mb-10">
          <BookingCTA variant="primary" size="lg">
            {ui("book", locale)}
          </BookingCTA>
        </div>

        {/* TOC dropdown (mobile) */}
        <TocDropdown items={tocItems} />

        {/* Content + TOC rail */}
        <div className="flex gap-12 mt-10">
          <TocRail items={tocItems} />
          <div className="flex-1 min-w-0">
            <SectionRenderer sections={data.sections || []} />
          </div>
        </div>

        {/* Related doctors */}
        {data.relatedDoctors?.length > 0 && (
          <div className="mt-16">
            <RelatedDoctorsStrip title={ui("ourSpecialists", locale)} doctors={data.relatedDoctors} />
          </div>
        )}

        {/* Related services */}
        {data.relatedServices?.length > 0 && (
          <div className="mt-16">
            <RelatedServicesGrid
              title={ui("alsoInteresting", locale)}
              services={data.relatedServices}
              categorySlug={data.category.slug}
            />
          </div>
        )}

        {/* Final CTA */}
        <div className="mt-20 bg-main rounded-[var(--radius-card)] p-8 lg:p-12 text-center">
          <h2 className="heading-2 text-champagne mb-4">{ui("bookCta", locale)}</h2>
          <p className="body-l text-white-60 mb-8 max-w-2xl mx-auto">
            {ui("ctaSubtitle", locale)}
          </p>
          <BookingCTA
            variant="secondary"
            size="lg"
            className="bg-champagne text-black hover:bg-champagne-dark"
          >
            {ui("bookConsultation", locale)}
          </BookingCTA>
        </div>
      </div>
    </>
  );
}
