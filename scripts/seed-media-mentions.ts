import { readFileSync } from "fs";
import * as path from "path";

const envContent = readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const envObj: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) envObj[k.trim()] = v.join("=").trim();
});
Object.assign(process.env, envObj);

const SEED: { url: string; publisher: string; titleUk: string; date: string | null }[] = [
  { url: "https://www.056.ua/news/4123776/ak-pozbutisa-lokalnih-zirovih-vidkladen-koli-dieta-ta-sport-ne-dopomagaut",
    publisher: "056.ua", titleUk: "Як позбутися локальних жирових відкладень: коли дієта та спорт не допомагають", date: "2026-06-29" },
  { url: "https://www.dpcity.v.ua/chi-mozhna-odnochasno-narostiti",
    publisher: "ДП City", titleUk: "Чи можна одночасно наростити м'язи та зменшити жировий прошарок?", date: null },
  { url: "https://faine-misto.dp.ua/check-up-40-obstezhennia-pislia-40-rokiv/",
    publisher: "Файне місто Дніпро", titleUk: "Check-Up 40+: що потрібно перевірити, щоб зберегти молодість і енергію", date: "2026-06-28" },
  { url: "https://nashdnipro.dp.ua/idealnyy-pres-bez-vysnazhlyvyh-trenuvan-mif-chy-realnist/",
    publisher: "Наш Дніпро", titleUk: "Ідеальний прес без виснажливих тренувань: міф чи реальність?", date: null },
  { url: "https://dnepr.news/public/yak-pidtyagnuti-shkiru-tila-pislya-shudnennya",
    publisher: "Новини Дніпра", titleUk: "Як підтягнути шкіру тіла після схуднення", date: "2026-07-02" },
  { url: "https://gorod.dp.ua/news/260308",
    publisher: "Городской сайт Днепра", titleUk: "Догляд за шкірою тіла: сучасні апаратні методики", date: null },
  { url: "https://vesti.dp.ua/suchasni-sposoby-borotby-z-v-yalistyu-shkiry-na-tili/",
    publisher: "Вісті Придніпров'я", titleUk: "Сучасні способи боротьби з в'ялістю шкіри на тілі", date: "2026-06-27" },
  { url: "https://donga.dp.ua/lazerna-epiliatsiia-vlitku-shcho-potribno-znaty-pered-protseduroiu/",
    publisher: "Дніпровська панорама", titleUk: "Лазерна епіляція влітку: що потрібно знати перед процедурою", date: null },
  { url: "https://nashreporter.com/dovidnyk/chomu-shkira-vtrachaye-elastychnist-i-yak-cze-vypravyty-318333",
    publisher: "Наш Репортер", titleUk: "Чому шкіра втрачає еластичність і як це виправити", date: "2026-06-29" },
  { url: "https://sobitie.com.ua/reklama/chomu-lazerna-epilyacziya-krashha-za-golinnya-ta-voskovu-depilyacziyu-427893/",
    publisher: "Событие", titleUk: "Чому лазерна епіляція краща за гоління та воскову депіляцію", date: null },
];

async function run() {
  const { fetchMediaMeta } = await import("../src/lib/media/fetch-meta");
  const { translateHeadline } = await import("../src/lib/translate");
  const { adminSaveMention } = await import("../src/lib/db/queries/media");

  let order = 0;
  for (const s of SEED) {
    const meta = await fetchMediaMeta(s.url);
    const titleUk = s.titleUk || meta.title_uk;
    const [titleRu, titleEn] = await Promise.all([
      translateHeadline(titleUk, "ru"),
      translateHeadline(titleUk, "en"),
    ]);
    const id = await adminSaveMention({
      url: s.url,
      publisherName: s.publisher || meta.publisher_name,
      publisherDomain: meta.publisher_domain,
      titleUk, titleRu, titleEn,
      imageUrl: meta.image_url,
      logoUrl: null,
      publishedAt: s.date || meta.published_at,
      sortOrder: order++,
      isPublished: true,
    });
    console.log(`✓ ${s.publisher} → ${id}`);
  }
  console.log("Seed complete.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
