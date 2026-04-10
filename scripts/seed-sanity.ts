/**
 * Seed Sanity with all content from translation JSON files.
 *
 * Usage: npx tsx scripts/seed-sanity.ts
 */
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

// Load env
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

// Load translations
const ua = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/messages/ua.json"), "utf-8"));
const ru = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/messages/ru.json"), "utf-8"));
const en = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/messages/en.json"), "utf-8"));

// Helper: create localized field { uk, ru, en }
function loc(uaVal: string, ruVal: string, enVal: string) {
  return { uk: uaVal, ru: ruVal, en: enVal };
}

async function seedEquipment() {
  console.log("Seeding equipment...");
  const items = ua.equipment.items;

  for (let i = 0; i < items.length; i++) {
    const uaItem = ua.equipment.items[i];
    const ruItem = ru.equipment.items[i];
    const enItem = en.equipment.items[i];

    await client.createOrReplace({
      _id: `equipment-${i}`,
      _type: "equipment",
      category: uaItem.category,
      name: uaItem.name, // Brand names are the same across locales
      order: i,
      shortDescription: loc(uaItem.shortDescription, ruItem.shortDescription, enItem.shortDescription),
      description: loc(uaItem.description, ruItem.description, enItem.description),
      suits: loc(uaItem.suits, ruItem.suits, enItem.suits),
      results: loc(uaItem.results, ruItem.results, enItem.results),
      note: loc(uaItem.note || "", ruItem.note || "", enItem.note || ""),
    });
    console.log(`  ✓ ${uaItem.name}`);
  }
}

async function seedDoctors() {
  console.log("Seeding doctors...");
  const items = ua.doctors.items;

  for (let i = 0; i < items.length; i++) {
    const uaItem = ua.doctors.items[i];
    const ruItem = ru.doctors.items[i];
    const enItem = en.doctors.items[i];

    await client.createOrReplace({
      _id: `doctor-${i}`,
      _type: "doctor",
      name: loc(uaItem.name, ruItem.name, enItem.name),
      role: loc(uaItem.role, ruItem.role, enItem.role),
      experience: loc(uaItem.experience, ruItem.experience, enItem.experience),
      specialties: loc(uaItem.specialties, ruItem.specialties, enItem.specialties),
      order: i,
      // Photos will be uploaded separately or via Sanity Studio
      cardPosition: "",
      modalPosition: "",
    });
    console.log(`  ✓ ${uaItem.name}`);
  }
}

async function seedFaq() {
  console.log("Seeding FAQ...");
  const items = ua.faq.items;

  for (let i = 0; i < items.length; i++) {
    const uaItem = ua.faq.items[i];
    const ruItem = ru.faq.items[i];
    const enItem = en.faq.items[i];

    await client.createOrReplace({
      _id: `faq-${i}`,
      _type: "faq",
      question: loc(uaItem.question, ruItem.question, enItem.question),
      answer: loc(uaItem.answer, ruItem.answer, enItem.answer),
      order: i,
    });
    console.log(`  ✓ ${uaItem.question.slice(0, 40)}...`);
  }
}

async function seedSiteSettings() {
  console.log("Seeding site settings...");

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    phone1: ua.contacts.phone1,
    phone2: ua.contacts.phone2,
    address: loc(ua.contacts.address, ru.contacts.address, en.contacts.address),
    instagram: ua.contacts.instagram,
    hours: loc(ua.footer.hours, ru.footer.hours, en.footer.hours),
  });
  console.log("  ✓ Site settings");
}

async function seedHero() {
  console.log("Seeding hero...");

  await client.createOrReplace({
    _id: "hero",
    _type: "hero",
    title: loc(ua.landingHero.title, ru.landingHero.title, en.landingHero.title),
    subtitle: loc(ua.landingHero.subtitle, ru.landingHero.subtitle, en.landingHero.subtitle),
    cta: loc(ua.landingHero.cta, ru.landingHero.cta, en.landingHero.cta),
    location: loc(ua.landingHero.location, ru.landingHero.location, en.landingHero.location),
  });
  console.log("  ✓ Hero");
}

async function seedAbout() {
  console.log("Seeding about...");

  await client.createOrReplace({
    _id: "about",
    _type: "about",
    title: loc(ua.about.title, ru.about.title, en.about.title),
    text1: loc(ua.about.text1, ru.about.text1, en.about.text1),
    text2: loc(ua.about.text2, ru.about.text2, en.about.text2),
    diagnostics: loc(ua.about.diagnostics, ru.about.diagnostics, en.about.diagnostics),
  });
  console.log("  ✓ About");
}

