import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ua", "ru", "en"],
  defaultLocale: "ua",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
