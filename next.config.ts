import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  // Build-time stamp folded into Last-Modified (see src/lib/last-modified.ts)
  // so a code/layout/nav deploy invalidates every cached page's 304, even
  // though a deploy bumps no row's `updated_at`. `Date.now()` here is
  // evaluated at build time and is identical across all instances of a
  // given deployment.
  env: {
    APP_BUILD_TIME: String(Date.now()),
  },
  // Image Optimization is metered per unique (source image × width × quality ×
  // format) combination, and the account has a hard monthly cap — once it is
  // exhausted `/_next/image` answers OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
  // (HTTP 402) and photos vanish from the page one by one as edge cache entries
  // go stale. Everything below exists to keep that combination count small:
  //
  //   - one format, not two (AVIF's extra ~15% saving is not worth doubling the
  //     bill; every browser we care about takes WebP)
  //   - one quality — 75, the Next.js default. Add a value here ONLY together
  //     with the `quality` prop that uses it, or that prop 400s
  //     (INVALID_IMAGE_OPTIMIZE_REQUEST) instead of falling back.
  //   - a trimmed width ladder. The defaults offer 16 widths; these 9 cover
  //     every `sizes` used in the app with at most one step of overshoot.
  //
  // Note that admin-uploaded photos are ALREADY resized and WebP-encoded by
  // src/app/(admin)/admin/_actions/upload.ts, so the optimizer is only
  // re-cutting widths here — never rescuing an unprocessed 12MP original.
  images: {
    formats: ["image/webp"],
    qualities: [75],
    deviceSizes: [640, 828, 1080, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
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
      // ТЗ №1 §2: plastic-surgery/plastic-surgery is empty → redirect to category page
      { source: "/services/plastic-surgery/plastic-surgery", destination: "/services/plastic-surgery", permanent: true },
      { source: "/ru/services/plastic-surgery/plastic-surgery", destination: "/ru/services/plastic-surgery", permanent: true },
      { source: "/en/services/plastic-surgery/plastic-surgery", destination: "/en/services/plastic-surgery", permanent: true },
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