async function seedUiStrings() {
  console.log("Seeding UI strings...");

  await client.createOrReplace({
    _id: "uiStrings",
    _type: "uiStrings",
    nav: {
      about: loc(ua.nav.about, ru.nav.about, en.nav.about),
      services: loc(ua.nav.services, ru.nav.services, en.nav.services),
      doctors: loc(ua.nav.doctors, ru.nav.doctors, en.nav.doctors),
      contacts: loc(ua.nav.contacts, ru.nav.contacts, en.nav.contacts),
      cta: loc(ua.nav.cta, ru.nav.cta, en.nav.cta),
    },
    equipment: {
      title: loc(ua.equipment.title, ru.equipment.title, en.equipment.title),
      details: loc(ua.equipment.details, ru.equipment.details, en.equipment.details),
      showMore: loc(ua.equipment.showMore, ru.equipment.showMore, en.equipment.showMore),
      showLess: loc(ua.equipment.showLess, ru.equipment.showLess, en.equipment.showLess),
      suitsTitle: loc(ua.equipment.suitsTitle, ru.equipment.suitsTitle, en.equipment.suitsTitle),
      resultsTitle: loc(ua.equipment.resultsTitle, ru.equipment.resultsTitle, en.equipment.resultsTitle),
      tabs: {
        all: loc(ua.equipment.tabs.all, ru.equipment.tabs.all, en.equipment.tabs.all),
        face: loc(ua.equipment.tabs.face, ru.equipment.tabs.face, en.equipment.tabs.face),
        body: loc(ua.equipment.tabs.body, ru.equipment.tabs.body, en.equipment.tabs.body),
        skin: loc(ua.equipment.tabs.skin, ru.equipment.tabs.skin, en.equipment.tabs.skin),
        intimate: loc(ua.equipment.tabs.intimate, ru.equipment.tabs.intimate, en.equipment.tabs.intimate),
        laser: loc(ua.equipment.tabs.laser, ru.equipment.tabs.laser, en.equipment.tabs.laser),
      },
    },
    doctors: {
      title: loc(ua.doctors.title, ru.doctors.title, en.doctors.title),
      subtitle: loc(ua.doctors.subtitle, ru.doctors.subtitle, en.doctors.subtitle),
      cta: loc(ua.doctors.cta, ru.doctors.cta, en.doctors.cta),
      experience: loc(ua.doctors.experience, ru.doctors.experience, en.doctors.experience),
    },
    contacts: {
      title: loc(ua.contacts.title, ru.contacts.title, en.contacts.title),
      instagramLabel: loc(ua.contacts.instagramLabel, ru.contacts.instagramLabel, en.contacts.instagramLabel),
    },
    ctaForm: {
      title: loc(ua.ctaForm.title, ru.ctaForm.title, en.ctaForm.title),
      titleAlt: loc(ua.ctaForm.titleAlt, ru.ctaForm.titleAlt, en.ctaForm.titleAlt),
      name: loc(ua.ctaForm.name, ru.ctaForm.name, en.ctaForm.name),
      phone: loc(ua.ctaForm.phone, ru.ctaForm.phone, en.ctaForm.phone),
      submit: loc(ua.ctaForm.submit, ru.ctaForm.submit, en.ctaForm.submit),
      success: loc(ua.ctaForm.success, ru.ctaForm.success, en.ctaForm.success),
    },
    footer: {
      description: loc(ua.footer.description, ru.footer.description, en.footer.description),
      license: loc(ua.footer.license, ru.footer.license, en.footer.license),
      useful: loc(ua.footer.useful, ru.footer.useful, en.footer.useful),
      contact: loc(ua.footer.contact, ru.footer.contact, en.footer.contact),
      rights: loc(ua.footer.rights, ru.footer.rights, en.footer.rights),
    },
    meta: {
      title: loc(ua.meta.title, ru.meta.title, en.meta.title),
      description: loc(ua.meta.description, ru.meta.description, en.meta.description),
    },
  });
  console.log("  ✓ UI strings");
}

async function main() {
  console.log("🌱 Seeding Sanity...\n");

  await seedEquipment();
  await seedDoctors();
  await seedFaq();
  await seedSiteSettings();
  await seedHero();
  await seedAbout();
  await seedUiStrings();

  console.log("\n✅ Done! All content seeded to Sanity.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
