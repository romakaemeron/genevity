import type { ContentSection } from "@/lib/db/types";
import RichTextSection from "./RichTextSection";
import BulletsSection from "./BulletsSection";
import StepsSection from "./StepsSection";
import CompareTableSection from "./CompareTableSection";
import IndicationsContraindicationsSection from "./IndicationsContraindicationsSection";
import PriceTeaserSection from "./PriceTeaserSection";
import CalloutSection from "./CalloutSection";
import ImageGallerySection from "./ImageGallerySection";
import RelatedDoctorsSection from "./RelatedDoctorsSection";
import CtaSection from "./CtaSection";

interface Props {
  sections: ContentSection[];
}

function renderSection(section: ContentSection, index: number) {
  switch (section._type) {
    case "section.richText":
      return <RichTextSection {...section} index={index} />;
    case "section.bullets":
      return <BulletsSection {...section} />;
    case "section.steps":
      return <StepsSection {...section} />;
    case "section.compareTable":
      return <CompareTableSection {...section} />;
    case "section.indicationsContraindications":
      return <IndicationsContraindicationsSection {...section} />;
    case "section.priceTeaser":
      return <PriceTeaserSection {...section} />;
    case "section.callout":
      return <CalloutSection {...section} />;
    case "section.imageGallery":
      return <ImageGallerySection {...section} />;
    case "section.relatedDoctors":
      return <RelatedDoctorsSection {...section} />;
    case "section.cta":
      return <CtaSection {...section} />;
    default:
      return null;
  }
}

export default function SectionRenderer({ sections }: Props) {
  if (!sections?.length) return null;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {sections.map((section, i) => (
        <div key={section._key} id={`section-${section._key}`}>
          {renderSection(section, i)}
        </div>
      ))}
    </div>
  );
}
