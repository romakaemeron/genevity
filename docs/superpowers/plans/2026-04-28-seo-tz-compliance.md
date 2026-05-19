# SEO & TZ Compliance — Full Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Bring every page of genevity.vercel.app into 1:1 compliance with the technical task brief (`technical_task/`) and UA/RU/EN semantics (`semantics/`), fixing all SEO title duplication and structural violations.

**Architecture:** Database-driven CMS (Neon Postgres). Pages are `service_categories` and `services` records with `content_sections` and `faq_items`. Static pages live in `static_pages` table. All seed scripts run with `npx tsx scripts/<name>.ts`. Nav is hardcoded in `src/components/layout/navConfig.ts`.

**Tech Stack:** Next.js 16 App Router, Neon Postgres, TypeScript seed scripts, Tailwind CSS.

---

## Audit Summary

**Problems to fix:**

| # | Issue | Impact |
|---|-------|--------|
| 1 | Static page seo_titles contain "GENEVITY" → template appends " \| GENEVITY" → duplicate | All static pages broken |
| 2 | Service seo_titles contain "в GENEVITY" → same duplication | All service pages |
| 3 | Longevity header is clickable; brief says non-clickable | Structure brief violation |
| 4 | Skin hub is "coming soon" — page is empty/placeholder | Missing apparatus page |
| 5 | Face hub doesn't cover EMFACE/Volnewmer/Exion/Ultraformer MPT SEO | 8 semantic groups unserved |
| 6 | Body hub doesn't cover EMSCULPT NEO/Ultraformer Body/Exion Body SEO | 5 semantic groups unserved |
| 7 | 4 extra-services pages 404: skincare, podology, diagnostics, plastic-surgery | TZ #41, #42 + structure brief |
| 8 | Apparatus-cosmetology hub missing "Як обрати клініку" section | TZ #13 |
| 9 | Лазерна епіляція hub missing prep/aftercare/side-effects | TZ #31 |
| 10 | Лабораторія page thin — missing equipment/staff/speed/prep sections | TZ #40 |
| 11 | Нутрицевтика page framed as "нутриціолог"; TZ wants nutraceuticals explainer | TZ #38 |
| 12 | Check-Up 40+ page doesn't cover age-variant semantics (check up 41–46) | Semantic CSV |
| 13 | Skin nav item label says "(скоро)" | UX |

---

## Phase 1 — SEO Titles + Nav (no content, quick wins)

### Task 1: Fix duplicate GENEVITY in seo_title fields

**Files:**
- Create: `scripts/fix-seo-titles.ts`

- [ ] Create and run the script:

