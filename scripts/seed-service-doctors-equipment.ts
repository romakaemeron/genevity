/**
 * Reseed service_doctors and service_equipment from master CSV:
 * technical_task/Аппарат - процедура - врач - Аркуш1.csv
 *
 * Run: npx tsx scripts/seed-service-doctors-equipment.ts
 */
import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = neon(env.DATABASE_URL!);

// Doctor slug → service slugs
// Source: technical_task/Аппарат - процедура - врач - Аркуш1.csv
// Excluded (not in DB): Полуніна Вероніка, Мершавка Надія, Гармаш Сергій
const SERVICE_DOCTORS: Record<string, string[]> = {
  "beliyanushkin-viktor": [
    "botulinum-therapy","contour-plasty","biorevitalisation","mesotherapy",
    "prp-therapy","exosomes","stem-cell-therapy","rejuran","juvederm","polyphil",
    "emface","volnewmer","exion-face","ultraformer-mpt",
    "emsculpt-neo","ultraformer-mpt-body","exion-body",
    "m22-stellar-black","splendor-x","hydrafacial","acupulse-co2",
    "bioimpedance","cosmetologist",
  ],
  "sepkina-hanna": [
    "botulinum-therapy","contour-plasty","biorevitalisation","mesotherapy",
    "prp-therapy","exosomes","rejuran","juvederm","polyphil",
    "emface","volnewmer","exion-face","ultraformer-mpt",
    "emsculpt-neo","ultraformer-mpt-body","exion-body",
    "m22-stellar-black","splendor-x","hydrafacial","acupulse-co2",
    "laser-men","laser-women","cosmetologist",
  ],
  "makarenko-oleksandra": ["endocrinologist"],
  "poleshko-kateryna":    ["endocrinologist","hormonal-balance","longevity-program","iv-therapy","bioimpedance"],
  "lysenko-maksym":       ["ultrasound","ultrasound-diagnostician"],
  "fedorenko-svitlana":   ["ultrasound","ultrasound-diagnostician"],
  "yesayants-anna":       ["monopolar-rf-lifting","acupulse-co2-intimate","ultrasound"],
  "kyrylenko-anzhela":    [],
  "minchuk-yevheniia":    ["nutraceuticals","bioimpedance"],
  "tolstykova-tetiana":   ["nutraceuticals","bioimpedance"],
  "petrenko-svitlana":    [],
};

// Equipment UUID → service slugs
// Source: apparatus column of CSV + equipment table IDs
const EQUIP_SERVICES: { id: string; slugs: string[] }[] = [
  { id: "89c64f09-65a9-4f65-a6c6-231a725b1a51", slugs: ["emface"] },
  { id: "18e12727-116a-4e38-b08d-397a37f10aaa", slugs: ["volnewmer"] },
  { id: "8a58bc56-6e1a-4f70-be08-cbeb0a3df349", slugs: ["exion-face"] },
  { id: "43033463-9b71-421f-a1eb-9f24c9f7b713", slugs: ["ultraformer-mpt"] },
  { id: "a6192be2-a410-4a8e-bda1-37503b37dea7", slugs: ["emsculpt-neo"] },
  { id: "6b86fc8f-19ae-481c-b7e0-ff56c909d7b0", slugs: ["ultraformer-mpt-body"] },
  { id: "d1302bff-a164-4d46-9d0c-b278b63b7681", slugs: ["exion-body"] },
  { id: "1466b7ba-0060-447e-8619-f3c7eea7f76a", slugs: ["m22-stellar-black"] },
  { id: "5fbab61d-b967-4b12-be40-05d6326aab81", slugs: ["splendor-x"] },
  { id: "d98aec45-ab1a-4828-8dce-5946ec2fb8ee", slugs: ["laser-men","laser-women"] },
  { id: "20ca8a02-c60d-4a17-ab70-a29890c9c823", slugs: ["hydrafacial"] },
  { id: "b9fc15cc-b374-4bc4-83f7-a0310675a287", slugs: ["acupulse-co2","acupulse-co2-intimate"] },
  { id: "928eae80-c571-4749-8b4a-5ec595512c3b", slugs: ["bioimpedance"] },
  { id: "6c646b53-fdc3-405d-8720-de233f71f1c2", slugs: ["ultrasound","ultrasound-diagnostician"] },
  { id: "be53204c-329a-4df4-8ba9-84c293677883", slugs: ["monopolar-rf-lifting"] },
];

async function main() {
  const svcRows = await sql`SELECT id, slug FROM services`;
  const svc = Object.fromEntries(svcRows.map((r) => [r.slug as string, r.id as string]));
  const docRows = await sql`SELECT id, slug FROM doctors WHERE slug IS NOT NULL`;
  const doc = Object.fromEntries(docRows.map((r) => [r.slug as string, r.id as string]));

  // service_doctors
  await sql`DELETE FROM service_doctors`;
  let sd = 0;
  for (const [dSlug, slugs] of Object.entries(SERVICE_DOCTORS)) {
    const dId = doc[dSlug];
    if (!dId) { console.warn(`⚠  Doctor not found: ${dSlug}`); continue; }
    for (let i = 0; i < slugs.length; i++) {
      const sId = svc[slugs[i]];
      if (!sId) { console.warn(`  ⚠  Service not found: ${slugs[i]}`); continue; }
      await sql`INSERT INTO service_doctors(service_id,doctor_id,sort_order) VALUES(${sId},${dId},${i}) ON CONFLICT DO NOTHING`;
      sd++;
    }
    if (slugs.length) console.log(`✓ ${dSlug} → ${slugs.length} services`);
  }
  console.log(`\nservice_doctors: ${sd} rows`);

  // service_equipment
  await sql`DELETE FROM service_equipment`;
  let se = 0;
  for (const { id: eId, slugs } of EQUIP_SERVICES) {
    for (let i = 0; i < slugs.length; i++) {
      const sId = svc[slugs[i]];
      if (!sId) { console.warn(`  ⚠  Service not found: ${slugs[i]}`); continue; }
      await sql`INSERT INTO service_equipment(service_id,equipment_id,sort_order) VALUES(${sId},${eId},${i}) ON CONFLICT DO NOTHING`;
      se++;
    }
  }
  console.log(`service_equipment: ${se} rows`);
  console.log("\n✅ Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
