import { notFound } from "next/navigation";
import { getDoctorBySlug } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import DoctorProfilePage from "@/components/pages/DoctorProfilePage";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const doctor = await getDoctorBySlug(locale, slug);
  if (!doctor) return {};
  // §2.1 SEO audit — template fallback when no manual fields set
  const titleFallback =
    locale === "ru"
      ? `${doctor.name} ${doctor.role} с опытом ${doctor.experience}`
      : locale === "en"
      ? `${doctor.name} ${doctor.role} with experience ${doctor.experience}`
      : `${doctor.name} ${doctor.role} з досвідом ${doctor.experience}`;

  const descFallback =
    locale === "ru"
      ? `${doctor.role} ${doctor.name} с опытом работы ${doctor.experience} 🤍 Консультация в GENEVITY 💫 Запись онлайн.`
      : locale === "en"
      ? `${doctor.role} ${doctor.name} with work experience ${doctor.experience} 🤍 Consultation at GENEVITY 💫 Online appointment.`
      : `${doctor.role} ${doctor.name} з досвідом роботи ${doctor.experience} 🤍 Консультація в GENEVITY 💫 Запис онлайн.`;

  return generatePageMetadata({
    title: doctor.seoTitle || titleFallback,
    description: doctor.seoDescription || descFallback,
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
    ...(doctor.certifications.length > 0 ? {
      hasCredential: doctor.certifications.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.title_uk,
        credentialCategory: "certification",
        ...(c.issuer_uk ? { recognizedBy: { "@type": "Organization", name: c.issuer_uk } } : {}),
        ...(c.year ? { dateCreated: String(c.year) } : {}),
      })),
    } : {}),
    ...(doctor.specialties.length > 0 ? { medicalSpecialty: doctor.specialties } : {}),
    ...(doctor.reviews.length > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (doctor.reviews.reduce((s, r) => s + r.rating, 0) / doctor.reviews.length).toFixed(1),
        ratingCount: doctor.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: doctor.reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.reviewerName },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.reviewText,
        datePublished: r.reviewedAt,
      })),
    } : {}),
  };

  const photo = doctor.photoFull || doctor.photoCard;
  const photoUrl = photo
    ? photo.startsWith("http") ? photo : `https://genevity.com.ua${photo}`
    : null;

  // §1.16.5 ImageObject schema for doctor profile photo
  const imageSchema = photoUrl
    ? {
        "@context": "https://schema.org/",
        "@type": "ImageObject",
        contentUrl: photoUrl,
        creditText: "GENEVITY",
        caption: doctor.name,
        creator: { "@type": "Organization", name: "GENEVITY" },
      }
    : null;

  return (
    <>
      <JsonLd data={schema as Record<string, unknown>} />
      {imageSchema && <JsonLd data={imageSchema} />}
      <MegaMenuHeader variant="solid" position="fixed" />
      <DoctorProfilePage doctor={doctor} locale={locale as Locale} />
    </>
  );
}
