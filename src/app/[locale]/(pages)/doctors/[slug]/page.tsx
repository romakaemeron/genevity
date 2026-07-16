import { notFound } from "next/navigation";
import { getDoctorBySlug, getAllDoctorSlugs } from "@/lib/db/queries";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import DoctorProfilePage from "@/components/pages/DoctorProfilePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { JsonLdBreadcrumbList } from "@/components/seo/JsonLdBreadcrumbList";
import { medicalSpecialtyFor } from "@/lib/medical-specialty";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllDoctorSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

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

  const doctorUrl = `https://genevity.com.ua${locale === "ua" ? "" : "/" + locale}/doctors/${slug}`;
  const photo = doctor.photoFull || doctor.photoCard;
  const photoUrl = photo
    ? photo.startsWith("http") ? photo : `https://genevity.com.ua${photo}`
    : null;
  const description = doctor.seoDescription || doctor.bio.slice(0, 200);
  const specialty = medicalSpecialtyFor(doctor.role); // valid schema.org MedicalSpecialty enum

  // Single @graph per Технічне завдання №7: ProfilePage + Person/Physician
  // (valid medicalSpecialty enum, worksFor → #organization) + MedicalOrganization.
  const person: Record<string, unknown> = {
    "@type": ["Person", "Physician"],
    "@id": `${doctorUrl}#person`,
    name: doctor.name,
    description,
    url: doctorUrl,
    ...(photoUrl ? { image: photoUrl } : {}),
    jobTitle: doctor.role,
    ...(specialty ? { medicalSpecialty: specialty } : {}),
    worksFor: { "@id": "https://genevity.com.ua/#organization" },
    ...(doctor.education.length > 0 ? {
      alumniOf: doctor.education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution_uk })),
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
        reviewBody: r.reviewText,
        datePublished: r.reviewedAt,
        author: { "@type": "Person", name: r.reviewerName },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      })),
    } : {}),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "ProfilePage", url: doctorUrl, mainEntity: { "@id": `${doctorUrl}#person` } },
      person,
      {
        "@type": "MedicalOrganization",
        "@id": "https://genevity.com.ua/#organization",
        name: "GENEVITY",
        url: "https://genevity.com.ua/",
        address: {
          "@type": "PostalAddress",
          streetAddress: "вул. Олеся Гончара, 12",
          addressLocality: "Дніпро",
          addressCountry: "UA",
        },
      },
    ],
  };

  const localePrefix = locale === "ua" ? "" : `/${locale}`;
  const doctorsLabel = locale === "ru" ? "Врачи" : locale === "en" ? "Doctors" : "Лікарі";

  return (
    <>
      <JsonLdBreadcrumbList items={[
        { name: "GENEVITY", url: "https://genevity.com.ua/" },
        { name: doctorsLabel, url: `https://genevity.com.ua${localePrefix}/doctors` },
        { name: doctor.name, url: doctorUrl },
      ]} />
      <JsonLd data={graph} />
      <MegaMenuHeader variant="solid" position="fixed" />
      <DoctorProfilePage doctor={doctor} locale={locale as Locale} />
    </>
  );
}
