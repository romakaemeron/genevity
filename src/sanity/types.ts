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
