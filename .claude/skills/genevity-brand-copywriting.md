---
name: genevity-brand-copywriting
description: Comprehensive brand, tone of voice, copywriting, and content seeding rules for GENEVITY medical clinic website. Use this skill when writing ANY content for the site — service pages, category hubs, blog posts, UI strings, meta tags, or FAQ.
---

# GENEVITY Brand & Copywriting Skill

## Who is GENEVITY

GENEVITY is a premium longevity and aesthetic medicine center in Dnipro, Ukraine. Address: vul. Olesia Honchara, 12. Founded 2026. Licensed by MOH Ukraine (No. 1296, 14.08.2025). Own clinical diagnostic laboratory on-site.

**What makes GENEVITY unique:**
- **Not a spa, not a hospital** — a longevity center that combines aesthetic medicine with deep diagnostics
- **9 medical directions** under one roof: cosmetology, endocrinology, gynecology, cardiology, urology-andrology, gastroenterology, dermatology, ultrasound diagnostics, podology
- **12 physicians**
- **27 premium devices** — some exclusive / only ones to Ukraine (EMFACE, Ultraformer MPT, VOLNEWMER, etc.)
- **Own laboratory** — 50+ ultrasound types, elastography, InBody body composition analysis
- **Day stationary** — comfortable private rooms for IV therapy, recovery, observation
- **Longevity programs** — Check-Up 40+, hormonal balance, nutraceuticals, IV therapy — the full protocol from diagnostics to maintenance

**Two audience segments:**
1. **Aesthetic seekers** (28–55, women predominantly) — booking specific procedures (Botox, fillers, laser, Hydrafacial). Local intent (Dnipro). Price-compare + trust signals.
2. **Longevity seekers** (35–65, mixed) — health-spans, hormones, comprehensive check-ups. National intent. Higher LTV, longer funnel. Science-oriented.

---

## Brand Voice — Three Words

### EXPERT
Speak like a senior dermatologist who's also a great writer. Knows the science, explains clearly, doesn't lecture. Every claim backed by mechanism ("collagen synthesis" not "magic rejuvenation").

### CALM
No hype, no urgency tricks, no fear-marketing. Quiet confidence. The clinic doesn't chase clients — it earns trust through authority and warmth. Premium brands don't shout.

### PREMIUM
Sells via authority + warmth + clear evidence. Named doctors, specific equipment, transparent process. The text should feel like reading a beautifully designed clinic brochure, not a landing page.

---

## Language Rules

### Prohibited Words & Patterns
- "магічна", "неймовірна", "революційна", "ідеальна", "100% безпечна", "немає протипоказань"
- Fear-marketing: "загроза старіння", "ваша шкіра гине", "поки не пізно"
- Urgency tricks: "тільки сьогодні", "залишилось 3 місця", "знижка закінчується"
- Superlatives without evidence: "найкраща клініка", "перші в Україні" (unless verified)
- Generic filler: "ми дбаємо про вас", "ваше здоров'я — наш пріоритет" (say something specific instead)

### Approved Vocabulary
- "сучасний", "доказовий", "виважений", "прогнозований результат", "індивідуальний підхід"
- "персоналізований протокол", "медичний нагляд", "комплексна діагностика"
- "комфортний", "делікатний", "без періоду відновлення" (only when true)
- Device brand names always in Latin: EMFACE, VOLNEWMER, Ultraformer MPT, EMSCULPT NEO, Hydrafacial Syndeo, Splendor X, M22 Stellar Black, AcuPulse, EXION, InBody
- "GENEVITY" always in Latin, all caps

### Reading Level
- 9th grade Ukrainian equivalent
- Average sentence: 14 words
- Active voice preferred
- Short paragraphs (2–4 sentences max)

---

## Trilingual Rules (UA / RU / EN)

### Quality Bar
All three locales must be equally polished. No "ship UA first, translate later." Each locale is a **native rewrite**, NOT a literal translation.

### Language Specifics
- **UA** (canonical, written first) — perfect grammar, use "ґ" where needed, consistent "и/і" usage
- **RU** — fluent native Russian, NOT transliteration. Idiomatic phrasing. Brand names stay in Latin.
- **EN** — British English (centre, optimise, behaviour). Fluent for international/relocated clients.
- **Char count parity**: all three locales ±15% of each other
- **Locale code mapping**: app uses `ua`, Sanity uses `uk`, BCP 47 requires `uk`

### Common Pitfalls
- UA "процедура" ≠ RU "процедура" always — sometimes RU prefers "методика" or "техника"
- UA "результат" (singular) can be RU "результаты" (plural) — match natural phrasing
- EN medical terms: use the internationally recognized term, not a back-translation from Ukrainian

---

