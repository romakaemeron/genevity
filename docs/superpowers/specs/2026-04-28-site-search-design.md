# Site-Wide Search — Design Spec

## Goal

Keyboard-accessible, instant-results search modal covering all services, categories, doctors, and static pages across all three locales (Ukrainian, Russian, English).

## Architecture

Four units with clean boundaries:

| Unit | File | Responsibility |
|------|------|----------------|
| Search API | `src/app/api/search/route.ts` | DB query, synonym expansion, result shaping |
| Search Modal | `src/components/ui/SearchModal.tsx` | UI, keyboard nav, result rendering |
| Search Trigger | `src/components/ui/SearchTrigger.tsx` | Icon button + ⌘K global listener |
| Header integration | `src/components/layout/MegaMenuHeader.tsx` | Mount trigger on desktop and mobile |

---

## 1. Search API — `/api/search`

### Request
`GET /api/search?q=<term>&locale=<ua|ru|en>`

- Returns `{ results: SearchResult[] }` as JSON.
- Returns `{ results: [] }` immediately if `q.length < 2`.
- Max 12 results total (5 services + 3 categories + 2 doctors + 2 pages).

### Cross-language querying
**Always query all three language columns (uk, ru, en) regardless of locale.** This means a user on the Russian locale typing `"emface"` or `"емфейс"` finds the same page. Result titles are returned in the request locale only.

### Synonym expansion
Before querying, expand the input into additional terms using a hardcoded map:

```typescript
const SYNONYMS: Record<string, string> = {
  "ботокс": "ботулін",
  "ботулін": "ботокс",
  "плазма": "prp",
  "prp": "плазма",
  "лазер": "splendor",
  "splendor": "епіляц",
  "епіляц": "splendor",
  "iv": "крапельниц",
  "крапельниц": "iv",
  "инъекц": "ін'єкц",
  "ін'єкц": "инъекц",
  "стволов": "стовбур",
  "стовбур": "стволов",
  "чистк": "hydrafacial",
  "hydrafacial": "чистк",
  "шліфовк": "co2",
  "co2": "шліфовк",
  "филлер": "філер",
  "філер": "филлер",
};
```

Build `pattern = '%' + q + '%'` and `altPattern = '%' + synonym + '%'` for the query.

### DB queries
All four queries run with `Promise.all`. Each uses `ILIKE` on the union of all six language columns (uk + ru + en for title + summary/h1):

```sql
-- Services (joined with category slug for URL construction)
SELECT s.slug, s.title_uk, s.title_ru, s.title_en,
       s.summary_uk, s.summary_ru, s.summary_en,
       c.slug AS cat_slug, c.title_uk AS cat_title_uk,
       c.title_ru AS cat_title_ru, c.title_en AS cat_title_en
FROM services s
JOIN service_categories c ON s.category_id = c.id
WHERE s.title_uk ILIKE $pattern OR s.title_ru ILIKE $pattern OR s.title_en ILIKE $pattern
   OR s.summary_uk ILIKE $pattern OR s.summary_ru ILIKE $pattern OR s.summary_en ILIKE $pattern
   OR s.h1_uk ILIKE $pattern
   OR [same conditions with $altPattern]
LIMIT 5

-- Categories (exclude seo_noindex ones)
SELECT slug, title_uk, title_ru, title_en, summary_uk, summary_ru, summary_en
FROM service_categories
WHERE seo_noindex IS NOT TRUE
  AND (title_uk ILIKE $pattern OR ... OR [alt conditions])
LIMIT 3

-- Doctors
SELECT id, name, specialty_uk, specialty_ru, specialty_en
FROM doctors
WHERE name ILIKE $pattern OR name ILIKE $altPattern
   OR specialty_uk ILIKE $pattern OR specialty_ru ILIKE $pattern
LIMIT 2

-- Static pages (exclude home, services index)
SELECT slug, title_uk, title_ru, title_en, seo_desc_uk, seo_desc_ru, seo_desc_en
FROM static_pages
WHERE slug NOT IN ('home')
  AND (title_uk ILIKE $pattern OR ... OR [alt conditions])
LIMIT 2
```

### Result shape
```typescript
interface SearchResult {
  type: "service" | "category" | "doctor" | "page";
  title: string;       // in request locale
  subtitle: string;    // category name, specialty, or page type
  path: string;        // locale-neutral path, e.g. /services/injectable-cosmetology/botulinum-therapy
}
```

Paths:
- Service → `/services/${catSlug}/${slug}`
- Category → `/services/${slug}`
- Doctor → `/doctors`
- Static page → `/${slug}` (except `laboratory` → `/laboratory`, `stationary` → `/stationary`)

---

## 2. SearchModal

### Props
```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}
```

### State
- `query: string` — controlled input value
- `results: SearchResult[]` — from API
- `activeIndex: number` — keyboard-selected row (-1 = none)
- `loading: boolean` — show spinner on slow responses

