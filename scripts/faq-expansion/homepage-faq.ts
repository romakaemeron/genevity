/** Adds q6 and q7 to the homepage FAQ block (ui_strings.homeFaq). */
import { sql } from "@/lib/db/client";

const NEW = {
  q6: {
    question: {
      uk: "Чи є у центрі власна лабораторія та діагностика?",
      ru: "Есть ли в центре собственная лаборатория и диагностика?",
      en: "Does the centre have its own laboratory and diagnostics?",
    },
    answer: {
      uk: "Так. GENEVITY має власну клініко-діагностичну лабораторію та кабінет УЗД експертного класу, тож аналізи, ультразвукове дослідження й аналіз складу тіла на InBody можна пройти в день консультації. Це прискорює діагностику й дає лікарю точні дані для персоналізованого протоколу.",
      ru: "Да. GENEVITY имеет собственную клинико-диагностическую лабораторию и кабинет УЗИ экспертного класса, поэтому анализы, ультразвуковое исследование и анализ состава тела на InBody можно пройти в день консультации. Это ускоряет диагностику и даёт врачу точные данные для персонализированного протокола.",
      en: "Yes. GENEVITY has its own clinical laboratory and an expert-class ultrasound room, so blood tests, imaging and an InBody composition scan can all be done on the day of your consultation. This speeds up diagnosis and gives the physician precise data for a personalised protocol.",
    },
  },
  q7: {
    question: {
      uk: "Як обрати процедуру, якщо я не знаю, що мені потрібно?",
      ru: "Как выбрать процедуру, если я не знаю, что мне нужно?",
      en: "How do I choose a treatment if I do not know what I need?",
    },
    answer: {
      uk: "Почніть із консультації. Лікар оцінить стан шкіри або результати обстежень, з'ясує ваш запит і складе покроковий план: що доречно зробити зараз, що згодом, а чого краще не робити взагалі. Це заощаджує і час, і кошти — замість набору випадкових процедур ви отримуєте протокол під свою задачу.",
      ru: "Начните с консультации. Врач оценит состояние кожи или результаты обследований, выяснит ваш запрос и составит пошаговый план: что уместно сделать сейчас, что позже, а чего лучше не делать вовсе. Это экономит и время, и средства — вместо набора случайных процедур вы получаете протокол под свою задачу.",
      en: "Start with a consultation. The physician assesses your skin or test results, clarifies your goal and sets out a step-by-step plan: what to do now, what later and what to avoid altogether. It saves time and money — instead of a set of unrelated treatments you get a protocol built around your goal.",
    },
  },
};

const main = async () => {
  const rows = await sql`SELECT data FROM ui_strings WHERE id = 1`;
  const raw = rows[0]?.data;
  const tree = (typeof raw === "string" ? JSON.parse(raw) : raw) as any;
  tree.homeFaq = { ...tree.homeFaq, ...NEW };
  await sql`UPDATE ui_strings SET data = ${JSON.stringify(tree)}::jsonb WHERE id = 1`;
  console.log("homeFaq keys:", Object.keys(tree.homeFaq).join(", "));
};

main();
