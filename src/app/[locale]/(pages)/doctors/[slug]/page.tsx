import { notFound } from "next/navigation";
import { getDoctorBySlug, getAllDoctorSlugs } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import DoctorProfilePage from "@/components/pages/DoctorProfilePage";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllDoctorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doctor = await getDoctorBySlug(locale, slug);
  if (!doctor) return {};
  return generatePageMetadata({
    title: doctor.seoTitle || doctor.name,
    description: doctor.seoDescription || doctor.bio.slice(0, 155),
    locale: locale as Locale,
    path: `/doctors/${slug}`,
  });
}

export default async function DoctorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doctor = await getDoctorBySlug(locale, slug);
  if (!doctor) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    jobTitle: doctor.role,
    description: doctor.seoDescription || doctor.bio.slice(0, 200),
    url: `https://genevity.com.ua${locale === "ua" ? "" : "/" + locale}/doctors/${slug}`,
    ...(doctor.photoFull || doctor.photoCard ? {
      image: (doctor.photoFull || doctor.photoCard)!.startsWith("http")
        ? (doctor.photoFull || doctor.photoCard)
        : `https://genevity.com.ua${doctor.photoFull || doctor.photoCard}`,
    } : {}),
    worksFor: {
      "@type": "MedicalOrganization",
      name: "GENEVITY",
      url: "https://genevity.com.ua",
      address: {
        "@type": "PostalAddress",
        streetAddress: "вул. Гончара, 4",
        addressLocality: "Дніпро",
        addressCountry: "UA",
      },
    },
    ...(doctor.education.length > 0 ? {
      alumniOf: doctor.education.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.institution_uk,
      })),
    } : {}),
    ...(doctor.specialties.length > 0 ? { medicalSpecialty: doctor.specialties } : {}),
  };

  return (
    <>
      <JsonLd data={schema as Record<string, unknown>} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <DoctorProfilePage doctor={doctor} locale={locale as Locale} />
    </>
  );
}