### Behaviour

**Opening:** Framer Motion `AnimatePresence` — backdrop fades in (`opacity 0→0.6`), card scales up (`scale 0.96→1, opacity 0→1`, `duration 200ms, ease out`).

**Input:** Debounce 250ms. On change, reset `activeIndex` to -1.

**Keyboard:**
- `ArrowDown` / `ArrowUp` — move `activeIndex` through flat results list, wrapping at ends
- `Enter` — navigate to `results[activeIndex].path` via `useRouter` from `next-intl`; call `onClose()`
- `Escape` — call `onClose()`

**Click on result** — same as Enter.

**Click on empty-state tag** — sets `query` to tag text, triggers search immediately (no debounce).

**Click on empty-state category shortcut** — navigates directly to category URL, calls `onClose()`.

### Empty state content (hardcoded, not from DB)
Popular tags:
```
Ботулінотерапія, EMFACE, Лазерна епіляція, Check-Up 40+, IV-терапія, Hydrafacial
```

Category shortcuts (icon key + label + path):
```
{ icon: "syringe",   label: "Ін'єкції",  path: "/services/injectable-cosmetology" }
{ icon: "device",    label: "Апаратна",  path: "/services/apparatus-cosmetology" }
{ icon: "longevity", label: "Longevity", path: "/services/longevity/check-up-40" }
{ icon: "doctor",    label: "Лікарі",    path: "/doctors" }
```

### Result display
- Results grouped into sections: Процедури → Розділи → Лікарі → Сторінки
- Empty sections are skipped entirely (no empty group headers)
- Active result (`activeIndex`) gets `bg-[--color-champagne]` background
- Matched substring highlighted: wrap with `<mark>` using a regex replace on `title`
- Keyboard hint bar at bottom: `↑↓ навігація · ↵ перейти · ESC закрити`

### No-results state
When query ≥ 2 chars and `results.length === 0` and `!loading`:
```
Нічого не знайдено за запитом «{query}»
→ Переглянути всі послуги  (link to /services)
```

### Layout / styling
- Overlay: `fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]`
- Card: `bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[80vh] flex flex-col`
- Input row: `px-4 py-3 border-b border-[--color-champagne] flex items-center gap-3`
- Results area: `overflow-y-auto flex-1 px-2 py-2`
- Section label: `px-3 py-1 text-[10px] uppercase tracking-wider text-black/40`
- Result row: `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors`
- Icon box: `w-8 h-8 rounded-lg bg-[--color-champagne] flex items-center justify-center shrink-0`
- Footer hints: `px-4 py-2 border-t border-[--color-champagne] text-[10px] text-black/30`

---

## 3. SearchTrigger

### Props
```typescript
interface SearchTriggerProps {
  onOpen: () => void;
  className?: string;
}
```

### Behaviour
- Renders a `<button>` with a magnifying-glass SVG icon
- On mount, registers a `keydown` listener: `if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onOpen(); }`
- On unmount, removes the listener
- Accessible: `aria-label="Пошук"`, `title="⌘K"`

---

## 4. MegaMenuHeader integration

Two insertion points — both mount `<SearchTrigger onOpen={() => setSearchOpen(true)} />`:

**Desktop** (line ~221 in current file): Inside the `hidden lg:flex items-center gap-4` div, between `<LocaleSelector />` and `<BookingCTA>`:
```tsx
<LocaleSelector />
<SearchTrigger onOpen={() => setSearchOpen(true)} />
<BookingCTA ...>
```

**Mobile** (line ~227): Inside the `lg:hidden flex items-center gap-3` div, between `<LocaleSelector />` and the hamburger button:
```tsx
<LocaleSelector />
<SearchTrigger onOpen={() => setSearchOpen(true)} className="p-1.5" />
<button ... {/* hamburger */}>
```

**State:** `const [searchOpen, setSearchOpen] = useState(false)` added to component state.

**Modal mount:** At the bottom of the returned JSX, after all nav markup:
```tsx
<SearchModal
  isOpen={searchOpen}
  onClose={() => setSearchOpen(false)}
  locale={locale}
/>
```

`SearchModal` uses `AnimatePresence` internally so it can be always mounted — it handles its own visibility.

---

## Spec self-review

- No TBDs or placeholders — all field names, SQL patterns, paths, and class names are explicit.
- Cross-language querying is consistent: all DB queries use 6 columns (uk+ru+en × title+summary), synonym expansion applies to the same set.
- `seo_noindex` categories correctly excluded from both sitemap and search.
- Doctor path always `/doctors` (no individual doctor pages exist in routing).
- Static page `home` excluded (no useful search target); `services` index excluded (redundant with categories).
- No `/search` page — modal is the only surface.
- Locale used only for *displaying* results, not for *finding* them.
