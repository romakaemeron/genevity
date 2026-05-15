import { JsonLd } from "./JsonLd";

/**
 * schema.org MedicalProcedure structured data.
 * @see https://schema.org/MedicalProcedure
 */
interface Props {
  name: string;
  description: string;
  url: string;
  /** e.g. "NoninvasiveProcedure", "PercutaneousProcedure" */
  procedureType?: string;
  /** e.g. "30 хв" */
  howPerformed?: string;
  /** e.g. "мінімальний" */
  preparation?: string;
  /** e.g. "до 6 місяців" */
  followup?: string;
  bodyLocation?: string;
  /** e.g. "від 1200 грн" — displayed price string */
  priceFrom?: string;
}

export function JsonLdMedicalProcedure({
  name,
  description,
  url,
  procedureType,
  howPerformed,
  preparation,
  followup,
  bodyLocation,
  priceFrom,
}: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name,
    description,
    url,
  };

  if (procedureType) data.procedureType = procedureType;
  if (howPerformed) data.howPerformed = howPerformed;
  if (preparation) data.preparation = preparation;
  if (followup) data.followup = followup;
  if (bodyLocation) data.bodyLocation = bodyLocation;
  if (priceFrom) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "UAH",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "UAH",
        description: priceFrom,
      },
      url,
    };
  }

  return <JsonLd data={data} />;
}
