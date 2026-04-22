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
} satisfies NextConfig & { middlewareClientMaxBodySize?: string };

export default withNextIntl(nextConfig);
