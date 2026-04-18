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
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://genevity.com.ua/services?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
