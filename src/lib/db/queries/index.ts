// Central re-export — drop-in replacement for @/sanity/queries
export { getHomepageData, getAllDoctors, getUiStringsData, getSiteSettingsData, getAboutData } from "./homepage";
export { getCategoryBySlug, getAllCategories, getAllCategorySlugs } from "./categories";
export { getServiceBySlug, getServicesByCategory, getAllServiceSlugs } from "./services";
export { getStaticPage } from "./static-pages";
export { getNavigation } from "./navigation";
export { getLegalDocs, getLegalDocBySlug } from "./legal";
export type { LegalDocLink } from "./legal";
