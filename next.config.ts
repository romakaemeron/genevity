import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Next.js 16: proxy/middleware request body is capped separately from Server Actions.
  // Lift it to 20MB so large source photos (12MP+ phone shots) can reach the server.
  middlewareClientMaxBodySize: "20mb",
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  rewrites: () => [
    // Serve image sitemap at the conventional .xml URL (SEO audit §1.6.1)
    { source: "/sitemap-images.xml", destination: "/sitemap-images" },
  ],
  redirects() {
    return [
      // 301: www → non-www (fixes 307 mirror redirect flagged in SEO audit)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.genevity.com.ua" }],
        destination: "https://genevity.com.ua/:path*",
        permanent: true,
      },
      // SEO audit §1.7: laser-hair-removal slug renames (women/men → laser-women/laser-men)
      { source: "/services/laser-hair-removal/women", destination: "/services/laser-hair-removal/laser-women", permanent: true },
      { source: "/services/laser-hair-removal/men", destination: "/services/laser-hair-removal/laser-men", permanent: true },
      { source: "/ru/services/laser-hair-removal/women", destination: "/ru/services/laser-hair-removal/laser-women", permanent: true },
      { source: "/ru/services/laser-hair-removal/men", destination: "/ru/services/laser-hair-removal", permanent: true },
      { source: "/en/services/laser-hair-removal/women", destination: "/en/services/laser-hair-removal/laser-women", permanent: true },
      { source: "/en/services/laser-hair-removal/men", destination: "/en/services/laser-hair-removal", permanent: true },
      // SEO audit §1.7: fix double-locale prefix in doctor URLs (bug in blog link builder)
      { source: "/en/en/doctors/:slug", destination: "/en/doctors/:slug", permanent: true },
      { source: "/ru/ru/doctors/:slug", destination: "/ru/doctors/:slug", permanent: true },
      // 301: blog/page1 → blog (first pagination page is a duplicate of parent)
      { source: "/blog/page1", destination: "/blog", permanent: true },
      { source: "/ru/blog/page1", destination: "/ru/blog", permanent: true },
      { source: "/en/blog/page1", destination: "/en/blog", permanent: true },
      // ТЗ №1 §2: gynaecology/gynaecology is a duplicate of gynaecology → redirect to canonical
      { source: "/services/gynaecology/gynaecology", destination: "/services/gynaecology", permanent: true },
      { source: "/ru/services/gynaecology/gynaecology", destination: "/ru/services/gynaecology", permanent: true },
      { source: "/en/services/gynaecology/gynaecology", destination: "/en/services/gynaecology", permanent: true },
    ];
  },
  // Vary: Accept-Encoding only — User-Agent fragments the CDN cache
  // (each browser variant gets its own entry → near-zero cache hit rate).
  // Last-Modified is omitted: static assets are immutable-cached, ISR pages
  // use ETag/s-maxage instead.
  headers: async () => [
    {
      source: "/(.*)",
      headers: [{ key: "Vary", value: "Accept-Encoding" }],
    },
    // ТЗ №1 §1: block indexing of Next.js RSC prefetch URLs (?_rsc=…)
    {
      source: "/(.*)",
      has: [{ type: "query", key: "_rsc" }],
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    },
  ],
} satisfies NextConfig & { middlewareClientMaxBodySize?: string };

export default withNextIntl(nextConfig);
