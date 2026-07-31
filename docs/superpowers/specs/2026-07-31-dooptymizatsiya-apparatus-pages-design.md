# Дооптимізація: apparatus-cosmetology service pages (Inweb ТЗ + Тексти №1)

**Date:** 2026-07-31
**Branch:** `develop`
**Status:** design approved

## Goal

Add the content blocks Inweb's optimisation spec requires to six `apparatus-cosmetology`
service pages, using the RU copy they supplied, translated to UA and EN.

**Sources**
- Spec: `tasks_inweb/genevity.com.ua _ Дооптимізація послуг/genevity.com.ua.html`
- Copy: `tasks_inweb/genevity.com.ua _ Тексти №1 _ Дооптимізація _ 14 000/genevity.com.ua114000.html`
  (~30 000 characters, **RU only** — zero Ukrainian-specific letters in the whole document)

**Target pages** (all exist, all under `apparatus-cosmetology`):
`body`, `splendor-x`, `emsculpt-neo`, `ultraformer-mpt-body`, `exion-body`, `m22-stellar-black`

## Decisions taken

1. **Translate to UA and EN automatically.** UA is the canonical locale and renders
   without a URL prefix, so leaving it empty would be an SEO loss. Machine translation
   via the existing `src/lib/translate.ts`; the client proofreads afterwards.
2. **No "Фото До/Після" blocks.** The copy has a literal `…` placeholder in all six
   places and no images were supplied. Recorded as an open ТЗ item rather than filled
   with stock photography, which on a medical site is worse than an absent block.
3. **Inweb's copy is published as delivered.** We do not rewrite their medical wording
   to inject keywords. Five keywords are genuinely absent and are reported back to them
   (see "Keyword gap").
4. **New sections are appended; existing sections are not rewritten.** The task adds
   blocks to pages that already have content.

## No code changes required

Every block the spec asks for maps onto a section type that already exists in the
`section_type` Postgres enum, in the admin editor (`_components/section-editors.tsx`),
and in `SectionRenderer`:

| Spec block | Section type |
|---|---|
| Підготовка до процедури | `bullets` |
| Рекомендації після процедури | `bullets` |
| Результати за етапами курсу | `bullets` |
| Показання / Протипоказання | `indicationsContraindications` |
| Порівняння методів | `compareTable` |
| Повний прайс по зонах (4 columns) | `compareTable` |
| Проста ціна (label + price) | `priceTable` |
| Коли найкраще робити процедуру | `richText` |

`compareTable` carries the 4-column price tables because `SectionPriceTable` holds only
`{label, price}`. `compareTable` is `{heading, columns[], rows[{label, values[]}]}`,
which is the shape the copy's tables actually have
(`Зона | Линии | Цена (грн) | Продолжительность`).

## Data model

`content_sections(owner_type='service', owner_id, sort_order, section_type, data jsonb)`.
Every localised value inside `data` is an object `{uk, ru, en}`.

**Provenance marker.** Each inserted section carries `data.source = "inweb-tz1"`. The
seed script deletes rows with that marker for the target service before inserting, so
re-running is idempotent and never duplicates or touches hand-authored sections.

**Ordering.** Existing sections keep their `sort_order`. New sections are numbered from
`100` upward, except that any existing `cta` section is pushed to `sort_order = 900` so
the call to action stays last on the page.

**The `body` page is a hub, not a single procedure.** Its copy is three device summaries
(EMSCULPT NEO, Ultraformer MPT, Exion Body), each with its own
Показания/Противопоказания/Результат/Цена, plus one shared preparation-and-aftercare
block. The page already has one `richText` per device, so the new sections interleave:
each device's `indicationsContraindications` and `priceTable` are ordered directly after
that device's existing `richText`, and the shared preparation `bullets` goes last.

## Copy extraction

A single script parses the exported HTML into structured JSON before anything is written,
so the extraction is reviewable on its own and the DB write is mechanical.

Content that must be dropped during extraction:
- the `…` photo placeholders,
- the stray artefact line `3503 сбп` and the trailing `[IMG]` at the end of the `body` section,
- the `№N <url>` page markers.

## Translation

RU → UA and RU → EN, per string, through `src/lib/translate.ts`. Because sections are
short strings and list items rather than article HTML, the existing `translateHeadline`
path fits; `translateHtml` is only needed where a block is `richText`.

Translation output is written into the same JSON artefact as the RU extraction, reviewed,
and only then seeded. A failed translation leaves the field empty rather than falling back
to RU text, so gaps are visible rather than silently bilingual.

## Verification

1. Extraction JSON reviewed against the source document — block counts and table shapes.
2. Seed applied to the database, then the six pages checked on a local dev server:
   every new block renders, tables are not clipped, no empty-section layout breakage.
3. `npx tsc --noEmit` and `npm run build` clean (no code changes expected, so this only
   guards against an accidental edit).
4. Client reviews the six pages on the dev server before anything is considered done.

**Production visibility.** Publishing to the live site is out of scope for this task.
When it happens it needs a production redeploy, because `/api/revalidate` on `main` does
not actually invalidate service pages (documented separately).

## Keyword gap — to report to Inweb

25 of 30 required keywords already appear in the supplied copy (matched with stemming, so
declined forms count). Genuinely absent:

- `emsculpt-neo`: «emsculpt ягодицы», «емс для живота», «emsculpt процедура»
  (the last only as word order — «процедура emsculpt» is present)
- `ultraformer-mpt-body`: «безоперационный smas лифтинг»
- `m22-stellar-black`: «м22 для лица»

## Out of scope

Photo "До/Після" blocks; rewriting Inweb's copy; publishing to production; the other
ТЗ files in `tasks_inweb/`.
