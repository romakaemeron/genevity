import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uk", "ru", "en"],
  defaultLocale: "uk",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/pro-tsentr": {
      uk: "/pro-tsentr",
      ru: "/o-tsentre",
      en: "/about",
    },
    "/poslugy": {
      uk: "/poslugy",
      ru: "/uslugi",
      en: "/services",
    },
    "/likari": {
      uk: "/likari",
      ru: "/vrachi",
      en: "/doctors",
    },
    "/blog": "/blog",
    "/kontakty": {
      uk: "/kontakty",
      ru: "/kontakty",
      en: "/contacts",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