## Content Structure by Page Type

### Service Detail Pages (28 pages)
**Char target:** 3,800–7,300 depending on service complexity

**Standard sections (in order):**
1. **Hero** — H1 + subtitle + KeyFactsBar (duration, effect, sessions, priceFrom)
2. **"Що таке [процедура]?"** — educational intro (unique per service, NO boilerplate duplication)
3. **Показання** — who benefits, bullet list
4. **Протипоказання** — who should not, bullet list (with ⚠ amber style)
5. **"Як проходить процедура?"** — step-by-step timeline
6. **Переваги** — bullet list of benefits
7. **Результати та ефективність** — what to expect, timeline
8. **Вартість** — priceTeaser with CTA (use placeholder until prices confirmed)
9. **Рекомендації після процедури** — aftercare bullets
10. **FAQ** — 3–5 Q&A pairs, questions verbatim from brief
11. **Related doctors** — who performs this procedure
12. **Related services** — 3 related procedures with cards

### Category Hub Pages (6 hubs)
**Char target:** 5,300–5,800

**Sections:**
1. Hero with image (dark variant)
2. "Що таке [категорія]?" — broad intro
3. Переваги категорії
4. Види — listed services with brief descriptions + links
5. Показання та протипоказання (general)
6. How procedures work (general flow)
7. Вартість у Дніпрі
8. FAQ (3–5)
9. Doctors who work in this direction
10. CTA block

---

## SEO Rules (MANDATORY for every page)

1. **H1 contains primary keyword** verbatim (or near-exact) once
2. **First 100 chars of body** include primary keyword once
3. **Every section heading** contains an entity from keyword pool
4. **Density**: Primary keyword 0.6–1.2% of total chars
5. **Internal links**: ≥3 other pages per service (related services + category + doctor)
6. **External links**: Only authoritative (manufacturer site, MOH, WHO). `rel="noreferrer noopener"`
7. **Image alt text**: Descriptive in target locale, includes service name
8. **FAQ questions**: Verbatim from brief — they map to People Also Ask
9. **No duplicate boilerplate** across pages — each "Що таке...?" must be unique

### H1 Formula Library
```
Pattern 1: [Procedure] у Дніпрі — [outcome adjective] [outcome noun]
  → "Ботулінотерапія у Дніпрі — природне розгладження зморшок"

Pattern 2: [Procedure] для [audience/zone] — [unique angle]
  → "Лазерна епіляція для жінок — комфортно та надовго"

Pattern 3: [Brand]: [what it does in 3-5 words]
  → "EMFACE: безін'єкційний ліфтинг обличчя"
```

### Meta Title (≤60 chars)
`[Procedure] в Дніпрі — клініка Genevity`

### Meta Description (≤155 chars)
`[Procedure] у центрі Genevity, Дніпро. [Key benefit + duration]. Запис на консультацію онлайн.`

### Hero Subtitle Pattern
`[Time/sessions]. [Expected result]. [Trust signal].`

---

## Pricing Language

**STATUS**: Real prices exist in the pricing spreadsheet for some services. Others use placeholders.

- When price exists: use `від X грн` format
- When no price: use `«за консультацією»`
- **NEVER invent ranges. NEVER use "від 0 грн" or "договірна"**
- Mid-page priceTeaser text: "Вартість процедури [X] у центрі GENEVITY розраховується індивідуально, після консультації з лікарем. Зв'яжіться з нами — обговоримо ваш випадок та підберемо оптимальний протокол."

---

## CTA Copy
- Primary: "Записатися на консультацію"
- Secondary: "Дізнатися ціну"
- Tertiary: "Зв'язатися з нами"
- Equipment card: "Детальніше"
- Service card: "Дізнатися більше"
- All doctors: "Всі лікарі"

---

## Equipment Knowledge Base

GENEVITY has these premium devices (use exact names):

| Device | Category | What it does |
|---|---|---|
| EMFACE | Face, non-invasive | Simultaneous muscle activation + skin renewal, no injections |
| VOLNEWMER | Face, lifting | Deep heating → collagen production, sharper contour |
| Ultraformer MPT | Face/Body, tightening | Non-surgical SMAS lifting, gradual effect over months |
| EXION | Face/Body, renewal | Monopolar RF + fractional microneedling |
| EMSCULPT NEO | Body, contouring | Electromagnetic muscle stim + RF for tone and fat reduction |
| M22 Stellar Black | Skin, tone | IPL for pigmentation, vascular concerns, even skin tone |
| Splendor X | Laser | Alexandrite + Nd:YAG dual laser for hair removal + vascular |
| Hydrafacial Syndeo | Skin, cleansing | Multi-step deep cleansing, exfoliation, hydration |
| AcuPulse CO₂ | Face/Intimate | Fractional CO₂ laser for resurfacing, scar removal, intimate rejuvenation |
| InBody 270 | Diagnostics | Body composition analysis in 60 seconds |
| GE LOGIQ E10 | Diagnostics | Expert-class ultrasound for comprehensive organ imaging |
| Zemits CryoCool | Skin, recovery | Cryotherapy for post-procedure recovery, pore tightening |
| Zemits Verstand Pro | Skin, care | Professional skincare device |

