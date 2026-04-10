import { localeString, localeText, localeStringArray } from "./localeString";
import { equipment } from "./equipment";
import { doctor } from "./doctor";
import { faq } from "./faq";
import { siteSettings } from "./siteSettings";
import { hero } from "./hero";
import { about } from "./about";

export const schemaTypes = [
  // Locale types
  localeString,
  localeText,
  localeStringArray,
  // Documents
  equipment,
  doctor,
  faq,
  hero,
  about,
  siteSettings,
];
