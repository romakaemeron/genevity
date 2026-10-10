import type { ContentSection } from "@/lib/db/types";
import RichTextSection from "./RichTextSection";
import BulletsSection from "./BulletsSection";
import StepsSection from "./StepsSection";
import CompareTableSection from "./CompareTableSection";
import PriceTableSection from "./PriceTableSection";
import IndicationsContraindicationsSection from "./IndicationsContraindicationsSection";
import PriceTeaserSection from "./PriceTeaserSection";
import CalloutSection from "./CalloutSection";
import ImageGallerySection from "./ImageGallerySection";
import ShowcaseGallerySection from "./ShowcaseGallerySection";
import RelatedDoctorsSection from "./RelatedDoctorsSection";
import CtaSection from "./CtaSection";
import SourcesSection from "./SourcesSection";
import AlternativesSection from "./AlternativesSection";

interface Props {
  sections: ContentSection[];
  /** Request locale — only the sections with built-in copy need it. */
  locale?: string;
}

function renderSection(section: ContentSection, index: number, locale?: string) {
  switch (section._type) {
    case "section.richText":
      return <RichTextSection {...section} index={index} />;
    case "section.bullets":
      return <BulletsSection {...section} />;
    case "section.steps":
      return <StepsSection {...section} />;
    case "section.compareTable":
      return <CompareTableSection {...section} />;
    case "section.priceTable":
      return <PriceTableSection {...section} />;
    case "section.indicationsContraindications":
      return <IndicationsContraindicationsSection {...section} />;
    case "section.priceTeaser":
      return <PriceTeaserSection {...section} />;
    case "section.callout":
      return <CalloutSection {...section} />;
    case "section.imageGallery":
      return <ImageGallerySection {...section} />;
    case "section.showcaseGallery":
      return <ShowcaseGallerySection {...section} />;
    case "section.relatedDoctors":
      return <RelatedDoctorsSection {...section} />;
    case "section.cta":
      return <CtaSection {...section} />;
    case "section.sources":
      return <SourcesSection section={section} />;
    case "section.alternatives":
      return <AlternativesSection section={section} locale={locale} />;
    default:
      return null;
  }
}

export default function SectionRenderer({ sections, locale }: Props) {
  if (!sections?.length) return null;

  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {sections.map((section, i) => (
        <div key={section._key} id={`section-${section._key}`}>
          {renderSection(section, i, locale)}
        </div>
      ))}
    </div>
  );
}
