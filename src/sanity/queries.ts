import { sanityClient } from "./client";
import type {
  HomepageData, EquipmentItem, DoctorItem, FaqItem, HeroData, AboutData, SiteSettingsData, UiStringsData,
  ServiceCategoryData, ServiceData, ServiceCardData, StaticPageData, NavigationData,
} from "./types";

// Map internal locale code to Sanity field name
function lang(locale: string) {
  return locale === "ua" ? "uk" : locale;
}

export interface LegalDocLink {
  _id: string;
  slug: string;
  label: string;
}

export async function getLegalDocs(locale: string): Promise<LegalDocLink[]> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "legalDoc"] | order(order asc) {
      _id,
      "slug": slug.current,
      "label": coalesce(shortLabel.${l}, shortLabel.uk, title.${l}, title.uk),
    }
  `);
}

export async function getHomepageData(locale: string): Promise<HomepageData> {
  const l = lang(locale);

  const [equipment, doctors, faq, hero, about, settings, ui] = await Promise.all([
    getEquipment(l),
    getDoctors(l),
    getFaq(l),
    getHero(l),
    getAbout(l),
    getSiteSettings(l),
    getUiStrings(l),
  ]);

  return { equipment, doctors, faq, hero, about, settings, ui };
}

async function getEquipment(l: string): Promise<EquipmentItem[]> {
  return sanityClient.fetch(`
    *[_type == "equipment"] | order(order asc) {
      _id,
      category,
      name,
      "shortDescription": coalesce(shortDescription.${l}, shortDescription.uk),
      "description": coalesce(description.${l}, description.uk),
      "suits": coalesce(suits.${l}, suits.uk),
      "results": coalesce(results.${l}, results.uk),
      "note": coalesce(note.${l}, note.uk),
    }
  `);
}

async function getDoctors(l: string): Promise<DoctorItem[]> {
  return sanityClient.fetch(`
    *[_type == "doctor"] | order(order asc) {
      _id,
      "name": coalesce(name.${l}, name.uk),
      "role": coalesce(role.${l}, role.uk),
      "experience": coalesce(experience.${l}, experience.uk),
      "specialties": coalesce(specialties.${l}, specialties.uk),
      "photoCard": photoCard.asset->url,
      "photoModal": photoModal.asset->url,
      cardPosition,
      modalPosition,
    }
  `);
}

async function getFaq(l: string): Promise<FaqItem[]> {
  return sanityClient.fetch(`
    *[_type == "faq"] | order(order asc) {
      _id,
      "question": coalesce(question.${l}, question.uk),
      "answer": coalesce(answer.${l}, answer.uk),
    }
  `);
}

async function getHero(l: string): Promise<HeroData> {
  return sanityClient.fetch(`
    *[_type == "hero"][0] {
      "title": coalesce(title.${l}, title.uk),
      "subtitle": coalesce(subtitle.${l}, subtitle.uk),
      "cta": coalesce(cta.${l}, cta.uk),
      "location": coalesce(location.${l}, location.uk),
    }
  `);
}

async function getAbout(l: string): Promise<AboutData> {
  return sanityClient.fetch(`
    *[_type == "about"][0] {
      "title": coalesce(title.${l}, title.uk),
      "text1": coalesce(text1.${l}, text1.uk),
      "text2": coalesce(text2.${l}, text2.uk),
      "diagnostics": coalesce(diagnostics.${l}, diagnostics.uk),
    }
  `);
}

async function getSiteSettings(l: string): Promise<SiteSettingsData> {
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      phone1,
      phone2,
      "address": coalesce(address.${l}, address.uk),
      instagram,
      "hours": coalesce(hours.${l}, hours.uk),
    }
  `);
}

