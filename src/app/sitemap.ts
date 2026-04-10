import type { MetadataRoute } from "next";

const baseUrl = "https://genevity.com.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          uk: baseUrl,
          ru: `${baseUrl}/ru`,
          en: `${baseUrl}/en`,
        },
      },
    },
  ];
}
