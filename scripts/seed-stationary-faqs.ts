/**
 * Add 5 TZ #39 FAQs to the stationary static page.
 * Run: npx tsx scripts/seed-stationary-faqs.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

async function main() {
  const [page] = await sql`SELECT id FROM static_pages WHERE slug = 'stationary'`;
  if (!page) { console.error("stationary page not found"); process.exit(1); }

  // Clear existing FAQs first to avoid duplicates
  await sql`DELETE FROM faq_items WHERE owner_id = ${page.id} AND owner_type = 'static_page'`;

  const faqs = [
    {
      q: {
        uk: "Які документи необхідні для госпіталізації в стаціонар?",
        ru: "Какие документы нужны для госпитализации в стационар?",
        en: "What documents are needed for stationary admission?",
      },
      a: {
        uk: "Для госпіталізації в денний стаціонар GENEVITY необхідний паспорт або інший документ, що підтверджує особу. Медичні документи (результати попередніх обстежень, виписки, аналізи) — за наявності, але не обов'язкові. Направлення від лікаря не потрібне — запис здійснюється безпосередньо через адміністратора GENEVITY.",
        ru: "Для госпитализации нужен паспорт или другой документ, удостоверяющий личность. Медицинские документы — при наличии, не обязательны. Направление от врача не требуется — запись через администратора GENEVITY.",
        en: "Admission to GENEVITY day stationary requires a passport or other identity document. Medical records (previous test results, discharge summaries) are welcome but not mandatory. No physician referral is needed — booking is made directly through the GENEVITY administrator.",
      },
    },
    {
      q: {
        uk: "Чи можна відвідувати пацієнтів у стаціонарі?",
        ru: "Можно ли посещать пациентов в стационаре?",
        en: "Can visitors come to the day stationary?",
      },
      a: {
        uk: "Так, відвідування дозволено. Просимо відвідувачів дотримуватися тихого режиму та не заважати медичним процедурам інших пацієнтів. Кількість одночасних відвідувачів може бути обмежена залежно від завантаженості стаціонару. Уточнюйте актуальний графік відвідувань у адміністратора.",
        ru: "Да, посещения разрешены. Просим соблюдать тихий режим и не мешать процедурам других пациентов. Количество посетителей может быть ограничено. Уточняйте у администратора.",
        en: "Yes, visits are permitted. We ask visitors to maintain a quiet atmosphere and not disturb other patients during procedures. The number of concurrent visitors may be limited depending on occupancy. Check current visiting hours with the administrator.",
      },
    },
    {
      q: {
        uk: "Які обмеження існують під час перебування в стаціонарі?",
        ru: "Какие ограничения действуют во время пребывания в стационаре?",
        en: "What restrictions apply during a stationary stay?",
      },
      a: {
        uk: "Під час перебування в стаціонарі просимо: не палити на території центру, не вживати алкоголь, дотримуватися тихого режиму в загальних зонах, виконувати рекомендації медичного персоналу. Конкретні медичні обмеження щодо їжі, фізичної активності та режиму визначає лікар відповідно до призначених процедур.",
        ru: "Во время пребывания просим: не курить, не употреблять алкоголь, соблюдать тихий режим, выполнять рекомендации медперсонала. Медицинские ограничения по питанию и режиму определяет врач.",
        en: "During your stay, please: no smoking on the premises, no alcohol, maintain a quiet atmosphere in common areas, and follow medical staff recommendations. Specific restrictions on diet, activity and schedule are determined by the physician per prescribed procedures.",
      },
    },
    {
      q: {
        uk: "Чи передбачено харчування для пацієнтів стаціонару?",
        ru: "Предусмотрено ли питание для пациентов стационара?",
        en: "Is catering provided for stationary patients?",
      },
      a: {
        uk: "GENEVITY — денний стаціонар, тому харчування за програмою не включено. Пацієнти можуть приносити їжу та напої з собою. Для процедур, що потребують голодування (наприклад, ранкова IV-терапія), лікар дасть окремі рекомендації. При тривалому перебуванні адміністратор порекомендує найближчі кафе поблизу центру.",
        ru: "GENEVITY — дневной стационар, питание по программе не включено. Пациенты могут приносить еду и напитки. При необходимости натощак — врач даст рекомендации. Администратор порекомендует ближайшие кафе.",
        en: "GENEVITY is a day stationary — meals are not included in the programme. Patients may bring their own food and drinks. For procedures requiring fasting (e.g. morning IV therapy), the physician will provide specific guidance. For extended stays, the administrator can recommend nearby cafés.",
      },
    },
    {
      q: {
        uk: "Як записатися на лікування в денному стаціонарі?",
        ru: "Как записаться на лечение в дневном стационаре?",
        en: "How to book treatment at the day stationary?",
      },
      a: {
        uk: "Записатися на лікування в денному стаціонарі GENEVITY можна: за телефоном +380 73 000 0150, через форму онлайн-запису на сайті або особисто в адміністратора. Рекомендується попередня консультація лікаря для складання індивідуального плану лікування та узгодження зручного графіку відвідувань.",
        ru: "Записаться можно по телефону +380 73 000 0150, через форму онлайн-записи на сайте или лично у администратора. Рекомендуется предварительная консультация врача.",
        en: "Book treatment at GENEVITY day stationary by phone +380 73 000 0150, via the online booking form on the website, or in person at the front desk. A preliminary physician consultation is recommended to create an individual treatment plan and agree on a convenient schedule.",
      },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${page.id}, 'static_page', ${f.q.uk}, ${f.q.ru}, ${f.q.en}, ${f.a.uk}, ${f.a.ru}, ${f.a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Stationary: ${faqs.length} FAQs added`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
