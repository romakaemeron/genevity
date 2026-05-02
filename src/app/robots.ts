import type { MetadataRoute } from "next";

const BASE = "https://genevity.com.ua";

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers on preview/staging deployments — only production gets indexed.
  // VERCEL_ENV is set by Vercel: "production" | "preview" | "development"
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: [`${BASE}/sitemap.xml`, `${BASE}/sitemap-images.xml`],
    };
  }

  return {
    rules: [
      {
        // All crawlers (including AI) — allowed everywhere except internal/admin paths.
        // SEO audit §1.4.1: do NOT block AI crawlers.
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/", "/studio/"],
      },
    ],
    sitemap: [`${BASE}/sitemap.xml`, `${BASE}/sitemap-images.xml`],
  };
}
