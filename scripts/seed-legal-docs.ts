/**
 * Seed legal documents to Sanity.
 * Usage: npx tsx scripts/seed-legal-docs.ts
 */
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

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

// Ukrainian source → Russian/English translations will be done manually in Studio
const docs = [
  {
    _id: "legal-license",
    slug: "license",
    order: 0,
    title: {
      uk: "Ліцензія на провадження медичної практики",
      ru: "Лицензия на осуществление медицинской практики",
      en: "Medical Practice License",
    },
    shortLabel: {
      uk: "Ліцензія",
      ru: "Лицензия",
      en: "License",
    },
    content: {
      uk: `Ліцензія на провадження медичної практики, видана МОЗ України згідно наказу від 14.08.2025 №1296.

ФОП Харківська Катерина Сергіївна

Центр довголіття та якості життя "GENEVITY" здійснює медичну діяльність на підставі ліцензії Міністерства охорони здоров'я України.`,
      ru: `Лицензия на осуществление медицинской практики, выдана МОЗ Украины согласно приказу от 14.08.2025 №1296.

ФЛП Харьковская Екатерина Сергеевна

Центр долголетия и качества жизни "GENEVITY" осуществляет медицинскую деятельность на основании лицензии Министерства здравоохранения Украины.`,
      en: `Medical practice license issued by the Ministry of Health of Ukraine under order №1296 dated 14.08.2025.

Individual Entrepreneur Kateryna Kharkivska

Longevity and Quality of Life Center "GENEVITY" conducts medical activities based on the license of the Ministry of Health of Ukraine.`,
    },
  },
  {
    _id: "legal-air-raid",
    slug: "air-raid-rules",
    order: 1,
    title: {
      uk: "Правила поведінки під час повітряної тривоги",
      ru: "Правила поведения во время воздушной тревоги",
      en: "Air Raid Alert Procedures",
    },
    shortLabel: {
      uk: "Повітряна тривога",
      ru: "Воздушная тревога",
      en: "Air Raid Alert",
    },
    content: {
      uk: `Шановні відвідувачі Центру довголіття та якості життя Genevity.

Сповіщення про повітряну тривогу — це сигнал "Увага всім!", що повідомляє про загрозу виникнення або виникнення надзвичайних ситуацій загальнодержавного рівня (наприклад, техногенного чи воєнного характеру). Загальна тривалість попереджувального сигналу може становити 3–5 хв.

Правила поведінки під час ПОВІТРЯНОЇ ТРИВОГИ в Центрі довголіття та якості життя Genevity:

Після початку звукового сигналу (сирени) усім необхідно пройти до укриття, зокрема і тим, хто перебуває у подвір'ї центру. Виконуйте вказівки адміністраторів та відповідального медичного персоналу.

Покинути укриття можна лише після сигналу "ВІДБІЙ ПОВІТРЯНОЇ ТРИВОГИ" (виконуючи вказівки адміністратора та відповідального медичного персоналу).

Зверніть увагу! Медичний центр не несе відповідальності за життя і здоров'я пацієнта, супроводжуючої особи чи гостя, які відмовляються пройти в укриття.

Найближчі укриття:

— просп. Гагаріна, буд. 67, Державний вищий навчальний заклад "Український Державний хіміко-технологічний університет"
— вул. Пісаржевського, 1А, ДП "Науково-дослідний та конструкторсько-технологічний інститут трубної промисловості ім. Я. Ю. Осади"`,
      ru: `Уважаемые посетители Центра долголетия и качества жизни Genevity.

Оповещение о воздушной тревоге — это сигнал "Внимание всем!", который сообщает об угрозе возникновения или возникновении чрезвычайных ситуаций общегосударственного уровня (например, техногенного или военного характера). Общая длительность предупредительного сигнала может составлять 3–5 мин.

Правила поведения во время ВОЗДУШНОЙ ТРЕВОГИ в Центре долголетия и качества жизни Genevity:

После начала звукового сигнала (сирены) всем необходимо пройти в укрытие, в том числе и тем, кто находится во дворе центра. Выполняйте указания администраторов и ответственного медицинского персонала.

Покинуть укрытие можно только после сигнала "ОТБОЙ ВОЗДУШНОЙ ТРЕВОГИ" (выполняя указания администратора и ответственного медицинского персонала).

Обратите внимание! Медицинский центр не несёт ответственности за жизнь и здоровье пациента, сопровождающего лица или гостя, которые отказываются пройти в укрытие.

Ближайшие укрытия:

— просп. Гагарина, д. 67, Государственное высшее учебное заведение "Украинский Государственный химико-технологический университет"
— ул. Писаржевского, 1А, ГП "Научно-исследовательский и конструкторско-технологический институт трубной промышленности им. Я. Е. Осады"`,
      en: `Dear visitors of the Longevity and Quality of Life Center Genevity.

Air raid alert is an "Attention All!" signal that warns of the threat or occurrence of national-level emergencies (e.g., technological or military). Total warning signal duration may be 3–5 minutes.

Air raid alert procedures at Genevity Longevity and Quality of Life Center:

After the audio signal (siren) begins, everyone must proceed to the shelter, including those in the center's courtyard. Follow the instructions of administrators and responsible medical staff.

You may leave the shelter only after the "ALL CLEAR" signal (following the instructions of the administrator and responsible medical staff).

Please note! The medical center is not responsible for the life and health of patients, accompanying persons, or guests who refuse to go to the shelter.

Nearest shelters:

— 67 Gagarin Ave., Ukrainian State University of Chemical Technology
— 1A Pisarzhevsky St., Y. Osada Research and Design-Technological Institute of the Pipe Industry`,
    },
  },
];

// Read the full privacy policy text
const privacyPath = path.resolve("/tmp/ПОЛОЖЕННЯ_ПРО_ПОРЯДОК_ТА_ПРОЦЕДУРУ_ОБРОБКИ_ТА_ЗАХИСТУ_ПЕРСОНАЛЬНИХ_ДАНИХ_КЛІЄНТІВ_ЦЕНТРУ_ДОВГОЛІТТЯ_ТА_ЯКОСТІ_ЖИТТЯ_“GENEVITY”.txt");
const privacyText = fs.existsSync(privacyPath) ? fs.readFileSync(privacyPath, "utf-8") : "";

const privacyDoc = {
  _id: "legal-privacy",
  slug: "privacy-policy",
  order: 2,
  title: {
    uk: "Положення про обробку та захист персональних даних",
    ru: "Положение об обработке и защите персональных данных",
    en: "Personal Data Processing and Protection Policy",
  },
  shortLabel: {
    uk: "Політика конфіденційності",
    ru: "Политика конфиденциальности",
    en: "Privacy Policy",
  },
  content: {
    uk: privacyText,
    ru: "", // To be translated in Studio
    en: "", // To be translated in Studio
  },
};

async function main() {
  console.log("📄 Seeding legal documents...\n");

  for (const doc of [...docs, privacyDoc]) {
    await client.createOrReplace({
      _type: "legalDoc",
      _id: doc._id,
      title: doc.title,
      slug: { _type: "slug", current: doc.slug },
      shortLabel: doc.shortLabel,
      content: doc.content,
      order: doc.order,
    });
    console.log(`  ✓ ${doc.title.uk}`);
  }

  console.log("\n✅ Legal documents seeded!");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