async function getUiStrings(l: string): Promise<UiStringsData> {
  return sanityClient.fetch(`
    *[_type == "uiStrings"][0] {
      "nav": {
        "about": coalesce(nav.about.${l}, nav.about.uk),
        "services": coalesce(nav.services.${l}, nav.services.uk),
        "doctors": coalesce(nav.doctors.${l}, nav.doctors.uk),
        "contacts": coalesce(nav.contacts.${l}, nav.contacts.uk),
        "cta": coalesce(nav.cta.${l}, nav.cta.uk),
      },
      "equipment": {
        "title": coalesce(equipment.title.${l}, equipment.title.uk),
        "details": coalesce(equipment.details.${l}, equipment.details.uk),
        "showMore": coalesce(equipment.showMore.${l}, equipment.showMore.uk),
        "showLess": coalesce(equipment.showLess.${l}, equipment.showLess.uk),
        "suitsTitle": coalesce(equipment.suitsTitle.${l}, equipment.suitsTitle.uk),
        "resultsTitle": coalesce(equipment.resultsTitle.${l}, equipment.resultsTitle.uk),
        "tabs": {
          "all": coalesce(equipment.tabs.all.${l}, equipment.tabs.all.uk),
          "face": coalesce(equipment.tabs.face.${l}, equipment.tabs.face.uk),
          "body": coalesce(equipment.tabs.body.${l}, equipment.tabs.body.uk),
          "skin": coalesce(equipment.tabs.skin.${l}, equipment.tabs.skin.uk),
          "intimate": coalesce(equipment.tabs.intimate.${l}, equipment.tabs.intimate.uk),
          "laser": coalesce(equipment.tabs.laser.${l}, equipment.tabs.laser.uk),
        },
      },
      "doctors": {
        "title": coalesce(doctors.title.${l}, doctors.title.uk),
        "subtitle": coalesce(doctors.subtitle.${l}, doctors.subtitle.uk),
        "cta": coalesce(doctors.cta.${l}, doctors.cta.uk),
        "experience": coalesce(doctors.experience.${l}, doctors.experience.uk),
      },
      "contacts": {
        "title": coalesce(contacts.title.${l}, contacts.title.uk),
        "instagramLabel": coalesce(contacts.instagramLabel.${l}, contacts.instagramLabel.uk),
      },
      "ctaForm": {
        "title": coalesce(ctaForm.title.${l}, ctaForm.title.uk),
        "titleAlt": coalesce(ctaForm.titleAlt.${l}, ctaForm.titleAlt.uk),
        "name": coalesce(ctaForm.name.${l}, ctaForm.name.uk),
        "phone": coalesce(ctaForm.phone.${l}, ctaForm.phone.uk),
        "submit": coalesce(ctaForm.submit.${l}, ctaForm.submit.uk),
        "success": coalesce(ctaForm.success.${l}, ctaForm.success.uk),
      },
      "footer": {
        "description": coalesce(footer.description.${l}, footer.description.uk),
        "license": coalesce(footer.license.${l}, footer.license.uk),
        "useful": coalesce(footer.useful.${l}, footer.useful.uk),
        "contact": coalesce(footer.contact.${l}, footer.contact.uk),
        "rights": coalesce(footer.rights.${l}, footer.rights.uk),
      },
      "meta": {
        "title": coalesce(meta.title.${l}, meta.title.uk),
        "description": coalesce(meta.description.${l}, meta.description.uk),
      },
    }
  `);
}

// ---- v2 queries: services, categories, static pages, navigation ----

/** Shared GROQ fragment for projecting content sections with locale fallback */
function sectionsProjection(l: string) {
  return `
    sections[] {
      _type,
      _key,
      _type == "section.richText" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "body": coalesce(body.${l}, body.uk),
      },
      _type == "section.bullets" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "items": coalesce(items.${l}, items.uk),
      },
      _type == "section.steps" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "steps": steps[] {
          "title": coalesce(title.${l}, title.uk),
          "description": coalesce(description.${l}, description.uk),
        },
      },
      _type == "section.compareTable" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "columns": columns[] { "value": coalesce(@.${l}, @.uk) }.value,
        "rows": rows[] {
          "label": coalesce(label.${l}, label.uk),
          "values": coalesce(values.${l}, values.uk),
        },
      },
      _type == "section.indicationsContraindications" => {
        "indicationsHeading": coalesce(indicationsHeading.${l}, indicationsHeading.uk),
        "indications": coalesce(indications.${l}, indications.uk),
        "contraindicationsHeading": coalesce(contraindicationsHeading.${l}, contraindicationsHeading.uk),
        "contraindications": coalesce(contraindications.${l}, contraindications.uk),
      },
      _type == "section.priceTeaser" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "intro": coalesce(intro.${l}, intro.uk),
        "ctaLabel": coalesce(ctaLabel.${l}, ctaLabel.uk),
      },
      _type == "section.callout" => {
        tone,
        "body": coalesce(body.${l}, body.uk),
      },
      _type == "section.imageGallery" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "images": images[] { "url": asset->url, "alt": asset->altText },
      },
      _type == "section.relatedDoctors" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "doctors": doctors[]-> {
          _id,
          "name": coalesce(name.${l}, name.uk),
          "role": coalesce(role.${l}, role.uk),
          "experience": coalesce(experience.${l}, experience.uk),
          "specialties": coalesce(specialties.${l}, specialties.uk),
          "photoCard": photoCard.asset->url,
        },
      },
      _type == "section.cta" => {
        "heading": coalesce(heading.${l}, heading.uk),
        "body": coalesce(body.${l}, body.uk),
        "ctaLabel": coalesce(ctaLabel.${l}, ctaLabel.uk),
        ctaHref,
      },
    }
  `;
}

function faqProjection(l: string) {
  return `
    faq[] {
      "question": coalesce(question.${l}, question.uk),
      "answer": coalesce(answer.${l}, answer.uk),
    }
  `;
}

// --- Service Category ---

