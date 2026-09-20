# Full Price Catalogue — Design

**Date:** 2026-09-21
**Branch:** `develop`
**Status:** approved design, pending implementation plan

## Problem

`/prices` currently shows 34 hand-curated items in 5 flat categories. The
clinic's real catalogue is 575 services. Two consequences:

1. **Coverage.** Whole service lines have no public price at all — AcuPuls
   and Smart XIDE laser resurfacing, видалення новоутворень, M-22
   фотоомолодження, most of УЗД. That is a large amount of long-tail search
   surface the site does not compete for.
2. **Accuracy.** The 34 items were partly hand-entered and have drifted. A
   diff against the clinic's price book found six wrong prices, and only two
   of them are explained by a stale revision — the rest were never correct.

### Provenance of the six mismatches

| Item | Site | Current sheet | Older sheet (`docs/Прайс дженевети (1).xlsx`) | Diagnosis |
|---|---|---|---|---|
| Подологічна обробка 1 кат. | 800 | 1 000 | 800 | stale — missed the 26/06 increase |
| Подологічна обробка 2 кат. | 1 100 | 1 200 | 1 100 | stale — missed the 26/06 increase |
| Пахви (жін.) | 400 | 810 | 810 | never correct — hand-entry error |
| Повне бікіні (жін.) | 950 | 1 540 | 1 540 | never correct — hand-entry error |
| Консультація ендокринолога | 1 100 | 950 (base) | 950 (base) | never matched a sheet |
| Консультація гастроентеролога | 1 100 | 950 (base) | 950 (base) | never matched a sheet |

Because manual entry is demonstrably unreliable at this scale, the imported
spreadsheet becomes the source of truth for prices.

## Source data

`Прайс Геліос-4.xlsx` is the Геліос network price book: 28 sheets, ~11 700
priced rows. Only the first sheet is GENEVITY.

**In scope:** `прайс GENEVITY (Гончара)` — 575 priced items, 8 top-level
categories, ~45 subcategories. Out of scope: all other sheets (Геліос
consultations, lab panels, pediatrics, X-ray, stationary, reproductology,
packages).

Useful columns beyond name and price: **col A** carries the clinic's real
RoApp service ID, **col C** a duration in minutes, **col E** notes such as
`Гармаш С.К.` or `нова послуга 22/06`.

## Data model

```
price_categories      unchanged (8 rows)

price_subcategories   NEW
                      id, category_id FK, slug,
                      label_uk / label_ru / label_en,
                      is_visible, sort_order          (~45 rows)

price_items           + subcategory_id    nullable FK (flat categories have none)
                      + duration          text — one row is "15/30", not an int
                      + roapp_service_id  text — col A
                      + note_uk/ru/en     text — col E
                      + price_numeric     int — structured data + future sorting
                      + is_visible        bool default true
                      + source            'import' | 'manual'
```

`price` stays text. The sheet mixes `1 500`, `950.0` and `10`, and the
display string should survive the round trip untouched; `price_numeric` is
derived at import for schema.org and sorting.

## Import pipeline

One parser module, two entry points: a CLI for the initial seed and an admin
upload for subsequent updates.

**Row classification** derives from the sheet's own shape, so no manual
mapping table is needed:

- col A is 1–8, text in col B, no price → **category**
- text in col B alone, no col A → **subcategory**
- col A is a service ID, text in col B, a price → **item**
- otherwise → skipped

**Diff engine.** Matches rows on `roapp_service_id` where present, falling
back to (category, subcategory, name). Classifies each row as added, price
changed, renamed, or removed, and renders that for confirmation before
anything is written. Removed rows are set `is_visible=false` rather than
deleted, so a mistake in the source file cannot destroy data.

**Translation reuse.** Only new and renamed rows are translated; existing
`name_ru` / `name_en` survive the import. The clinic does not re-pay
translation cost when it bumps prices.

**Conflict rule.** The spreadsheet owns prices, durations and structure. The
database owns translations and visibility. A price edited by hand in admin is
marked `source='manual'` and appears in the next diff as an explicit conflict
rather than being silently overwritten.

**Dependency.** Add `exceljs`. The repo has no spreadsheet reader; hand-rolled
zip/XML parsing is acceptable for a one-off script but not for an upload route.

## Taxonomy decisions

### Consultations — excluded from import

The consultations category keeps its current curated rows and prices. The
sheet's 24 consultation rows (per-doctor variants and online duplicates) are
not imported.

Three consultations present in the sheet but missing from the site are added
manually: **терапевт 900 ₴, невролог 1 000 ₴, репродуктолог 1 100 ₴**.

