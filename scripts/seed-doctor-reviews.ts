/**
 * Seed warm patient reviews for each doctor.
 * Run: npx tsx scripts/seed-doctor-reviews.ts
 */
import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = neon(env.DATABASE_URL!);

interface R { reviewer_name: string; procedure_tag?: string; rating: number; review_text: string; reviewed_at: string; }

const DATA: { slug: string; reviews: R[] }[] = [
  {
    slug: "beliyanushkin-viktor",
    reviews: [
      {
        reviewer_name: "Олена К.",
        procedure_tag: "Контурна пластика",
        rating: 5,
        review_text: "Вікторе Ігоровичу, дякую від щирого серця! Прийшла з опущеними куточками губ і страхом щось змінювати. Він уважно вислухав, пояснив кожен крок і зробив так природно, що навіть чоловік не одразу зрозумів – просто сказав, що я вигляджу відпочилою. Обов'язково повернуся!",
        reviewed_at: "2025-02-14",
      },
      {
        reviewer_name: "Марія Т.",
        procedure_tag: "Ботулінотерапія",
        rating: 5,
        review_text: "Вперше робила ботулінотерапію і дуже боялась. Але Віктор Ігорович – це той лікар, поруч з яким не страшно. Дуже детально пояснює що і навіщо, не поспішає, відповідає на всі запитання. Результат – через два тижні жодної зморшки на лобі, і виглядаю себе, тільки краще.",
        reviewed_at: "2025-01-20",
      },
      {
        reviewer_name: "Наталя В.",
        procedure_tag: "EMFACE",
        rating: 5,
        review_text: "Займаюсь із Віктором Ігоровичем вже три роки. Встигла зробити EMFACE, контурну пластику і ревіталізацію. Кожного разу відчуття, що тебе чують і розуміють. Ніколи не нав'язує зайвого, завжди говорить реальні очікування. Найкращий лікар-естет якого я знаю.",
        reviewed_at: "2024-12-05",
      },
    ],
  },
  {
    slug: "sepkina-hanna",
    reviews: [
      {
        reviewer_name: "Світлана М.",
        procedure_tag: "Лазерне омолодження",
        rating: 5,
        review_text: "Анна Сергіївна – це лікар від Бога. Робила у неї лазерне омолодження і ревіталізацію. Після кількох сеансів шкіра помолоділа так, що подруги питають у чому секрет. А секрет простий – правильний лікар :)",
        reviewed_at: "2025-03-10",
      },
      {
        reviewer_name: "Юлія Д.",
        procedure_tag: "EMFACE",
        rating: 5,
        review_text: "Прийшла до Анни Сергіївни з пігментацією, яка мучила мене роками. Вже після першого сеансу EMFACE побачила різницю. Дуже вдячна за уважне ставлення і результат, що перевершив усі очікування.",
        reviewed_at: "2025-02-28",
      },
      {
        reviewer_name: "Катерина Р.",
        procedure_tag: "Біоревіталізація",
        rating: 5,
        review_text: "Тільки після Анни нарешті зрозуміла, що не боюсь уколів. Вона настільки делікатна і точна в роботі, що навіть болюче завжди мінімально. Після курсу біоревіталізації шкіра стала зволоженою і сяючою. Рекомендую всім своїм подругам!",
        reviewed_at: "2025-01-15",
      },
    ],
  },
  {
    slug: "makarenko-oleksandra",
    reviews: [
      {
        reviewer_name: "Ірина С.",
        procedure_tag: "Консультація ендокринолога",
        rating: 5,
        review_text: "Олександра Сергіївна повністю змінила моє розуміння власного здоров'я. Прийшла з хронічною втомою і купою аналізів з різних клінік. Вона не просто призначила лікування – пояснила, чому і як все пов'язано між собою. Вже через місяць відчуваю себе набагато краще.",
        reviewed_at: "2025-03-20",
      },
      {
        reviewer_name: "Тетяна Г.",
        procedure_tag: "Гормональний баланс",
        rating: 5,
        review_text: "Звернулась до Олександри Сергіївни з проблемами щитовидної залози. Лікар дуже уважна, вдумлива, завжди знаходить час відповісти на запитання навіть після прийому. Завдяки її підходу мої показники нарешті в нормі!",
        reviewed_at: "2025-02-01",
      },
    ],
  },
  {
    slug: "poleshko-kateryna",
    reviews: [
      {
        reviewer_name: "Вікторія Л.",
        procedure_tag: "Програма довголіття",
        rating: 5,
        review_text: "Катерина Сергіївна – це той лікар, до якого хочеться повертатись. Після програми довголіття відчула справжній підйом енергії. Вона не просто лікує симптоми, а працює з причиною. Вдячна їй безмежно!",
        reviewed_at: "2025-03-05",
      },
      {
        reviewer_name: "Наталія М.",
        procedure_tag: "IV-терапія",
        rating: 5,
        review_text: "Прийшла на IV-терапію за рекомендацією подруги і не пошкодувала. Катерина Сергіївна детально пояснює склад кожної краплинниці і підбирає його індивідуально. Після курсу відчуваю себе набагато бадьоріше й активніше.",
        reviewed_at: "2025-01-28",
      },
    ],
  },
  {
    slug: "yesayants-anna",
    reviews: [
      {
        reviewer_name: "Аліна Б.",
        procedure_tag: "Гінекологія",
        rating: 5,
        review_text: "Анна Авагімівна – це той лікар, до якого прийшла раз і залишилась назавжди. Уважна, тактовна, все пояснює доступно. Більше не боюсь гінекологічних процедур, бо знаю – Анна Авагімівна зробить усе максимально комфортно.",
        reviewed_at: "2025-03-18",
      },
      {
        reviewer_name: "Дарина С.",
        procedure_tag: "Інтимна косметологія",
        rating: 5,
        review_text: "Довго не наважувалась записатись, але Анна Авагімівна розвіяла всі сумніви вже на першій консультації. Говорить відверто і по суті, без зайвого. Дуже рада, що вирішилась. Результат чудовий.",
        reviewed_at: "2025-02-10",
      },
    ],
  },
  {
    slug: "lysenko-maksym",
    reviews: [
      {
        reviewer_name: "Тамара В.",
        procedure_tag: "УЗД діагностика",
        rating: 5,
        review_text: "Максим – дуже уважний і терпеливий фахівець. Детально пояснив результати, відповів на всі запитання. Після обстеження пішла зі спокійним серцем і повним розумінням своєї ситуації.",
        reviewed_at: "2025-02-15",
      },
    ],
  },
  {
    slug: "fedorenko-svitlana",
    reviews: [
      {
        reviewer_name: "Ольга М.",
        procedure_tag: "УЗД діагностика",
        rating: 5,
        review_text: "Світлана Миколаївна – дуже досвідчений фахівець. Провела огляд ретельно і з поясненнями. Після консультації з нею нарешті зрозуміла, що в мене відбувається. Щиро рекомендую!",
        reviewed_at: "2025-01-30",
      },
    ],
  },
  {
    slug: "minchuk-yevheniia",
    reviews: [
      {
        reviewer_name: "Оксана В.",
        procedure_tag: "Нутрицевтики",
        rating: 5,
        review_text: "Євгенія допомогла нарешті розібратись з добавками – до цього я хаотично пила все підряд за порадами інтернету. Після консультації отримала чіткий план, і вже за місяць відчула різницю в рівні енергії та якості сну. Дуже вдячна!",
        reviewed_at: "2025-02-20",
      },
    ],
  },
  {
    slug: "tolstykova-tetiana",
    reviews: [
      {
        reviewer_name: "Лариса К.",
        procedure_tag: "Нутрицевтики",
        rating: 5,
        review_text: "До Тетяни Іванівни звернулась після того, як все перепробувала самостійно і нічого не спрацювало. Вона підійшла комплексно, призначила аналізи і склала персональну схему. Через три місяці відчуваю себе набагато краще. Спасибі за такий уважний підхід!",
        reviewed_at: "2025-03-01",
      },
    ],
  },
];

async function main() {
  const docRows = await sql`SELECT id, slug FROM doctors WHERE slug IS NOT NULL`;
  const docMap = Object.fromEntries(docRows.map((r) => [r.slug as string, r.id as string]));

  await sql`DELETE FROM doctor_reviews`;

  let total = 0;
  for (const { slug, reviews } of DATA) {
    const docId = docMap[slug];
    if (!docId) { console.warn(`⚠  Doctor not found: ${slug}`); continue; }
    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];
      await sql`
        INSERT INTO doctor_reviews (doctor_id, reviewer_name, procedure_tag, rating, review_text, reviewed_at, sort_order)
        VALUES (${docId}, ${r.reviewer_name}, ${r.procedure_tag ?? null}, ${r.rating}, ${r.review_text}, ${r.reviewed_at}::date, ${i})
      `;
      total++;
    }
    console.log(`✓ ${slug} → ${reviews.length} reviews`);
  }
  console.log(`\n✅ Seeded ${total} reviews total.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
