import { localeString, localeText, localeStringArray } from "./localeString";
import { equipment } from "./equipment";
import { doctor } from "./doctor";
import { faq } from "./faq";
import { siteSettings } from "./siteSettings";
import { hero } from "./hero";
import { about } from "./about";
import { legalDoc } from "./legalDoc";
import { faqItem } from "./faqItem";
import { navItem } from "./navItem";
import {
  sectionRichText,
  sectionBullets,
  sectionSteps,
  sectionCompareTable,
  sectionIndicationsContraindications,
  sectionPriceTeaser,
  sectionCallout,
  sectionImageGallery,
  sectionRelatedDoctors,
  sectionCta,
} from "./sections";
import { serviceCategory } from "./serviceCategory";
import { service } from "./service";
import { staticPage } from "./staticPage";
import { navigation } from "./navigation";

export const schemaTypes = [
  // Locale types
  localeString,
  localeText,
  localeStringArray,
  // Reusable objects
  faqItem,
  navItem,
  // Content section variants
  sectionRichText,
  sectionBullets,
  sectionSteps,
  sectionCompareTable,
  sectionIndicationsContraindications,
  sectionPriceTeaser,
  sectionCallout,
  sectionImageGallery,
  sectionRelatedDoctors,
  sectionCta,
  // Existing documents
  equipment,
  doctor,
  faq,
  hero,
  about,
  siteSettings,
  legalDoc,
  // New documents
  serviceCategory,
  service,
  staticPage,
  navigation,
];
