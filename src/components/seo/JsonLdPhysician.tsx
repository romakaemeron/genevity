import { JsonLd } from "./JsonLd";

/**
 * schema.org Physician structured data.
 * @see https://schema.org/Physician
 */
interface Props {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  medicalSpecialty?: string[];
  worksFor?: { name: string; url: string };
}

export function JsonLdPhysician({
  name,
  url,
  image,
  jobTitle,
  medicalSpecialty,
  worksFor,
}: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name,
    url,
  };

  if (image) data.image = image;
  if (jobTitle) data.jobTitle = jobTitle;
  if (medicalSpecialty) data.medicalSpecialty = medicalSpecialty;
  if (worksFor) {
    data.worksFor = {
      "@type": "MedicalBusiness",
      ...worksFor,
    };
  }

  return <JsonLd data={data} />;
}
