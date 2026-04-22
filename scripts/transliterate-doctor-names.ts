/**
 * Transliterate all doctors' name_en from Ukrainian Cyrillic to Latin script
 * using the official Ukrainian passport romanization (2010 KMU rules).
 * Run: npx tsx scripts/transliterate-doctor-names.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

// Hand-written transliterations so they read naturally in English
// (avoids clunky machine output for non-standard characters).
const transliterations: Record<string, string> = {
  "Бєлянушкін Віктор Ігорович": "Bielianushkin Viktor Ihorovych",
  "Сепкіна Ганна Сергіївна": "Sepkina Hanna Serhiivna",
  "Макаренко Олександра Сергіївна": "Makarenko Oleksandra Serhiivna",
  "Полешко Катерина Володимирівна": "Poleshko Kateryna Volodymyrivna",
  "Лисенко Максим Ігорович": "Lysenko Maksym Ihorovych",
  "Федоренко Світлана Олексіївна": "Fedorenko Svitlana Oleksiivna",
  "Єсаянц Анна Олександрівна": "Yesaiants Anna Oleksandrivna",
  "Кириленко Анжела В'ячеславівна": "Kyrylenko Anzhela Viacheslavivna",
  "Мінчук Євгенія Анатоліївна": "Minchuk Yevheniia Anatoliivna",
  "Толстикова Тетяна Миколаївна": "Tolstykova Tetiana Mykolaivna",
  "Петренко Світлана Андріївна": "Petrenko Svitlana Andriivna",
};

async function main() {
  let updated = 0;
  for (const [uk, en] of Object.entries(transliterations)) {
    const res = await sql`
      UPDATE doctors SET name_en = ${en}
      WHERE name_uk = ${uk}
    `;
    if (res.count > 0) {
      console.log(`✓ ${uk}  →  ${en}`);
      updated += res.count;
    } else {
      console.log(`· Not found: ${uk}`);
    }
  }
  console.log(`\nDone. Updated ${updated} doctor name_en field(s).`);
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