export async function getCategoryBySlug(locale: string, slug: string): Promise<ServiceCategoryData | null> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "serviceCategory" && slug.current == $slug][0] {
      _id,
      "title": coalesce(title.${l}, title.uk),
      "slug": slug.current,
      "summary": coalesce(summary.${l}, summary.uk),
      "heroImage": heroImage.asset->url,
      "parent": parent-> {
        _id,
        "slug": slug.current,
        "title": coalesce(title.${l}, title.uk),
      },
      order,
      "clickable": coalesce(clickable, true),
      iconKey,
      ${sectionsProjection(l)},
      ${faqProjection(l)},
    }
  `, { slug });
}

export async function getAllCategories(locale: string): Promise<ServiceCategoryData[]> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "serviceCategory"] | order(order asc) {
      _id,
      "title": coalesce(title.${l}, title.uk),
      "slug": slug.current,
      "summary": coalesce(summary.${l}, summary.uk),
      "heroImage": heroImage.asset->url,
      "parent": parent-> {
        _id,
        "slug": slug.current,
        "title": coalesce(title.${l}, title.uk),
      },
      order,
      "clickable": coalesce(clickable, true),
      iconKey,
    }
  `);
}

export async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  return sanityClient.fetch(`
    *[_type == "serviceCategory"] { "slug": slug.current }
  `);
}

// --- Service ---

export async function getServiceBySlug(locale: string, categorySlug: string, serviceSlug: string): Promise<ServiceData | null> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "service" && slug.current == $serviceSlug && category->slug.current == $categorySlug][0] {
      _id,
      "title": coalesce(title.${l}, title.uk),
      "h1": coalesce(h1.${l}, h1.uk, title.${l}, title.uk),
      "slug": slug.current,
      "category": category-> {
        _id,
        "slug": slug.current,
        "title": coalesce(title.${l}, title.uk),
      },
      "summary": coalesce(summary.${l}, summary.uk),
      "heroImage": heroImage.asset->url,
      "procedureLength": coalesce(procedureLength.${l}, procedureLength.uk),
      "effectDuration": coalesce(effectDuration.${l}, effectDuration.uk),
      "sessionsRecommended": coalesce(sessionsRecommended.${l}, sessionsRecommended.uk),
      "priceFrom": coalesce(priceFrom.${l}, priceFrom.uk),
      "priceUnit": coalesce(priceUnit.${l}, priceUnit.uk),
      ${sectionsProjection(l)},
      ${faqProjection(l)},
      "relatedDoctors": relatedDoctors[]-> {
        _id,
        "name": coalesce(name.${l}, name.uk),
        "role": coalesce(role.${l}, role.uk),
        "experience": coalesce(experience.${l}, experience.uk),
        "specialties": coalesce(specialties.${l}, specialties.uk),
        "photoCard": photoCard.asset->url,
        "photoModal": photoModal.asset->url,
        cardPosition,
        modalPosition,
      },
      "relatedServices": relatedServices[]-> {
        _id,
        "title": coalesce(title.${l}, title.uk),
        "slug": slug.current,
        "summary": coalesce(summary.${l}, summary.uk),
        "heroImage": heroImage.asset->url,
      },
      "relatedEquipment": relatedEquipment[]-> {
        _id,
        name,
      },
    }
  `, { serviceSlug, categorySlug });
}

export async function getServicesByCategory(locale: string, categorySlug: string): Promise<ServiceCardData[]> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "service" && category->slug.current == $categorySlug] | order(order asc) {
      _id,
      "title": coalesce(title.${l}, title.uk),
      "slug": slug.current,
      "summary": coalesce(summary.${l}, summary.uk),
      "heroImage": heroImage.asset->url,
      "categorySlug": category->slug.current,
    }
  `, { categorySlug });
}

export async function getAllServiceSlugs(): Promise<{ slug: string; categorySlug: string }[]> {
  return sanityClient.fetch(`
    *[_type == "service"] {
      "slug": slug.current,
      "categorySlug": category->slug.current,
    }
  `);
}

// --- Static Page ---

export async function getStaticPage(locale: string, slug: string): Promise<StaticPageData | null> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "staticPage" && slug == $slug][0] {
      _id,
      slug,
      "title": coalesce(title.${l}, title.uk),
      "h1": coalesce(h1.${l}, h1.uk, title.${l}, title.uk),
      "summary": coalesce(summary.${l}, summary.uk),
      ${sectionsProjection(l)},
      ${faqProjection(l)},
    }
  `, { slug });
}

// --- Navigation ---

export async function getNavigation(locale: string): Promise<NavigationData> {
  const l = lang(locale);
  return sanityClient.fetch(`
    *[_type == "navigation"][0] {
      "items": items[] {
        "label": coalesce(label.${l}, label.uk),
        "href": coalesce(href.${l}, href.uk),
        "isMegaMenu": coalesce(isMegaMenu, false),
        "categorySlug": category->slug.current,
        "order": coalesce(order, 0),
      } | order(order asc),
      "cta": {
        "label": coalesce(cta.label.${l}, cta.label.uk),
        "href": cta.href,
      },
    }
  `);
}