---

## Doctor Roster

| Name (UA) | Specialty | Experience |
|---|---|---|
| Бєлянушкін Віктор Ігорович | Director, dermatologist, cosmetologist | 20 years |
| Сепкіна Ганна Сергіївна | Dermatologist, cosmetologist | 10 years |
| Макаренко Олександра Сергіївна | Endocrinologist | 8 years |
| Полешко Катерина Володимирівна | Endocrinologist | 13 years |
| Федоренко Світлана Олексіївна | Ultrasound physician | 10 years |
| Єсаянц Анна Олександрівна | Gynecologist | 12 years |
| Мінчук Євгенія Анатоліївна | Gastroenterologist, dietician | 28 years |
| Толстикова Тетяна Миколаївна | Gastroenterologist, dietician | 25 years |
| Лисенко Максим Ігорович | Ultrasound physician | 4 years |
| Петренко Світлана Андріївна | Urologist, andrologist | 4 years |
| Кириленко Анжела В'ячеславівна | Podologist | — |

---

## Sanity Content Architecture

### Content Section Types (used in `sections[]` array)
1. `section.richText` — heading + body (markdown)
2. `section.bullets` — heading + items list
3. `section.steps` — heading + numbered steps with title+description
4. `section.indicationsContraindications` — paired lists
5. `section.priceTeaser` — heading + intro + CTA
6. `section.callout` — tone (info/warning/success) + body
7. `section.compareTable` — heading + columns + rows
8. `section.imageGallery` — heading + images
9. `section.relatedDoctors` — heading + doctor references
10. `section.cta` — heading + body + CTA button

### Service Document Fields
- `title`, `h1`, `slug`, `category` (ref), `summary`
- `procedureLength`, `effectDuration`, `sessionsRecommended`, `priceFrom`, `priceUnit`
- `sections[]` — array of content blocks above
- `faq[]` — question + answer per locale
- `relatedDoctors[]`, `relatedServices[]`, `relatedEquipment[]`
- `seo.title`, `seo.description`

---

## Internal Linking Rules

Every service page must link to:
- Its category hub (via breadcrumb)
- 3 sibling services in same category ("Часто разом з...")
- 1–2 services in adjacent categories (medically related)
- 1–3 doctors who perform it
- Related equipment

Key cross-links (from SEO keyword ownership map):
- Ботулінотерапія ↔ Контурна пластика
- Біоревіталізація ↔ Мезотерапія ↔ Екзосоми
- EMFACE ↔ Ultraformer MPT ↔ VOLNEWMER
- AcuPulse Face ↔ AcuPulse Intimate
- Splendor X ↔ Laser Hair Removal (hub + men + women)
- Check-Up 40+ ↔ Hormonal Balance ↔ Laboratory
- IV-Therapy ↔ Nutraceuticals ↔ Longevity Program

---

## Content Quality Checklist (run before seeding each page)

- [ ] H1 contains primary keyword
- [ ] First 100 chars contain primary keyword
- [ ] All section headings have keyword-relevant entities
- [ ] UA/RU/EN are native rewrites (not translations)
- [ ] Char count within ±15% across locales
- [ ] No prohibited words/patterns used
- [ ] FAQ questions match brief verbatim
- [ ] ≥3 internal links to other pages
- [ ] priceTeaser uses correct placeholder or real price
- [ ] seoTitle ≤60 chars, seoDescription ≤155 chars
- [ ] No duplicate boilerplate from other service pages
- [ ] Tone is expert, calm, premium throughout
- [ ] Reading level: short sentences, active voice, 9th grade

---

## Contact Information (always use these exact values)

- **Address UA**: Дніпро, вул. Олеся Гончара, 12
- **Address RU**: Днепр, ул. Олеся Гончара, 12
- **Address EN**: Dnipro, 12 Oles Honchar St.
- **Phones**: +380 73 000 0150 (Kyivstar), +380 93 000 0150 (Life)
- **Instagram**: @genevity.center
- **Hours**: Пн–Пт 09:00–21:00, Сб 10:00–18:00, Нд за записом
- **Google Maps**: https://maps.google.com/?q=Дніпро,+вул.+Олеся+Гончара,+12
- **License**: МОЗ України, № 1296 від 14.08.2025
