# GENEVITY v2 — Full Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **For humans / Roman:** This is the master reference doc. It captures every page brief from `technical_task/`, the full IA, schema design, copywriting constitution, and the page-by-page execution cadence. Read once, then jump to specific sections (each page has a stable anchor: `#page-NN-slug`).

**Goal:** Expand the current Ukrainian-language landing into the definitive 43-page longevity & aesthetic-medicine site for Ukraine, ranked top-1 for the keyword clusters in `technical_task/Семантичне ядро.xlsx`.

**Architecture:** Next.js 16 App Router on Vercel, content fully driven by Sanity (single shared `production` dataset across `main` and `develop`). Three reusable page templates (category hub / service detail / static page) render every public page from Sanity documents. Cache Components (`use cache` + Sanity webhook revalidation) keep pages fully static-fast while letting the client publish edits in real time. Trilingual UA/RU/EN with `next-intl` routing and locale-keyed Sanity fields.

**Tech Stack:**
- Next.js 16 (App Router, Cache Components, Turbopack)
- TypeScript strict
- Tailwind CSS v4 (CSS-first config in `globals.css`)
- Framer Motion (animation presets in `src/lib/motion`)
- next-intl (locales: `ua` / `ru` / `en`; default `ua`; `localePrefix: "as-needed"`)
- Sanity v3 (locale fields use keys `uk` / `ru` / `en`; mapping in `src/sanity/queries.ts:lang()`)
- Fonts: Cormorant Garamond (headings), Montserrat (body) via `next/font/google`
- Hosting: Vercel Fluid Compute, production = `main`, preview = `develop`

---

## 0. How this document works

- **Section 11 (per-page specs)** is the durable reference for every page brief. When working on a page, jump there and use only that section — do not re-open the `.docx` files.
- **Section 14 (Phase tasks)** drives execution. Tasks are TDD-style and bite-sized (2–5 min steps).
- **Page-by-page cadence** (Section 16): one page at a time, in the priority order in Section 19. After each page, stop, present, wait for go/no-go from Roman before moving to the next.
- **Decisions** in Section 4 are locked. Re-read them before suggesting alternatives.
- **Open questions** in Section 18 are placeholders Roman is collecting from the client. Don't guess values — render `«за консультацією»` / `«уточнюється»` placeholders until answered.

---

## 1. Project north star

**Audience:** Adults (28–65), women predominantly, in Дніпро and the wider Ukrainian aesthetic-medicine / longevity market. Two clusters:
1. **Aesthetic seekers** — booking a specific procedure (Botox, fillers, mesotherapy, laser hair removal, Hydrafacial). Local intent. Compare price + clinic reputation.
2. **Longevity seekers** — health-spans, hormones, IV therapy, Check-Up 40+. National intent, higher LTV, longer consideration funnel.

**Brand tone:** Premium, calm, expert. Not fluffy "spa". Not cold "hospital". Sells via authority + warmth + clear evidence (procedure science + named doctors + equipment list + transparent pricing model).

**Success metrics (year-1):**
- 30+ "Дніпро + procedure" queries on page 1 of Google
- 10+ national longevity queries on page 1 (Check-Up 40, IV терапія, гормональний баланс)
- LCP < 1.5 s on 75th percentile mobile
- ≥ 5 % CTR from search → on-page CTA → form submit
- Sitemap fully indexed within 4 weeks of v2 launch

---

## 2. Constraints

- **`main` is locked.** All work on `develop`. GitHub branch protection enforces this. See `CLAUDE.md` and `feedback_branch_policy` memory.
- **Single Sanity dataset (`production`).** Both branches read it. Adding fields is safe; never rename existing fields without a Sanity migration.
- **Trilingual quality bar:** UA/RU/EN must be parallel and equally polished. No machine-translated artifacts. Per Roman's instruction: "they should be perfect copies and ideal grammar".
- **No client-side fetches for content.** All pages render content server-side from Sanity via Cache Components.
- **No invented facts.** Doctors, equipment, prices, hours — only what Sanity contains. Placeholder copy where data is pending.

---

## 3. Tech-stack notes worth pinning

- **Locale code mapping:** App routes use `ua` (per `src/i18n/routing.ts`); Sanity locale fields use `uk`. Always go through `lang()` in `src/sanity/queries.ts`.
- **i18n strategy decision:** All long-form content lives in Sanity (locale-keyed). Static UI strings (button labels, error states) currently live in `src/messages/{ua,ru,en}.json` — keep that for short UI strings, but every new long page is Sanity-only. Do NOT add new message keys for service-page copy.
- **Animation:** Use existing `fadeInUp` / `staggerContainer` / `viewportConfig` presets from `@/lib/motion`. Keep new animations consistent (small, calm, premium).
- **Existing schemas:** `equipment`, `doctor`, `faq`, `hero`, `about`, `siteSettings`, `legalDoc`, `localeString`, `localeText`, `localeStringArray`, `uiStrings` (queried in `queries.ts` but not yet exported in `schemas/index.ts` — verify before relying on it).
- **Studio:** Hosted at `admin.genevity.com.ua` via subdomain rewrite (`(studio)/studio/[[...tool]]`).

---

## 4. Decisions log (locked 2026-04-15)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Copy:** Claude drafts UA + RU + EN copy per page, Roman polishes in Sanity Studio. Voice: professional copywriter + SEO expert combined — sells while ranking. | Roman's req #1. AI-first lets us move at one-page-per-session pace; human review preserves voice. |
| D2 | **Design:** Visual language extends current landing (taupe/champagne/rosegold, Cormorant + Montserrat) but each page can experiment with richer compositions. Page-by-page cadence; Roman approves each before next. | Roman's req #2. Reduces blast radius of misjudged direction. |
| D3 | **Booking:** Form → CRM/Telegram fallback. No third-party booking system yet. Use existing CTA modal pattern. | Roman's req #3. Real booking integration deferred to Phase 3. |
| D4 | **Locales:** UA + RU + EN drafted in parallel for every page. No "ship UA first, translate later." Quality-equal across locales. | Roman's req #4. Avoids the trap of EN/RU pages decaying behind UA. |
| D5 | **Pricing:** Placeholders (`«за консультацією»` / `«від ___ грн»` with empty value) until client returns the price list. | Roman's req #5. |
| D6 | **URLs:** Latin, English-semantic slugs, shared across all locales (e.g., `/services/injectable-cosmetology/botulinum-therapy` under every `/{locale}` prefix). Category paths also English. | Client brief: "Latin, readable, consistent logic." Single slug per page = simpler authoring + consistent brand. |

---

## 5. Site information architecture

### 5.1 Top-level navigation (per `Рекомендації щодо формування структури.docx`)

```
Про центр  |  Ціни  |  Послуги ▼  |  Стаціонар  |  Лабораторія  |  Лікарі  |  Контакти
                       │
                       ├── Ін'єкційна косметологія ▼     (clickable hub + dropdown)
                       │     ├── Ботулінотерапія
                       │     ├── Контурна пластика
                       │     ├── Біоревіталізація
                       │     ├── Мезотерапія
                       │     ├── PRP-терапія
                       │     ├── Екзосоми
                       │     └── Терапія стовбуровими клітинами
                       │
                       ├── Апаратна косметологія ▼
                       │     ├── Апаратна косметологія для обличчя
                       │     ├── Апаратна косметологія для тіла
                       │     └── Шкіра (заглушка / "soon" page)
                       │
                       ├── Інтимне відновлення ▼
                       │     ├── Монополярний RF-ліфтинг
                       │     └── Інтимне омолодження AcuPulse CO₂
                       │
                       ├── Лазерна епіляція ▼
                       │     ├── Чоловіча лазерна епіляція
                       │     └── Жіноча лазерна епіляція
                       │
                       ├── Longevity & Anti-Age ▼   (NON-clickable parent)
                       │     ├── Check-Up 40+
                       │     ├── Longevity програма
                       │     ├── Гормональний баланс
                       │     ├── IV-терапія
                       │     └── Нутрицевтика
                       │
                       ├── Доглядові процедури
                       ├── Подологія
                       ├── Діагностичні послуги
                       └── Пластична хірургія
```

Reference for menu UX style: `https://www.sentamed.in.ua/`. "Soon" page (skin sub-section) uses pattern from `https://laserhealth.com.ua/`.

### 5.2 Complete route map (FINAL)

All routes prefixed with `/{locale}` (locale = `ua` default — no prefix — / `ru` / `en`). One slug per page shared across locales.

| # | Route | Page type | Source spec |
|---|---|---|---|
| 1 | `/` | Home | §11.01 |
| 2 | `/about` | Static (About) | (client brief pending) |
| 3 | `/prices` | Pricing index | (waiting on price list) |
| 4 | `/services` | Services index hub | derived |
| 5 | `/services/injectable-cosmetology` | Category hub: Ін'єкційна | §11.02 |
| 6 | `/services/injectable-cosmetology/botulinum-therapy` | Service | §11.03 |
| 7 | `/services/injectable-cosmetology/contour-plasty` | Service | §11.04 |
| 8 | `/services/injectable-cosmetology/biorevitalisation` | Service | §11.05 |
| 9 | `/services/injectable-cosmetology/mesotherapy` | Service | §11.06 |
| 10 | `/services/injectable-cosmetology/prp-therapy` | Service | §11.07 |
| 11 | `/services/injectable-cosmetology/exosomes` | Service | §11.08 |
| 12 | `/services/injectable-cosmetology/stem-cell-therapy` | Service | §11.09 |
| 13 | `/services/injectable-cosmetology/rejuran` | Service | §11.10 |
| 14 | `/services/injectable-cosmetology/juvederm` | Service | §11.11 |
| 15 | `/services/injectable-cosmetology/polyphil` | Service | §11.12 |
| 16 | `/services/apparatus-cosmetology` | Category hub | §11.13 |
| 17 | `/services/apparatus-cosmetology/face` | Sub-hub | §11.14 |
| 18 | `/services/apparatus-cosmetology/face/emface` | Service | §11.15 |
| 19 | `/services/apparatus-cosmetology/face/volnewmer` | Service | §11.16 |
| 20 | `/services/apparatus-cosmetology/face/exion` | Service | §11.17 |
| 21 | `/services/apparatus-cosmetology/face/ultraformer-mpt` | Service | §11.18 |
| 22 | `/services/apparatus-cosmetology/body` | Sub-hub | §11.19 |
| 23 | `/services/apparatus-cosmetology/body/emsculpt-neo` | Service | §11.20 |
| 24 | `/services/apparatus-cosmetology/body/ultraformer-mpt-body` | Service | §11.21 |
| 25 | `/services/apparatus-cosmetology/body/exion-body` | Service | §11.22 |
| 26 | `/services/apparatus-cosmetology/m22-stellar-black` | Service | §11.23 |
| 27 | `/services/apparatus-cosmetology/splendor-x` | Service | §11.24 |
| 28 | `/services/apparatus-cosmetology/hydrafacial` | Service | §11.25 |
| 29 | `/services/apparatus-cosmetology/acupulse-co2` | Service | §11.26 |
| 30 | `/services/apparatus-cosmetology/intimate-zone` | Sub-hub | §11.27 |
| 31 | `/services/intimate-rejuvenation/monopolar-rf-lifting` | Service | §11.28 |
| 32 | `/services/intimate-rejuvenation/acupulse-co2-intimate` | Service | §11.30 |
| 33 | `/services/laser-hair-removal` | Category hub | §11.31 |
| 34 | `/services/laser-hair-removal/men` | Service | §11.32 |
| 35 | `/services/laser-hair-removal/women` | Service | §11.33 |
| 36 | `/services/longevity/check-up-40` | Service | §11.34 |
| 37 | `/services/longevity/longevity-program` | Service | §11.35 |
| 38 | `/services/longevity/hormonal-balance` | Service | §11.36 |
| 39 | `/services/longevity/iv-therapy` | Service | §11.37 |
| 40 | `/services/longevity/nutraceuticals` | Service | §11.38 |
| 41 | `/stationary` | Static | §11.39 |
| 42 | `/laboratory` | Static | §11.40 |
| 43 | `/services/skincare` | Service | §11.41 |
| 44 | `/services/podology` | Service | §11.42 |
| 45 | `/services/plastic-surgery` | Service | §11.43 |
| 46 | `/doctors` | Doctors index | (existing data) |
| 47 | `/doctors/[slug]` | Doctor profile | (Phase 3) |
| 48 | `/contacts` | Static (Contacts) | (use existing siteSettings) |
| 49 | `/blog` and `/blog/[slug]` | Blog (Phase 3) | — |

> Per-page §11.NN route values in Section 11 reference these final routes; this table is the authority.

### 5.3 Slug policy (FINAL — approved 2026-04-15)

- **Latin, English-semantic, single slug per page, shared across all 3 locales.**
- Route = `/{locale}/{category}/{service}` with locale prefix handled by `next-intl` (`ua` default no prefix).
- Category path segments stay English: `services`, `doctors`, `about`, `prices`, `contacts`, `stationary`, `laboratory`.
- Service slugs:
  - Generic procedures → English term: `botulinum-therapy`, `contour-plasty`, `biorevitalisation`, `mesotherapy`, `prp-therapy`, `exosomes`, `stem-cell-therapy`, `mesotherapy`, `hydrafacial`, `laser-hair-removal`, `check-up-40`, `iv-therapy`, `hormonal-balance`, `nutraceuticals`, `skincare`, `podology`, `plastic-surgery`.
  - Brand-name products → kept as-is lower-kebab: `rejuran`, `juvederm`, `polyphil`, `emface`, `volnewmer`, `exion`, `exion-body`, `ultraformer-mpt`, `ultraformer-mpt-body`, `emsculpt-neo`, `splendor-x`, `m22-stellar-black`, `acupulse-co2`, `acupulse-co2-intimate`, `monopolar-rf-lifting`.
- Stored as a single `slug.current` string on each Sanity document (not locale-keyed). Title/body fields remain locale-keyed (UA/RU/EN).

---

## 6. Sanity schema design

### 6.1 New document types

