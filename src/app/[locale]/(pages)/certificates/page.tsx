import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/seo";
import { getCertificateDocuments } from "@/lib/db/queries";
import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import CertificatesPage from "@/components/pages/CertificatesPage";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 86400;

const META = {
  ua: {
    title: "Сертифікати на обладнання ➦ Документи на апарати GENEVITY",
    description:
      "Сертифікати відповідності на апаратне обладнання GENEVITY ☝ Скани документів на EMFACE, EMSCULPT NEO, EXION, Ultraformer MPT, Volnewmer, M22 Stellar, Splendor X, AcuPulse та Zemits.",
  },
  ru: {
    title: "Сертификаты на оборудование ➦ Документы на аппараты GENEVITY",
    description:
      "Сертификаты соответствия на аппаратное оборудование GENEVITY ☝ Сканы документов на EMFACE, EMSCULPT NEO, EXION, Ultraformer MPT, Volnewmer, M22 Stellar, Splendor X, AcuPulse и Zemits.",
  },
  en: {
    title: "Equipment Certificates ➦ GENEVITY Device Documentation",
    description:
      "Certificates of conformity for GENEVITY's devices ☝ Scanned documents for EMFACE, EMSCULPT NEO, EXION, Ultraformer MPT, Volnewmer, M22 Stellar, Splendor X, AcuPulse and Zemits.",
  },
} as const;

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = META[(locale as keyof typeof META)] ?? META.ua;
  return generatePageMetadata({
    title: m.title,
    description: m.description,
    locale: locale as Locale,
    path: "/certificates",
  });
}

export default async function Page({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const documents = await getCertificateDocuments(locale);

  // Each scan as an ImageObject, so the documents are indexable in their own
  // right the same way doctor certificate scans already are.
  const images = documents.flatMap((doc) =>
    doc.pages.map((p) => ({
      "@type": "ImageObject",
      "@id": p.url,
      url: p.url,
      contentUrl: p.url,
      name: p.alt,
      description: [doc.doc, doc.number && `№ ${doc.number}`, doc.issuer]
        .filter(Boolean)
        .join(" · "),
      creditText: "GENEVITY",
      representativeOfPage: false,
    })),
  );

  return (
    <>
      {images.length > 0 && (
        <JsonLd data={{ "@context": "https://schema.org", "@graph": images }} />
      )}
      <MegaMenuHeader variant="solid" position="fixed" />
      <CertificatesPage documents={documents} locale={locale as Locale} />
    </>
  );
}
