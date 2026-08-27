/**
 * Replaces Вероніка Полуніна's profile bio with the client-supplied text
 * ("Врачи на сайт дженевети/Полуніна Вероніка.txt"), in all three locales.
 *
 * Formatting note: DoctorProfilePage splits the bio on "\n\n" and renders each
 * chunk as a <p> with no whitespace-pre-line, so single newlines collapse. The
 * previous bio kept its "Професійні напрямки" list on separate "\r\n" lines,
 * which the browser ran together into one wall of text. The list is therefore
 * set as a single sentence with semicolons, and every paragraph break is a
 * real "\n\n".
 *
 * The source text is impersonal third person, unlike the previous first-person
 * bio — that matches the rest of the roster (Гармаш, Децик).
 *
 *   npx tsx scripts/update-polunina-bio.mts          # dry run
 *   npx tsx scripts/update-polunina-bio.mts --apply
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
const env = readFileSync(".env.local", "utf8");
env.split("\n").forEach((l) => { const m = l.match(/^([^#=\s]+)=(.+)/); if (m) process.env[m[1].trim()] = m[2].trim(); });

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
const APPLY = process.argv.includes("--apply");
const SLUG = "polunina-veronika";

const bio_uk = [
  "Експерт з інноваційної косметології.",
  "Медична освіта та понад 11 років успішної практики у сфері естетичної медицини й косметології. Експертиза охоплює сучасні ін’єкційні методики та високотехнологічні апаратні процедури, що відповідають найвищим міжнародним стандартам безпеки та ефективності.",
  "У роботі застосовуються виключно перевірені протоколи, інноваційні технології та преміальні препарати, що дозволяють досягати природних, гармонійних і довготривалих результатів. Особлива увага приділяється збереженню індивідуальності пацієнта, адже справжня естетика полягає не у зміні зовнішності, а в її делікатному вдосконаленні.",
  "Постійний професійний розвиток є невід’ємною частиною діяльності: регулярна участь у міжнародних конгресах, науково-практичних конференціях та спеціалізованих навчальних програмах дозволяє впроваджувати у практику найсучасніші досягнення світової естетичної медицини.",
  "Довіра пацієнтів ґрунтується на професіоналізмі, бездоганному сервісі, індивідуальному підході та безкомпромісній якості.",
  "Професійні напрямки: апаратні методики омолодження нового покоління; комплексні anti-age програми; персоналізовані протоколи корекції вікових змін; ін’єкційна косметологія преміум-рівня.",
  "Природна краса не потребує кардинальних змін. Вона потребує професійного підходу, точності та бездоганного відчуття гармонії.",
].join("\n\n");

const bio_ru = [
  "Эксперт по инновационной косметологии.",
  "Медицинское образование и более 11 лет успешной практики в сфере эстетической медицины и косметологии. Экспертиза охватывает современные инъекционные методики и высокотехнологичные аппаратные процедуры, отвечающие самым высоким международным стандартам безопасности и эффективности.",
  "В работе применяются исключительно проверенные протоколы, инновационные технологии и премиальные препараты, позволяющие достигать естественных, гармоничных и долговременных результатов. Особое внимание уделяется сохранению индивидуальности пациента, ведь подлинная эстетика заключается не в изменении внешности, а в её деликатном совершенствовании.",
  "Постоянное профессиональное развитие — неотъемлемая часть работы: регулярное участие в международных конгрессах, научно-практических конференциях и специализированных учебных программах позволяет внедрять в практику самые современные достижения мировой эстетической медицины.",
  "Доверие пациентов основано на профессионализме, безупречном сервисе, индивидуальном подходе и бескомпромиссном качестве.",
  "Профессиональные направления: аппаратные методики омоложения нового поколения; комплексные anti-age программы; персонализированные протоколы коррекции возрастных изменений; инъекционная косметология премиум-уровня.",
  "Естественная красота не требует кардинальных перемен. Она требует профессионального подхода, точности и безупречного чувства гармонии.",
].join("\n\n");

const bio_en = [
  "An expert in innovative cosmetology.",
  "A medical degree and over 11 years of practice in aesthetic medicine and cosmetology. That expertise spans contemporary injectable techniques and high-technology device-based treatments that meet the highest international standards of safety and efficacy.",
  "The work relies solely on proven protocols, innovative technology, and premium products, which together deliver natural, harmonious, and long-lasting results. Particular care goes to preserving each patient's individuality, because genuine aesthetics lies not in altering appearance but in refining it with restraint.",
  "Continuous professional development is an integral part of the practice: regular participation in international congresses, scientific conferences, and specialist training programmes brings the latest advances in global aesthetic medicine into everyday work.",
  "Patients' trust rests on professionalism, impeccable service, an individual approach, and uncompromising quality.",
  "Areas of practice: next-generation device-based rejuvenation; comprehensive anti-age programmes; personalised protocols for correcting age-related change; premium-level injectable cosmetology.",
  "Natural beauty does not call for dramatic change. It calls for a professional approach, precision, and a faultless sense of harmony.",
].join("\n\n");

const before = (await sql`SELECT slug, name_uk, bio_uk, bio_ru, bio_en FROM doctors WHERE slug = ${SLUG}`)[0] as any;
if (!before) throw new Error(`Doctor not found: ${SLUG}`);

console.log(APPLY ? "APPLYING\n" : "DRY RUN — pass --apply to write\n");
console.log(`${before.name_uk} (${SLUG})`);
for (const [loc, next, prev] of [["uk", bio_uk, before.bio_uk], ["ru", bio_ru, before.bio_ru], ["en", bio_en, before.bio_en]] as [string, string, string][]) {
  const same = next === prev;
  console.log(`  ${loc}: ${same ? "already set" : `${(prev ?? "").length} → ${next.length} chars, ${next.split("\n\n").length} paragraphs`}`);
}

if (APPLY) {
  if (!existsSync("scripts/backups")) mkdirSync("scripts/backups", { recursive: true });
  const file = `scripts/backups/polunina-bio-rollback-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(before, null, 2));
  await sql`UPDATE doctors SET bio_uk = ${bio_uk}, bio_ru = ${bio_ru}, bio_en = ${bio_en}, updated_at = now() WHERE slug = ${SLUG}`;
  console.log(`\nUpdated. Previous text saved to ${file}`);
}