#### `serviceCategory`
Top-level grouping for the mega-menu (Ін'єкційна, Апаратна, Інтимне, Лазерна, Longevity).
- `title: localeString` (required)
- `slug: { current: string }` per locale via `localeString`-shaped slug helper (or 3 slug fields)
- `summary: localeText` — used on `/poslugy` index card
- `heroImage: image` — used on category hub page
- `parent: reference → serviceCategory` (nullable, for sub-categories like Апаратна → Обличчя)
- `order: number`
- `clickable: boolean` — false for "Longevity & Anti-Age" parent
- `iconKey: string` — references a key in our local icon registry
- `seo: object { title: localeString, description: localeText, ogImage: image }`

#### `service`
The 28 service detail pages.
- `title: localeString` (e.g. "Ботулінотерапія")
- `h1: localeString` — distinct from menu title where useful
- `slug: localeString-slug` (3 slugs, one per locale)
- `category: reference → serviceCategory`
- `summary: localeText` — short hook (1-2 sentences) for cards & meta description seed
- `heroImage: image`
- `procedureLength: localeString` (e.g. "30 хв")
- `effectDuration: localeString` (e.g. "до 6 місяців")
- `sessionsRecommended: localeString` (e.g. "3-5 сеансів")
- `priceFrom: localeString` (placeholder until client confirms; e.g. "за консультацією")
- `priceUnit: localeString` (e.g. "за процедуру", "за зону")
- `sections: array<contentSection>` — see 6.2
- `faq: array<faqItem>` — inline question/answer per locale
- `relatedDoctors: array<reference → doctor>` (filled later)
- `relatedServices: array<reference → service>` (auto-suggested + manual override)
- `relatedEquipment: array<reference → equipment>` (where applicable, e.g. EMFACE → equipment.emface)
- `keywords: object { primary: localeStringArray, secondary: localeStringArray }` — for SEO ops dashboards
- `seo: object { title: localeString, description: localeText, ogImage: image, noindex: boolean }`
- `order: number` (within category)

#### `staticPage`
For Home, Pro tsentr, Tsiny, Statsionar, Laboratoriya, Kontakty.
- `slug: string` — `home | pro-tsentr | tsiny | statsionar | laboratoriya | kontakty`
- `title: localeString`
- `h1: localeString`
- `summary: localeText`
- `sections: array<contentSection>` — same building blocks as service pages
- `faq: array<faqItem>`
- `seo: object { title, description, ogImage, noindex }`

#### `blogPost` (Phase 3)
- `title: localeString`
- `slug: localeString-slug`
- `excerpt: localeText`
- `coverImage: image`
- `body: array<portableText>` (locale-keyed)
- `author: reference → doctor` (or a new `author` type)
- `publishedAt: datetime`
- `tags: array<string>`
- `relatedServices: array<reference → service>`
- `seo: { title, description, ogImage }`

#### `priceList` (Phase 2 once client returns prices)
- `service: reference → service` OR `category: reference → serviceCategory` (one or the other)
- `tiers: array<{ label: localeString, price: number, currency: "UAH", note: localeString }>`

#### `navigation`
Single document driving the mega-menu.
- `items: array<navItem>`
  - `navItem: { label: localeString, href: localeString OR null, category: reference → serviceCategory OR null, isMegaMenu: boolean, order: number }`
- `cta: { label: localeString, href: string }`

### 6.2 Reusable object types

#### `contentSection` (object, used inside `sections[]`)
A discriminated union — Sanity supports it via multiple `of` types.

Variants:

1. **`section.richText`** — `{ heading: localeString, body: localeText }` (markdown allowed) — for "Що таке…?" type sections.
2. **`section.bullets`** — `{ heading: localeString, items: localeStringArray }` — for indications/benefits/contraindications lists.
3. **`section.steps`** — `{ heading: localeString, steps: array<{ title: localeString, description: localeText }> }` — for "Як проходить процедура" multi-step flows.
4. **`section.compareTable`** — `{ heading: localeString, columns: array<localeString>, rows: array<{ label: localeString, values: localeStringArray }> }` — for comparison sections (e.g. EMSCULPT vs liposuction).
5. **`section.indicationsContraindications`** — `{ indicationsHeading: localeString, indications: localeStringArray, contraindicationsHeading: localeString, contraindications: localeStringArray }` — paired layout, very common.
6. **`section.priceTeaser`** — `{ heading: localeString, intro: localeText, ctaLabel: localeString }` — pricing block with CTA, no actual numbers (numbers come from `priceList`).
7. **`section.callout`** — `{ tone: "info"|"warning"|"success", body: localeText }` — for "Зверніть увагу" boxes.
8. **`section.imageGallery`** — `{ heading: localeString, images: array<image> }` — for before/after or equipment shots.
9. **`section.relatedDoctors`** — `{ heading: localeString, doctors: array<reference → doctor> }` — overrides auto-relation.
10. **`section.cta`** — `{ heading: localeString, body: localeText, ctaLabel: localeString, ctaHref: string }` — mid-page CTA strip.

This block-system lets every page be authored from the same primitives without bespoke schemas per service.

#### `faqItem` (object)
- `question: localeString`
- `answer: localeText` (markdown allowed for inline links)

#### `localeSlug` (helper)
- `uk: { current: string }`
- `ru: { current: string }`
- `en: { current: string }`

### 6.3 Schema additions to `src/sanity/schemas/index.ts`

```ts
export const schemaTypes = [
  // existing locale + document types
  ...existing,
  // new locale helper
  localeSlug,
  // new objects (sections + faqItem + nav items)
  sectionRichText,
  sectionBullets,
  sectionSteps,
  sectionCompareTable,
  sectionIndicationsContraindications,
  sectionPriceTeaser,
  sectionCallout,
  sectionImageGallery,
  sectionRelatedDoctors,
  sectionCta,
  faqItem,
  navItem,
  // new documents
  serviceCategory,
  service,
  staticPage,
  navigation,
  // phase 3
  // blogPost,
  // priceList,
];
```

---

## 7. Page templates inventory

Three templates render every public page. Keep template count low to enforce visual consistency.

### 7.1 `<CategoryHubTemplate>`
Used by: Послуги index, Ін'єкційна, Апаратна, Інтимне відновлення, Лазерна епіляція, Longevity & Anti-Age, Апаратна → Обличчя/Тіло/Інтимна (sub-hubs).

Layout:
1. **Hero**: gradient + heroImage right-aligned, H1 (category title), summary, CTA.
2. **Intro paragraph** (from `summary` or first `richText` section).
3. **Service grid**: 2-col on desktop, cards with title, short description, hero photo, "Детальніше →".
4. **Doctors strip**: top 3-5 doctors associated with services in this category.
5. **FAQ** (collapsible).
6. **CTA section** (form).
7. **Internal links**: "Інші напрямки" — links to sibling categories.

### 7.2 `<ServiceDetailTemplate>`
Used by: all 28 service pages.

Layout:
1. **Hero**: side-by-side. Left: H1, summary, key facts (procedureLength / effectDuration / sessions / priceFrom), CTA "Записатися". Right: heroImage.
2. **Sticky table-of-contents** (left rail desktop, top dropdown mobile) generated from sections[].heading.
3. **Sections** rendered in order via `<SectionRenderer>` (switches on section variant).
4. **Pricing teaser** (uses `section.priceTeaser` if present, else falls back to a default block).
5. **Related doctors** (3-up cards).
6. **FAQ** (FAQPage schema.org).
7. **Related services** (3-up).
8. **CTA** form.

### 7.3 `<StaticPageTemplate>`
Used by: Home (special variant), Pro tsentr, Tsiny, Statsionar, Laboratoriya, Kontakty.

Layout: very similar to ServiceDetail but without sticky TOC, without related-services grid, with optional custom hero (Home keeps its existing custom hero).

### 7.4 Shared layout chrome

- `<MegaMenuHeader>` — replaces current header. Driven by `navigation` doc. Desktop: hover/click reveals dropdown; Mobile: full-screen accordion.
- `<Footer>` — extend current footer; add "Послуги" column with category links + "Інформація" column with About/Pricing/Contacts/Blog.
- `<CtaModal>` — reuse existing modal; lead body (procedure name + URL) when triggered from a service page.
- `<Breadcrumbs>` — JSON-LD BreadcrumbList + visible breadcrumb on all non-home pages.

---

## 8. Design system extension

### 8.1 Locked tokens (do not change without explicit ok)

- Color: `--color-main` (#8B7B6B taupe), `--color-champagne` (#FAF9F6), `--color-rosegold` (#C0CFD5)
- Type: Cormorant Garamond (headings), Montserrat (body)
- Spacing: section 120 / block 64 / element 32 / card 24 / inner 16
- Radius: button 12 / card 16 / pill 999

### 8.2 New tokens to add

```css
--color-ink: #2A2520;          /* near-black for body text on champagne */
--color-muted: #6B6359;        /* secondary text */
--color-line: #E6E0D6;         /* dividers, table borders */
--color-rosegold-deep: #9CB1B8; /* darker accent for hover/active */
--color-success: #5E7A5E;       /* form success */
--color-warning: #B8865E;       /* warnings, callouts */

--shadow-card: 0 8px 32px -12px rgba(42, 37, 32, 0.12);
--shadow-card-hover: 0 16px 48px -16px rgba(42, 37, 32, 0.18);

--ease-premium: cubic-bezier(0.32, 0.72, 0, 1);
--duration-quick: 180ms;
--duration-base: 320ms;
--duration-slow: 560ms;
```

### 8.3 Component vocabulary

Add to `src/components/ui/` over Phase 1 (one component per task, TDD where applicable):

- `<Breadcrumbs />`
- `<TocRail />` (desktop sticky table of contents)
- `<TocDropdown />` (mobile)
- `<KeyFactsBar />` (procedure length / sessions / price-from)
- `<IndicationsList />` and `<ContraindicationsList />` (paired layout component)
- `<StepsTimeline />` (numbered, vertical on mobile, horizontal on desktop)
- `<CompareTable />`
- `<Callout tone="info|warning|success" />`
- `<RelatedDoctorsStrip />`
- `<RelatedServicesGrid />`
- `<MegaMenuPanel />` (the dropdown body)
- `<FormFieldErrors />` (form helper)
- `<JsonLd type="MedicalProcedure|Physician|FAQPage|MedicalBusiness|BreadcrumbList" data={...} />`

Existing `Button`, `SectionHeader`, `Icons` etc. stay as-is.

### 8.4 Per-page experimentation budget

Each service detail page may introduce ONE bespoke visual flourish (e.g. a custom illustration, a unique animation, a one-off layout twist) — not more. Re-usable improvements get promoted to the design system. This is how Roman wants it (page-by-page experimentation, not a sweep).

---

## 9. Copywriting constitution

### 9.1 Voice

Three words: **expert, calm, premium**.

- Speak like a senior dermatologist who's also a great writer: knows the science, doesn't show off, won't over-promise.
- No hype-words: ❌ "магічна", "неймовірна", "революційна", "ідеальна", "100 % безпечна", "немає протипоказань"
- No fear-marketing: ❌ "загроза старіння", "ваша шкіра гине"
- Yes-words: "сучасний", "доказовий", "виважений", "прогнозований результат", "індивідуальний підхід"

### 9.2 Tone per surface

| Surface | Tone | Length |
|---|---|---|
| H1 / hero subtitle | Promise + clarity | H1: 3–7 words; sub: 12–25 words |
| Section bodies | Educational, slightly warm | 80–180 words per paragraph block |
| FAQ answers | Direct, no fluff, with numbers | 30–80 words |
| CTA buttons | Action verb + outcome | "Записатися на консультацію", not "Дізнатися більше" |
| Doctor cards / equipment cards | Factual, credentialing | Strict |
| Pricing | Honest, no false specificity | Use ranges or "за консультацією" |

### 9.3 SEO-while-selling rules

These are enforced for EVERY page:

1. **H1 contains primary keyword verbatim** (or near-exact) once.
2. **First 100 chars of body** include primary keyword once.
3. **Every section heading** contains an entity from the keyword pool (procedure, body part, technology, "Дніпро").
4. **Density target:** Primary keyword 0.6–1.2 % of total chars. Don't keyword-stuff. (For 5,000-char pages, that's ~30–60 occurrences split across all forms.)
5. **Internal links:** Every page links to ≥ 3 other pages on the site (related services + ≥ 1 category + ≥ 1 doctor profile when available).
6. **External links:** Only authoritative (manufacturer site for equipment, ministry of health / WHO for medical claims). `rel="noreferrer noopener"` for all.
7. **Image alt text:** Always descriptive in target locale, includes service name when relevant. Not "image1.jpg".
8. **FAQ questions are taken verbatim from the brief.** They map to People-Also-Ask. Don't paraphrase the question; do write a better answer.
9. **Reading level:** 9th grade UA equivalent. Short sentences (avg 14 words). Active voice.
10. **No duplicate boilerplate** across services. Each "Що таке…?" must say something unique to that procedure.

### 9.4 Trilingual quality bar (per D4)

- **UA** is canonical, drafted first.
- **RU** is a fluent native re-write, NOT a literal translation. Same meaning, idiomatic Russian. Keep brand names in Latin (Juvederm, EMFACE).
- **EN** is a fluent native re-write for international clients (often relocated patients). British or American usage — pick once and stick: **British English** (centre, optimise, behaviour) since it's closer to UA/EU medical convention.
- All three locales must hit the same char count ±15 %.
- Run grammar check (Grammarly / LanguageTool / equivalent) on each before publishing.

### 9.5 Formula library (Roman uses these as first-draft starters)

**H1 patterns**
- `[Procedure] у Дніпрі — [outcome adjective] [outcome noun]` — e.g. "Ботулінотерапія у Дніпрі — природне розгладження зморшок"
- `[Procedure] для [audience/zone] — [unique angle]` — e.g. "Лазерна епіляція для жінок — комфортно та надовго"
- `[Brand procedure]: [what it does in 3-5 words]` — e.g. "EMFACE: безін'єкційний ліфтинг обличчя"

**Hero subtitle pattern**
`[Time/sessions context]. [Result you can expect]. [Trust signal — наприклад "У сертифікованому центрі Дніпра з 2019 року"].`

**Meta title pattern**
`[Procedure] в Дніпрі — [center type] Genevity` (≤ 60 chars). Examples:
- "Ботулінотерапія в Дніпрі — клініка Genevity"
- "PRP-плазмоліфтинг — ціна процедури в Дніпрі | Genevity"

**Meta description pattern (≤ 155 chars)**
`[Procedure] у центрі Genevity, Дніпро. [Key benefit + duration/sessions]. Запис на консультацію онлайн.`

**CTA copy**
- Primary: "Записатися на консультацію"
- Secondary: "Дізнатися ціну"
- Tertiary: "Зв'язатися з нами"

### 9.6 Pricing language until prices arrive

- Use `«за консультацією»` everywhere a number would go.
- DO NOT invent ranges. DO NOT use "від 0 грн" or "договірна".
- Mid-page priceTeaser: "Вартість процедури [Procedure] у центрі Genevity розраховується індивідуально, після консультації з лікарем. Зв'яжіться з нами — обговоримо ваш випадок та підберемо оптимальний протокол."

---

## 10. SEO strategy

### 10.1 Technical SEO checklist (Phase 0 + 1)

- [ ] `sitemap.ts` generated dynamically from Sanity (pulls every published page, includes `lastmod`, `hreflang` alternates).
- [ ] `robots.ts` — allow all, disallow `/studio`, link to sitemap.
- [ ] `<link rel="alternate" hreflang="uk-UA|ru-UA|en">` on every page — emit via root layout.
- [ ] Canonical URL on every page.
- [ ] OpenGraph + Twitter Card per page (image, title, description).
- [ ] JSON-LD per page type:
  - Home: `MedicalBusiness` (with address, phone, hours, geo, sameAs, medicalSpecialty)
  - Service detail: `MedicalProcedure` (procedureType, bodyLocation, howPerformed, indication, contraindication)
  - Doctor profile: `Physician` (name, medicalSpecialty, alumniOf, worksFor, telephone, address)
  - FAQ block: `FAQPage`
  - All pages: `BreadcrumbList`
  - Static About: `AboutPage` + `MedicalBusiness`
- [ ] Performance: LCP < 1.5s mobile (75th pctl), INP < 200ms, CLS < 0.05
- [ ] Image strategy: `next/image` everywhere, `priority` on hero only, sizes attribute always set
- [ ] Font strategy: `next/font/google` with `display: 'swap'` + preload
- [ ] HTTP cache headers via Vercel: `s-maxage=31536000, stale-while-revalidate=86400` on static; tag-based purge on Sanity webhook.

### 10.2 Internal linking architecture

A page belongs to ONE category but can link to any other. Linking rules:

- Service detail → its category hub (breadcrumb)
- Service detail → 3 sibling services in same category ("Часто разом з…")
- Service detail → 1-2 services in adjacent categories where medically related (e.g. Ботулінотерапія ↔ Контурна пластика; EMFACE ↔ Ultraformer MPT)
- Service detail → 1-3 doctors who perform it
- Service detail → relevant equipment page (Phase 3 or via `relatedEquipment`)
- Category hub → all its services + parent (Послуги)
- Home → top 6 most-searched services (Ботулінотерапія, Біоревіталізація, Hydrafacial, Лазерна епіляція, Check-Up 40, EMFACE)

### 10.3 Keyword cluster ownership

| Cluster | Owning page | Supporting pages (link to owner) |
|---|---|---|
| "ботокс / ботулінотерапія" | §11.03 | §11.02, §11.04, home |
| "контурна пластика" | §11.04 | §11.11 (Juvederm), §11.12 (PolyPhil), §11.02 |
| "біоревіталізація" | §11.05 | §11.06 (mezo), §11.02 |
| "мезотерапія" | §11.06 | §11.05, §11.02 |
| "PRP / плазмоліфтинг" | §11.07 | §11.02 |
| "екзосоми" | §11.08 | §11.05, §11.06 |
| "стовбурові клітини" | §11.09 | §11.08 |
| "Juvederm" | §11.11 | §11.04 |
| "PolyPhil" | §11.12 | §11.04 |
| "Rejuran" | §11.10 | §11.05 |
| "EMFACE" | §11.15 | §11.13, §11.14, §11.18 |
| "Volnewmer" | §11.16 | §11.14, §11.18 |
| "Exion / Exion Face" | §11.17 | §11.14, §11.22 (body) |
| "Ultraformer MPT" | §11.18 | §11.21 (body), §11.14 |
| "EMSCULPT" | §11.20 | §11.19 (body hub), §11.21 |
| "Hydrafacial" | §11.25 | §11.41 (доглядові) |
| "AcuPulse CO₂ обличчя" | §11.26 | §11.30 (intymne) |
| "AcuPulse CO₂ інтимне" | §11.30 | §11.27, §11.26 |
| "Splendor X" | §11.24 | §11.31, §11.32, §11.33 |
| "M22 Stellar Black" | §11.23 | §11.13 |
| "RF-ліфтинг монополярний" | §11.28 | §11.27 |
| "лазерна епіляція" | §11.31 | §11.32, §11.33, §11.24 |
| "лазерна епіляція для чоловіків" | §11.32 | §11.31 |
| "лазерна епіляція для жінок" | §11.33 | §11.31 |
| "Check-Up 40" | §11.34 | §11.35, §11.36, §11.40 (lab) |
| "Longevity програма" | §11.35 | §11.34, §11.36, §11.37 |
| "гормональний баланс" | §11.36 | §11.34, §11.40, §11.37 |
| "IV терапія" | §11.37 | §11.38 (нутрицевтика), §11.36 |
| "нутрицевтика" | §11.38 | §11.37, §11.35 |
| "стаціонар Дніпро" | §11.39 | §11.40, §11.43 (хірургія) |
| "лабораторія Дніпро / здати аналізи" | §11.40 | §11.34, §11.36 |
| "процедури догляду за обличчям" | §11.41 | §11.25 (Hydrafacial), §11.05 |
| "подолог Дніпро" | §11.42 | (standalone) |
| "пластична хірургія" | §11.43 | §11.39 |

---

## 11. Per-page specifications (43 briefs — durable reference)

> For every page below: brief is captured verbatim from `technical_task/Завдання на тексти №1.docx`, plus enrichment (search intent, internal links, schema, H1/meta direction). Use this section as the SINGLE source of truth — do not re-open the .docx.

---

### §11.01 — Page 01 / Home {#page-01-home}

- **Route:** `/`
- **Source brief:** Завдання на тексти №1, page 1 ("Головна")
- **Char target:** 2 500 – 3 000
- **Section outline (verbatim):**
  - Вступ
  - Послуги центру естетичної медицини Genevity
  - Переваги центру медичної косметології
- **FAQ (verbatim):**
  - Які процедури пропонує центр естетичної медицини?
  - Як записатися на консультацію?
  - Які кваліфікації мають ваші спеціалісти?
  - Чи є у вас акції або спеціальні пропозиції?
  - Які засоби використовуються під час процедур?
- **Primary keywords:** центр естетичної медицини, центр косметології та естетичної медицини, центр естетичної медицини та косметології, медичний центр косметології
- **Secondary keywords:** центр, косметологія, естетика, медицина, процедура, лікар, шкіра, дніпро, пацієнт, фахівець, проблема, результат, обличчя, жінка, волосся, підхід, ціни
- **Search intent:** Brand + category discovery. Visitors land here from "центр косметології Дніпро" or branded "Genevity".
- **Internal links out:** Top 6 service hubs (Ін'єкційна, Апаратна, Інтимне, Лазерна, Longevity, Доглядові); /likari; /tsiny; /kontakty.
- **Schema.org:** `MedicalBusiness`, `WebSite` (with potential SearchAction), `BreadcrumbList`.
- **H1 angle:** "Центр естетичної медицини Genevity у Дніпрі" (variant: "…наука та естетика для тривалого результату").
- **Meta title:** "Genevity — центр естетичної медицини та longevity у Дніпрі" (≤60 ch)
- **Meta description angle:** Прокальна назва, ключові категорії послуг, CTA на консультацію.

---

### §11.02 — Page 02 / Косметичні ін'єкції (Category hub) {#page-02-injectable}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia`
- **Char target:** 5 300 – 5 800
- **Section outline:**
  - Що таке ін'єкційна косметологія?
  - Переваги ін'єкційних процедур для обличчя
  - Види ін'єкційних процедур
    - Ботулінотерапія
    - Контурна пластика
    - Біоревіталізація
    - Мезотерапія
  - Показання та протипоказання до ін'єкційних процедур
  - Як проходить процедура ін'єкційної косметології?
  - Вартість ін'єкційних процедур у Дніпрі
  - Догляд за шкірою після ін'єкційних процедур
- **FAQ:**
  - Які можливі побічні ефекти після ін'єкційних процедур?
  - Скільки триває ефект від ін'єкційної косметології?
  - Чи можна поєднувати ін'єкційні процедури з іншими методами омолодження?
- **Primary kw:** косметичні ін'єкції, ін'єкційна косметологія, ціна косметичних ін'єкцій, косметичні ін'єкції для обличчя, вартість косметичних ін'єкцій
- **Secondary kw:** омолоджуючі, процедури, обличчя, вартість, послуги, ін'єкції, косметологія, ціни, Дніпро, зробити, центр, естетика, медицина, процедура, лікар, записатися
- **Search intent:** Comparison/research — visitor knows they want "an injection" but hasn't picked Botox vs filler vs meso yet.
- **Internal links:** All 10 sub-services (§11.03–§11.12), parent /poslugy, /likari (injectable doctors).
- **Schema.org:** `MedicalProcedure` (procedureType: injection), `BreadcrumbList`, `FAQPage`.
- **H1 angle:** "Косметичні ін'єкції у Дніпрі — повний спектр процедур" (variant: "Ін'єкційна косметологія в Genevity").
- **Template:** `<CategoryHubTemplate>` extended with the 4-procedure mini-cards section.

---

### §11.03 — Page 03 / Ботулінотерапія {#page-03-botulinotherapy}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/botulinoterapiya`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке ботулінотерапія?
  - Показання до проведення ботулінотерапії
  - Протипоказання та обмеження процедури
  - Переваги та недоліки ботулінотерапії
  - Як проходить процедура ботулінотерапії?
  - Догляд після процедури та можливі побічні ефекти
  - Вартість ботулінотерапії та фактори, що на неї впливають
- **FAQ:**
  - Як швидко проявляється ефект після ботулінотерапії?
  - Чи можна поєднувати ботулінотерапію з іншими косметологічними процедурами?
  - Скільки триває реабілітаційний період після ін'єкцій ботулотоксину?
- **Primary kw:** ботокс для обличчя, ботулінотерапія, ін'єкції ботоксу, уколи ботулотоксину, ціни на ботулінотерапію
- **Secondary kw:** уколи, ін'єкції, процедура, ціна, вартість, протипоказання, показання, косметологія, естетична, Дніпро, обличчя, зморшки, ботулотоксин, ботокс, центр, лікар, записатися
- **Search intent:** Bottom-of-funnel — user is ready to compare clinics in Дніпро for Botox.
- **Internal links:** §11.02 (parent), §11.04, §11.05, §11.11 (Juvederm cross-reference), 1-2 injectable doctors.
- **Schema.org:** `MedicalProcedure` (botulinum toxin therapy), `FAQPage`, `BreadcrumbList`.
- **H1 angle:** "Ботулінотерапія в Дніпрі — природне розгладження зморшок"
- **Meta title:** "Ботулінотерапія у Дніпрі — ціни на ботокс | Genevity"

---

### §11.04 — Page 04 / Контурна пластика {#page-04-contour}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/konturna-plastyka`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке контурна пластика обличчя?
  - Показання до проведення контурної пластики
  - Процедура контурної пластики: етапи та особливості
  - Переваги контурної пластики
  - Протипоказання та можливі побічні ефекти
  - Рекомендації після процедури
  - Тривалість ефекту та необхідність повторних процедур
- **FAQ:**
  - Які препарати використовуються для контурної пластики?
  - Чи можна поєднувати контурну пластику з іншими косметологічними процедурами?
  - Як підготуватися до процедури контурної пластики?
- **Primary kw:** контурна пластика овалу обличчя, ін'єкції для контурної пластики, послуги з контурної пластики, зробити контурну пластику обличчя
- **Secondary kw:** процедура, показання, протипоказання, побічні, ефекти, переваги, вартість, рекомендації, тривалість, ефект, ціни, дніпро, центр, косметологія, лікар, записатися
- **Internal links:** §11.02, §11.11 (Juvederm), §11.12 (PolyPhil), §11.03.
- **Schema:** `MedicalProcedure`, `FAQPage`, `BreadcrumbList`.
- **H1:** "Контурна пластика обличчя у Дніпрі — філери та моделювання овалу"

---

### §11.05 — Page 05 / Біоревіталізація {#page-05-biorevitalization}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/biorevitalizatsiia`
- **Char target:** 6 800 – 7 300 (longest in this category)
- **Outline:**
  - Що таке біоревіталізація?
  - Переваги біоревіталізації
  - Показання та протипоказання до процедури
  - Як проходить процедура біоревіталізації?
  - Результати та ефективність біоревіталізації
- **FAQ:**
  - Скільки триває ефект від біоревіталізації?
  - Чи можна поєднувати біоревіталізацію з іншими косметологічними процедурами?
  - Який реабілітаційний період після біоревіталізації?
  - Чи є вікові обмеження для проведення біоревіталізації?
- **Primary kw:** біоревіталізація обличчя, ціна біоревіталізації в дніпрі, процедура біоревіталізації обличчя, біоревіталізація шкіри обличчя, протипоказання до біоревіталізації
- **Secondary kw:** омолодження, ін'єкції, гіалуронова, ефективність, результати, вартість, Дніпро, косметологія, процедура, показання, центр, медицина, лікар, записатися
- **Internal links:** §11.02, §11.06 (мезо), §11.10 (Rejuran), §11.08 (екзосоми).
- **Schema:** `MedicalProcedure` + `FAQPage`.
- **H1:** "Біоревіталізація обличчя в Дніпрі — глибоке зволоження гіалуроновою кислотою"

---

### §11.06 — Page 06 / Мезотерапія {#page-06-mesotherapy}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/mezoterapiya`
- **Char target:** 6 800 – 7 300
- **Outline:**
  - Що таке мезотерапія обличчя?
  - Показання до проведення мезотерапії
  - Протипоказання та можливі побічні ефекти
  - Процедура проведення мезотерапії
  - Результати та ефективність процедури
  - Види мезотерапії
  - Підготовка та реабілітація після процедури
- **FAQ:**
  - Скільки триває ефект від мезотерапії обличчя?
  - Чи болюча процедура мезотерапії?
  - Скільки сеансів мезотерапії необхідно для досягнення результату?
  - Чи можна поєднувати мезотерапію з іншими косметологічними процедурами?
- **Primary kw:** мезотерапія обличчя, мезотерапія для обличчя, ціна на мезотерапію обличчя, процедура мезотерапії, ін'єкції мезотерапії
- **Secondary kw:** омолодження, ліфтинг, підтяжка, ін'єкції, показання, протипоказання, вартість, ін'єкційна косметологія, овал, центр, медицина, лікар, дніпро, записатися, ціна
- **Internal links:** §11.02, §11.05, §11.08, §11.10.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Мезотерапія обличчя в Дніпрі — індивідуальні коктейлі для шкіри"

---

### §11.07 — Page 07 / PRP-плазмоліфтинг {#page-07-prp}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/prp-plazmoliftynh`
- **Char target:** 4 000 – 4 500
- **Outline:**
  - Що таке PRP-терапія?
  - Показання та протипоказання до PRP-терапії
  - Процедура проведення плазмотерапії
  - Переваги та недоліки PRP-терапії
- **FAQ:**
  - Скільки триває ефект від PRP-терапії?
  - Чи болісна процедура PRP-терапії?
  - Скільки сеансів PRP-терапії необхідно для досягнення результату?
  - Чи можна поєднувати PRP-терапію з іншими косметологічними процедурами?
- **Primary kw:** prp-терапія, ціна плазмотерапії, prp-терапія для обличчя, плазмоліфтинг prp, показання до prp-терапії
- **Secondary kw:** вартість, процедура, омолодження, косметологія, протипоказання, шкіра, обличчя, плазмоліфтинг, сеанс, ефект, результат, центр, медицина, лікар, дніпро, записатися
- **Internal links:** §11.02, §11.05, §11.08.
- **Schema:** `MedicalProcedure` (PRP), `FAQPage`.
- **H1:** "PRP-плазмоліфтинг у Дніпрі — омолодження власною плазмою"

---

### §11.08 — Page 08 / Екзосоми {#page-08-exosomes}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/ekzosomy`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке екзосоми?
  - Застосування екзосом у косметології
  - Ефекти екзосомальної терапії для обличчя
  - Показання та протипоказання до процедури
  - Процедура введення екзосом
    - Підготовка до процедури
    - Етапи проведення
    - Рекомендації після процедури
  - Порівняння екзосомальної терапії з іншими методами омолодження
  - Можливі побічні ефекти та ризики екзосомальної терапії
- **FAQ:**
  - Чи безпечна екзосомальна терапія для всіх типів шкіри?
  - Скільки процедур екзосомальної терапії необхідно для досягнення видимого результату?
  - Чи можна поєднувати екзосомальну терапію з іншими косметологічними процедурами?
  - Який період реабілітації після введення екзосом?
  - Чи підходить екзосомальна терапія для лікування акне?
- **Primary kw:** екзосоми, екзосоми для обличчя, екзосомальна терапія, ін'єкції екзосом, екзосоми лікування
- **Secondary kw:** екзосома, обличчя, екзосомальні, терапія, ін'єкція, лікування, шкіра, процедура, клітина, відновлення, косметологія, регенерація, ріст, омолодження, активний, ефект, процес, центр, медицина, лікар, дніпро, записатися, ціни, вартість
- **Internal links:** §11.02, §11.05, §11.06, §11.09 (cells), §11.10 (Rejuran).
- **Schema:** `MedicalProcedure` + `FAQPage`. Use compareTable section for the "Порівняння" block.
- **H1:** "Екзосомальна терапія для обличчя — клітинне омолодження в Дніпрі"

---

### §11.09 — Page 09 / Омолодження стовбуровими клітинами {#page-09-stemcells}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/stovburovi-klityny`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке омолодження стовбуровими клітинами?
  - Переваги процедури омолодження стовбуровими клітинами
  - Як проходить процедура омолодження стовбуровими клітинами?
    - Підготовка до процедури
    - Етапи проведення
    - Відновлення після процедури
  - Показання та протипоказання до омолодження стовбуровими клітинами
  - Можливі ризики та побічні ефекти процедури
- **FAQ:**
  - Які результати можна очікувати після омолодження стовбуровими клітинами?
  - Скільки триває ефект від процедури?
  - Чи безпечне омолодження стовбуровими клітинами?
  - Чи можна поєднувати цю процедуру з іншими методами омолодження?
  - Як часто можна проводити омолодження стовбуровими клітинами?
- **Primary kw:** омолодження стовбуровими клітинами, омолодження за допомогою стовбурових клітин, процедура омолодження стовбуровими клітинами, уколи молодості стовбурові клітини
- **Secondary kw:** вартість, косметологія, ін'єкції, шкіра, власними, процедури, центр, естетика, медицина, лікар, дніпро, записатися, ціна
- **Internal links:** §11.02, §11.08, §11.05, §11.35 (Longevity).
- **Schema:** `MedicalProcedure`, `FAQPage`. Add `Callout` (regulatory note about cell-based therapies in Ukraine).
- **H1:** "Омолодження стовбуровими клітинами у Дніпрі — клітинна регенерація шкіри"

---

### §11.10 — Page 10 / Rejuran {#page-10-rejuran}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/rejuran`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке процедура Rejuran?
  - Переваги ін'єкцій Rejuran
  - Як проходить процедура Rejuran?
    - Підготовка до процедури
    - Етапи проведення
    - Рекомендації після процедури
  - Види препаратів Rejuran та їх особливості
  - Показання та протипоказання до процедури Rejuran
  - Можливі побічні ефекти та ускладнення після ін'єкцій Rejuran
- **FAQ:**
  - Скільки триває ефект від процедури Rejuran?
  - Чи можна поєднувати Rejuran з іншими косметологічними процедурами?
  - Як часто рекомендується проводити процедуру Rejuran?
- **Primary kw:** rejuran ціна процедури, rejuran процедура, процедура rejuran, реджуран ін'єкції
- **Secondary kw:** вартість, ефект, показання, протипоказання, побічні, ускладнення, підготовка, етапи, рекомендації, види, препарати, поєднання, частота, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціни, rejuran
- **Internal links:** §11.02, §11.05, §11.08.
- **Schema:** `MedicalProcedure`, `FAQPage`. Add bullets section listing Rejuran препарати (S, I, HB).
- **H1:** "Rejuran у Дніпрі — лосось-ДНК ін'єкції для регенерації шкіри"

---

### §11.11 — Page 11 / Juvederm {#page-11-juvederm}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/juvederm`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Juvederm?
  - Переваги ін'єкцій Juvederm
  - Процедура введення філерів Juvederm
    - Підготовка до процедури
    - Етапи проведення ін'єкції
    - Рекомендації після процедури
  - Можливі побічні ефекти та протипоказання
  - Показання та протипоказання до застосування Juvederm
- **FAQ:**
  - Які результати можна очікувати після ін'єкцій Juvederm?
  - Скільки триває ефект від процедури?
  - Чи можна поєднувати Juvederm з іншими косметичними процедурами?
- **Primary kw:** ін'єкції ювідерм, ін'єкції juvederm, ін'єкції краси ювідерм, ін'єкції ювідерм у дніпрі
- **Secondary kw:** філери, гіалуронова, кислота, процедура, ефект, побічні, ефекти, протипоказання, результати, поєднання, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, ціна, вартість, juvederm
- **Internal links:** §11.04 (контурна пластика — primary parent), §11.12 (PolyPhil sister product), §11.02.
- **Schema:** `MedicalProcedure`, `Drug` (HA filler), `FAQPage`.
- **H1:** "Філери Juvederm у Дніпрі — преміальні гіалуронові ін'єкції"

---

### §11.12 — Page 12 / PolyPhil {#page-12-polyphil}

- **Route:** `/poslugy/inyektsiyna-kosmetolohiia/polyphil`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке процедура PolyPhil?
  - Переваги процедури PolyPhil
  - Як проходить процедура PolyPhil?
  - Показання та протипоказання до процедури PolyPhil
  - Рекомендації після процедури PolyPhil
- **FAQ:**
  - Скільки триває ефект від процедури PolyPhil?
  - Чи можна поєднувати процедуру PolyPhil з іншими косметичними процедурами?
  - Які можливі побічні ефекти після процедури PolyPhil?
- **Primary kw:** polyphil ціна процедури, polyphil процедура, процедура polyphil
- **Secondary kw:** процедура, ефект, побічні, ефекти, протипоказання, результати, поєднання, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, ціна, вартість, polyphil
- **Internal links:** §11.04, §11.11, §11.02.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "PolyPhil у Дніпрі — біостимулятор для природного омолодження"

---

### §11.13 — Page 13 / Апаратна косметологія (top hub) {#page-13-apparatus}

- **Route:** `/poslugy/aparatna-kosmetolohiia`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке апаратна косметологія?
  - Показання до апаратних косметологічних процедур
  - Основні методи апаратної косметології
  - Переваги апаратної косметології
  - Протипоказання до апаратних процедур
  - Як обрати клініку для апаратної косметології?
- **FAQ:**
  - Які результати можна очікувати після апаратних процедур?
  - Скільки сеансів апаратної косметології потрібно для досягнення ефекту?
  - Чи є побічні ефекти після апаратних процедур?
  - Як підготуватися до апаратної косметологічної процедури?
  - Чи можна поєднувати апаратні процедури з іншими методами омолодження?
- **Primary kw:** апаратна косметологія, апаратна косметологія послуги, апаратна медична косметологія, апаратна косметологія обличчя і тіла
- **Secondary kw:** процедури, ціни, сучасна, ефективна, вартість, косметологічні, центр, косметологія, медицина, лікар, дніпро, записатися
- **Internal links:** §11.14 (face), §11.19 (body), §11.27 (intimate), §11.23, §11.24, §11.25, §11.26.
- **Schema:** `MedicalProcedure` parent, `FAQPage`, `BreadcrumbList`.
- **Template:** `<CategoryHubTemplate>` with 3 "device family" sub-cards (Face / Body / Intimate).

---

### §11.14 — Page 14 / Апаратні процедури для обличчя (sub-hub) {#page-14-apparatus-face}

- **Route:** `/poslugy/aparatna-kosmetolohiia/oblychchia`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке апаратні процедури для обличчя?
  - Переваги апаратної косметології
  - Основні види апаратних процедур для обличчя
  - Показання та протипоказання до апаратних процедур
  - Як обрати відповідну апаратну процедуру для обличчя?
- **FAQ:**
  - Які результати можна очікувати після апаратних процедур для обличчя?
  - Скільки сеансів апаратної косметології потрібно для досягнення бажаного ефекту?
  - Чи є побічні ефекти після апаратних процедур для обличчя?
- **Primary kw:** апаратні процедури для обличчя, апаратна косметологія для обличчя, вартість апаратних процедур для обличчя
- **Secondary kw:** процедури, косметологія, обличчя, догляд, вартість, центр, естетика, медицина, процедура, лікар, дніпро, записатися, ціна
- **Internal links:** §11.13 (parent), §11.15, §11.16, §11.17, §11.18, §11.25, §11.26.
- **Schema:** `MedicalProcedure`, `FAQPage`, `BreadcrumbList`.

---

### §11.15 — Page 15 / EMFACE {#page-15-emface}

- **Route:** `/poslugy/aparatna-kosmetolohiia/oblychchia/emface`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке EMFACE?
  - Принцип дії процедури EMFACE
  - Переваги процедури EMFACE
  - Як проходить процедура EMFACE?
  - Показання та протипоказання до процедури EMFACE
  - Результати та ефективність EMFACE
  - Порівняння EMFACE з іншими методами омолодження
- **FAQ:**
  - Чи безпечна процедура EMFACE?
  - Скільки триває реабілітаційний період після EMFACE?
  - Чи можна поєднувати EMFACE з іншими косметологічними процедурами?
  - Які можливі побічні ефекти після EMFACE?
  - Як довго зберігається ефект від процедури EMFACE?
- **Primary kw:** emface, emface процедура
- **Secondary kw:** омолодження, ліфтинг, безін'єкційний, радіочастотний, електростимуляція, м'язи, шкіра, зморшки, контури, ефективність, EMFACE, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціна
- **Internal links:** §11.14 (parent), §11.18 (Ultraformer), §11.16 (Volnewmer), §11.13.
- **Schema:** `MedicalProcedure`, `FAQPage`. Reference equipment doc `equipment.emface`.
- **H1:** "EMFACE у Дніпрі — безін'єкційний ліфтинг обличчя"

---

### §11.16 — Page 16 / Volnewmer {#page-16-volnewmer}

- **Route:** `/poslugy/aparatna-kosmetolohiia/oblychchia/volnewmer`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Volnewmer?
  - Показання до застосування Volnewmer
  - Принцип дії та технологія Volnewmer
  - Основні характеристики та переваги Volnewmer
  - Процедура лікування з використанням Volnewmer
  - Протипоказання та можливі побічні ефекти
- **FAQ:**
  - Чи безпечна процедура Volnewmer?
  - Скільки часу триває ефект після процедури Volnewmer?
  - Чи потрібна спеціальна підготовка перед процедурою Volnewmer?
- **Primary kw:** процедура volnewmer, volnewmer показання
- **Secondary kw:** volnewmer, процедура, показання, зона, апарат, ефект, шкіра, пацієнт, результат, естетичний, безголковий, RF, ліфтинг, обличчя, область, косметологія, послуга, апаратний, центр, дніпро, записатися, ціна, вартість
- **Internal links:** §11.14 (parent), §11.15, §11.18, §11.28.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Volnewmer у Дніпрі — RF-ліфтинг нового покоління"

---

### §11.17 — Page 17 / Exion (Face) {#page-17-exion}

- **Route:** `/poslugy/aparatna-kosmetolohiia/oblychchia/exion`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Exion?
  - Як працює технологія Exion?
  - Переваги використання Exion для обличчя
  - Процедура Exion Face: етапи та тривалість
  - Порівняння Exion Face з іншими методами омолодження
  - Можливі побічні ефекти та протипоказання
  - Рекомендації після процедури Exion Face
- **FAQ:**
  - Чи підходить Exion Face для всіх типів шкіри?
  - Скільки сеансів Exion Face потрібно для досягнення бажаного результату?
  - Чи можна поєднувати Exion Face з іншими косметичними процедурами?
  - Як довго зберігається ефект після процедури Exion Face?
- **Primary kw:** exion, exion face
- **Secondary kw:** технологія, омолодження, процедура, переваги, результати, Exion, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.14 (parent), §11.22 (Exion Body), §11.18, §11.15.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Exion Face у Дніпрі — фракційний RF та ультразвук в одному апараті"

---

### §11.18 — Page 18 / Ultraformer MPT {#page-18-ultraformer}

- **Route:** `/poslugy/aparatna-kosmetolohiia/oblychchia/ultraformer-mpt`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке Ultraformer MPT?
  - Переваги процедури Ultraformer MPT
  - Показання та протипоказання до застосування
  - Як проходить процедура Ultraformer MPT?
  - Результати та ефективність Ultraformer MPT
  - Рекомендації після процедури
- **FAQ:**
  - Чи болісна процедура Ultraformer MPT?
  - Скільки триває ефект після процедури Ultraformer MPT?
  - Чи можна поєднувати Ultraformer MPT з іншими косметологічними процедурами?
- **Primary kw:** ультраформер, смас ліфтинг ультраформер, ультраформер для обличчя, ультраформер показання, ультраформер ціна процедури
- **Secondary kw:** процедура, ефект, результати, переваги, протипоказання, рекомендації, безболісна, тривалість, поєднання, косметологічні, Ultraformer MPT, центр, косметологія, медицина, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.14, §11.21 (body version), §11.15, §11.17.
- **Schema:** `MedicalProcedure` (HIFU), `FAQPage`. Reference equipment.
- **H1:** "Ultraformer MPT у Дніпрі — SMAS-ліфтинг сфокусованим ультразвуком"

---

### §11.19 — Page 19 / Апаратна косметологія для тіла (sub-hub) {#page-19-apparatus-body}

- **Route:** `/poslugy/aparatna-kosmetolohiia/tilo`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке апаратна косметологія для тіла?
  - Основні види апаратних процедур для тіла
  - Переваги апаратної косметології для тіла
  - Показання та протипоказання до апаратних процедур
  - Як підготуватися до апаратних процедур для тіла?
  - Рекомендації після проведення апаратних процедур
- **FAQ:**
  - Які результати можна очікувати після апаратних процедур для тіла?
  - Скільки сеансів апаратної косметології потрібно для досягнення бажаного ефекту?
  - Чи є апаратна косметологія безпечною для здоров'я?
  - Чи можна поєднувати апаратні процедури з іншими методами корекції фігури?
  - Який період відновлення після апаратних процедур для тіла?
- **Primary kw:** апаратна корекція фігури, апаратна косметологія для тіла, апаратні процедури для тіла, апаратна косметологія для схуднення, апаратна косметологія для корекції фігури
- **Secondary kw:** підтяжка, шкіра, процедури, корекція, фігура, омолодження, целюліт, ліфтинг, масаж, терапія, пресотерапія, вакуумний, ультразвуковий, радіочастотний, мікрострумовий, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.13, §11.20, §11.21, §11.22.
- **Schema:** `MedicalProcedure`, `FAQPage`, `BreadcrumbList`.

---

### §11.20 — Page 20 / EMSCULPT NEO {#page-20-emsculpt}

- **Route:** `/poslugy/aparatna-kosmetolohiia/tilo/emsculpt-neo`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке EMSCULPT NEO?
  - Як працює процедура EMSCULPT NEO?
  - Переваги EMSCULPT NEO
  - Показання та протипоказання до процедури
  - Очікувані результати та ефективність
  - Порівняння EMSCULPT NEO з іншими методами корекції фігури
- **FAQ:**
  - Скільки триває одна процедура EMSCULPT NEO?
  - Чи потрібна реабілітація після процедури?
  - Скільки процедур необхідно для досягнення бажаного результату?
  - Чи підходить EMSCULPT NEO для чоловіків?
  - Чи можна поєднувати EMSCULPT NEO з іншими косметичними процедурами?
- **Primary kw:** emsculpt neo, emsculpt ціна, emsculpt процедура, emsculpt ціна процедури, процедура emsculpt
- **Secondary kw:** переваги, показання, протипоказання, ефективність, результати, порівняння, ліпосакція, реабілітація, тривалість, кількість, чоловіки, поєднання, косметичні, процедури, emsculpt neo, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.19 (parent), §11.21, §11.22.
- **Schema:** `MedicalProcedure`, `FAQPage`. Compare table vs liposuction.
- **H1:** "EMSCULPT NEO у Дніпрі — спалювання жиру та зміцнення м'язів за одну сесію"

---

### §11.21 — Page 21 / Ultraformer MPT для тіла {#page-21-ultraformer-body}

- **Route:** `/poslugy/aparatna-kosmetolohiia/tilo/ultraformer-mpt-body`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Ultraformer MPT для тіла?
  - Переваги процедури Ultraformer MPT
  - Показання та протипоказання до процедури
  - Як проходить процедура Ultraformer MPT для тіла?
  - Результати та ефективність процедури
  - Можливі побічні ефекти та реабілітація
  - Вартість та кількість необхідних сеансів
- **FAQ:**
  - Скільки триває ефект від процедури Ultraformer MPT?
  - Чи болюча процедура Ultraformer MPT для тіла?
  - Чи можна поєднувати Ultraformer MPT з іншими косметологічними процедурами?
  - Які зони тіла можна обробляти за допомогою Ultraformer MPT?
  - Чи потрібна спеціальна підготовка перед процедурою Ultraformer MPT?
- **Primary kw:** ультраформер тіло, ультраформер по тілу, ультраформер для тіла
- **Secondary kw:** процедура, ефективність, результати, побічні, ефекти, реабілітація, порівняння, методи, корекція, фігура, вартість, сеанси, Ultraformer MPT, тіло, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися
- **Internal links:** §11.19, §11.18 (face), §11.20, §11.22.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Ultraformer MPT для тіла — SMAS-ліфтинг живота, рук та сідниць у Дніпрі"

---

### §11.22 — Page 22 / Exion Body {#page-22-exion-body}

- **Route:** `/poslugy/aparatna-kosmetolohiia/tilo/exion-body`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Exion Body?
  - Як працює технологія Exion Body?
  - Переваги процедури Exion Body
  - Порівняння Exion Body з іншими методами контурної пластики
  - Які зони можна обробляти за допомогою Exion Body?
  - Кому підходить процедура Exion Body?
  - Очікувані результати та тривалість ефекту після Exion Body
- **FAQ:**
  - Чи безпечна процедура Exion Body?
  - Скільки сеансів Exion Body потрібно для досягнення бажаного результату?
  - Чи є побічні ефекти після процедури Exion Body?
  - Як підготуватися до сеансу Exion Body?
  - Чи можна поєднувати Exion Body з іншими косметичними процедурами?
- **Primary kw:** exion body, exion rf body
- **Secondary kw:** технологія, процедура, переваги, результати, безпека, підготовка, ефект, сеанс, зони, підходить, побічні, ефекти, поєднувати, косметичними, процедурами, exion body, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.19, §11.17 (face counterpart), §11.20, §11.21.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Exion Body у Дніпрі — RF + ультразвук для зміцнення шкіри тіла"

---

### §11.23 — Page 23 / M22 Stellar Black {#page-23-m22}

- **Route:** `/poslugy/aparatna-kosmetolohiia/m22-stellar-black`
- **Char target:** 3 000 – 3 500 (shorter brief)
- **Outline:**
  - Як працює M22 Stellar Black?
  - Кому підходить процедура M22 Black?
  - Як проходить процедура?
- **FAQ:**
  - Що таке процедура M22 Stellar Black і як вона впливає на шкіру?
  - Кому рекомендовано проходити M22 Stellar Black і при яких проблемах вона найбільш ефективна?
  - Як проходить процедура M22 Stellar Black у медичному центрі?
  - Скільки процедур M22 Stellar Black потрібно для досягнення помітного результату?
- **Primary kw:** m22 stellar black
- **Secondary kw:** m22, stellar, black, шкіра, комплексний, процедура, омолодження, центр, реабілітація, медичний, судинний, корекція, апарат, індивідуальний, пігментний, пацієнт, метод, акне, постакне, лікар, зниження, пружність, безпечний, дніпро, записатися, ціна, вартість
- **Internal links:** §11.13, §11.24, §11.26 (CO₂ laser counterpart).
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "M22 Stellar Black у Дніпрі — IPL та лазерна терапія шкіри"

---

### §11.24 — Page 24 / Splendor X {#page-24-splendor}

- **Route:** `/poslugy/aparatna-kosmetolohiia/splendor-x`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке Splendor X?
  - Переваги лазерної епіляції з Splendor X
  - Для яких типів шкіри підходить Splendor X?
  - Які ділянки тіла можна обробляти за допомогою Splendor X?
  - Як підготуватися до процедури лазерної епіляції Splendor X?
  - Чого очікувати після процедури Splendor X?
- **FAQ:**
  - Скільки сеансів потрібно для досягнення бажаного результату з Splendor X?
  - Чи безпечна процедура Splendor X для засмаглої шкіри?
  - Які можливі побічні ефекти після лазерної епіляції Splendor X?
- **Primary kw:** splendor x, лазерна епіляція splendor x, splendor x для всіх типів шкіри, переваги splendor x
- **Secondary kw:** епіляція, лазер, технологія, шкіра, процедура, сеанс, результат, безпека, підготовка, ефект, Splendor X, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.31 (laser hair removal hub), §11.32, §11.33, §11.13.
- **Schema:** `MedicalProcedure` (laser hair removal), `FAQPage`.
- **H1:** "Splendor X у Дніпрі — лазерна епіляція для всіх фототипів"

---

### §11.25 — Page 25 / Hydrafacial {#page-25-hydrafacial}

- **Route:** `/poslugy/aparatna-kosmetolohiia/hydrafacial`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке процедура Hydrafacial?
  - Переваги Hydrafacial
  - Показання до проведення Hydrafacial
  - Протипоказання до процедури Hydrafacial
  - Етапи проведення процедури Hydrafacial
  - Догляд за шкірою після Hydrafacial
- **FAQ:**
  - Скільки триває процедура Hydrafacial?
  - Чи можна проводити Hydrafacial влітку?
  - Як часто рекомендується проходити процедуру Hydrafacial?
- **Primary kw:** hydrafacial, hydrafacial процедура, hydrafacial ціна, hydrafacial протипоказання, чистка обличчя hydrafacial
- **Secondary kw:** чистка, обличчя, процедура, вартість, догляд, переваги, показання, протипоказання, етапи, тривалість, центр, косметологія, медицина, процедура, лікар, дніпро, записатися, ціна
- **Internal links:** §11.13, §11.41 (доглядові процедури), §11.05 (біоревіталізація complement).
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Hydrafacial Syndeo у Дніпрі — апаратна чистка та зволоження шкіри"

---

### §11.26 — Page 26 / AcuPulse CO₂ (Face) {#page-26-acupulse-face}

- **Route:** `/poslugy/aparatna-kosmetolohiia/acupulse-co2`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке AcuPulse CO₂ лазер?
  - Показання для використання AcuPulse CO₂ лазера
    - Лікування зморшок та ознак старіння
    - Корекція рубців та постакне
    - Усунення пігментації та нерівностей шкіри
  - Протипоказання до процедури
  - Як проходить процедура лазерного шліфування AcuPulse CO₂
  - Відновлення та догляд після процедури
  - Переваги використання AcuPulse CO₂ лазера
  - Можливі побічні ефекти та ризики
- **FAQ:**
  - Скільки процедур AcuPulse CO₂ лазера потрібно для досягнення бажаного результату?
  - Чи болюча процедура лазерного шліфування AcuPulse CO₂?
  - Який період реабілітації після процедури?
  - Чи можна поєднувати AcuPulse CO₂ лазер з іншими косметологічними процедурами?
  - Як довго зберігається ефект після лазерного шліфування AcuPulse CO₂?
- **Primary kw:** co2 лазерна шліфовка, лазерна шліфовка co2 протипоказання, лазерна шліфовка co2 обличчя, co2 лазерна шліфовка обличчя, лазерна co2 шліфовка
- **Secondary kw:** ціна, апарат, фракційна, рубців, голлівудська, лазер, обличчя, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, вартість
- **Internal links:** §11.13, §11.30 (intimate counterpart), §11.23.
- **Schema:** `MedicalProcedure` (CO₂ laser resurfacing), `FAQPage`.
- **H1:** "Лазерне шліфування CO₂ AcuPulse у Дніпрі — оновлення шкіри обличчя"

---

### §11.27 — Page 27 / Апаратна косметологія для інтимної зони (sub-hub) {#page-27-intimate-apparatus}

- **Route:** `/poslugy/aparatna-kosmetolohiia/intymna-zona`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке апаратна косметологія для інтимної зони?
  - Показання та протипоказання до процедур
  - Види апаратних процедур для інтимної зони
    - Лазерне омолодження
    - Інтимний пілінг
    - Контурна пластика
  - Переваги апаратної косметології для інтимної зони
  - Як підготуватися до процедури та догляд після неї
- **FAQ:**
  - Які результати можна очікувати після апаратних процедур для інтимної зони?
  - Скільки сеансів потрібно для досягнення бажаного ефекту?
  - Чи є болісними апаратні процедури для інтимної зони?
  - Який період відновлення після процедур?
  - Чи можна поєднувати апаратні процедури з іншими методами омолодження?
- **Primary kw:** косметологія інтимних зон, інтимна косметологія, лазерна інтимна косметологія
- **Secondary kw:** апаратна, процедури, омолодження, пілінг, контурна, пластика, переваги, підготовка, догляд, результати, сеанси, болісність, відновлення, поєднання, центр, медицина, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.13, §11.28, §11.30.
- **Schema:** `MedicalProcedure`, `FAQPage`, `BreadcrumbList`.

---

### §11.28 — Page 28 / Монополярний RF-ліфтинг {#page-28-rf-lifting}

- **Route:** `/poslugy/intymne-vidnovlennia/monopolyarnyy-rf-liftynh`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке монополярний RF-ліфтинг?
  - Переваги монополярного RF-ліфтингу
  - Як проходить процедура монополярного RF-ліфтингу?
    - Підготовка до процедури
    - Етапи проведення
    - Рекомендації після процедури
  - Показання та протипоказання до монополярного RF-ліфтингу
  - Результати та ефективність монополярного RF-ліфтингу
- **FAQ:**
  - Скільки триває ефект від монополярного RF-ліфтингу?
  - Чи болісна процедура монополярного RF-ліфтингу?
  - Скільки сеансів монополярного RF-ліфтингу необхідно для досягнення бажаного результату?
- **Primary kw:** монополярний рф ліфтинг, монополярний RF ліфтинг, RF-ліфтинг монополярний, рф ліфтинг монополярний, ціна на монополярний RF-ліфтинг
- **Secondary kw:** монополярний, ліфтинг, ціна, Дніпро, процедура, шкіра, RF-ліфтинг, апарат, обличчя, результат, колаген, ефект, омолодження, радіочастотний, вплив, біполярний, лікар, центр, косметологія, медицина, вартість
- **Internal links:** §11.27 (parent), §11.30, §11.16 (Volnewmer face RF), §11.13.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Монополярний RF-ліфтинг у Дніпрі — глибинне зміцнення тканин"

---

### §11.30 — Page 30 / Інтимне омолодження AcuPulse CO₂ {#page-30-acupulse-intimate}

> Note: source brief skips number 29.

- **Route:** `/poslugy/intymne-vidnovlennia/acupulse-co2-intymne`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Показання до лазерного омолодження піхви
  - Результати лазерного вагінального омолодження
  - Як проводиться лазерне омолодження інтимної зони?
  - Як працює лазерне інтимне омолодження AcuPulse CO₂?
  - Реабілітація після лазерного інтимного омолодження
- **FAQ:**
  - Чи болісна процедура лазерного інтимного омолодження AcuPulse CO₂?
  - Скільки триває ефект після CO2-омолодження та як його підтримати?
  - Чи є протипоказання до лазерного омолодження CO2?
  - Чи впливає процедура на чутливість та якість інтимного життя?
- **Primary kw:** CO2-звуження вагінальних м'язів, лазерне омолодження CO2, омолодження CO2
- **Secondary kw:** звуження, піхвові, м'язи, лазерне, омолодження CO2, процедура, інтимний, тканина, лікування, технологія, результат, статевий, слизовий, стінка, вагінальний, жінка, апарат, проблема, період, гінекологія, застосування, вплив, ефект, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.27, §11.28, §11.26 (face counterpart).
- **Schema:** `MedicalProcedure` (gynecological laser), `FAQPage`. Use Callout (gentle privacy assurance).
- **H1:** "Інтимне лазерне омолодження AcuPulse CO₂ у Дніпрі"

---

### §11.31 — Page 31 / Лазерна епіляція (Hub) {#page-31-laser-hub}

- **Route:** `/poslugy/lazerna-epiliatsiya`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке лазерна епіляція?
  - Переваги лазерної епіляції
  - Процедура лазерної епіляції: етапи та особливості
  - Протипоказання та можливі побічні ефекти
  - Як підготуватися до процедури лазерної епіляції?
  - Догляд за шкірою після лазерної епіляції
- **FAQ:**
  - Скільки сеансів лазерної епіляції потрібно для повного видалення волосся?
  - Чи болюча процедура лазерної епіляції?
  - Чи можна робити лазерну епіляцію влітку?
  - Які зони тіла можна обробляти лазером?
  - Чи підходить лазерна епіляція для всіх типів шкіри?
- **Primary kw:** лазерна епіляція, ціна на лазерну епіляцію, вартість лазерної епіляції, ціна на лазерну епіляцію в Дніпрі
- **Secondary kw:** волос, процедура, послуги, косметологія, вартість, ціни, дніпро, центр, естетика, медицина, процедура, лікар, записатися
- **Internal links:** §11.32, §11.33, §11.24 (Splendor X equipment).
- **Schema:** `MedicalProcedure`, `FAQPage`, `BreadcrumbList`.

---

### §11.32 — Page 32 / Лазерна епіляція для чоловіків {#page-32-laser-men}

- **Route:** `/poslugy/lazerna-epiliatsiya/cholovicha`
- **Char target:** 6 800 – 7 300 (one of the longest)
- **Outline:**
  - Що таке лазерна епіляція для чоловіків?
  - Переваги лазерної епіляції для чоловіків
  - Процедура лазерної епіляції: як це відбувається?
  - Підготовка до процедури лазерної епіляції
  - Протипоказання та можливі побічні ефекти
  - Зони обробки лазером у чоловіків
  - Кількість необхідних сеансів та очікувані результати
  - Догляд за шкірою після лазерної епіляції
- **FAQ:**
  - Чи болюча процедура лазерної епіляції для чоловіків?
  - Скільки часу триває один сеанс лазерної епіляції?
  - Чи можна засмагати після лазерної епіляції?
  - Чи ефективна лазерна епіляція для світлого або сивого волосся?
  - Які альтернативи лазерній епіляції існують для чоловіків?
- **Primary kw:** лазерна епіляція для чоловіків, чоловіча лазерна епіляція, лазерна епіляція чоловіків
- **Secondary kw:** ціна, вартість, Дніпро, видалення, волосся, депіляція, лазером, чоловікам, чоловіча, епіляція, центр, косметологія, естетика, медицина, процедура, лікар, записатися
- **Internal links:** §11.31 (parent), §11.24.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Лазерна епіляція для чоловіків у Дніпрі — комфортно та надовго"

---

### §11.33 — Page 33 / Лазерна епіляція для жінок {#page-33-laser-women}

- **Route:** `/poslugy/lazerna-epiliatsiya/zhinocha`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке лазерна епіляція для жінок?
  - Переваги лазерної епіляції для жінок
  - Процедура лазерної епіляції: етапи та особливості
    - Підготовка до процедури
    - Проведення сеансу
    - Догляд після процедури
  - Протипоказання та можливі побічні ефекти
- **FAQ:**
  - Скільки сеансів потрібно для повного видалення волосся?
  - Чи болюча процедура лазерної епіляції?
  - Чи можна робити лазерну епіляцію влітку?
  - Які зони можна обробляти лазером?
  - Чи підходить лазерна епіляція для всіх типів шкіри?
- **Primary kw:** лазерна епіляція для жінок, жіноча лазерна епіляція, ціна на лазерну епіляцію для жінок, ціни на лазерну епіляцію для жінок
- **Secondary kw:** лазер, епіляція, жінка, ціна, жіночий, волосся, процедура, шкіра, зона, результат, видалення, губа, бікіні, сеанс, день, верхня, область, обличчя, нога, глибокий, центр, косметологія, естетика, медицина, лікар, дніпро, записатися, вартість
- **Internal links:** §11.31, §11.24.
- **Schema:** `MedicalProcedure`, `FAQPage`.
- **H1:** "Лазерна епіляція для жінок у Дніпрі — гладкість надовго з технологією Splendor X"

---

### §11.34 — Page 34 / Check-Up 40+ {#page-34-checkup}

- **Route:** `/poslugy/longevity-anti-age/check-up-40`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке програма «Check-up 40»?
  - Кому рекомендовано проходити «Check-up 40»?
  - Які обстеження включає програма «Check-up 40»?
  - Як підготуватися до проходження «Check-up 40»?
  - Де можна пройти програму «Check-up 40»?
- **FAQ:**
  - Яка тривалість програми «Check-up 40»?
  - Чи покриває страхування вартість «Check-up 40»?
  - Як часто рекомендується проходити «Check-up 40»?
- **Primary kw:** check up 40, програма чек ап 40, чек ап після 40, чек ап 40 років, чек ап організму в 40 років
- **Secondary kw:** скринінг, здоров'я, обстеження, програма, організм, центр, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.35, §11.36, §11.40 (lab), §11.39 (statsionar).
- **Schema:** `MedicalProcedure` (preventive screening), `FAQPage`.
- **H1:** "Check-Up 40+ у Genevity — повний скринінг здоров'я після 40 років"

---

### §11.35 — Page 35 / Longevity програма {#page-35-longevity}

- **Route:** `/poslugy/longevity-anti-age/longevity-prohrama`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке програма Longevity?
  - Основні компоненти програми Longevity
    - Персоналізоване харчування
    - Фізична активність
    - Ментальне здоров'я
  - Переваги участі в програмі Longevity
  - Як розпочати участь у програмі Longevity?
- **FAQ:**
  - Які результати можна очікувати від участі в програмі Longevity?
  - Чи підходить програма Longevity для людей з хронічними захворюваннями?
  - Як часто потрібно проходити оцінку прогресу в програмі Longevity?
- **Primary kw:** програма довголіття, програма здорового довголіття
- **Secondary kw:** програма, довголіття, здоров'я, життя, літня людина, організм, підтримка, вік, робота, фізичний, якість, соціальний, активність, особа, сприяти, харчування, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.34, §11.36, §11.37, §11.38.
- **Schema:** `MedicalProcedure` (longevity program), `FAQPage`. Add `MedicalAudience` markup (audience: 40+).
- **H1:** "Longevity-програма Genevity — наука довгого та якісного життя"

---

### §11.36 — Page 36 / Гормональний баланс {#page-36-hormones}

- **Route:** `/poslugy/longevity-anti-age/hormonalnyy-balans`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке гормональний баланс і чому він важливий?
  - Ознаки та симптоми гормонального дисбалансу
  - Програма відновлення гормонального балансу: основні етапи
    - Діагностика та оцінка стану
    - Індивідуальний план харчування
    - Фізична активність та режим дня
- **FAQ:**
  - Які аналізи необхідні для оцінки гормонального балансу?
  - Чи підходить програма для жінок різного віку?
  - Скільки часу потрібно для відновлення гормонального балансу?
  - Чи можливі побічні ефекти під час проходження програми?
- **Primary kw:** програма гормональний баланс, відновлення гормонального балансу, симптоми гормонального дисбалансу, переваги програми гормонального балансу
- **Secondary kw:** програма, гормональний, баланс, життя, продовження, корекція, діагностика, вік, зміна, напрямок, здоров'я, стан, фахівець, центр, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.34, §11.40 (lab), §11.37, §11.35.
- **Schema:** `MedicalProcedure` (endocrine assessment), `FAQPage`.
- **H1:** "Програма гормонального балансу — індивідуальне відновлення в Genevity"

---

### §11.37 — Page 37 / IV-терапія {#page-37-iv}

- **Route:** `/poslugy/longevity-anti-age/iv-terapiya`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке IV терапія?
  - Переваги внутрішньовенної терапії
  - Показання до застосування IV терапії
  - Протипоказання та можливі побічні ефекти
  - Процедура проведення IV терапії
  - Види вітамінних крапельниць
- **FAQ:**
  - Чи безпечна IV терапія?
  - Скільки триває одна процедура IV терапії?
  - Як часто можна проходити IV терапію?
  - Чи потрібна підготовка перед процедурою?
  - Чи можна поєднувати IV терапію з іншими методами лікування?
- **Primary kw:** внутрішньовенна терапія, внутрішньовенна крапельниця, вартість внутрішньовенної терапії, внутрішньовенна вітамінна терапія, крапельниця для виведення токсинів
- **Secondary kw:** інфузійна, внутрішньовенна, терапія, протипоказання, показання, процедура, вартість, побічні, ефекти, види, крапельниць, центр, медицина, процедура, лікар, дніпро, записатися, ціна
- **Internal links:** §11.35, §11.36, §11.38, §11.39 (statsionar — IV often performed there).
- **Schema:** `MedicalProcedure` (IV therapy), `FAQPage`. Bullets section for крапельниці types.
- **H1:** "IV-терапія у Дніпрі — вітамінні крапельниці за медичним протоколом"

---

### §11.38 — Page 38 / Нутрицевтика {#page-38-nutraceuticals}

- **Route:** `/poslugy/longevity-anti-age/nutritsevtyka`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Що таке нутрицевтика?
  - Основні види нутрицевтиків
    - Вітаміни та мінерали
    - Пробіотики та пребіотики
    - Омега-3 жирні кислоти
  - Переваги використання нутрицевтиків
  - Як правильно обирати та вживати нутрицевтики?
  - Можливі ризики та протипоказання при прийомі нутрицевтиків
- **FAQ:**
  - Чи можуть нутрицевтики замінити повноцінне харчування?
  - Як довго можна приймати нутрицевтики без перерви?
  - Чи потрібна консультація лікаря перед початком прийому нутрицевтиків?
  - Які побічні ефекти можуть виникнути при прийомі нутрицевтиків?
  - Чи можна поєднувати різні види нутрицевтиків одночасно?
- **Primary kw:** нутрицевтика
- **Secondary kw:** лікар, запис, послуги, консультація, вартість, записатися, прийом, Дніпро, центр, медицина, ціна
- **Internal links:** §11.37, §11.36, §11.35.
- **Schema:** `MedicalProcedure` (nutritional consultation), `FAQPage`.
- **H1:** "Нутрицевтика в Genevity — індивідуальні протоколи добавок"

---

### §11.39 — Page 39 / Стаціонар {#page-39-stationary}

- **Route:** `/statsionar`
- **Char target:** 3 800 – 4 300
- **Outline:**
  - Переваги приватного стаціонару в Дніпрі
  - Послуги денного стаціонару
  - Показання для лікування в денному стаціонарі
  - Як підготуватися до лікування в стаціонарі?
  - Вартість послуг стаціонару в Дніпрі
- **FAQ:**
  - Які документи необхідні для госпіталізації в стаціонар?
  - Чи можна відвідувати пацієнтів у стаціонарі?
  - Які обмеження існують під час перебування в стаціонарі?
  - Чи передбачено харчування для пацієнтів стаціонару?
  - Як записатися на лікування в денному стаціонарі?
- **Primary kw:** стаціонар у Дніпрі, приватний стаціонар, стаціонарне відділення, приватний стаціонар у Дніпрі, денний стаціонар
- **Secondary kw:** лікування, послуги, ціна, відділення, денний, перебування, визначення, запис, підготовка, показання, переваги, підхід, комфорт, медичний, центр, вартість
- **Internal links:** §11.40, §11.43, §11.37.
- **Schema:** `MedicalClinic` (sub-org of MedicalBusiness), `FAQPage`.
- **H1:** "Приватний денний стаціонар Genevity у Дніпрі"

---

### §11.40 — Page 40 / Лабораторія {#page-40-lab}

- **Route:** `/laboratoriya`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Послуги лабораторії
  - Переваги нашої лабораторії
    - Сучасне обладнання
    - Висококваліфікований персонал
    - Швидке отримання результатів
  - Як підготуватися до здачі аналізів
- **FAQ:**
  - Які години роботи лабораторії?
  - Чи можна отримати результати аналізів онлайн?
  - Чи потрібен запис на здачу аналізів?
  - Які документи необхідні для здачі аналізів?
- **Primary kw:** здати аналізи, де здати аналізи, приватні лабораторії у Дніпрі, лабораторія для здачі аналізів, скільки коштує здати аналіз
- **Secondary kw:** центр, медицина, аналіз, лікар, дніпро, записатися, ціна, вартість, лабораторія
- **Internal links:** §11.34, §11.36, §11.39.
- **Schema:** `MedicalClinic` (lab), `FAQPage`.
- **H1:** "Лабораторія Genevity у Дніпрі — швидкі та точні аналізи"

---

### §11.41 — Page 41 / Доглядові процедури {#page-41-care}

- **Route:** `/poslugy/dohliadovi-protsedury`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Що таке уходові процедури для обличчя?
  - Основні етапи уходових процедур
    - Консультація та діагностика стану шкіри
    - Глибоке очищення та ексфоліація
    - Нанесення активних сироваток та масок
    - Массаж та завершальний догляд
  - Види уходових процедур у косметології
    - Пілінги: механічний, фізичний, хімічний
    - Маски: альгінатні, з екзосомами, з ретиноїдами
    - Аппаратні методики: мікротоки, ультразвук, RF-ліфтинг
  - Показання та протипоказання до уходових процедур
  - Переваги професійних уходових процедур
  - Як обрати відповідну уходову процедуру?
- **FAQ:**
  - Які уходові процедури підходять для чутливої шкіри?
  - Як часто слід проходити уходові процедури для обличчя?
  - Чи можна поєднувати різні види уходових процедур?
  - Які результати можна очікувати після першої процедури?
  - Чи є вікові обмеження для проведення уходових процедур?
- **Primary kw:** процедури догляду за обличчям, процедури догляду, процедури з догляду за шкірою обличчя, процедури догляду у косметолога
- **Secondary kw:** косметологія, маски, пілінги, масаж, очищення, зволоження, живлення, апаратні, протипоказання, показання, чутлива, регулярність, ефективність, консультація, тип, центр, естетика, медицина, процедура, лікар, дніпро, записатися, ціна, вартість
- **Internal links:** §11.25 (Hydrafacial), §11.05.
- **Schema:** `MedicalProcedure` (skincare), `FAQPage`.
- **H1:** "Доглядові процедури для обличчя у Дніпрі — професійний догляд від косметолога"

---

### §11.42 — Page 42 / Подологія {#page-42-podology}

- **Route:** `/poslugy/podolohiia`
- **Char target:** 5 300 – 5 800
- **Outline:**
  - Хто такий подолог і які послуги він надає
  - Показання для звернення до подолога
  - Процес прийому у подолога
  - Вартість послуг подолога в Дніпрі
  - Як обрати кваліфікованого подолога
- **FAQ:**
  - Які проблеми вирішує подолог?
  - Чи потрібна підготовка перед візитом до подолога?
  - Скільки триває прийом у подолога?
  - Чи болісні процедури у подолога?
  - Як часто слід відвідувати подолога для профілактики?
- **Primary kw:** подолог, послуги подолога, прайс на послуги подолога, скільки коштують послуги подолога, ціни на послуги подолога
- **Secondary kw:** вартість, прийом, лікар, центр, косметологія, естетика, медицина, процедура, дніпро, записатися, ціна
- **Internal links:** /likari (link to the podologist's profile when ready).
- **Schema:** `MedicalProcedure` (podiatry), `Physician` (link to Кириленко А. В.), `FAQPage`.
- **H1:** "Подолог у Дніпрі — медичний догляд за стопами в Genevity"

---

### §11.43 — Page 43 / Пластична хірургія {#page-43-plastic}

- **Route:** `/poslugy/plastychna-khirurhiia`
- **Char target:** 6 800 – 7 300
- **Outline:**
  - Основні види пластичних операцій
    - Реконструктивна хірургія
    - Естетична хірургія
  - Популярні процедури в пластичній хірургії
    - Ринопластика
    - Маммопластика
    - Ліпосакція
    - Блефаропластика
  - Як обрати кваліфікованого пластичного хірурга?
  - Підготовка до пластичної операції та реабілітація
- **FAQ:**
  - Які ризики пов'язані з пластичною хірургією?
  - Скільки часу займає відновлення після пластичної операції?
  - Чи можливе фінансування пластичних операцій у розстрочку?
- **Primary kw:** пластична хірургія, послуги пластичного хірурга, скільки коштує пластична хірургія, вартість консультації пластичного хірурга, записатися до пластичного хірурга
- **Secondary kw:** операції, вартість, консультація, записатися, послуги, центр, косметологія, естетика, медицина, процедура, лікар, дніпро, ціна
- **Internal links:** §11.39 (statsionar — surgeries performed there), §11.20 (EMSCULPT non-surgical alternative).
- **Schema:** `MedicalProcedure` (plastic surgery — multiple sub-types as separate JSON-LD), `Physician`, `FAQPage`.
- **H1:** "Пластична хірургія у Дніпрі — естетичні та реконструктивні операції в Genevity"

---

## 12. File structure (additions / modifications)

```
src/
├── app/
│   └── [locale]/
│       ├── page.tsx                              # MODIFY: pull static-page sanity doc
│       ├── poslugy/
│       │   ├── page.tsx                          # CREATE: services index
│       │   ├── [category]/
│       │   │   ├── page.tsx                      # CREATE: category hub (handles sub-hubs too via reference traversal)
│       │   │   └── [...slug]/
│       │   │       └── page.tsx                  # CREATE: service detail (catch-all for nested categories)
│       │   └── ...
│       ├── pro-tsentr/page.tsx                   # CREATE
│       ├── tsiny/page.tsx                        # CREATE
│       ├── statsionar/page.tsx                   # CREATE
│       ├── laboratoriya/page.tsx                 # CREATE
│       ├── kontakty/page.tsx                     # CREATE
│       └── likari/
│           ├── page.tsx                          # CREATE
│           └── [slug]/page.tsx                   # CREATE (Phase 3)
│
├── app/sitemap.ts                                # CREATE: dynamic from Sanity
├── app/robots.ts                                 # CREATE
│
├── components/
│   ├── ui/
│   │   ├── Breadcrumbs.tsx                       # CREATE
│   │   ├── TocRail.tsx                           # CREATE
│   │   ├── TocDropdown.tsx                       # CREATE
│   │   ├── KeyFactsBar.tsx                       # CREATE
│   │   ├── IndicationsList.tsx                   # CREATE
│   │   ├── StepsTimeline.tsx                     # CREATE
│   │   ├── CompareTable.tsx                      # CREATE
│   │   ├── Callout.tsx                           # CREATE
│   │   ├── RelatedDoctorsStrip.tsx               # CREATE
│   │   ├── RelatedServicesGrid.tsx               # CREATE
│   │   └── FormFieldErrors.tsx                   # CREATE
│   ├── layout/
│   │   ├── MegaMenuHeader.tsx                    # CREATE: replaces current Header.tsx
│   │   ├── MegaMenuPanel.tsx                     # CREATE
│   │   └── Footer.tsx                            # MODIFY: add services + info columns
│   ├── templates/
│   │   ├── CategoryHubTemplate.tsx               # CREATE
│   │   ├── ServiceDetailTemplate.tsx             # CREATE
│   │   └── StaticPageTemplate.tsx                # CREATE
│   ├── sections/
│   │   └── SectionRenderer.tsx                   # CREATE: switches on contentSection variant
│   └── seo/
│       ├── JsonLdMedicalBusiness.tsx             # CREATE
│       ├── JsonLdMedicalProcedure.tsx            # CREATE
│       ├── JsonLdPhysician.tsx                   # CREATE
│       ├── JsonLdFAQPage.tsx                     # CREATE
│       └── JsonLdBreadcrumbList.tsx              # CREATE
│
├── lib/
│   ├── motion.ts                                  # KEEP
│   ├── seo.ts                                     # CREATE: generateMetadata helpers
│   ├── slugs.ts                                   # CREATE: route ↔ slug ↔ locale mapping
│   └── revalidation.ts                            # CREATE: tag helpers for Cache Components
│
├── sanity/
│   ├── client.ts                                  # KEEP
│   ├── queries.ts                                 # MODIFY: add service / serviceCategory / staticPage queries
│   ├── types.ts                                   # MODIFY: add new TS types
│   └── schemas/
│       ├── index.ts                               # MODIFY: add new types to schemaTypes
│       ├── localeSlug.ts                          # CREATE
│       ├── faqItem.ts                             # CREATE
│       ├── navItem.ts                             # CREATE
│       ├── navigation.ts                          # CREATE (document)
│       ├── serviceCategory.ts                     # CREATE (document)
│       ├── service.ts                             # CREATE (document)
│       ├── staticPage.ts                          # CREATE (document)
│       └── sections/
│           ├── richText.ts
│           ├── bullets.ts
│           ├── steps.ts
│           ├── compareTable.ts
│           ├── indicationsContraindications.ts
│           ├── priceTeaser.ts
│           ├── callout.ts
│           ├── imageGallery.ts
│           ├── relatedDoctors.ts
│           └── cta.ts
│
└── styles/
    └── globals.css                                # MODIFY: add new tokens

scripts/
├── seed-static-pages.ts                           # CREATE
├── seed-categories.ts                             # CREATE
├── seed-service.ts                                # CREATE: parameterized
└── revalidate-on-publish.ts                       # CREATE: webhook handler stub

src/app/api/
└── revalidate/route.ts                            # MODIFY (already exists): handle new tags
```

---

## 13. Per-page Sanity content authoring kit

Every service page authoring follows the same shape (so we can codegen + AI-draft against it). Stored as a JSON sidecar in `technical_task/page-drafts/<slug>.json` during drafting — Roman approves, then we `npx tsx scripts/seed-service.ts <slug>` to push to Sanity.

Schema of the JSON:
```jsonc
{
  "slug": { "uk": "botulinoterapiya", "ru": "botulinoterapiya", "en": "botulinum-therapy" },
  "category": "inyektsiyna-kosmetolohiia",
  "title":   { "uk": "Ботулінотерапія", "ru": "Ботулинотерапия", "en": "Botulinum therapy" },
  "h1":      { "uk": "...", "ru": "...", "en": "..." },
  "summary": { "uk": "...", "ru": "...", "en": "..." },
  "keyFacts": {
    "procedureLength": { "uk": "30 хв", "ru": "30 мин", "en": "30 min" },
    "effectDuration":  { "uk": "до 6 місяців", "ru": "до 6 месяцев", "en": "up to 6 months" },
    "sessions":        { "uk": "1 сеанс", "ru": "1 сеанс", "en": "1 session" },
    "priceFrom":       { "uk": "за консультацією", "ru": "по консультации", "en": "on request" }
  },
  "sections": [
    { "type": "richText", "heading": { "uk": "Що таке ботулінотерапія?" }, "body": { "uk": "..." } },
    { "type": "indicationsContraindications", "indicationsHeading": {}, "indications": {}, "contraindicationsHeading": {}, "contraindications": {} },
    { "type": "steps", "heading": {}, "steps": [{}, {}] }
  ],
  "faq": [
    { "question": {}, "answer": {} }
  ],
  "seo": {
    "title": { "uk": "Ботулінотерапія у Дніпрі — ціни на ботокс | Genevity" },
    "description": { "uk": "..." }
  },
  "keywords": {
    "primary": { "uk": ["ботокс для обличчя", "ботулінотерапія"] },
    "secondary": { "uk": [] }
  }
}
```

---

## 14. Phase 0 — Foundation tasks (TDD where applicable)

> **Branch:** all tasks committed to `develop`. Never push to `main`.

### Task 0.1: Add design tokens to globals.css

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1:** Open `src/styles/globals.css` and locate the `:root` token block.
- [ ] **Step 2:** Add the new tokens from §8.2 inside `:root`. Code:
  ```css
  --color-ink: #2A2520;
  --color-muted: #6B6359;
  --color-line: #E6E0D6;
  --color-rosegold-deep: #9CB1B8;
  --color-success: #5E7A5E;
  --color-warning: #B8865E;
  --shadow-card: 0 8px 32px -12px rgba(42, 37, 32, 0.12);
  --shadow-card-hover: 0 16px 48px -16px rgba(42, 37, 32, 0.18);
  --ease-premium: cubic-bezier(0.32, 0.72, 0, 1);
  --duration-quick: 180ms;
  --duration-base: 320ms;
  --duration-slow: 560ms;
  ```
- [ ] **Step 3:** Run `npm run build` to confirm CSS compiles.
- [ ] **Step 4:** Commit: `git add src/styles/globals.css && git commit -m "feat(design): add v2 design tokens (ink/muted/line/shadows/easing)"`

### Task 0.2: Create localeSlug helper schema

**Files:**
- Create: `src/sanity/schemas/localeSlug.ts`

- [ ] **Step 1:** Create the file:
  ```ts
  import { defineType } from "sanity";

  export const localeSlug = defineType({
    name: "localeSlug",
    title: "Localized Slug",
    type: "object",
    fields: [
      { name: "uk", title: "Українська", type: "slug", options: { source: (doc: any, ctx: any) => ctx.parent?.title?.uk } },
      { name: "ru", title: "Русский", type: "slug", options: { source: (doc: any, ctx: any) => ctx.parent?.title?.ru } },
      { name: "en", title: "English", type: "slug", options: { source: (doc: any, ctx: any) => ctx.parent?.title?.en } },
    ],
  });
  ```
- [ ] **Step 2:** Add to `src/sanity/schemas/index.ts` imports and `schemaTypes` array.
- [ ] **Step 3:** Run `npm run dev`, open Sanity Studio at `/studio`, confirm no errors.
- [ ] **Step 4:** Commit: `git commit -m "feat(sanity): add localeSlug helper schema"`

### Task 0.3: Create faqItem object schema

**Files:**
- Create: `src/sanity/schemas/faqItem.ts`

- [ ] **Step 1:** Create file:
  ```ts
  import { defineType, defineField } from "sanity";

  export const faqItem = defineType({
    name: "faqItem",
    title: "FAQ Item",
    type: "object",
    fields: [
      defineField({ name: "question", title: "Question", type: "localeString", validation: (r) => r.required() }),
      defineField({ name: "answer", title: "Answer", type: "localeText", validation: (r) => r.required() }),
    ],
    preview: { select: { title: "question.uk" } },
  });
  ```
- [ ] **Step 2:** Add to `index.ts`.
- [ ] **Step 3:** Studio loads cleanly.
- [ ] **Step 4:** Commit: `git commit -m "feat(sanity): add faqItem object"`

### Task 0.4: Create section.* object schemas

**Files (one per object):**
- Create: `src/sanity/schemas/sections/richText.ts`
- Create: `src/sanity/schemas/sections/bullets.ts`
- Create: `src/sanity/schemas/sections/steps.ts`
- Create: `src/sanity/schemas/sections/compareTable.ts`
- Create: `src/sanity/schemas/sections/indicationsContraindications.ts`
- Create: `src/sanity/schemas/sections/priceTeaser.ts`
- Create: `src/sanity/schemas/sections/callout.ts`
- Create: `src/sanity/schemas/sections/imageGallery.ts`
- Create: `src/sanity/schemas/sections/relatedDoctors.ts`
- Create: `src/sanity/schemas/sections/cta.ts`

For each: define a Sanity object type per §6.2. Example for `richText.ts`:

```ts
import { defineType, defineField } from "sanity";
export const sectionRichText = defineType({
  name: "section.richText",
  title: "Rich Text Section",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
  ],
  preview: { select: { title: "heading.uk", subtitle: "body.uk" } },
});
```

Subtask checklist (apply to each section type):
- [ ] **Step 1:** Create file with the schema definition (per §6.2).
- [ ] **Step 2:** Export from `src/sanity/schemas/sections/index.ts` (create barrel file).
- [ ] **Step 3:** Add to `src/sanity/schemas/index.ts` schemaTypes.
- [ ] **Step 4:** Studio loads cleanly.
- [ ] **Step 5:** Commit each section type or batch as `feat(sanity): add 10 contentSection variants`.

### Task 0.5: Create serviceCategory document schema

**Files:**
- Create: `src/sanity/schemas/serviceCategory.ts`

- [ ] **Step 1:** Create file per §6.1 (serviceCategory section). All fields included.
- [ ] **Step 2:** Add to `index.ts`.
- [ ] **Step 3:** In Studio, manually create a test category to validate fields.
- [ ] **Step 4:** Delete the test doc.
- [ ] **Step 5:** Commit: `git commit -m "feat(sanity): add serviceCategory document"`

### Task 0.6: Create service document schema

**Files:**
- Create: `src/sanity/schemas/service.ts`

- [ ] **Step 1:** Create per §6.1. Note `sections` is an array of `{type: "section.richText"} | {type: "section.bullets"} | …` references.
- [ ] **Step 2:** Add to `index.ts`.
- [ ] **Step 3:** Studio test: create one service doc with one section of each type, ensure preview/edit works.
- [ ] **Step 4:** Delete test doc.
- [ ] **Step 5:** Commit: `git commit -m "feat(sanity): add service document with section unions"`

### Task 0.7: Create staticPage document schema

**Files:**
- Create: `src/sanity/schemas/staticPage.ts`

- [ ] Per §6.1. Same section-union approach. Slug is plain string (since these are top-level fixed routes).
- [ ] Commit: `feat(sanity): add staticPage document`

### Task 0.8: Create navigation document schema

**Files:**
- Create: `src/sanity/schemas/navItem.ts` (object) and `src/sanity/schemas/navigation.ts` (singleton document).

- [ ] Per §6.1.
- [ ] Use Studio structure to enforce one nav doc.
- [ ] Commit: `feat(sanity): add navigation document`

### Task 0.9: Add Sanity queries for new types

**Files:**
- Modify: `src/sanity/queries.ts`
- Modify: `src/sanity/types.ts`

- [ ] **Step 1:** Define TS types: `ServiceCategoryData`, `ServiceData`, `StaticPageData`, `NavigationData`, `ContentSection` (discriminated union), `FaqItemData`.
- [ ] **Step 2:** Add `getServiceBySlug(locale, categorySlug, serviceSlug)`, `getCategoryBySlug(locale, slug)`, `getStaticPage(locale, slug)`, `getNavigation(locale)`, `getAllServiceSlugs()` (for `generateStaticParams`), `getAllCategorySlugs()`.
- [ ] **Step 3:** Each query uses GROQ projection per the existing `coalesce(field.${l}, field.uk)` pattern.
- [ ] **Step 4:** Run `npm run dev` and visit a temporary debug page that calls each. Verify shapes.
- [ ] **Step 5:** Commit: `feat(sanity): add queries + types for service/category/staticPage/navigation`

### Task 0.10: SEO helper library

**Files:**
- Create: `src/lib/seo.ts`

- [ ] **Step 1:** Implement `generatePageMetadata({ title, description, ogImage, locale, path, alternates, noindex })` that returns Next.js `Metadata`. Includes hreflang alternates, canonical, OG, Twitter card.
- [ ] **Step 2:** Implement `localizedPath(path, locale)` for hreflang generation.
- [ ] **Step 3:** Use the helper from `src/app/[locale]/page.tsx` `generateMetadata`.
- [ ] **Step 4:** Verify `<head>` rendering on home and one legal page.
- [ ] **Step 5:** Commit: `feat(seo): add generatePageMetadata helper`

### Task 0.11: JSON-LD components

**Files:**
- Create: `src/components/seo/JsonLdMedicalBusiness.tsx`
- Create: `src/components/seo/JsonLdMedicalProcedure.tsx`
- Create: `src/components/seo/JsonLdPhysician.tsx`
- Create: `src/components/seo/JsonLdFAQPage.tsx`
- Create: `src/components/seo/JsonLdBreadcrumbList.tsx`

Each component receives typed props and renders a `<script type="application/ld+json">` tag containing the serialized JSON payload (use Next.js `Script` component with `id` and the JSON string as children, OR a React script tag with stringified inner HTML — content is server-controlled and safe). Document required fields per schema.org spec inside each file as JSDoc.

- [ ] One file per component per task; commit per file.

### Task 0.12: sitemap.ts and robots.ts

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1:** sitemap.ts pulls all `service`, `serviceCategory`, `staticPage`, `legalDoc` documents and emits one URL per locale per page with `alternates: { languages }`.
- [ ] **Step 2:** robots.ts disallows `/studio`, allows everything else, references the sitemap URL.
- [ ] **Step 3:** Visit `/sitemap.xml` and `/robots.txt` locally — verify output.
- [ ] **Step 4:** Commit: `feat(seo): dynamic sitemap and robots`

### Task 0.13: Cache Components revalidation tag plumbing

**Files:**
- Create: `src/lib/revalidation.ts`
- Modify: `src/app/api/revalidate/route.ts`

- [ ] **Step 1:** Define tag helpers: `tagForService(slug)`, `tagForCategory(slug)`, `tagForStaticPage(slug)`, `TAG_GLOBAL`.
- [ ] **Step 2:** Update revalidate route to accept Sanity webhook payload, parse the document type+slug, call `revalidateTag()` for affected tags.
- [ ] **Step 3:** Configure Sanity webhook (in Sanity → API → Webhooks) to POST to the deployed `/api/revalidate` endpoint on every publish; secret verified via header.
- [ ] **Step 4:** Test by editing a doc in Studio, observe revalidation in Vercel logs.
- [ ] **Step 5:** Commit: `feat(cache): tag-based revalidation via Sanity webhook`

### Task 0.14: Slugs / routing helper

**Files:**
- Create: `src/lib/slugs.ts`

- [ ] Export functions: `localizedHref({ locale, path })`, `serviceHref({ locale, categorySlug, serviceSlug })`, `categoryHref({ locale, slug })`. These are the SINGLE source of truth for URL composition site-wide.
- [ ] Commit: `feat(routing): centralized URL composition helper`

### Task 0.15: MegaMenuHeader scaffold

**Files:**
- Create: `src/components/layout/MegaMenuHeader.tsx`
- Create: `src/components/layout/MegaMenuPanel.tsx`
- Modify: `src/app/[locale]/layout.tsx` — replace `<Header />` with `<MegaMenuHeader navigation={nav} />`

- [ ] **Step 1:** Build markup-only header that consumes `NavigationData`. No interactivity yet.
- [ ] **Step 2:** Add Framer-Motion-driven dropdown panel. Hover on desktop, tap on mobile.
- [ ] **Step 3:** Mobile: full-screen overlay, accordion per category.
- [ ] **Step 4:** Handle `clickable === false` parents (no link, only opens dropdown).
- [ ] **Step 5:** Wire to current site by seeding a navigation doc that mirrors the current 4-item menu (no-op visual change).
- [ ] **Step 6:** Manual QA on mobile + desktop.
- [ ] **Step 7:** Commit: `feat(nav): mega-menu header scaffold (visual-only with current items)`

End of Phase 0. Stop here. Roman reviews on `develop` preview URL.

---

## 15. Phase 1 — Templates tasks

Each template task ends with rendering ONE real page in Sanity → real route → visible at preview URL. Stop and review after each.

### Task 1.1: SectionRenderer + first 5 section components

**Files:**
- Create: `src/components/sections/SectionRenderer.tsx` — switch on `_type`, render correct child.
- Create: `src/components/sections/RichTextSection.tsx`
- Create: `src/components/sections/BulletsSection.tsx`
- Create: `src/components/sections/StepsSection.tsx`
- Create: `src/components/sections/IndicationsContraindicationsSection.tsx`
- Create: `src/components/sections/PriceTeaserSection.tsx`

- [ ] One section component per substep. Each is server-rendered, takes typed section props.
- [ ] After all 5 done, commit: `feat(sections): RichText/Bullets/Steps/IC/PriceTeaser renderers`

### Task 1.2: SectionRenderer + remaining 5 section components

**Files:**
- Create: `src/components/sections/CompareTableSection.tsx`
- Create: `src/components/sections/CalloutSection.tsx`
- Create: `src/components/sections/ImageGallerySection.tsx`
- Create: `src/components/sections/RelatedDoctorsSection.tsx`
- Create: `src/components/sections/CtaSection.tsx`

- [ ] Same pattern. Commit: `feat(sections): Compare/Callout/Gallery/RelatedDoctors/Cta renderers`

### Task 1.3: KeyFactsBar component

**Files:**
- Create: `src/components/ui/KeyFactsBar.tsx`

- [ ] Renders the 4-fact bar (procedure length / effect duration / sessions / priceFrom). Icons from existing `Icons` set or new ones if needed.
- [ ] Commit: `feat(ui): KeyFactsBar`

### Task 1.4: TocRail + TocDropdown

**Files:**
- Create: `src/components/ui/TocRail.tsx` — desktop sticky left rail
- Create: `src/components/ui/TocDropdown.tsx` — mobile

- [ ] Generates anchor links from sections[].heading. Highlights on scroll (IntersectionObserver). Smooth-scroll on click.
- [ ] Commit: `feat(ui): table-of-contents rail + dropdown`

### Task 1.5: Breadcrumbs

**Files:**
- Create: `src/components/ui/Breadcrumbs.tsx`
- Uses `JsonLdBreadcrumbList` for SEO.
- Commit: `feat(ui): Breadcrumbs`

### Task 1.6: RelatedServicesGrid + RelatedDoctorsStrip

**Files:**
- Create: `src/components/ui/RelatedServicesGrid.tsx`
- Create: `src/components/ui/RelatedDoctorsStrip.tsx`

Each is a typed presentation component. Commit per file.

### Task 1.7: ServiceDetailTemplate

**Files:**
- Create: `src/components/templates/ServiceDetailTemplate.tsx`

Composes: hero + KeyFactsBar + TocRail/Dropdown + SectionRenderer loop + FAQ + RelatedDoctorsStrip + RelatedServicesGrid + final CTA.

- [ ] Take typed `ServiceData` props.
- [ ] Render `<JsonLdMedicalProcedure>` and `<JsonLdFAQPage>`.
- [ ] Commit: `feat(templates): ServiceDetailTemplate`

### Task 1.8: CategoryHubTemplate

**Files:**
- Create: `src/components/templates/CategoryHubTemplate.tsx`

Composes: hero + intro (richText) + service grid + RelatedDoctorsStrip + FAQ + sibling-categories strip.

- [ ] Commit: `feat(templates): CategoryHubTemplate`

### Task 1.9: StaticPageTemplate

**Files:**
- Create: `src/components/templates/StaticPageTemplate.tsx`

- [ ] Commit: `feat(templates): StaticPageTemplate`

### Task 1.10: Routing — services index + category + service detail routes

**Files:**
- Create: `src/app/[locale]/poslugy/page.tsx`
- Create: `src/app/[locale]/poslugy/[category]/page.tsx`
- Create: `src/app/[locale]/poslugy/[category]/[...slug]/page.tsx`

Each:
- Uses `'use cache'` per Next.js 16 Cache Components.
- `cacheTag(tagForService(slug))` etc.
- `generateStaticParams` from Sanity.
- `generateMetadata` via `generatePageMetadata`.
- Renders the appropriate template.

- [ ] Commit per route. End-state: routing in place; visiting a route renders nothing-found until docs exist.

### Task 1.11: Routing — static pages

**Files:**
- Create: `src/app/[locale]/pro-tsentr/page.tsx`
- Create: `src/app/[locale]/tsiny/page.tsx`
- Create: `src/app/[locale]/statsionar/page.tsx`
- Create: `src/app/[locale]/laboratoriya/page.tsx`
- Create: `src/app/[locale]/kontakty/page.tsx`
- Create: `src/app/[locale]/likari/page.tsx`

Each fetches the matching `staticPage` doc by slug + renders `<StaticPageTemplate>`. Commit per route.

### Task 1.12: Footer expansion

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] Add 4-column footer: About / Послуги (auto-list categories) / Інформація (Стаціонар, Лабораторія, Ціни, Лікарі, Контакти) / Контакти (phone, address, instagram).
- [ ] Commit: `feat(layout): expanded footer with services + info columns`

### Task 1.13: Wire Mega Menu to navigation document

**Files:**
- Modify: `src/components/layout/MegaMenuHeader.tsx`

- [ ] Replace seeded items with full `navigation` doc pulled at request time.
- [ ] Pre-populate the `navigation` doc with the full IA from §5.1 via `scripts/seed-navigation.ts`.
- [ ] Commit: `feat(nav): wire MegaMenu to navigation doc; seed full IA`

End of Phase 1. Stop. Preview URL has full IA, navigation, and templates ready — but no service content yet.

---

## 16. Phase 2 — Per-page content cadence (the long phase)

### 16.1 Loop per page

For each page in priority order (Section 19), one session = one page shipped. The cadence:

1. **Open** the §11.NN spec for the page.
2. **Draft** UA copy meeting the spec (char target, all sections, all FAQs, primary keyword in H1 + first 100 chars).
3. **Translate** UA → RU (idiomatic, not literal). Same char count ±15 %.
4. **Translate** UA → EN (British English). Same char count ±15 %.
5. **Compose** the JSON sidecar at `technical_task/page-drafts/<slug>.json` per §13.
6. **Run** `npx tsx scripts/seed-service.ts <slug>` (or seed-static / seed-category).
7. **Verify** preview URL renders the page with all sections, FAQ, JSON-LD valid, no console errors.
8. **Run** `npm run lint && npm run build` — clean.
9. **Commit:** `content(<slug>): seed UA/RU/EN copy + assets`
10. **Stop.** Share the preview URL with Roman. Wait for go/no-go before next page.

If the page introduces ONE bespoke visual flourish (per §8.4), do it in this same task; if it's a flourish to be reused, lift it to `src/components/ui/` and reference from the design system in §8.3.

### 16.2 Quality gate per page

Before saying "done", verify EACH of:
- [ ] Char count UA in target ±10 %
- [ ] Char count RU within 15 % of UA
- [ ] Char count EN within 15 % of UA
- [ ] Primary keyword appears in H1 (UA, RU, EN equivalents)
- [ ] Primary keyword appears in first 100 chars of body
- [ ] All FAQ questions from spec present, verbatim (UA); RU/EN reasonable equivalents
- [ ] All section headings from spec present
- [ ] ≥ 3 internal links (per §10.2)
- [ ] Meta title ≤ 60 chars; meta description ≤ 155 chars
- [ ] JSON-LD validates (Google Rich Results Test)
- [ ] LCP < 1.8 s on mobile (PageSpeed Insights)
- [ ] No layout shift on hero
- [ ] No console errors / hydration warnings

---

## 17. Phase 3 — Polish tasks (post-content)

### Task 3.1: Doctor profile pages
- [ ] `src/app/[locale]/likari/[slug]/page.tsx` per doctor.
- [ ] Doctor schema gets `slug`, `bio: localeText`, `education: localeStringArray`, `certifications: localeStringArray`.
- [ ] `JsonLdPhysician`.
- [ ] Cross-link from every relevant service.

### Task 3.2: Search / filter on services index
- [ ] Client-side filter by category, body zone, tech.

### Task 3.3: Blog
- [ ] `blogPost` schema, `/blog` index, `/blog/[slug]` route.
- [ ] Author link to doctor profile.

### Task 3.4: Pricing pulled from priceList
- [ ] `priceList` schema.
- [ ] `/tsiny` renders all priceLists.
- [ ] Service detail KeyFactsBar `priceFrom` reads from priceList instead of free-text.

### Task 3.5: Real booking integration
- [ ] Decide Helix / Reservio / custom (out of scope until client decides).

### Task 3.6: Performance audit
- [ ] Vercel Speed Insights review.
- [ ] Image audit — replace any non-`next/image` usages.
- [ ] Bundle audit — `npm run build` analysis.

### Task 3.7: Analytics
- [ ] PostHog or GA4 — events: page_view, cta_click, form_submit, faq_open, service_view, doctor_view.
- [ ] Conversion funnel set up.

---

## 18. Open questions for client (placeholders until answered)

For each: leave `«за консультацією»` / `«уточнюється»` text on page; create a Sanity field but blank.

| # | Question | Affects |
|---|---|---|
| Q1 | Final price list per service — exact UAH ranges or "від X грн" | KeyFactsBar.priceFrom + priceList docs |
| Q2 | License number(s) for medical activity | Footer + About + JSON-LD MedicalBusiness |
| Q3 | Working hours by day | siteSettings.hours, JSON-LD `openingHours` |
| Q4 | Doctor bios + education + certifications | doctor schema (Phase 3) |
| Q5 | Real booking system to integrate | CTA flow (Phase 3) |
| Q6 | Photo bank for: clinic interior, equipment in use, before/after | Hero + ImageGallery sections |
| Q7 | Specific drug brands / dosage protocols stockable | Service.relatedEquipment + body copy facts |
| Q8 | Insurance coverage information (e.g. "чи покриває страхування Check-Up 40") | §11.34 FAQ answer |
| Q9 | Plastic surgery — specific surgeon credentials & hospital affiliation | §11.43 |
| Q10 | Any current promos / discounts | Home FAQ #4 ("Чи є у вас акції?") |
| Q11 | Telegram bot / form endpoint for lead capture | CtaModal POST target |
| Q12 | Privacy policy + terms updates if needed for new content types | /legal/* |

---

## 19. Recommended page priority (Phase 2 build order)

Logic: build the highest-traffic + highest-revenue pages first; build category hubs before their leaves so internal links exist as we go; build longevity cluster as a unit (it converts slowest, needs full ecosystem).

1. **Home** (§11.01) — anchor of the site, links everywhere
2. **Service hubs (parents):** Ін'єкційна (§11.02), Апаратна (§11.13), Лазерна (§11.31)
3. **Hottest commercial pages:** Ботулінотерапія (§11.03), Біоревіталізація (§11.05), Лазерна для жінок (§11.33), Hydrafacial (§11.25)
4. **Sub-hubs:** Апаратна для обличчя (§11.14), Апаратна для тіла (§11.19)
5. **Apparatus stars:** EMFACE (§11.15), Ultraformer MPT (§11.18), EMSCULPT NEO (§11.20)
6. **Static institutional:** Pro tsentr, Stationary (§11.39), Lab (§11.40), Kontakty
7. **Injectables follow-on:** Контурна пластика (§11.04), Мезотерапія (§11.06), Juvederm (§11.11), PRP (§11.07)
8. **Apparatus follow-on:** Volnewmer (§11.16), Exion Face (§11.17), Exion Body (§11.22), Ultraformer Body (§11.21), AcuPulse Face (§11.26), M22 (§11.23), Splendor X (§11.24)
9. **Intimate cluster:** §11.27, §11.28, §11.30
10. **Longevity cluster (build together):** §11.34 → §11.35 → §11.36 → §11.37 → §11.38
11. **Specialty:** Доглядові процедури (§11.41), Подологія (§11.42), Пластична хірургія (§11.43)
12. **Edge cases:** Екзосоми (§11.08), Стовбурові клітини (§11.09), Rejuran (§11.10), PolyPhil (§11.12), Лазерна для чоловіків (§11.32)
13. **Service index:** /poslugy hub (last — needs all categories live)
14. **Pricing:** /tsiny (after price data arrives)
15. **Doctors index + per-doctor pages** (Phase 3)
16. **Blog launch** (Phase 3)

---

## 20. Working agreements

- **Branch:** every commit lands on `develop` only. No exceptions.
- **Cadence:** one page per session in Phase 2. After each page, stop and share preview URL.
- **Preview URL:** `https://genevity-git-develop-roman-kochetovs-projects-83817bac.vercel.app` (auto-generated per push).
- **Sanity:** single dataset `production`. Schema-additive only; never rename a field.
- **Memory/feedback:** if Roman corrects a copy direction or design choice, save to `~/.claude/.../memory/` as a `feedback_*.md` so future sessions don't repeat the mistake.
- **No promotion to main:** until Phase 2 is 100 % complete + Roman approves the full site, `develop` and `main` stay separate. Final cutover via PR review.
- **Verification before completion:** every "done" claim must be backed by `npm run build` + `npm run lint` + manual visit of the preview URL. No "should work".

---

## 21. Self-review checklist

- [x] Spec coverage: every page brief in `technical_task/Завдання на тексти №1.docx` is captured in Section 11. Pages numbered 1-43 (with 29 skipped per source). All 42 active briefs present.
- [x] Site structure: matches `Рекомендації щодо формування структури.docx` — top-level menu, sub-categories, sub-sub-categories, "Soon" placeholder noted.
- [x] No placeholders inside actionable tasks. All open *content* placeholders flagged in Section 18 with explicit "do nothing" guidance.
- [x] Type consistency: schema field names referenced in queries (Task 0.9), templates (Tasks 1.7-1.9), and seed scripts (§13) match the schema definitions in §6.1/6.2.
- [x] Locale code mapping: noted everywhere — app `ua/ru/en` ↔ Sanity `uk/ru/en`. Lookup helper is `lang()` in `src/sanity/queries.ts`.
- [x] Branch policy: reiterated in §2 and §20.
- [x] Decisions D1–D5 from this conversation captured and locked.
- [x] Per-page priority order (Section 19) sequenced for SEO leverage + dependency order (hubs before leaves).

---

## 22. Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-15-genevity-v2-site.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration. Best for Phase 0 (foundation tasks, mostly mechanical) and Phase 1 (templates, well-bounded work).

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Best for Phase 2 (per-page content) since each page benefits from continuity of voice/decisions within a session.

**Recommended split:**
- Phase 0 + Phase 1 → Subagent-Driven
- Phase 2 → Inline Execution, one page per session
- Phase 3 → Subagent-Driven where mechanical, Inline where it touches copy

Tell me which approach to start with and which page (default: Phase 0 Task 0.1).
