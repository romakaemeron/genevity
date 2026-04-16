import { JsonLd } from "./JsonLd";

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "GENEVITY",
        url: "https://genevity.com.ua",
        inLanguage: ["uk", "ru", "en"],
        publisher: {
          "@type": "MedicalBusiness",
          name: "GENEVITY",
          url: "https://genevity.com.ua",
        },
      }}
    />
  );
}
