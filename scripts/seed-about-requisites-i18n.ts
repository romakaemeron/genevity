/**
 * TZ #10 §3 — legal requisites on /about.
 *
 * The block was stored as one English blob and served identically to the
 * Ukrainian, Russian and English pages. This writes a per-locale version and
 * switches the format to one `Label: value` pair per line so the front end can
 * render it as a readable definition list instead of a wall of text.
 *
 * The values themselves (names, addresses, account numbers, MFO codes) are
 * reproduced verbatim from the client's original block — only the labels and
 * the place names are localized.
 *
 * Also seeds the `aboutPage.requisitesHeading` UI string.
 *
 * Safe to re-run. Run: npx tsx scripts/seed-about-requisites-i18n.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

const UK = [
  "ФОП Харківська Катерина Сергіївна",
  "Юридична адреса: 49116, Дніпропетровська область, Дніпровський район, смт Слобожанське, вул. Волошкова, буд. 18",
  "Фактична адреса: 49000, м. Дніпро, вул. Олеся Гончара, буд. 12",
  "Податковий номер (РНОКПП): 3887006966",
  "Розрахунковий рахунок: UA073052990000026003050624373 в АТ КБ «ПриватБанк», МФО: 305299",
  "Розрахунковий рахунок: UA123348510000000026009302974 в АТ «ПУМБ», МФО: 14282829",
  "E-mail: info@genevity.com.ua",
].join("\n");

const RU = [
  "ФЛП Харьковская Екатерина Сергеевна",
  "Юридический адрес: 49116, Днепропетровская область, Днепровский район, пгт Слобожанское, ул. Волошковая, д. 18",
  "Фактический адрес: 49000, г. Днепр, ул. Олеся Гончара, д. 12",
  "Налоговый номер (РНОКПП): 3887006966",
  "Расчётный счёт: UA073052990000026003050624373 в АО КБ «ПриватБанк», МФО: 305299",
  "Расчётный счёт: UA123348510000000026009302974 в АО «ПУМБ», МФО: 14282829",
  "E-mail: info@genevity.com.ua",
].join("\n");

const EN = [
  "FOP Kharkivska Kateryna Serhiivna",
  "Legal address: 49116, Dnipropetrovsk region, Dnipro district, Slobozhanske village, Voloshkova St., building 18",
  "Physical address: 49000, Dnipro, Oles Honchar St., building 12",
  "Tax ID (RNOKPP): 3887006966",
  "Bank account: UA073052990000026003050624373 at JSC CB PrivatBank, MFO: 305299",
  "Bank account: UA123348510000000026009302974 at JSC FUIB, MFO: 14282829",
  "E-mail: info@genevity.com.ua",
].join("\n");

const HEADING = {
  uk: "Реквізити",
  ru: "Реквизиты",
  en: "Legal details",
};

async function main() {
  await sql`
    UPDATE about SET
      requisites_uk = ${UK},
      requisites_ru = ${RU},
      requisites_en = ${EN}
    WHERE id = 1
  `;
  console.log("✓ about.requisites_{uk,ru,en} localized and restructured");

  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const tree = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  tree.aboutPage = tree.aboutPage || {};
  if (!tree.aboutPage.requisitesHeading) {
    tree.aboutPage.requisitesHeading = HEADING;
    await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
    console.log("✓ added aboutPage.requisitesHeading");
  } else {
    console.log("↷ aboutPage.requisitesHeading already present");
  }

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