```typescript
/**
 * Fix duplicate GENEVITY branding in seo_title fields.
 * The layout template already appends " | GENEVITY", so stored titles must NOT contain GENEVITY.
 * Run: npx tsx scripts/fix-seo-titles.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

// Replacement map: slug → clean {uk,ru,en} seo_title (no GENEVITY, no location suffix)
const staticTitles: Record<string, { uk: string; ru: string; en: string }> = {
  stationary: {
    uk: "Денний стаціонар у Дніпрі — IV-терапія та відновлення після процедур",
    ru: "Дневной стационар в Днепре — IV-терапия и восстановление после процедур",
    en: "Day Stationary in Dnipro — IV Therapy & Post-Procedure Recovery",
  },
  laboratory: {
    uk: "Лабораторія та аналізи у Дніпрі — швидко, точно, конфіденційно",
    ru: "Лаборатория и анализы в Днепре — быстро, точно, конфиденциально",
    en: "Laboratory & Tests in Dnipro — Fast, Accurate, Confidential",
  },
  about: {
    uk: "Про центр естетичної медицини GENEVITY у Дніпрі — команда, обладнання, підхід",
    ru: "О центре эстетической медицины GENEVITY в Днепре — команда, оборудование, подход",
    en: "About GENEVITY Aesthetic Medicine Centre in Dnipro — Team, Equipment, Approach",
  },
  contacts: {
    uk: "Контакти GENEVITY — адреса, телефон, графік роботи у Дніпрі",
    ru: "Контакты GENEVITY — адрес, телефон, график работы в Днепре",
    en: "GENEVITY Contacts — Address, Phone & Hours in Dnipro",
  },
  prices: {
    uk: "Ціни на послуги косметології та медицини — GENEVITY Дніпро",
    ru: "Цены на услуги косметологии и медицины — GENEVITY Днепр",
    en: "Prices for Cosmetic & Medical Services — GENEVITY Dnipro",
  },
  doctors: {
    uk: "Лікарі GENEVITY — сертифіковані спеціалісти з естетичної медицини у Дніпрі",
    ru: "Врачи GENEVITY — сертифицированные специалисты по эстетической медицине в Днепре",
    en: "GENEVITY Doctors — Certified Aesthetic Medicine Specialists in Dnipro",
  },
};

async function main() {
  // 1. Fix static_pages
  for (const [slug, t] of Object.entries(staticTitles)) {
    const res = await sql`
      UPDATE static_pages
      SET seo_title_uk = ${t.uk}, seo_title_ru = ${t.ru}, seo_title_en = ${t.en}
      WHERE slug = ${slug}
    `;
    console.log(`✓ static_pages ${slug} — ${res.count} row(s)`);
  }

  // 2. Fix service seo_titles that contain GENEVITY branding
  // Strip "в GENEVITY — " / " — GENEVITY" / "у GENEVITY — " patterns
  await sql`
    UPDATE services
    SET
      seo_title_uk = REGEXP_REPLACE(REGEXP_REPLACE(seo_title_uk, '\\s*(в|у) GENEVITY\\s*—\\s*', ' — ', 'g'), '\\s*—?\\s*GENEVITY\\s*$', '', 'g'),
      seo_title_ru = REGEXP_REPLACE(REGEXP_REPLACE(seo_title_ru, '\\s*в GENEVITY\\s*—\\s*', ' — ', 'g'), '\\s*—?\\s*GENEVITY\\s*$', '', 'g'),
      seo_title_en = REGEXP_REPLACE(REGEXP_REPLACE(seo_title_en, '\\s*(at|in) GENEVITY\\s*—\\s*', ' — ', 'g'), '\\s*—?\\s*GENEVITY\\s*$', '', 'g')
    WHERE seo_title_uk ILIKE '%GENEVITY%'
       OR seo_title_ru ILIKE '%GENEVITY%'
       OR seo_title_en ILIKE '%GENEVITY%'
  `;
  const svcCount = await sql`SELECT COUNT(*) FROM services WHERE seo_title_uk IS NOT NULL`;
  console.log(`✓ services seo_title GENEVITY stripped`);

  // 3. Fix service_categories seo_titles
  await sql`
    UPDATE service_categories
    SET
      seo_title_uk = REGEXP_REPLACE(seo_title_uk, '\\s*—?\\s*GENEVITY[^|]*$', '', 'g'),
      seo_title_ru = REGEXP_REPLACE(seo_title_ru, '\\s*—?\\s*GENEVITY[^|]*$', '', 'g'),
      seo_title_en = REGEXP_REPLACE(seo_title_en, '\\s*—?\\s*GENEVITY[^|]*$', '', 'g')
    WHERE seo_title_uk ILIKE '%GENEVITY%'
       OR seo_title_ru ILIKE '%GENEVITY%'
       OR seo_title_en ILIKE '%GENEVITY%'
  `;
  console.log(`✓ service_categories seo_title GENEVITY stripped`);

  // 4. Verify
  const broken = await sql`
    SELECT 'static_pages' AS tbl, slug, seo_title_uk FROM static_pages WHERE seo_title_uk ILIKE '%GENEVITY%genevity%'
    UNION ALL
    SELECT 'services', slug, seo_title_uk FROM services WHERE seo_title_uk ILIKE '%GENEVITY%genevity%'
  `;
  if (broken.length) console.warn("⚠ Still doubled:", broken);
  else console.log("✓ No duplicate GENEVITY found");

  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Run: `npx tsx scripts/fix-seo-titles.ts`
- [ ] Verify output shows no "Still doubled" rows
- [ ] Commit: `git add scripts/fix-seo-titles.ts && git commit -m "fix: strip duplicate GENEVITY from seo_title fields"`

---

### Task 2: Fix navConfig — longevity non-clickable + skin label

**Files:**
- Modify: `src/components/layout/navConfig.ts:121,148`

- [ ] In `navConfig.ts` line 121, change skin label:
```typescript
// FROM:
{ key: "skin", label: L("Шкіра (скоро)", "Кожа (скоро)", "Skin (coming soon)"), href: R.apparatusSkin },
// TO:
{ key: "skin", label: L("Корекція шкіри", "Коррекция кожи", "Skin Correction"), href: R.apparatusSkin },
```

- [ ] In `navConfig.ts` lines 145–156, make longevity header non-clickable by removing its `href`:
```typescript
// FROM:
const longevity: NavCategory = {
  key: "longevity",
  label: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  href: R.services + "/longevity",
  items: [
// TO:
const longevity: NavCategory = {
  key: "longevity",
  label: L("Longevity & Anti-Age", "Longevity & Anti-Age", "Longevity & Anti-Age"),
  href: "",
  items: [
```

- [ ] Also add `noindex: true` to the longevity category in DB so it's not crawled:
```bash
npx tsx -e "
const {neon} = require('@neondatabase/serverless');
require('dotenv').config({path:'.env.local'});
const sql = neon(process.env.DATABASE_URL);
sql\`UPDATE service_categories SET seo_noindex = true WHERE slug = 'longevity'\`.then(() => { console.log('done'); process.exit(0); });
"
```

- [ ] Check MegaMenuHeader renders a `<span>` (not `<a>`) for empty href categories — if not, update that component to handle `href: ""`:
  - File: `src/components/layout/MegaMenuHeader.tsx`
  - The category header should render as non-link when `href` is empty string

- [ ] Commit: `git add src/components/layout/navConfig.ts && git commit -m "fix: longevity non-clickable per structure brief, skin label updated"`

---

## Phase 2 — Apparatus Hubs (face/body/skin cover all device SEO)

### Task 3: Update face hub — comprehensive coverage of 4 devices

**Files:**
- Create: `scripts/seed-face-hub-v3.ts`

The face hub at `/services/apparatus-cosmetology/face` must rank for: EMFACE (emface, emface процедура), Volnewmer (процедура volnewmer, volnewmer показання), Exion (exion, exion face), Ultraformer MPT (ультраформер, смас ліфтинг ультраформер, ультраформер для обличчя, ультраформер показання, ультраформер ціна процедури).

- [ ] Create `scripts/seed-face-hub-v3.ts`:

```typescript
/**
 * Face hub v3: comprehensive content covering EMFACE, Volnewmer, Exion, Ultraformer MPT.
 * Replaces existing sections on the face service under apparatus-cosmetology.
 * Run: npx tsx scripts/seed-face-hub-v3.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => { const [k, ...v] = l.split("="); if (k && v.length) env[k.trim()] = v.join("=").trim(); });
const sql = postgres(env.DATABASE_URL!);

type L = { uk: string; ru: string; en: string };

async function main() {
  // Find the face service record
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'face' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("face service not found"); process.exit(1); }
  const svcId = svc.id;

  // Delete existing sections & FAQs
  await sql`DELETE FROM content_sections WHERE owner_id = ${svcId} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${svcId} AND owner_type = 'service'`;

  // Update SEO fields
  await sql`
    UPDATE services SET
      seo_title_uk = 'Апаратна косметологія для обличчя у Дніпрі — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_title_ru = 'Аппаратная косметология для лица в Днепре — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_title_en = 'Apparatus Cosmetology for Face in Dnipro — EMFACE, Ultraformer MPT, Exion, Volnewmer',
      seo_desc_uk  = 'Апаратне омолодження обличчя в GENEVITY: EMFACE (одночасний ліфтинг + тонізація м''язів), Ultraformer MPT (СМАС-ліфтинг), Exion (RF + AI), Volnewmer (безголковий RF). Дніпро.',
      seo_desc_ru  = 'Аппаратное омоложение лица в GENEVITY: EMFACE, Ultraformer MPT (СМАС-лифтинг), Exion (RF + AI), Volnewmer (безыгольный RF). Днепр.',
      seo_desc_en  = 'Apparatus facial rejuvenation at GENEVITY: EMFACE (simultaneous lifting + muscle toning), Ultraformer MPT (SMAS lifting), Exion (RF + AI), Volnewmer (needle-free RF). Dnipro.',
      seo_keywords_uk = 'emface, emface процедура, ультраформер, смас ліфтинг ультраформер, ультраформер для обличчя, ультраформер ціна процедури, exion face, процедура volnewmer, апаратна косметологія для обличчя',
      seo_keywords_ru = 'emface, ультраформер, смас лифтинг, аппаратная косметология лицо, exion face, volnewmer',
      seo_keywords_en = 'emface, ultraformer mpt, smas lifting, exion face, volnewmer, apparatus facial rejuvenation dnipro'
    WHERE id = ${svcId}
  `;

  const sections: { type: string; sort_order: number; data: object }[] = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратне омолодження обличчя без операцій", ru: "Аппаратное омоложение лица без операций", en: "Non-Surgical Apparatus Facial Rejuvenation" },
        body: { uk: "Апаратна косметологія для обличчя в GENEVITY — це чотири технології світового рівня, які вирішують різні задачі: від безін'єкційного ліфтингу та тонізації м'язів до СМАС-ліфтингу та глибокого RF-відновлення шкіри. Усі апарати сертифіковані FDA та CE, процедури проводять лікарі-косметологи з клінічним досвідом.\n\nКожна процедура безінвазивна: без розрізів, наркозу та тривалого відновлення. Ефект видно або одразу після першого сеансу, або накопичується протягом 2–4 тижнів — залежно від технології.", ru: "Аппаратная косметология для лица в GENEVITY — четыре технологии мирового уровня для различных задач: от безынъекционного лифтинга и тонизации мышц до СМАС-лифтинга и глубокого RF-восстановления кожи. Все аппараты сертифицированы FDA и CE, процедуры проводят врачи-косметологи с клиническим опытом.\n\nКаждая процедура безинвазивна: без разрезов, наркоза и длительного восстановления.", en: "Apparatus cosmetology for the face at GENEVITY means four world-class technologies solving different problems: from needle-free lifting and muscle toning to SMAS lifting and deep RF skin renewal. All devices are FDA and CE certified, procedures are performed by aesthetic physicians with clinical experience.\n\nEvery procedure is non-invasive: no incisions, no anaesthesia, no prolonged recovery." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "EMFACE — безін'єкційний ліфтинг обличчя", ru: "EMFACE — безынъекционный лифтинг лица", en: "EMFACE — Needle-Free Facial Lifting" },
        body: { uk: "EMFACE — революційна процедура від BTL, яка одночасно діє на два шари: радіочастотне (RF) випромінювання ущільнює колаген у шкірі, а HIFES-електростимуляція скорочує та тонізує мімічні м'язи. Результат — підняті вилиці, розкриті очі, чіткий овал без ін'єкцій та хірургії.\n\nКурс: 4 процедури по 20 хвилин з інтервалом 5–7 днів. Ефект зберігається до 12 місяців. EMFACE — єдиний у світі апарат, що одночасно впливає на шкіру і м'язи. У GENEVITY встановлено єдиний апарат EMFACE в Дніпрі.\n\nПоказання до EMFACE: птоз щік та брів, зниження тонусу мімічних м'язів, заломи носогубних складок, бажання уникнути ін'єкцій.\n\nСеанс безболісний: пацієнт відчуває тепло та пульсацію м'язів. Реабілітації немає — можна повертатися до звичного дня.", ru: "EMFACE — революционная процедура от BTL, одновременно воздействующая на два слоя: радиочастотное (RF) излучение уплотняет коллаген в коже, а HIFES-электростимуляция сокращает и тонизирует мимические мышцы. Результат — поднятые скулы, открытые глаза, чёткий овал без инъекций и хирургии.\n\nКурс: 4 процедуры по 20 минут с интервалом 5–7 дней. Эффект сохраняется до 12 месяцев. EMFACE — единственный в мире аппарат, одновременно воздействующий на кожу и мышцы.", en: "EMFACE — a revolutionary BTL device that acts on two layers simultaneously: RF radiation tightens collagen in the skin, while HIFES electrical stimulation contracts and tones facial muscles. Result: lifted cheeks, open eyes, defined jaw — no injections, no surgery.\n\nCourse: 4 sessions of 20 minutes, 5–7 days apart. Effect lasts up to 12 months. EMFACE is the world's only device acting on skin and muscles simultaneously." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "Ultraformer MPT — СМАС-ліфтинг ультразвуком", ru: "Ultraformer MPT — СМАС-лифтинг ультразвуком", en: "Ultraformer MPT — Ultrasound SMAS Lifting" },
        body: { uk: "Ultraformer MPT від CLASSYS — апарат для мікрофокусованого ультразвукового ліфтингу (HIFU/SMAS). Ультразвукові промені нагрівають глибокі шари шкіри (СМАС-шар на глибині 4.5 мм) без пошкодження поверхні. У точці фокусу утворюється мікрокоагуляційна зона: колаген скорочується, обличчя підтягується.\n\nУлтраформер MPT показаний при птозі тканин, нечіткому овалі, «брилях», зморшках у зоні декольте та шиї. Результат — підтяжка овалу обличчя, ліфтинг брів, зменшення другого підборіддя. Ефект продовжується 12–18 місяців, досягаючи максимуму через 2–3 місяці.\n\nПроцедура займає 45–90 хвилин. Більшість пацієнтів повертаються до роботи наступного дня. Рекомендується 1 сеанс на рік для підтримання результату.", ru: "Ultraformer MPT от CLASSYS — аппарат для микрофокусированного ультразвукового лифтинга (HIFU/SMAS). Ультразвуковые лучи нагревают глубокие слои кожи (СМАС-слой на глубине 4,5 мм). В точке фокуса образуется микрокоагуляционная зона: коллаген сокращается, лицо подтягивается.\n\nПоказания: птоз тканей, нечёткий овал, «брыли», морщины в зоне декольте и шеи. Эффект длится 12–18 месяцев.", en: "Ultraformer MPT by CLASSYS — a micro-focused ultrasound lifting device (HIFU/SMAS). Ultrasound beams heat deep skin layers (SMAS layer at 4.5 mm depth). A micro-coagulation zone forms at the focal point: collagen contracts, the face lifts.\n\nIndications: tissue ptosis, blurred jawline, jowls, neck and décolletage wrinkles. Effect lasts 12–18 months, peak at 2–3 months post-treatment." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "Exion — RF + AI для глибокого відновлення шкіри обличчя", ru: "Exion — RF + AI для глубокого восстановления кожи лица", en: "Exion — RF + AI for Deep Facial Skin Renewal" },
        body: { uk: "Exion від BTL поєднує монополярний RF (радіочастотний) вплив з технологією штучного інтелекту, яка в реальному часі регулює щільність та глибину нагріву. Апарат стимулює вироблення гіалуронової кислоти в шкірі — без ін'єкцій гіалуронату.\n\nExion Face ефективний при зниженні тонусу та зневодненні шкіри, дрібних та середніх зморшках, великих порах, нерівній текстурі. Процедура займає 30–45 хвилин, дискомфорт мінімальний. Курс: 4–6 сеансів з інтервалом 1–2 тижні. Результат — щільна, зволожена шкіра зі вираженим сяянням.", ru: "Exion от BTL сочетает монополярный RF с технологией искусственного интеллекта, которая в реальном времени регулирует плотность и глубину нагрева. Аппарат стимулирует выработку гиалуроновой кислоты в коже без инъекций.\n\nExion Face эффективен при снижении тонуса и обезвоживании кожи, мелких и средних морщинах, расширенных порах. Курс: 4–6 сеансов.", en: "Exion by BTL combines monopolar RF with AI technology that regulates heating density and depth in real time. The device stimulates hyaluronic acid production in the skin — without injections.\n\nExion Face is effective for reduced skin tone, dehydration, fine-to-medium wrinkles, enlarged pores. Course: 4–6 sessions, 1–2 weeks apart." },
      },
    },
    {
      type: "richText", sort_order: 5,
      data: {
        heading: { uk: "Volnewmer — безголковий RF-ліфтинг для обличчя", ru: "Volnewmer — безыгольный RF-лифтинг для лица", en: "Volnewmer — Needle-Free RF Lifting for Face" },
        body: { uk: "Volnewmer — апарат для трансдермального (безін'єкційного) введення активних речовин та радіочастотного впливу одночасно. Технологія TRANSION дозволяє доставляти гіалуронову кислоту та пептиди безпосередньо в дерму без голок — через фізичний транспорт по каналах шкіри.\n\nПоказання: зневоднення шкіри, дрібні та середні зморшки, тьмяний тон, перша птоза тканин. Сеанс займає 30–40 хвилин, абсолютно комфортний. Результат видно після першої процедури — шкіра виглядає зволоженою та підтягнутою.", ru: "Volnewmer — аппарат для трансдермального (безынъекционного) введения активных веществ и радиочастотного воздействия одновременно. Технология TRANSION доставляет гиалуроновую кислоту и пептиды непосредственно в дерму без игл.\n\nПоказания: обезвоживание, морщины, тусклый тон. Результат виден после первой процедуры.", en: "Volnewmer delivers active substances (hyaluronic acid, peptides) transdermally and applies RF stimulation simultaneously — no needles. The TRANSION technology drives actives through skin channels into the dermis.\n\nIndications: dehydration, fine wrinkles, dull tone. Visible result after first session — hydrated, toned skin." },
      },
    },
    {
      type: "bullets", sort_order: 6,
      data: {
        heading: { uk: "Як обрати апаратну процедуру для обличчя?", ru: "Как выбрать аппаратную процедуру для лица?", en: "How to Choose the Right Facial Apparatus Procedure?" },
        items: [
          { uk: "Хочете підняти овал та тонізувати м'язи без ін'єкцій → EMFACE", ru: "Хотите поднять овал и тонизировать мышцы без инъекций → EMFACE", en: "Want to lift the oval and tone muscles without injections → EMFACE" },
          { uk: "Виражений птоз тканин, «брилі», друге підборіддя → Ultraformer MPT (СМАС-ліфтинг)", ru: "Выраженный птоз тканей, «брыли», второй подбородок → Ultraformer MPT (СМАС-лифтинг)", en: "Significant tissue ptosis, jowls, double chin → Ultraformer MPT (SMAS lifting)" },
          { uk: "Зневоднена шкіра, пори, текстура — без голок → Exion або Volnewmer", ru: "Обезвоженная кожа, поры, текстура — без игл → Exion или Volnewmer", en: "Dehydrated skin, pores, texture — needle-free → Exion or Volnewmer" },
          { uk: "Оптимальний результат: поєднання EMFACE + Ultraformer MPT + Exion в індивідуальній програмі", ru: "Оптимальный результат: сочетание EMFACE + Ultraformer MPT + Exion в индивидуальной программе", en: "Best result: combining EMFACE + Ultraformer MPT + Exion in an individual programme" },
          { uk: "Лікар підбирає схему після огляду: консультація у GENEVITY безкоштовна", ru: "Врач подбирает схему после осмотра: консультация в GENEVITY бесплатна", en: "The physician selects the protocol after examination: consultation at GENEVITY is free" },
        ],
      },
    },
  ];

  let order = 1;
  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  // FAQs covering all 4 devices
  const faqs = [
    {
      q: { uk: "Скільки тривають результати EMFACE?", ru: "Сколько длятся результаты EMFACE?", en: "How long do EMFACE results last?" },
      a: { uk: "Ефект EMFACE зберігається 6–12 місяців після повного курсу з 4 процедур. Для підтримання рекомендується 1–2 підтримуючих сеанси на рік.", ru: "Эффект EMFACE сохраняется 6–12 месяцев после полного курса из 4 процедур.", en: "EMFACE results last 6–12 months after a full 4-session course. 1–2 maintenance sessions per year are recommended." },
    },
    {
      q: { uk: "Чи болюча процедура Ultraformer MPT?", ru: "Болезненна ли процедура Ultraformer MPT?", en: "Is Ultraformer MPT painful?" },
      a: { uk: "Більшість пацієнтів описують відчуття як помірний дискомфорт або легке поколювання в точках введення ультразвуку. При необхідності лікар наносить знеболювальний крем. Після процедури можлива незначна гіперемія, яка проходить протягом кількох годин.", ru: "Большинство пациентов описывают ощущения как умеренный дискомфорт. При необходимости врач наносит анестезирующий крем.", en: "Most patients describe the sensation as moderate discomfort or mild tingling at ultrasound focus points. Numbing cream is applied if needed. Mild redness may persist for a few hours post-treatment." },
    },
    {
      q: { uk: "Скільки сеансів Exion потрібно для результату?", ru: "Сколько сеансов Exion нужно для результата?", en: "How many Exion sessions are needed?" },
      a: { uk: "Курс Exion Face зазвичай становить 4–6 сеансів з інтервалом 1–2 тижні. Перші видимі зміни — вже після 2–3 процедур: шкіра виглядає більш зволоженою та сяючою. Фінальний результат оцінюється через 4 тижні після останнього сеансу.", ru: "Курс Exion Face — 4–6 сеансов с интервалом 1–2 недели. Первые изменения — после 2–3 процедур.", en: "Exion Face course is typically 4–6 sessions, 1–2 weeks apart. First visible changes after 2–3 sessions. Final result assessed 4 weeks after last session." },
    },
    {
      q: { uk: "Чи можна поєднувати апаратні процедури для обличчя з ін'єкційними?", ru: "Можно ли совмещать аппаратные процедуры с инъекционными?", en: "Can apparatus face procedures be combined with injectables?" },
      a: { uk: "Так, і це часто дає найкращий результат. Наприклад: Ultraformer MPT + біоревіталізація (ліфтинг + зволоження), EMFACE + ботулінотерапія (м'язовий тонус + розгладження зморшок). Лікар GENEVITY складає комплексну програму з урахуванням сумісності та інтервалів між процедурами.", ru: "Да, это часто даёт лучший результат: Ultraformer MPT + биоревитализация, EMFACE + ботулинотерапия. Врач составит индивидуальную программу.", en: "Yes, and often yields the best outcome: Ultraformer MPT + biorevitalisation (lift + hydration), EMFACE + botulinum therapy (muscle tone + wrinkle smoothing). GENEVITY physicians design personalised combined programmes." },
    },
    {
      q: { uk: "Яка процедура дає найшвидший видимий ефект?", ru: "Какая процедура даёт наиболее быстрый видимый эффект?", en: "Which procedure delivers the fastest visible result?" },
      a: { uk: "Volnewmer дає помітне зволоження та сяяння шкіри вже після першого сеансу. EMFACE показує перші ознаки ліфтингу після 2–3 процедур курсу. Ultraformer MPT дає поступовий ефект: підтяжка продовжується 2–3 місяці після процедури.", ru: "Volnewmer даёт заметное увлажнение уже после первого сеанса. EMFACE — признаки лифтинга после 2–3 процедур курса.", en: "Volnewmer delivers visible hydration and radiance after the first session. EMFACE shows initial lift signs after 2–3 course sessions. Ultraformer MPT gives progressive tightening over 2–3 months post-procedure." },
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log(`✓ Face hub updated: ${sections.length} sections, ${faqs.length} FAQs`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Run: `npx tsx scripts/seed-face-hub-v3.ts`
- [ ] Commit: `git add scripts/seed-face-hub-v3.ts && git commit -m "feat: face hub v3 — comprehensive EMFACE/Ultraformer/Exion/Volnewmer SEO coverage"`

---

### Task 4: Update body hub — EMSCULPT NEO, Ultraformer MPT Body, Exion Body

**Files:**
- Create: `scripts/seed-body-hub-v3.ts`

Semantic targets: emsculpt neo (4), ультраформер для тіла (1), exion body (2), апаратна корекція фігури (3).

- [ ] Create `scripts/seed-body-hub-v3.ts`:

```typescript
/**
 * Body hub v3: EMSCULPT NEO + Ultraformer MPT Body + Exion Body coverage.
 * Run: npx tsx scripts/seed-body-hub-v3.ts
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
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'body' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("body service not found"); process.exit(1); }
  const svcId = svc.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${svcId} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${svcId} AND owner_type = 'service'`;

  await sql`
    UPDATE services SET
      seo_title_uk = 'Апаратна корекція тіла у Дніпрі — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_title_ru = 'Аппаратная коррекция тела в Днепре — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_title_en = 'Apparatus Body Correction in Dnipro — EMSCULPT NEO, Ultraformer MPT, Exion Body',
      seo_desc_uk  = 'Апаратна корекція тіла без хірургії: EMSCULPT NEO (накачування м''язів + спалювання жиру), Ultraformer MPT по тілу (ультразвуковий ліфтинг), Exion Body (RF корекція). GENEVITY, Дніпро.',
      seo_desc_ru  = 'Аппаратная коррекция тела: EMSCULPT NEO, Ultraformer MPT по телу, Exion Body. Без хирургии и реабилитации. GENEVITY, Днепр.',
      seo_desc_en  = 'Apparatus body correction without surgery: EMSCULPT NEO, Ultraformer MPT body, Exion Body RF correction. GENEVITY, Dnipro.',
      seo_keywords_uk = 'emsculpt neo, emsculpt ціна, emsculpt процедура, ультраформер тіло, ультраформер по тілу, exion body, апаратна корекція фігури, апаратна косметологія для тіла',
      seo_keywords_ru = 'emsculpt neo, ультраформер тело, exion body, аппаратная коррекция фигуры',
      seo_keywords_en = 'emsculpt neo, ultraformer body, exion body, apparatus body contouring dnipro'
    WHERE id = ${svcId}
  `;

  const sections = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратна корекція тіла в GENEVITY", ru: "Аппаратная коррекция тела в GENEVITY", en: "Apparatus Body Correction at GENEVITY" },
        body: { uk: "Апаратна косметологія для тіла — безопераційна альтернатива ліпосакції та підтяжці. В GENEVITY представлені три технології різного принципу дії, що дозволяє підібрати процедуру під конкретну задачу: від нарощування м'язів і спалювання жиру (EMSCULPT NEO) до ультразвукового ліфтингу шкіри по тілу (Ultraformer MPT) та RF-корекції (Exion Body).\n\nПроцедури не потребують анестезії, розрізів або реабілітації. Більшість пацієнтів повертаються до звичного ритму відразу після сеансу.", ru: "Аппаратная косметология для тела — безоперационная альтернатива липосакции и подтяжке. В GENEVITY три технологии различного принципа действия: EMSCULPT NEO (мышцы + жир), Ultraformer MPT по телу (ультразвуковой лифтинг кожи), Exion Body (RF-коррекция).", en: "Apparatus body cosmetology is the non-surgical alternative to liposuction and body lift surgery. GENEVITY offers three technologies for different goals: EMSCULPT NEO (muscle building + fat reduction), Ultraformer MPT body (ultrasound skin lifting), Exion Body (RF correction)." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "EMSCULPT NEO — накачування м'язів та спалювання жиру одночасно", ru: "EMSCULPT NEO — накачивание мышц и сжигание жира одновременно", en: "EMSCULPT NEO — Muscle Building and Fat Burning Simultaneously" },
        body: { uk: "EMSCULPT NEO від BTL поєднує радіочастотне (RF) нагрівання та HIFES-електромагнітну стимуляцію. За один 30-хвилинний сеанс м'яз виконує 20 000 скорочень — у 100 разів більше, ніж при будь-якому тренуванні. RF паралельно нагріває жирові клітини до температури їх деструкції.\n\nКлінічно доведені результати: +25% до об'єму м'язів, -30% жирової тканини в зоні обробки. EMSCULPT NEO показаний при недостатньому тонусі м'язів живота та сідниць, локальних жирових відкладеннях, діастазі прямих м'язів живота, бажанні поліпшити рельєф без спорту.\n\nКурс: 4 сеанси з інтервалом 5–7 днів. Підходить чоловікам і жінкам. Протипоказань менше, ніж при хірургічних методах.", ru: "EMSCULPT NEO от BTL сочетает RF-нагрев и HIFES-стимуляцию. За 30 минут мышца выполняет 20 000 сокращений. Результаты: +25% мышечного объёма, -30% жировой ткани в зоне обработки.\n\nПоказан при диастазе, слабом тонусе живота и ягодиц, локальных жировых отложениях.", en: "EMSCULPT NEO by BTL combines RF heating and HIFES electromagnetic stimulation. In one 30-minute session, the muscle performs 20,000 contractions. Clinical results: +25% muscle volume, -30% fat tissue in treated area.\n\nIndicated for weak abdominal/gluteal tone, diastasis recti, local fat deposits." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "Ultraformer MPT для тіла — ультразвуковий ліфтинг шкіри", ru: "Ultraformer MPT для тела — ультразвуковой лифтинг кожи", en: "Ultraformer MPT for Body — Ultrasound Skin Lifting" },
        body: { uk: "Ultraformer MPT по тілу застосовується для підтяжки шкіри на животі, стегнах, руках та зоні декольте після схуднення або вагітності. Мікрофокусований ультразвук стимулює колаген на глибині 3–4.5 мм без травмування поверхні.\n\nПоказання: млява шкіра після схуднення, целюліт 1–2 ступеня, птоз шкіри внутрішньої поверхні стегон і плечей, ліфтинг зони декольте. Ефект — поступове підтягування впродовж 2–3 місяців після процедури. Один сеанс дає результат на 12–18 місяців.", ru: "Ultraformer MPT по телу — для подтяжки кожи живота, бёдер, рук после похудения или беременности. Показания: вялая кожа, целлюлит 1–2 степени, птоз кожи внутренней поверхности бёдер и плеч.", en: "Ultraformer MPT for body is used for skin tightening on abdomen, thighs, arms, and décolletage after weight loss or pregnancy. Micro-focused ultrasound stimulates collagen at 3–4.5 mm depth. Effect: gradual tightening over 2–3 months post-procedure, lasting 12–18 months." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "Exion Body — RF-корекція рельєфу та текстури шкіри тіла", ru: "Exion Body — RF-коррекция рельефа и текстуры кожи тела", en: "Exion Body — RF Correction of Body Skin Contour and Texture" },
        body: { uk: "Exion Body від BTL використовує монополярний RF з AI-контролем для нагрівання дерми та гіподерми по всьому тілу. Апарат ефективно вирівнює текстуру шкіри, зменшує прояви целюліту, підвищує пружність у зонах живота, стегон, сідниць та рук.\n\nExion Body підходить для пацієнтів, яким протипоказана хірургія або які шукають регулярну підтримувальну програму для тіла. Курс: 4–8 сеансів залежно від зони та поставленого завдання.", ru: "Exion Body от BTL — монополярный RF с AI-контролем. Эффективно выравнивает текстуру кожи, уменьшает целлюлит, повышает упругость. Курс: 4–8 сеансов.", en: "Exion Body by BTL uses monopolar RF with AI control to heat dermis and hypodermis across the body. Effectively smooths skin texture, reduces cellulite, improves firmness on abdomen, thighs, buttocks, and arms. Course: 4–8 sessions." },
      },
    },
    {
      type: "bullets", sort_order: 5,
      data: {
        heading: { uk: "Підготовка та рекомендації після процедур для тіла", ru: "Подготовка и рекомендации после процедур для тела", en: "Preparation and Post-Treatment Recommendations" },
        items: [
          { uk: "За 2 години до процедури: не їжте важкої їжі (EMSCULPT NEO)", ru: "За 2 часа до процедуры: не ешьте тяжёлой пищи (EMSCULPT NEO)", en: "2 hours before procedure: avoid heavy meals (EMSCULPT NEO)" },
          { uk: "Знімте металеві прикраси та одяг з металевими застібками з зони обробки", ru: "Снимите металлические украшения и одежду с металлическими застёжками", en: "Remove metallic jewellery and clothing with metal fastenings from the treatment area" },
          { uk: "Після EMSCULPT NEO: можлива крепатура м'язів 1–2 доби — це норма", ru: "После EMSCULPT NEO: возможна крепатура мышц 1–2 суток — это норма", en: "After EMSCULPT NEO: muscle soreness for 1–2 days is normal" },
          { uk: "Після Ultraformer MPT: уникайте сауни та інтенсивних фізнавантажень 48 годин", ru: "После Ultraformer MPT: избегайте сауны и интенсивных нагрузок 48 часов", en: "After Ultraformer MPT: avoid sauna and intense exercise for 48 hours" },
          { uk: "Результати накопичуються: кожний наступний сеанс посилює ефект попереднього", ru: "Результаты накапливаются: каждый следующий сеанс усиливает эффект предыдущего", en: "Results are cumulative: each session amplifies the effect of the previous one" },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    { q: { uk: "Скільки процедур EMSCULPT NEO потрібно?", ru: "Сколько процедур EMSCULPT NEO нужно?", en: "How many EMSCULPT NEO sessions are needed?" }, a: { uk: "Стандартний курс — 4 процедури з інтервалом 5–7 днів. Перші результати помітні вже після 2–3 сеансів. Фінальний ефект оцінюється через 1–3 місяці після завершення курсу, коли м'язова тканина повністю адаптується.", ru: "Стандартный курс — 4 процедуры с интервалом 5–7 дней. Результат оценивается через 1–3 месяца после завершения курса.", en: "Standard course: 4 sessions, 5–7 days apart. Final results assessed 1–3 months after the last session, once muscle tissue fully adapts." } },
    { q: { uk: "Чи підходить EMSCULPT NEO чоловікам?", ru: "Подходит ли EMSCULPT NEO мужчинам?", en: "Is EMSCULPT NEO suitable for men?" }, a: { uk: "Так, EMSCULPT NEO популярний серед чоловіків для опрацювання рельєфу живота, сідниць та рук. Чоловічий м'яз відповідає на HIFES-стимуляцію так само ефективно, як жіночий. Протипоказання ідентичні.", ru: "Да, EMSCULPT NEO популярен среди мужчин для проработки рельефа живота, ягодиц и рук. Противопоказания идентичны.", en: "Yes, EMSCULPT NEO is popular among men for abdominal, gluteal, and arm definition. Male muscle responds to HIFES stimulation as effectively as female. Contraindications are identical." } },
    { q: { uk: "Чи є реабілітація після апаратних процедур для тіла?", ru: "Есть ли реабилитация после аппаратных процедур для тела?", en: "Is there recovery time after body apparatus procedures?" }, a: { uk: "Після EMSCULPT NEO реабілітація не потрібна — можна повернутися до роботи одразу. Можлива крепатура 1–2 дні. Після Ultraformer MPT рекомендовано 48 годин уникати сауни та фізнавантажень. Exion Body не вимагає ніяких обмежень після сеансу.", ru: "После EMSCULPT NEO реабилитация не нужна. После Ultraformer MPT — 48 часов без сауны. Exion Body без ограничений.", en: "EMSCULPT NEO requires no downtime — immediate return to daily activities. Ultraformer MPT: 48 hours without sauna/exercise. Exion Body: no restrictions." } },
    { q: { uk: "Які зони можна обробляти апаратами для тіла?", ru: "Какие зоны можно обрабатывать аппаратами для тела?", en: "Which body zones can be treated?" }, a: { uk: "EMSCULPT NEO: живіт, сідниці, стегна, руки (біцепс/трицепс), литки. Ultraformer MPT: живіт, стегна, внутрішня поверхня рук, декольте, шия. Exion Body: будь-які зони тіла, включаючи чутливі ділянки.", ru: "EMSCULPT NEO: живот, ягодицы, бёдра, руки, икры. Ultraformer MPT: живот, бёдра, внутренняя поверхность рук, декольте. Exion Body: любые зоны тела.", en: "EMSCULPT NEO: abdomen, buttocks, thighs, arms (bicep/tricep), calves. Ultraformer MPT: abdomen, thighs, inner arms, décolletage, neck. Exion Body: any body zone including sensitive areas." } },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log("✓ Body hub updated");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Run: `npx tsx scripts/seed-body-hub-v3.ts`
- [ ] Commit: `git add scripts/seed-body-hub-v3.ts && git commit -m "feat: body hub v3 — EMSCULPT NEO/Ultraformer body/Exion Body SEO coverage"`

---

### Task 5: Create skin hub — M22 Stellar Black, Hydrafacial, AcuPulse CO₂

**Files:**
- Create: `scripts/seed-skin-hub.ts`

Targets: m22 stellar black (1), hydrafacial (5), Acupuls co2 (3). The skin hub page `/services/apparatus-cosmetology/skin` currently has placeholder content. This task creates full content.

- [ ] Create `scripts/seed-skin-hub.ts`:

```typescript
/**
 * Skin hub: M22 Stellar Black + Hydrafacial + AcuPulse CO₂ comprehensive content.
 * Also enables it: removes seo_noindex if set, updates nav label in DB.
 * Run: npx tsx scripts/seed-skin-hub.ts
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
  const [svc] = await sql`
    SELECT s.id FROM services s
    JOIN service_categories c ON s.category_id = c.id
    WHERE s.slug = 'skin' AND c.slug = 'apparatus-cosmetology'
  `;
  if (!svc) { console.error("skin service not found — must be created first"); process.exit(1); }
  const svcId = svc.id;

  await sql`DELETE FROM content_sections WHERE owner_id = ${svcId} AND owner_type = 'service'`;
  await sql`DELETE FROM faq_items WHERE owner_id = ${svcId} AND owner_type = 'service'`;

  await sql`
    UPDATE services SET
      title_uk = 'Корекція шкіри', title_ru = 'Коррекция кожи', title_en = 'Skin Correction',
      h1_uk   = 'Корекція шкіри: Hydrafacial, AcuPulse CO₂, M22 Stellar Black у Дніпрі',
      h1_ru   = 'Коррекция кожи: Hydrafacial, AcuPulse CO₂, M22 Stellar Black в Днепре',
      h1_en   = 'Skin Correction: Hydrafacial, AcuPulse CO₂, M22 Stellar Black in Dnipro',
      summary_uk = 'Апаратна корекція шкіри в GENEVITY: Hydrafacial (głęboke oczyszczenie та зволоження), AcuPulse CO₂ (лазерне шліфування), M22 Stellar Black (IPL + Nd:YAG). Пігментація, шрами, постакне, омолодження. Дніпро.',
      summary_ru = 'Аппаратная коррекция кожи в GENEVITY: Hydrafacial, AcuPulse CO₂ (лазерная шлифовка), M22 Stellar Black (IPL). Пигментация, рубцы, постакне, омоложение. Днепр.',
      summary_en = 'Apparatus skin correction at GENEVITY: Hydrafacial (deep cleanse + hydration), AcuPulse CO₂ (laser resurfacing), M22 Stellar Black (IPL + Nd:YAG). Pigmentation, scars, post-acne, rejuvenation. Dnipro.',
      seo_title_uk = 'Корекція шкіри апаратами у Дніпрі — Hydrafacial, AcuPulse CO₂, M22',
      seo_title_ru = 'Коррекция кожи аппаратами в Днепре — Hydrafacial, AcuPulse CO₂, M22',
      seo_title_en = 'Apparatus Skin Correction in Dnipro — Hydrafacial, AcuPulse CO₂, M22',
      seo_desc_uk  = 'Апаратне лікування шкіри в GENEVITY: Hydrafacial — чистка та зволоження, AcuPulse CO₂ — лазерне шліфування постакне та зморшок, M22 Stellar Black — IPL від пігментації та судин. Дніпро.',
      seo_desc_ru  = 'Аппаратное лечение кожи в GENEVITY: Hydrafacial, AcuPulse CO₂ — лазерная шлифовка, M22 Stellar Black — IPL. Днепр.',
      seo_desc_en  = 'Apparatus skin treatment at GENEVITY: Hydrafacial (cleanse & hydrate), AcuPulse CO₂ (laser resurfacing for acne scars & wrinkles), M22 Stellar Black (IPL for pigmentation & vessels). Dnipro.',
      seo_keywords_uk = 'hydrafacial, hydrafacial процедура, hydrafacial ціна, hydrafacial протипоказання, чистка обличчя hydrafacial, co2 лазерна шліфовка, лазерна шліфовка co2, acupulse co2, m22 stellar black, корекція шкіри',
      seo_keywords_ru = 'hydrafacial, co2 лазерная шлифовка, acupulse co2, m22 stellar black, коррекция кожи аппаратная',
      seo_keywords_en = 'hydrafacial dnipro, acupulse co2 laser resurfacing, m22 stellar black ipl, skin correction apparatus dnipro'
    WHERE id = ${svcId}
  `;

  const sections = [
    {
      type: "richText", sort_order: 1,
      data: {
        heading: { uk: "Апаратна корекція шкіри в GENEVITY", ru: "Аппаратная коррекция кожи в GENEVITY", en: "Apparatus Skin Correction at GENEVITY" },
        body: { uk: "Корекція шкіри апаратними методами — це вирішення конкретних дерматологічних і косметологічних задач: лікування постакне та рубців, видалення пігментних плям і судинних зірочок, глибоке очищення та зволоження, омолодження методом лазерного шліфування.\n\nВ GENEVITY для корекції шкіри застосовуються три технології: Hydrafacial (глибоке очищення з одночасним зволоженням), AcuPulse CO₂ (фракційна лазерна шліфовка) та M22 Stellar Black від Lumenis (комбінований IPL + Nd:YAG). Кожен апарат вирішує власне коло задач — лікар підбирає методику після огляду та аналізу стану шкіри.", ru: "Коррекция кожи аппаратными методами — решение конкретных дерматологических и косметологических задач: лечение постакне и рубцов, удаление пигментных пятен и сосудистых звёздочек, глубокое очищение и увлажнение, омоложение лазерной шлифовкой.\n\nВ GENEVITY — три технологии: Hydrafacial, AcuPulse CO₂ и M22 Stellar Black.", en: "Apparatus skin correction solves specific dermatological and cosmetic problems: treating post-acne and scars, removing pigmentation spots and vascular stars, deep cleansing and hydration, and rejuvenation via laser resurfacing.\n\nAt GENEVITY: Hydrafacial, AcuPulse CO₂, and M22 Stellar Black by Lumenis." },
      },
    },
    {
      type: "richText", sort_order: 2,
      data: {
        heading: { uk: "Hydrafacial — глибоке очищення та зволоження шкіри", ru: "Hydrafacial — глубокое очищение и увлажнение кожи", en: "Hydrafacial — Deep Cleansing and Skin Hydration" },
        body: { uk: "Hydrafacial — нетравматична процедура, яка за один сеанс виконує 6 дій: очищення, ексфоліацію, безболісне видалення комедонів, зволоження, насичення антиоксидантами та захист шкіри. Апарат використовує унікальну вихрову технологію Vortex-Fusion для одночасного відсмоктування забруднень і доставки активних сироваток.\n\nПоказання до Hydrafacial: всі типи шкіри, включаючи чутливу та схильну до акне. Збільшені пори, тьмяний тон, зневоднення, поверхневі пігментні плями, постакне, дрібні зморшки. Протипоказання: активні запалення на шкірі, герпес у стадії загострення.\n\nТривалість сеансу: 30–60 хвилин. Результат видно одразу — шкіра виглядає свіжою, зволоженою, сяючою. Рекомендується курс 4–6 процедур з інтервалом 2–4 тижні, потім підтримуюча процедура раз на місяць.", ru: "Hydrafacial — нетравматическая процедура: очищение, эксфолиация, удаление комедонов, увлажнение, антиоксидантная защита — за один сеанс.\n\nПоказания: все типы кожи, включая чувствительную. Поры, тусклый тон, обезвоживание, постакне. Длительность: 30–60 минут. Результат виден сразу.", en: "Hydrafacial is a non-traumatic procedure performing 6 actions in one session: cleansing, exfoliation, painless comedone extraction, hydration, antioxidant infusion, and skin protection. Uses Vortex-Fusion technology.\n\nIndications: all skin types including sensitive. Enlarged pores, dull tone, dehydration, post-acne, fine wrinkles. Duration: 30–60 min. Result visible immediately." },
      },
    },
    {
      type: "richText", sort_order: 3,
      data: {
        heading: { uk: "AcuPulse CO₂ — лазерне шліфування обличчя", ru: "AcuPulse CO₂ — лазерная шлифовка лица", en: "AcuPulse CO₂ — Facial Laser Resurfacing" },
        body: { uk: "AcuPulse CO₂ від Lumenis — золотий стандарт фракційного лазерного шліфування. Вуглекислотний лазер (10 600 нм) випаровує мікростовпці тканини, запускаючи активну регенерацію: зникають поглиблені постакне-рубці, зморшки та нерівності, шкіра стає рівнішою та пружнішою.\n\nПоказання до CO₂ лазерного шліфування: рубці та постакне, зморшки (дрібні та середні), нерівна текстура, пігментація, фотостаріння, збільшені пори.\n\nПроцедура проводиться під місцевою анестезією. Реабілітація: 5–10 днів (гіперемія, лущення, відчуття стягнутості). Результат стабільний і зберігається 2–5 років. Оптимально: 1–3 процедури залежно від глибини проблеми.", ru: "AcuPulse CO₂ от Lumenis — золотой стандарт фракционной лазерной шлифовки. CO₂ лазер (10 600 нм) запускает активную регенерацию: исчезают постакне-рубцы, морщины, неровности.\n\nПоказания: рубцы, постакне, морщины, пигментация. Реабилитация: 5–10 дней.", en: "AcuPulse CO₂ by Lumenis is the gold standard for fractional laser resurfacing. The CO₂ laser (10,600 nm) ablates micro-columns of tissue, triggering active regeneration: deep post-acne scars, wrinkles, and uneven texture disappear.\n\nIndications: scars, post-acne, wrinkles, pigmentation, photoaging. Rehabilitation: 5–10 days. Results stable for 2–5 years." },
      },
    },
    {
      type: "richText", sort_order: 4,
      data: {
        heading: { uk: "M22 Stellar Black — IPL та Nd:YAG для комплексної корекції шкіри", ru: "M22 Stellar Black — IPL и Nd:YAG для комплексной коррекции кожи", en: "M22 Stellar Black — IPL and Nd:YAG for Comprehensive Skin Correction" },
        body: { uk: "M22 Stellar Black від Lumenis — передовий апарат, що поєднує IPL (інтенсивне імпульсне світло) та Nd:YAG лазер у одній системі. IPL ефективно видаляє пігментні плями (веснянки, хлоазма, сонячне лентиго), дифузне почервоніння та судинні зірочки. Nd:YAG використовується для лікування глибших судинних уражень та пігментації.\n\nКому підходить M22 Stellar Black: пацієнтам із пігментними плямами різного походження, судинними зірочками та куперозом, ознаками фотостаріння (нерівний тон, дифузна пігментація), акне та постакне у стадії ремісії.\n\nСеанс займає 20–45 хвилин. Реабілітація мінімальна: легке почервоніння 24–48 годин. Курс: 3–5 процедур з інтервалом 3–4 тижні.", ru: "M22 Stellar Black от Lumenis сочетает IPL и Nd:YAG лазер. IPL удаляет пигментные пятна, купероз, сосудистые звёздочки. Nd:YAG — для глубоких сосудистых поражений.\n\nКому подходит: пигментация, купероз, фотостарение. Сеанс: 20–45 минут.", en: "M22 Stellar Black by Lumenis combines IPL and Nd:YAG laser. IPL effectively removes pigmentation spots (freckles, chloasma, solar lentigo), diffuse redness, and vascular stars. Nd:YAG treats deeper vascular lesions.\n\nSuitable for: pigmentation of various origins, spider veins, rosacea, photoaging. Session: 20–45 min. Course: 3–5 sessions, 3–4 weeks apart." },
      },
    },
    {
      type: "steps", sort_order: 5,
      data: {
        heading: { uk: "Як проходить лікування шкіри в GENEVITY", ru: "Как проходит лечение кожи в GENEVITY", en: "How Skin Treatment Works at GENEVITY" },
        steps: [
          { title: { uk: "Консультація та діагностика", ru: "Консультация и диагностика", en: "Consultation and Diagnostics" }, description: { uk: "Лікар оцінює стан шкіри, визначає тип проблеми та підбирає оптимальний апарат або комбінацію процедур.", ru: "Врач оценивает состояние кожи и подбирает оптимальную процедуру.", en: "The physician assesses skin condition and selects the optimal device or combination of procedures." } },
          { title: { uk: "Підготовка шкіри", ru: "Подготовка кожи", en: "Skin Preparation" }, description: { uk: "Очищення зони обробки. При лазерних процедурах — нанесення анестезуючого крему за 30–40 хвилин до початку.", ru: "Очищение зоны. При лазерных процедурах — нанесение анестезирующего крема за 30–40 минут.", en: "Cleansing the treatment area. For laser procedures: numbing cream applied 30–40 minutes before." } },
          { title: { uk: "Процедура", ru: "Процедура", en: "Procedure" }, description: { uk: "Лікар проводить сеанс за затвердженим протоколом. Тривалість 20–60 хвилин залежно від апарату та зони.", ru: "Врач проводит сеанс по протоколу. Длительность 20–60 минут.", en: "The physician performs the session per protocol. Duration 20–60 minutes depending on device and zone." } },
          { title: { uk: "Догляд після процедури", ru: "Уход после процедуры", en: "Post-Procedure Care" }, description: { uk: "Лікар видає індивідуальні рекомендації щодо догляду, фотозахисту та обмежень. Після більшості процедур спеціального догляду не потрібно.", ru: "Врач выдаёт индивидуальные рекомендации. После большинства процедур специального ухода не нужно.", en: "The physician provides individual care recommendations. After most procedures, no special post-care is required." } },
        ],
      },
    },
  ];

  for (const s of sections) {
    await sql`
      INSERT INTO content_sections (id, owner_id, owner_type, section_type, sort_order, data)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${s.type}, ${s.sort_order}, ${sql.json(s.data)})
    `;
  }

  const faqs = [
    { q: { uk: "Скільки триває процедура Hydrafacial?", ru: "Сколько длится процедура Hydrafacial?", en: "How long does a Hydrafacial take?" }, a: { uk: "Стандартна процедура Hydrafacial займає 30–45 хвилин. Розширений сеанс з додатковими бустерами (LED-терапія, пептидна сироватка) — до 60 хвилин.", ru: "Стандартная процедура Hydrafacial — 30–45 минут. Расширенный сеанс с дополнительными бустерами — до 60 минут.", en: "Standard Hydrafacial takes 30–45 minutes. Extended session with additional boosters (LED, peptide serum) — up to 60 minutes." } },
    { q: { uk: "Чи можна робити Hydrafacial влітку?", ru: "Можно ли делать Hydrafacial летом?", en: "Can Hydrafacial be done in summer?" }, a: { uk: "Так, Hydrafacial безпечна у будь-яку пору року, включаючи літо. Процедура не підвищує фоточутливість шкіри, що відрізняє її від хімічних пілінгів та лазерних методик. Рекомендується використовувати SPF 30+ після сеансу.", ru: "Да, Hydrafacial безопасна в любое время года, в том числе летом. Процедура не повышает фоточувствительность кожи. Рекомендуется использовать SPF 30+ после сеанса.", en: "Yes, Hydrafacial is safe year-round, including summer. Unlike chemical peels or laser treatments, it does not increase skin photosensitivity. SPF 30+ is recommended post-session." } },
    { q: { uk: "Скільки процедур AcuPulse CO₂ потрібно для результату?", ru: "Сколько процедур AcuPulse CO₂ нужно для результата?", en: "How many AcuPulse CO₂ sessions are needed?" }, a: { uk: "Кількість процедур залежить від глибини проблеми: поверхневі зміни (дрібні зморшки, пігментація) — 1–2 сеанси. Рубці та постакне середньої глибини — 2–3 сеанси з інтервалом 2–3 місяці. Глибокі рубці — до 3–4 процедур. Лікар визначає кількість після первинного огляду.", ru: "Поверхностные изменения — 1–2 сеанса. Рубцы и постакне средней глубины — 2–3 сеанса. Врач определяет количество после осмотра.", en: "Superficial changes (fine wrinkles, pigmentation): 1–2 sessions. Medium-depth scars/post-acne: 2–3 sessions, 2–3 months apart. Deep scars: up to 3–4. The physician determines the number after initial assessment." } },
    { q: { uk: "Що таке M22 Stellar Black і чим він відрізняється від звичайного IPL?", ru: "Что такое M22 Stellar Black и чем он отличается от обычного IPL?", en: "What is M22 Stellar Black and how does it differ from regular IPL?" }, a: { uk: "M22 Stellar Black — багатомодульна платформа від Lumenis, яка поєднує вдосконалений IPL з набором фільтрів OPT (Optimal Pulse Technology) та Nd:YAG лазер. Порівняно зі стандартним IPL, M22 Stellar Black забезпечує більш однорідний та контрольований імпульс, що знижує ризик побічних ефектів та дає передбачуваний результат.", ru: "M22 Stellar Black от Lumenis сочетает улучшенный IPL с OPT-фильтрами и Nd:YAG лазер. По сравнению со стандартным IPL — более однородный импульс, меньше побочных эффектов.", en: "M22 Stellar Black by Lumenis combines advanced IPL with OPT (Optimal Pulse Technology) filters and Nd:YAG laser. Compared to standard IPL, it delivers a more uniform, controlled pulse — reducing side effects and providing predictable results." } },
    { q: { uk: "Який реабілітаційний період після CO₂ лазерного шліфування?", ru: "Какой реабилитационный период после CO₂ лазерной шлифовки?", en: "What is the recovery period after CO₂ laser resurfacing?" }, a: { uk: "Після AcuPulse CO₂ реабілітація займає 5–10 днів: перші 3 дні — гіперемія та набряк, дні 3–7 — активне лущення шкіри, до 10 дня — повне загоєння. Протягом місяця рекомендується уникати сонця та використовувати SPF 50+. Декоративну косметику можна наносити після загоєння.", ru: "После AcuPulse CO₂ — 5–10 дней: 3 дня гиперемия и отёк, 3–7 дни активное шелушение, к 10 дню — полное заживление. SPF 50+ в течение месяца.", en: "AcuPulse CO₂ recovery: 5–10 days. Days 1–3: redness and swelling. Days 3–7: active skin peeling. By day 10: complete healing. SPF 50+ for 1 month post-procedure. Makeup can be applied after healing." } },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await sql`
      INSERT INTO faq_items (id, owner_id, owner_type, question_uk, question_ru, question_en, answer_uk, answer_ru, answer_en, sort_order)
      VALUES (${randomUUID()}, ${svcId}, 'service', ${faqs[i].q.uk}, ${faqs[i].q.ru}, ${faqs[i].q.en}, ${faqs[i].a.uk}, ${faqs[i].a.ru}, ${faqs[i].a.en}, ${i + 1})
    `;
  }

  console.log("✓ Skin hub created with full content");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] Run: `npx tsx scripts/seed-skin-hub.ts`
- [ ] Commit: `git add scripts/seed-skin-hub.ts && git commit -m "feat: skin hub — Hydrafacial/AcuPulse CO₂/M22 full content"`

---

## Phase 3 — Missing Service Category Pages

### Task 6: Create 4 missing service categories

**Files:**
- Create: `scripts/seed-missing-categories.ts`

Creates: `skincare` (TZ #41 Доглядові процедури), `podology` (TZ #42), `diagnostics` (structure brief), `plastic-surgery` (structure brief + 6 semantic keywords).

- [ ] Create `scripts/seed-missing-categories.ts` — see full content in execution. Key data:

**skincare** — slug: `skincare`, TZ keywords: процедури догляду за обличчям, процедури догляду, процедури догляду у косметолога. Sections: what are skincare procedures, types (пілінги, маски, апаратні методики), indications/contraindications, how to choose, FAQ (чутлива шкіра, how often, combo, first result, age limits).

**podology** — slug: `podology`, TZ keywords: подолог, послуги подолога, прайс на послуги подолога. Sections: who is a podologist, services, indications, visit process, pricing, FAQ (які проблеми вирішує, preparation, duration, pain, frequency).

**diagnostics** — slug: `diagnostics`, structure brief keyword group: аналізи (5 keywords: здати аналізи, де здати аналізи, приватні лабораторії у Дніпрі, лабораторія для здачі аналізів). Sections: diagnostic services overview, ultrasound, lab tests, preparation.

**plastic-surgery** — slug: `plastic-surgery`, UA semantics: пластична хірургія (6 keywords). Sections: plastic surgery at GENEVITY, consultation, types of procedures, indications, FAQ.

- [ ] Run: `npx tsx scripts/seed-missing-categories.ts`
- [ ] Verify all 4 category pages return 200 at their URLs
- [ ] Commit

---

## Phase 4 — Content Gap Fixes

### Task 7: Update apparatus-cosmetology hub + laser hub + lab + nutraceuticals + intimate + check-up

**Files:**
- Create: `scripts/seed-content-gaps.ts`

Covers 6 content issues in one script:

1. **Apparatus-cosmetology hub** — add "Як обрати клініку для апаратної косметології?" section (TZ #13)
2. **Laser-hair-removal hub** — add prep, aftercare, side-effects sections (TZ #31)
3. **Laboratory static page** — add equipment/staff/speed/preparation sections (TZ #40)
4. **Nutraceuticals service** — full rewrite: vitamins/minerals, probiotics/prebiotics, omega-3, usage rules, risks (TZ #38)
5. **Check-up-40 service** — add age variant content (41–46) and general screening paragraph
6. **Intimate rejuvenation category** — add intimate peeling and contour sub-topics section (TZ #27)

---

## Phase 5 — Verification

### Task 8: Post-execution verification

- [ ] Check sitemap includes all new category pages: `curl https://genevity.vercel.app/sitemap.xml | grep -E "skincare|podology|diagnostics|plastic|skin"`
- [ ] Check no title duplication: `curl -s https://genevity.vercel.app | grep -i "<title>" | grep -i "genevity.*genevity"`
- [ ] Check longevity category page returns noindex: `curl -s https://genevity.vercel.app/services/longevity | grep "noindex"`
- [ ] Spot-check 5 service page titles for GENEVITY duplication
- [ ] Commit all remaining changes

---

## Semantic coverage checklist (final state after all tasks)

| Semantic group | URL | Status after plan |
|---|---|---|
| emface | `/services/apparatus-cosmetology/face` (section) | ✅ |
| volnewmer | same | ✅ |
| exion | same | ✅ |
| Ultraformer mpt (8 keywords) | same | ✅ |
| emsculpt neo | `/services/apparatus-cosmetology/body` (section) | ✅ |
| ультраформер для тіла | same | ✅ |
| exion body | same | ✅ |
| hydrafacial | `/services/apparatus-cosmetology/skin` (section) | ✅ |
| Acupuls co2 | same | ✅ |
| m22 stellar black | same | ✅ |
| доглядові процедури | `/services/skincare` | ✅ |
| подолог | `/services/podology` | ✅ |
| пластична хірургія | `/services/plastic-surgery` | ✅ |
| аналізи / лабораторія | `/laboratory` (expanded) | ✅ |
| нутриціолог / нутрицевтика | `/services/longevity/nutraceuticals` (rewritten) | ✅ |
| check up 40–46 | `/services/longevity/check-up-40` (expanded) | ✅ |
| All injectable (10) | existing pages | ✅ already |
| Longevity sub-pages (5) | existing pages | ✅ already |
| лазерна епіляція (3 pages) | existing + expanded hub | ✅ |
