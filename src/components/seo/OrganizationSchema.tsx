import { JsonLd } from "./JsonLd";
import { getSiteSettingsData } from "@/lib/db/queries";

const NAMES: Record<string, string> = {
  ua: "GENEVITY — центр довголіття та естетичної медицини",
  ru: "GENEVITY — центр долголетия и эстетической медицины",
  en: "GENEVITY — longevity and aesthetic medicine center",
};

const DESCRIPTIONS: Record<string, string> = {
  ua: "Медичний центр довголіття та естетичної медицини у Дніпрі. Персоналізовані програми здоров'я, відновлення та омолодження.",
  ru: "Медицинский центр долголетия и эстетической медицины в Днепре. Персонализированные программы здоровья, восстановления и омоложения.",
  en: "Longevity and aesthetic medicine medical center in Dnipro. Personalized health, recovery, and rejuvenation programs.",
};

const URLS: Record<string, string> = {
  ua: "https://genevity.com.ua/",
  ru: "https://genevity.com.ua/ru",
  en: "https://genevity.com.ua/en",
};

interface Props {
  locale?: string;
}

export async function OrganizationSchema({ locale = "ua" }: Props) {
  const s = await getSiteSettingsData("ua");

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        name: NAMES[locale] ?? NAMES.ua,
        url: URLS[locale] ?? URLS.ua,
        logo: {
          "@type": "ImageObject",
          url: "https://genevity.com.ua/brand/LogoFullDark.svg",
        },
        image: [
          "https://genevity.com.ua/clinic/semi1737-hdr.webp",
          "https://genevity.com.ua/clinic/semi1287-hdr.webp",
          "https://genevity.com.ua/clinic/semi1256-hdr.webp",
        ],
        description: DESCRIPTIONS[locale] ?? DESCRIPTIONS.ua,
        email: "info@genevity.com.ua",
        telephone: (s.phone1 || "+380730000150").replace(/\s/g, ""),
        address: {
          "@type": "PostalAddress",
          streetAddress: s.address || "вул. Олеся Гончара, 12",
          addressLocality: "Дніпро",
          addressRegion: "Дніпропетровська область",
          postalCode: "49000",
          addressCountry: "UA",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 48.4647,
          longitude: 35.0461,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday", "Tuesday", "Wednesday", "Thursday",
              "Friday", "Saturday", "Sunday",
            ],
            opens: "08:00",
            closes: "20:00",
          },
        ],
        hasMap: s.mapsUrl || "https://maps.app.goo.gl/3VATqzUMmo6u51Yj7",
        medicalSpecialty: [
          "Dermatology",
          "PlasticSurgery",
          "CosmeticDermatology",
          "Endocrinology",
          "Gynecology",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Послуги GENEVITY",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "EMFACE" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "VOLNEWMER" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "EXION" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "ULTRAFORMER MPT" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "EMSCULPT NEO" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "SPLENDOR X" } },
            { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "HYDRAFACIAL SYNDEO" } },
          ],
        },
        sameAs: s.instagram ? [`https://www.instagram.com/${s.instagram.replace(/^@/, "")}/`] : [],
      }}
    />
  );
}
