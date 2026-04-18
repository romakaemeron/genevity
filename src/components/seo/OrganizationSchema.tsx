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
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
        sameAs: ["https://www.instagram.com/genevity.center/"],
        hasMap:
          "https://www.google.com/maps/place/Genevity/@48.4647,35.0461,17z",
        medicalSpecialty: ["Dermatology", "PlasticSurgery"],
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
              name: "Face",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "EMFACE",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "VOLNEWMER",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "EXION",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "ULTRAFORMER MPT",
                  },
                },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Body",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "EMSCULPT NEO",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "ULTRAFORMER MPT Body",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "EXION Body",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "VOLNEWMER Body",
                  },
                },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Skin",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "M22 STELLAR BLACK",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "SPLENDOR X",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "HYDRAFACIAL SYNDEO",
                  },
                },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Intimate",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "EXION Intimate",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "CO2 AcuPulse",
                  },
                },
              ],
            },
            {
              "@type": "OfferCatalog",
              name: "Laser",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "MedicalProcedure",
                    name: "SPLENDOR X",
                  },
                },
              ],
            },
          ],
        },
      }}
    />
  );
}
