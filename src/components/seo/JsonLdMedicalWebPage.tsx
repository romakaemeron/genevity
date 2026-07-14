import { JsonLd } from "./JsonLd";

interface Props {
  url: string;
  name: string;
  /** ISO date YYYY-MM-DD */
  lastReviewed?: string;
  reviewer?: { name: string; url?: string };
}

/** schema.org MedicalWebPage with reviewedBy + lastReviewed for E-E-A-T. */
export function JsonLdMedicalWebPage({ url, name, lastReviewed, reviewer }: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    url,
    name,
  };
  if (lastReviewed) data.lastReviewed = lastReviewed;
  if (reviewer) {
    data.reviewedBy = {
      "@type": "Physician",
      name: reviewer.name,
      ...(reviewer.url ? { url: reviewer.url } : {}),
    };
  }
  return <JsonLd data={data} />;
}