Ендокринолог and гастроентеролог stay at **1 100 ₴** despite the sheet's 950 ₴
base, per client instruction.

### Category 8 — split, not hidden

The sheet's category 8 bundles three different risk profiles under one
heading. Importing it as one unit and hiding it wholesale would suppress ~53
publishable services to deal with 7 problematic ones. It is therefore split:

| Source subcategory | Destination | Visible |
|---|---|---|
| Нітковий ліфтинг, Ліпофілінг | folded into Ін'єкційна косметологія | yes |
| Пластика, Видалення новоутворень хірургічним шляхом, Smart Lipo | new category **Естетична хірургія** | yes |
| Крапельниці | new category **Крапельниці** | **no** — see below |
| Видалення базально-клітинної карциноми, панч-біопсія, циркумцизія, корекція статевого члена філером, PRP статевого члена | retained under Естетична хірургія | **no** |

The hidden group is oncological, urological and intimate-injection work that
does not belong on a public aesthetic-medicine price list. It is imported with
`is_visible=false` and is one admin toggle from publication.

**Крапельниці is imported hidden.** The category contains exactly one row,
`Крапельниця — 20 000 ₴`, an order of magnitude above comparable services and
most likely a data error. The category and its row are created with
`is_visible=false` so the structure exists and is one admin toggle from
publication once the clinic confirms the correct price — or supplies the full
drip menu this single row appears to stand in for.

### Price corrections applied by the import

Consultations untouched. Everything else takes the sheet as source of truth,
so on first import:

- Пахви (жін.) 400 → **810 ₴**
- Повне бікіні (жін.) 950 → **1 540 ₴**
- Подологічна обробка 1 кат. 800 → **1 000 ₴**
- Подологічна обробка 2 кат. 1 100 → **1 200 ₴**

## Page design

Two-level browse plus instant search, using the spreadsheet's own taxonomy.

**Structure.** Sticky category pills → subcategory accordions carrying item
counts → rows of name · duration · price. Categories with no subcategories
(Подологія) skip the accordion layer and render flat. The first subcategory of
a category opens by default so the page is never empty on arrival.

This is what makes 575 items navigable: Апаратні процедури alone holds ~215
services, which as one flat list is unusable, and as 21 labelled sections is
ordinary.

**Search.** Client-side across all 575 items, debounced, matching name,
subcategory and category. Results group by category with an
`Апаратні › EmFace` breadcrumb so a match is never context-free.

**URL state.** `?c=apparatus&s=ultraformer&q=…` — results are shareable and
the back button behaves.

**Rows** carry a duration badge where the sheet supplies one, and a note badge
for col E attribution. A single CTA sits at the foot of the page; 575 per-row
booking buttons would be noise.

**Accessibility.** Accordions are real `<button aria-expanded>`; search is
`<input type="search">` with a live result count.

## SEO

All categories render into the DOM and are toggled with CSS rather than
conditionally mounted, so every one of the 575 prices is present for indexing
on `/prices`. Each subcategory gets an `id` anchor.

Structured data extends to an `OfferCatalog` of `Offer` nodes built from
`price_numeric` and UAH — a rich-result opportunity for long-tail
"ціна <послуга> дніпро" queries the site does not currently compete for.

The existing PDF download stays.

## Admin

`/admin/pricing` gains two tabs:

- **Import** — upload, diff preview, apply.
- **Catalogue** — paginated, searchable list with per-row save and a
  visibility toggle.

`_components/prices-editor.tsx` is rewritten. It currently loads every
category into a single client form and replaces all rows on save; that is
workable at 34 items and fails at 575.

## Testing

- Parser unit tests against the real file: row classification, the `15/30`
  duration, space-separated prices, category-8 splitting.
- Diff engine tests: add, rename, price change, removal, manual-edit conflict.
- Translation reuse: unchanged names keep their existing ru/en.
- `npm run build`, then a pass over the `develop` preview URL.

## Delivery

All work on `develop`. Nothing here touches RoApp booking (`src/lib/roapp/*`,
`src/components/booking/*`, `/booking`), so the commits stay cherry-pickable
to `main` under the branch policy, on the client's confirmation.

## Out of scope

- Геліос sheets (lab, diagnostics, stationary, reproductology, packages).
- Body-zone faceted filtering. Considered and deferred: it needs per-item zone
  tags that do not exist in the source and would need re-deriving on every
  import. Revisit once the catalogue is live and search behaviour is known.
- Linking price rows to the booking flow via `roapp_service_id`. The ID is
  captured at import so this stays open, but wiring it is booking work and
  belongs on the other side of the client sign-off.
