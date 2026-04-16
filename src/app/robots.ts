import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/studio/"],
      },
    ],
    sitemap: "https://genevity.com.ua/sitemap.xml",
  };
}
