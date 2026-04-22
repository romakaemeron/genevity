// ---- Sanity document types for the homepage ----

export interface EquipmentItem {
  _id: string;
  category: string;
  name: string;
  shortDescription: string;
  description: string;
  suits: string[];
  results: string[];
  note: string;
  photo: string | null;
}

export interface DoctorItem {
  _id: string;
  name: string;
  role: string;
  experience: string;
  specialties: string[];
  photoCard: string | null;
  photoModal: string | null;
  cardPosition: string;
  modalPosition: string;
}

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

export interface HeroData {
  title: string;
  subtitle: string;
  cta: string;
  location: string;
}

export interface AboutData {
  title: string;
  text1: string;
  text2: string;
  diagnostics: string;
}

export interface SiteSettingsData {
  phone1: string;
  phone2: string;
  address: string;
  instagram: string;
  hours: string;
  /** Shareable Google Maps link — opens the listing in a new tab when the user
   *  clicks the address card. Used across ContactsPage and the Footer. */
  mapsUrl: string;
  /** Embed URL for the <iframe> on the contacts page. Derived from mapsUrl
   *  when possible so admins only have to configure one field. */
  mapsEmbedUrl: string;
  /** Site-wide default Open Graph image. Used whenever a page doesn't have
   *  its own seo_og_image set. 1200×630 recommended. */
  ogImage: string;
}

export interface UiStringsData {
  nav: {
    about: string;
    services: string;
    doctors: string;
    contacts: string;
    cta: string;
  };
  equipment: {
    title: string;
    details: string;
    showMore: string;
    showLess: string;
    suitsTitle: string;
    resultsTitle: string;
    tabs: Record<string, string>;
  };
  doctors: {
    title: string;
    subtitle: string;
    cta: string;
    experience: string;
  };
  contacts: {
    title: string;
    instagramLabel: string;
  };
  ctaForm: {
    title: string;
    titleAlt: string;
    name: string;
    phone: string;
    submit: string;
    success: string;
  };
  footer: {
    description: string;
    license: string;
    useful: string;
    contact: string;
    rights: string;
  };
  meta: {
    title: string;
    description: string;
  };
}

export interface HomepageData {
  hero: HeroData;
  about: AboutData;
  equipment: EquipmentItem[];
  doctors: DoctorItem[];
  faq: FaqItem[];
  settings: SiteSettingsData;
  ui: UiStringsData;
}

// ---- v2 types: services, categories, static pages, navigation ----

export interface FaqItemData {
  question: string;
  answer: string;
}

// Content section discriminated union
export interface SectionRichText {
  _type: "section.richText";
  _key: string;
  heading: string;
  body: string;
  /** Optional secondary paragraph rendered inside a highlighted card. */
  calloutBody?: string;
  /** When present (and this is the first rich-text section), triggers the
   *  hero-image side-by-side layout; otherwise the section renders normally. */
  heroImage?: string;
}

export interface SectionBullets {
  _type: "section.bullets";
  _key: string;
  heading: string;
  items: string[];
}

export interface SectionSteps {
  _type: "section.steps";
  _key: string;
  heading: string;
  steps: { title: string; description: string }[];
}

export interface SectionCompareTable {
  _type: "section.compareTable";
  _key: string;
  heading: string;
  columns: string[];
  rows: { label: string; values: string[] }[];
}

export interface SectionIndicationsContraindications {
  _type: "section.indicationsContraindications";
  _key: string;
  indicationsHeading: string;
  indications: string[];
  contraindicationsHeading: string;
  contraindications: string[];
}

export interface SectionPriceTeaser {
  _type: "section.priceTeaser";
  _key: string;
  heading: string;
  intro: string;
  ctaLabel: string;
}

export interface SectionCallout {
  _type: "section.callout";
  _key: string;
  tone: "info" | "warning" | "success";
  body: string;
}

export interface SectionImageGallery {
  _type: "section.imageGallery";
  _key: string;
  heading: string;
  images: { url: string; alt?: string }[];
}

export interface SectionRelatedDoctors {
  _type: "section.relatedDoctors";
  _key: string;
  heading: string;
  doctors: DoctorItem[];
}

export interface SectionCta {
  _type: "section.cta";
  _key: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export type ContentSection =
  | SectionRichText
  | SectionBullets
  | SectionSteps
  | SectionCompareTable
  | SectionIndicationsContraindications
  | SectionPriceTeaser
  | SectionCallout
  | SectionImageGallery
  | SectionRelatedDoctors
  | SectionCta;

export interface ServiceCategoryData {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
  parent: { _id: string; slug: string; title: string } | null;
  order: number;
  clickable: boolean;
  iconKey: string | null;
  seoTitle?: string;
  seoDescription?: string;
  sections?: ContentSection[];
  faq?: FaqItemData[];
}

export interface ServiceData {
  _id: string;
  title: string;
  h1: string;
  slug: string;
  category: { _id: string; slug: string; title: string };
  summary: string;
  heroImage: string | null;
  procedureLength: string | null;
  effectDuration: string | null;
  sessionsRecommended: string | null;
  priceFrom: string | null;
  priceUnit: string | null;
  seoTitle?: string;
  seoDescription?: string;
  sections: ContentSection[];
  faq: FaqItemData[];
  relatedDoctors: DoctorItem[];
  relatedServices: { _id: string; title: string; slug: string; summary: string; heroImage: string | null }[];
  relatedEquipment: EquipmentItem[];
  /** Ordered list of block keys that controls what renders below the hero and
   *  in what order. Empty / null = use the template's default order. See
   *  SERVICE_BLOCKS in ServiceDetailTemplate for valid keys. */
  blockOrder: string[] | null;
}

export interface ServiceCardData {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
  categorySlug: string;
  priceFrom: string | null;
}

export interface StaticPageData {
  _id: string;
  slug: string;
  title: string;
  h1: string;
  summary: string;
  sections: ContentSection[];
  faq: FaqItemData[];
}

export interface NavItemData {
  label: string;
  href: string | null;
  isMegaMenu: boolean;
  categorySlug: string | null;
  order: number;
}

export interface NavigationData {
  items: NavItemData[];
  cta: { label: string; href: string };
}
