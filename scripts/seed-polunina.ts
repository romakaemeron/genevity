/**
 * Seed: Полуніна Вероніка Вадимівна
 * Source: Полуніна В.В..docx (root)
 */
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(env.DATABASE_URL!);

const doctor = {
  name_uk: "Полуніна Вероніка Вадимівна",
  slug: "polunina-veronika",

  seo_title_uk: "Полуніна Вероніка Вадимівна Медична сестра-косметолог з досвідом 14 років",
  seo_title_ru: "Полунина Вероника Вадимовна Медицинская сестра-косметолог с опытом 14 лет",
  seo_title_en: "Veronika Polunina Medical Nurse-Cosmetologist with 14 years of experience",

  seo_desc_uk: "Медична сестра-косметолог Полуніна Вероніка Вадимівна з досвідом роботи 14 років 🤍 Консультація в GENEVITY 💫 Запис онлайн.",
  seo_desc_ru: "Медицинская сестра-косметолог Полунина Вероника Вадимовна с опытом работы 14 лет 🤍 Консультация в GENEVITY 💫 Запись онлайн.",
  seo_desc_en: "Medical Nurse-Cosmetologist Veronika Polunina with 14 years of experience 🤍 Consultation at GENEVITY 💫 Book online.",

  bio_uk: "Вероніка Вадимівна Полуніна — медична сестра-косметолог медичного центру GENEVITY з 14-річним досвідом у сфері косметологічних процедур. Практику розпочала у 2011 році та спеціалізується на апаратній, доглядовій та ін'єкційній косметології.\n\nНадає широкий спектр процедур, спрямованих на корекцію вікових змін шкіри. Приймає пацієнтів починаючи з 6-річного віку.\n\nВідрізняється уважним і турботливим підходом до кожного пацієнта, підбираючи оптимальні процедури з урахуванням індивідуального стану шкіри та потреб.",

  bio_ru: "Вероника Вадимовна Полунина — медицинская сестра-косметолог медицинского центра GENEVITY с 14-летним опытом в области косметологических процедур. Практику начала в 2011 году и специализируется на аппаратной, уходовой и инъекционной косметологии.\n\nПредоставляет широкий спектр процедур, направленных на коррекцию возрастных изменений кожи. Принимает пациентов начиная с 6-летнего возраста.\n\nОтличается внимательным и заботливым подходом к каждому пациенту, подбирая оптимальные процедуры с учётом индивидуального состояния кожи и потребностей.",

  bio_en: "Veronika Polunina is a medical nurse-cosmetologist at GENEVITY medical centre with 14 years of experience in cosmetic procedures. She began her practice in 2011 and specialises in device-based, care and injectable cosmetology.\n\nShe provides a wide range of procedures aimed at correcting age-related skin changes and accepts patients from the age of 6.\n\nShe is known for her attentive and caring approach to every patient, selecting the most appropriate procedures based on individual skin condition and needs.",

  education: [
    {
      institution_uk: "Медичний навчальний заклад",
      institution_ru: "Медицинское учебное заведение",
      institution_en: "Medical Educational Institution",
      degree_uk: "Медична сестра (Молодший спеціаліст)",
      degree_ru: "Медицинская сестра (Младший специалист)",
      degree_en: "Nurse (Junior Specialist)",
      year: null,
    },
  ],

  certifications: [] as object[],

  service_slugs: ["cosmetologist"],
};

async function main() {
  const rows = await sql`SELECT id FROM doctors WHERE name_uk = ${doctor.name_uk}`;
  if (!rows.length) { console.error(`❌ NOT FOUND: ${doctor.name_uk}`); process.exit(1); }
  const id = rows[0].id;

  await sql`
    UPDATE doctors SET
      slug           = ${doctor.slug},
      seo_title_uk   = ${doctor.seo_title_uk},
      seo_title_ru   = ${doctor.seo_title_ru},
      seo_title_en   = ${doctor.seo_title_en},
      seo_desc_uk    = ${doctor.seo_desc_uk},
      seo_desc_ru    = ${doctor.seo_desc_ru},
      seo_desc_en    = ${doctor.seo_desc_en},
      bio_uk         = ${doctor.bio_uk},
      bio_ru         = ${doctor.bio_ru},
      bio_en         = ${doctor.bio_en},
      education      = ${JSON.stringify(doctor.education)},
      certifications = ${JSON.stringify(doctor.certifications)}
    WHERE id = ${id}
  `;

  await sql`DELETE FROM service_doctors WHERE doctor_id = ${id}`;
  for (let i = 0; i < doctor.service_slugs.length; i++) {
    const svcRows = await sql`SELECT id FROM services WHERE slug = ${doctor.service_slugs[i]}`;
    if (!svcRows.length) { console.warn(`  ⚠  service not found: ${doctor.service_slugs[i]}`); continue; }
    await sql`
      INSERT INTO service_doctors (service_id, doctor_id, sort_order)
      VALUES (${svcRows[0].id}, ${id}, ${i})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log(`✅ ${doctor.name_uk} → /${doctor.slug} | ${doctor.service_slugs.length} services`);
}

main().catch((e) => { console.error(e); process.exit(1); });
