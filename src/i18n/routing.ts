import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ua", "ru", "en"],
  defaultLocale: "ua",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/pro-tsentr": {
      ua: "/pro-tsentr",
      ru: "/o-tsentre",
      en: "/about",
    },
    "/poslugy": {
      ua: "/poslugy",
      ru: "/uslugi",
      en: "/services",
    },
    "/likari": {
      ua: "/likari",
      ru: "/vrachi",
      en: "/doctors",
    },
    "/blog": "/blog",
    "/kontakty": {
      ua: "/kontakty",
      ru: "/kontakty",
      en: "/contacts",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
