import { sanityClient } from "./client";
import type { HomepageData, EquipmentItem, DoctorItem, FaqItem, HeroData, AboutData, SiteSettingsData, UiStringsData } from "./types";

// Map internal locale code to Sanity field name
function lang(locale: string) {
  return locale === "ua" ? "uk" : locale;
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
