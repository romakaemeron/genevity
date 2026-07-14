// Central re-export — drop-in replacement for @/sanity/queries
export { getHomepageData, getAllDoctors, getUiStringsData, getSiteSettingsData, getAboutData } from "./homepage";
export { getCategoryBySlug, getAllCategories, getAllCategorySlugs } from "./categories";
export { getServiceBySlug, getServicesByCategory, getAllServiceSlugs, getServicesBySlugs } from "./services";
export { getStaticPage, getStaticPageSeo } from "./static-pages";
export type { StaticPageSeo } from "./static-pages";
export { getNavigation } from "./navigation";
export { getLegalDocs, getLegalDocBySlug } from "./legal";
export type { LegalDocLink } from "./legal";
export { getUiStringsTree, getMessagesForLocale, getUiString, saveUiStringsTree, getUiStringsNamespace } from "./ui-strings";
export type { UiStringsTree } from "./ui-strings";
export { getDoctorBySlug, getAllDoctorSlugs } from "./doctors";
export type { DoctorProfileData, EducationEntry, CertEntry } from "./doctors";
export {
  getHeroSlides, getGalleryItems, getPriceCategoriesWithItems,
  getLabServices, getLabPrepSteps, getLabCheckups,
} from "./phase2";
export type {
  HeroSlide, GalleryItem, PriceCategory, LabService, LabPrepStep, LabCheckup,
} from "./phase2";
export { getClinicReviews, getReviewsSummary } from "./reviews";
export type { GoogleReview, ReviewsSummary } from "./reviews";
