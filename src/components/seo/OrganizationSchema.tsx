import { JsonLd } from "./JsonLd";

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["MedicalBusiness", "LocalBusiness"],
        name: "GENEVITY — Медичний центр довголіття",
        url: "https://genevity.com.ua",
        logo: "https://genevity.com.ua/brand/LogoFullDark.svg",
        image: "https://genevity.com.ua/og/genevity-og.jpg",
        telephone: "+380730000150",
        priceRange: "$$$$",
        geo: {
          "@type": "GeoCoordinates",
          latitude: 48.4647,
          longitude: 35.0461,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "вул. Олеся Гончара, 12",
          addressLocality: "Дніпро",
          addressRegion: "Дніпропетровська область",
          postalCode: "49000",
          addressCountry: "UA",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
        sameAs: ["https://www.instagram.com/genevity.center/"],
        hasMap: "https://www.google.com/maps?q=48.4647,35.0461",
        medicalSpecialty: [
          "Aesthetic Medicine",
          "Cosmetology",
          "Longevity Medicine",
          "Endocrinology",
          "Gastroenterology",
          "Gynecology",
          "Urology",
          "Podiatry",
          "Diagnostic Imaging",
        ],
        availableLanguage: [
          { "@type": "Language", name: "Ukrainian" },
          { "@type": "Language", name: "Russian" },
          { "@type": "Language", name: "English" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Послуги GENEVITY",
          itemListElement: [
            {
              "@type": "OfferCatalog",
              name: "Ін'єкційна косметологія",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Ботулінотерапія" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Контурна пластика" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Біоревіталізація" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Мезотерапія" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "PRP-терапія" } },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Апаратна косметологія",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "EMFACE" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Ultraformer MPT" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "EMSCULPT NEO" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "HydraFacial" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "AcuPulse CO₂" } },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Лазерна епіляція",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Лазерна епіляція Splendor X" } },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Longevity & Anti-Age",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Check-Up 40+" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "IV-терапія" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Гормональний баланс" } },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Діагностика",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "УЗД-діагностика" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Еластографія" } },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Подологія",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Медичний педикюр" } },
                { "@type": "Offer", itemOffered: { "@type": "MedicalProcedure", name: "Лікування врослого нігтя" } },
              ],
            },
          ],
        },
      }}
    />
  );
}
