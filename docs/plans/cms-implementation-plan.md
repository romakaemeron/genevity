# GENEVITY Custom CMS — Implementation Plan

> **Status:** Awaiting database provisioning (Neon Postgres). Once confirmed, begin Phase 1.
> **Estimated timeline:** 4–5 weeks from start.
> **Deploy target:** `admin.genevity.com.ua` (middleware rewrite to `/(admin)` route group)

---

## 0. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (one project)              │
│                                                     │
│  ┌──────────────────┐    ┌────────────────────────┐ │
│  │  Main Website     │    │  Admin CMS              │ │
│  │  /[locale]/*      │    │  /(admin)/*             │ │
│  │  genevity.com.ua  │    │  admin.genevity.com.ua  │ │
│  │                   │    │                         │ │
│  │  Server Components│    │  Server Components +    │ │
│  │  read from DB     │    │  Server Actions write   │ │
│  └────────┬──────────┘    └────────┬────────────────┘ │
│           │                        │                  │
│           └────────┬───────────────┘                  │
│                    │                                  │
│           ┌────────▼────────┐                         │
│           │  src/lib/db/    │                         │
│           │  Shared queries │                         │
│           │  & types        │                         │
│           └────────┬────────┘                         │
└────────────────────┼────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │    Neon Postgres     │
          │    (serverless)      │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │    Vercel Blob       │
          │    (image storage)   │
          └─────────────────────┘
```

### Key Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Hosting | Route group in same Next.js app | Zero CORS, shared types, one deploy |
| Database | Neon Postgres, flat `_uk/_ru/_en` columns | Type-safe, indexable, matches Sanity fields |
| Sections data | JSONB column with `section_type` discriminator | Polymorphic, flexible, matches existing pattern |
| ORM | Drizzle ORM | Type-safe SQL, lightweight, excellent DX |
| Auth | Custom JWT in HTTP-only cookies | Only 2–3 users, no OAuth complexity |
| Images | Vercel Blob upload, next/image optimization on read | Native Vercel, zero pipeline |
| Revalidation | In-process `revalidateTag()` from Server Actions | Same app = no webhook needed |
| UI framework | Tailwind + shadcn/ui primitives | Clean, accessible, consistent with brand |
| Animations | Framer Motion (subtle, non-distracting) | Already in project, premium feel |

---

## 1. Database Schema

### Naming Conventions
- Tables: `snake_case` plural (`services`, `doctors`)
- Columns: `snake_case` with locale suffix (`title_uk`, `title_ru`, `title_en`)
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `{table}_id UUID REFERENCES {table}(id)`
- Timestamps: `created_at`, `updated_at` on every table
- Sort: `sort_order INT` on every orderable entity

### Tables (22 total)

#### Content Entities
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `service_categories` | 5+ category hubs | slug, title_*, summary_*, hero_image, parent_id, seo_* |
| `services` | 30+ service pages | slug, category_id, title_*, h1_*, summary_*, procedure_length_*, price_from_*, seo_* |
| `doctors` | 12 physicians | name_*, role_*, experience_*, specialties_*[], photo_card, photo_full |
| `equipment` | 18 devices | name, category (enum), description_*, suits_*[], results_*[], photo |
| `static_pages` | Home, About, Prices, etc. | slug, title_*, h1_*, summary_*, seo_* |
| `legal_docs` | Privacy, Terms | slug, title_*, body_* |

#### Flexible Content
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `content_sections` | Page sections (polymorphic) | owner_type, owner_id, section_type (enum), data (JSONB), sort_order |
| `faq_items` | FAQ per page | owner_type, owner_id, question_*, answer_*, sort_order |

#### Relations (junction tables)
| Table | Purpose |
|-------|---------|
| `service_doctors` | Which doctors perform which services |
| `service_related` | Related services links |
| `service_equipment` | Which equipment used by which service |

#### Blog (v2)
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blog_categories` | Article categories | slug, title_*, description_*, seo_* |
| `blog_posts` | Articles | slug, category_id, author_id (→doctor), title_*, excerpt_*, body_* (JSONB sections), cover_image, published_at, tags[], seo_* |

#### Singletons (one row each)
| Table | Purpose |
|-------|---------|
| `hero` | Homepage hero content |
| `about` | Homepage about section |
| `site_settings` | Phones, address, hours, social |
| `ui_strings` | UI labels (JSONB blob) |
| `navigation` + `nav_items` | Menu structure |

#### Operations
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `form_submissions` | Lead forms inbox | form_type, name, phone, email, message, service_id, status (enum), page_url |
| `media` | Image library | url (Blob), filename, mime_type, dimensions, alt_text, folder |
| `cms_users` | Admin accounts | email, name, password_hash (bcrypt), role (admin/editor) |
| `cms_sessions` | Active sessions | user_id, token_hash, expires_at |

### Section Types (JSONB `data` structure)

```typescript
// section_type = 'richText'
{ heading: Locale, body: Locale }

// section_type = 'bullets'
{ heading: Locale, items: Locale[] }

// section_type = 'steps'
{ heading: Locale, steps: { title: Locale, description: Locale }[] }

// section_type = 'indicationsContraindications'
{ indicationsHeading: Locale, indications: Locale[], 
  contraindicationsHeading: Locale, contraindications: Locale[] }

// section_type = 'priceTeaser'
{ heading: Locale, intro: Locale, ctaLabel: Locale }

// section_type = 'callout'
{ tone: 'info'|'warning'|'success', body: Locale }

// section_type = 'compareTable'
{ heading: Locale, columns: Locale[], rows: { label: Locale, values: string[] }[] }

// section_type = 'cta'
{ heading: Locale, body: Locale, ctaLabel: Locale, ctaHref: string }

// where Locale = { uk: string, ru: string, en: string }
```

---

## 2. Directory Structure

```
src/
├── app/
│   ├── (admin)/                          # CMS route group
│   │   ├── layout.tsx                    # Admin shell (sidebar + header + auth guard)
│   │   ├── login/
│   │   │   └── page.tsx                  # Login (no sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Stats + recent submissions + quick actions
│   │   ├── services/
│   │   │   ├── page.tsx                  # List (grouped by category, drag-sort)
│   │   │   ├── new/page.tsx              # Create
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Edit (tabs: Content | Sections | SEO | Relations)
│   │   ├── categories/
│   │   │   ├── page.tsx                  # List
│   │   │   └── [id]/page.tsx             # Edit
│   │   ├── doctors/
│   │   │   ├── page.tsx                  # Grid with photos
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx             # Edit
│   │   ├── equipment/
│   │   │   ├── page.tsx                  # List
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx             # Edit
│   │   ├── pages/
│   │   │   ├── page.tsx                  # Static pages list
│   │   │   └── [slug]/page.tsx           # Edit static page
│   │   ├── blog/
│   │   │   ├── page.tsx                  # Posts list
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx             # Edit post
│   │   │   └── categories/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── forms/
│   │   │   ├── page.tsx                  # Inbox (filterable by status)
│   │   │   └── [id]/page.tsx             # Detail + mark actions
│   │   ├── media/
│   │   │   └── page.tsx                  # Library (grid, folders, upload)
│   │   ├── settings/
│   │   │   ├── page.tsx                  # General (phones, hours, address)
│   │   │   ├── navigation/page.tsx       # Menu editor (drag-and-drop)
│   │   │   ├── seo/page.tsx              # Defaults + robots.txt
│   │   │   ├── homepage/page.tsx         # Hero + About singletons
│   │   │   └── users/page.tsx            # User management (admin only)
│   │   └── _components/                  # Admin-only components
│   │       ├── sidebar.tsx               # Fixed left nav
│   │       ├── admin-header.tsx          # Top bar (breadcrumb + user menu)
│   │       ├── translation-tabs.tsx      # UA/RU/EN switcher with completeness dots
│   │       ├── section-builder.tsx       # Drag-and-drop sections editor
│   │       ├── media-picker.tsx          # Image selection modal
│   │       ├── rich-editor.tsx           # Minimal markdown editor
│   │       ├── form-field.tsx            # Labeled input with locale indicator
│   │       ├── data-table.tsx            # Sortable, filterable table
│   │       ├── status-badge.tsx          # Colored status pills
│   │       ├── save-bar.tsx              # Sticky bottom with Save button
│   │       ├── confirm-dialog.tsx        # Delete confirmation
│   │       ├── empty-state.tsx           # "No items yet" placeholder
│   │       ├── stat-card.tsx             # Dashboard metric card
│   │       └── drag-handle.tsx           # Sortable drag indicator
│   │
│   ├── (admin)/_actions/                 # Server Actions
│   │   ├── auth.ts                       # Login, logout, session
│   │   ├── services.ts                   # CRUD + revalidation
│   │   ├── categories.ts
│   │   ├── doctors.ts
│   │   ├── equipment.ts
│   │   ├── static-pages.ts
│   │   ├── blog.ts                       # Posts + categories CRUD
│   │   ├── media.ts                      # Blob upload/delete
│   │   ├── forms.ts                      # Status updates, export
│   │   ├── settings.ts                   # Site settings, nav, SEO
│   │   └── sections.ts                   # Section CRUD (shared)
│   │
│   └── [locale]/                         # Main website (unchanged)
│
├── lib/
│   └── db/
│       ├── client.ts                     # Neon serverless connection
│       ├── schema.ts                     # Drizzle schema definitions
│       ├── migrate.ts                    # Migration runner
│       ├── types.ts                      # Shared types (from sanity/types.ts)
│       └── queries/
│           ├── services.ts               # Replaces sanity/queries getServiceBySlug etc.
│           ├── categories.ts
│           ├── doctors.ts
│           ├── equipment.ts
│           ├── homepage.ts
│           ├── navigation.ts
│           ├── static-pages.ts
│           ├── blog.ts
│           └── forms.ts                  # For website form submission
│
├── middleware.ts                          # Route admin.* → /(admin), auth check
│
└── scripts/
    ├── migrate-from-sanity.ts            # One-time Sanity → Postgres migration
    ├── seed-admin-user.ts                # Create initial admin account
    └── migrations/                       # SQL migration files
        ├── 001_initial_schema.sql
        ├── 002_blog_tables.sql
        └── 003_indexes.sql
```

---

## 3. CMS UI Design Language

### Principles
- **Clean, not sterile.** Warm champagne background (`#FAF9F6`), taupe accents (`#8B7B6B`), soft shadows. Not cold SaaS gray.
- **One action per screen.** List → click → edit. No modals-on-modals.
- **Translation as tabs, not columns.** UA | RU | EN tabs at top. Green/yellow/red dot = complete/partial/empty. Non-technical admins don't need side-by-side.
- **Save means live.** No draft/publish complexity. One "Save" button. Sticky at bottom when form is dirty.
- **Drag to reorder.** Services, sections, FAQ, nav items — all drag-sortable. No manual "order" number fields.
- **Inline preview.** Section builder shows collapsed cards with heading preview. Expand to edit.

### Color Palette (admin)
```
Background:       #FAF9F6 (champagne — same as main site)
Sidebar:          #2A2520 (ink — dark, professional)
Sidebar active:   #8B7B6B (main taupe)
Card background:  #FFFFFF
Border:           #E6E0D6 (line)
Text primary:     #2A2520 (ink)
Text secondary:   #6B6359 (muted)
Accent:           #8B7B6B (main taupe)
Success:          #5A8A6A
Warning:          #C4944A
Error:            #C75050
New badge:        #8B7B6B
```

### Typography (admin)
- Headings: `font-heading` (Tenor Sans) — same as main site
- Body/forms: `font-body` (Mulish) — same as main site
- Monospace (code, slugs): `ui-monospace`

### Component Library (shadcn/ui-inspired, custom-styled)
Build these from scratch using Tailwind + Radix UI primitives:

| Component | Usage |
|-----------|-------|
| `Button` | Primary (taupe bg), Secondary (outline), Ghost, Destructive (red) |
| `Input` | Text, textarea, with floating label |
| `Select` | Single select dropdown |
| `Switch` | Boolean toggles |
| `Tabs` | Translation locale switcher |
| `Badge` | Status pills (new/read/processed) |
| `Card` | Content containers |
| `Table` | Data lists with sort/filter |
| `Dialog` | Confirmations only (delete, discard) |
| `DropdownMenu` | Actions menu (⋯ button) |
| `Toast` | Save success/error notifications |
| `Skeleton` | Loading states |
| `Avatar` | User photos, doctor thumbnails |
| `Tooltip` | Field help text |
| `DragHandle` | Sortable list items |

### Animations (Framer Motion, subtle)
- Page transitions: fade + 8px translateY (200ms)
- Card hover: subtle shadow elevation (150ms)
- Sidebar item: bg-color transition (150ms)
- Toast: slide in from top-right (300ms)
- Section builder: smooth reorder (layout animation)
- Save bar: slide up from bottom (200ms)
- Status badge: scale pulse on new items

---

## 4. Sidebar Structure

```
┌─────────────────────┐
│  ✦ GENEVITY          │  ← Logo + "CMS" badge
│                      │
│  ▸ Dashboard         │  ← Stats, recent forms, quick links
│                      │
│  CONTENT             │  ← Section label
│  ▸ Services      30  │  ← Count badge
│  ▸ Doctors       12  │
│  ▸ Equipment     18  │
│  ▸ Pages          7  │
│  ▸ Blog          —   │  ← "Coming soon" or count
│                      │
│  OPERATIONS          │
│  ▸ Forms        ●3   │  ← Red dot = unread count
│  ▸ Media        142  │
│                      │
│  ─────────────────── │
│  ▸ Settings     ⚙    │
│                      │
│  ─────────────────── │
│  Roman K.        ▾   │  ← User menu (profile, logout)
└─────────────────────┘
```

---

## 5. Key Screens (UX Wireframes)

### Dashboard
```
┌─────────────────────────────────────────────────┐
│ Good morning, Roman                              │
│                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ │ Services  │ │ Doctors  │ │ Forms    │ │ Blog ││
│ │    30     │ │   12     │ │  3 new   │ │  —   ││
│ └──────────┘ └──────────┘ └──────────┘ └──────┘│
│                                                  │
│ Recent Form Submissions                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ ● Гостищева С.О.  Записатися  2 хв тому     │ │
│ │ ● Лемеша У.В.     Записатися  15 хв тому    │ │
│ │ ○ Кабакчей А.Д.   Записатися  вчора         │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Quick Actions                                    │
│ [ + New Service ]  [ + New Doctor ]  [ + Post ]  │
└─────────────────────────────────────────────────┘
```

### Service Editor (Tabbed)
```
┌─────────────────────────────────────────────────┐
│ ← Services / Ін'єкційна косметологія            │
│                                                  │
│ Ботулінотерапія                                  │
│                                                  │
│ ┌─────┬─────┬─────┐                              │
│ │ UA ●│ RU ●│ EN ○│  ← Green = complete          │
│ └─────┴─────┴─────┘                              │
│                                                  │
│ ┌─ Content ──┬─ Sections ──┬─ SEO ──┬─ Links ──┐│
│ │            │             │        │          ││
│ ├────────────┴─────────────┴────────┴──────────┤│
│ │                                              ││
│ │  H1                                          ││
│ │  ┌──────────────────────────────────────────┐││
│ │  │ Ботулінотерапія у Дніпрі — природне...  │││
│ │  └──────────────────────────────────────────┘││
│ │                                              ││
│ │  Summary                                     ││
│ │  ┌──────────────────────────────────────────┐││
│ │  │ Процедура введення ботулотоксину для... │││
│ │  └──────────────────────────────────────────┘││
│ │                                              ││
│ │  Duration        Effect          Sessions    ││
│ │  ┌──────────┐   ┌──────────┐   ┌──────────┐ ││
│ │  │ 15–30 хв │   │ 4–6 міс  │   │ 1 сеанс  │ ││
│ │  └──────────┘   └──────────┘   └──────────┘ ││
│ │                                              ││
│ │  Price From         Price Unit               ││
│ │  ┌──────────┐       ┌──────────────────┐     ││
│ │  │ від 4000 │       │ за зону          │     ││
│ │  └──────────┘       └──────────────────┘     ││
│ │                                              ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │                              [ Save Changes ] │ │
│ └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Section Builder (within Sections tab)
```
┌──────────────────────────────────────────────────┐
│ Sections                            [ + Add ]    │
│                                                   │
│ ┌─ ≡ ── 1. richText ─────────────────── ▾ ── ✕ ┐│
│ │  Що таке ботулінотерапія?                     ││
│ │                                                ││
│ │  Heading  ┌────────────────────────────────┐   ││
│ │           │ Що таке ботулінотерапія?       │   ││
│ │           └────────────────────────────────┘   ││
│ │  Body     ┌────────────────────────────────┐   ││
│ │           │ Ботулінотерапія — це введення  │   ││
│ │           │ ботулотоксину типу А у...      │   ││
│ │           └────────────────────────────────┘   ││
│ └────────────────────────────────────────────────┘│
│                                                   │
│ ┌─ ≡ ── 2. indicationsContraindications ── ▸ ───┐│
│ │  Показання та протипоказання                   ││
│ └────────────────────────────────────────────────┘│
│                                                   │
│ ┌─ ≡ ── 3. steps ──────────────────────── ▸ ───┐│
│ │  Як проходить процедура?                      ││
│ └────────────────────────────────────────────────┘│
│                                                   │
│ ┌─ ≡ ── 4. bullets ───────────────────── ▸ ────┐│
│ │  Переваги ботулінотерапії                     ││
│ └────────────────────────────────────────────────┘│
│                                                   │
│ [ + Add Section ▾ ]                               │
│   ├ Rich Text                                     │
│   ├ Bullet List                                   │
│   ├ Steps Timeline                                │
│   ├ Indications & Contraindications               │
│   ├ Price Teaser                                  │
│   ├ Callout (info/warning)                        │
│   ├ Compare Table                                 │
│   └ CTA Block                                     │
└──────────────────────────────────────────────────┘
```

### Forms Inbox
```
┌──────────────────────────────────────────────────┐
│ Form Submissions                                  │
│                                                   │
│ ┌─ All ─┬─ New (3) ─┬─ Read ─┬─ Processed ─┐    │
│ └───────┴───────────┴───────┴──────────────┘    │
│                                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ ● Гостищева С.О.    +380 67 ...    2 хв     │ │
│ │   Записатися на прийом · Ботулінотерапія     │ │
│ ├──────────────────────────────────────────────┤ │
│ │ ● Лемеша У.В.       +380 50 ...    15 хв    │ │
│ │   Записатися на прийом · Загальна            │ │
│ ├──────────────────────────────────────────────┤ │
│ │ ○ Кабакчей А.Д.     +380 93 ...    вчора    │ │
│ │   Записатися на прийом · EMFACE              │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ [ Export CSV ]                                    │
└──────────────────────────────────────────────────┘
```

### Translation Tabs UX
```
┌─────┬─────┬─────┐
│ UA ●│ RU ●│ EN ○│
└─────┴─────┴─────┘

● Green  = all required fields filled for this locale
◐ Yellow = some fields filled
○ Gray   = empty (no content yet)

Switching tabs:
- Instant swap (no page reload)
- Form state preserved per tab in local state
- Save writes all 3 locales at once
- Char count shown below textarea: "2,340 chars (UA: 2,340 | RU: 2,210 | EN: 2,180)"
```

---

## 6. Phase Breakdown

### Phase 1: Database + Data Layer (3–4 days)

**Goal:** Postgres schema created, data migrated from Sanity, main site reads from DB.

| Step | Task | Files |
|------|------|-------|
| 1.1 | Provision Neon database, get connection string | `.env.local` |
| 1.2 | Install Drizzle ORM + `@neondatabase/serverless` | `package.json` |
| 1.3 | Write SQL migration: `001_initial_schema.sql` | `scripts/migrations/` |
| 1.4 | Write SQL migration: `002_blog_tables.sql` | `scripts/migrations/` |
| 1.5 | Write SQL migration: `003_indexes.sql` | `scripts/migrations/` |
| 1.6 | Create Drizzle schema definitions | `src/lib/db/schema.ts` |
| 1.7 | Create DB client connection | `src/lib/db/client.ts` |
| 1.8 | Rewrite all Sanity queries as SQL (same function signatures + return types) | `src/lib/db/queries/*.ts` |
| 1.9 | Move types from `src/sanity/types.ts` → `src/lib/db/types.ts` | |
| 1.10 | Write Sanity → Postgres migration script | `scripts/migrate-from-sanity.ts` |
| 1.11 | Run migration, verify all 30 services + 12 doctors + 18 equipment + categories + settings | |
| 1.12 | Update all imports: `@/sanity/queries` → `@/lib/db/queries/*` | All page files |
| 1.13 | Update `next.config.ts` remotePatterns for Vercel Blob | |
| 1.14 | Verify every page renders correctly in all 3 locales | Manual testing |
| 1.15 | Remove Sanity deps: `@sanity/*`, `next-sanity`, `sanity.config.ts`, `src/sanity/` | |

**Deliverable:** Main website runs entirely on Postgres. Sanity removed.

---

### Phase 2: Auth + Admin Shell (2–3 days)

**Goal:** Login page, authenticated admin layout with sidebar, empty dashboard.

| Step | Task | Files |
|------|------|-------|
| 2.1 | Create `cms_users` and `cms_sessions` tables | Migration SQL |
| 2.2 | Build auth utilities: hash password, create session, verify session | `src/app/(admin)/_actions/auth.ts` |
| 2.3 | Build login page (email + password, GENEVITY branded) | `src/app/(admin)/login/page.tsx` |
| 2.4 | Build admin layout with auth guard (redirect to login if no session) | `src/app/(admin)/layout.tsx` |
| 2.5 | Build sidebar component (8 items, active state, count badges) | `src/app/(admin)/_components/sidebar.tsx` |
| 2.6 | Build admin header (breadcrumb + user dropdown) | `src/app/(admin)/_components/admin-header.tsx` |
| 2.7 | Build dashboard with stat cards + recent submissions | `src/app/(admin)/dashboard/page.tsx` |
| 2.8 | Update middleware: route `admin.*` → `/(admin)` | `src/middleware.ts` |
| 2.9 | Seed initial admin user (Roman) | `scripts/seed-admin-user.ts` |
| 2.10 | Build shared UI components: Button, Input, Card, Badge, Toast | `src/app/(admin)/_components/` |

**Deliverable:** Admin can log in, see dashboard with real stats, navigate sidebar.

---

### Phase 3: Core Content Editors (5–7 days)

**Goal:** Full CRUD for doctors, equipment, categories, services (including section builder).

| Step | Task | Priority |
|------|------|----------|
| 3.1 | Build `TranslationTabs` component | Critical |
| 3.2 | Build `FormField` component (label + input + locale indicator) | Critical |
| 3.3 | Build `SaveBar` component (sticky bottom, dirty state detection) | Critical |
| 3.4 | Build `DataTable` component (sort, search, actions menu) | Critical |
| 3.5 | Build `MediaPicker` component + Vercel Blob upload action | Critical |
| 3.6 | **Doctors CRUD** — list (photo grid) + create + edit (simplest entity, good first form) | High |
| 3.7 | **Equipment CRUD** — list + create + edit (arrays for suits/results) | High |
| 3.8 | **Service Categories CRUD** — list + edit (with hero image) | High |
| 3.9 | Build `SectionBuilder` component (drag-and-drop, 10 section types) | Critical |
| 3.10 | Build per-section-type editors (richText, bullets, steps, etc.) | Critical |
| 3.11 | **Services CRUD** — list (grouped by category) + create + edit with 4 tabs | High |
| 3.12 | Service → Sections tab with SectionBuilder | High |
| 3.13 | Service → SEO tab (title, description, OG image, noindex) | Medium |
| 3.14 | Service → Relations tab (doctors, related services, equipment pickers) | Medium |
| 3.15 | FAQ editor (inline within service/category/page editors) | Medium |
| 3.16 | Wire revalidation: every save action calls `revalidateTag()` | Critical |

**Deliverable:** All content types editable. Changes reflect on website immediately.

---

### Phase 4: Pages, Blog, Forms, Media (4–5 days)

**Goal:** Static pages, blog system, form inbox, media library.

| Step | Task | Priority |
|------|------|----------|
| 4.1 | **Static Pages editor** — list + edit with section builder | High |
| 4.2 | **Homepage editor** — Hero singleton + About singleton | High |
| 4.3 | **Navigation editor** — drag-and-drop menu items | Medium |
| 4.4 | **Blog Categories CRUD** | Medium |
| 4.5 | **Blog Posts CRUD** — rich editor, cover image, author (doctor), tags, published_at | Medium |
| 4.6 | Blog post editor with section builder (reuse same component) | Medium |
| 4.7 | **Form Submissions inbox** — list with status tabs, detail view | High |
| 4.8 | Form status actions: mark read, mark processed, archive | High |
| 4.9 | Form CSV export | Low |
| 4.10 | **Media Library** — grid view, folder filter, drag-and-drop upload | Medium |
| 4.11 | Media deletion (remove from Blob + DB) | Low |
| 4.12 | Website form submission endpoint → writes to `form_submissions` table | High |

**Deliverable:** Full CMS functionality. Blog ready for v2. Forms captured.

---

### Phase 5: Settings + Polish (3–4 days)

**Goal:** Settings panel, user management, polish interactions.

| Step | Task | Priority |
|------|------|----------|
| 5.1 | **Site Settings editor** — phones, address, hours, Instagram | High |
| 5.2 | **SEO Defaults** — robots.txt editor, default OG image | Medium |
| 5.3 | **User Management** — admin can create/edit/deactivate editor accounts | Medium |
| 5.4 | Loading states (skeletons) for all list views | Medium |
| 5.5 | Error handling + toast notifications on all actions | Medium |
| 5.6 | Auto-save draft to localStorage (restore on revisit) | Low |
| 5.7 | Char count parity indicator on translation tabs | Low |
| 5.8 | Keyboard shortcuts: Cmd+S to save, Escape to close modals | Low |
| 5.9 | Responsive sidebar (collapse to icons on tablet) | Low |
| 5.10 | Final QA: test every CRUD flow, every locale, every section type | Critical |

**Deliverable:** Production-ready CMS. Clean, polished, delightful to use.

---

## 7. Migration Checklist (Sanity → Postgres)

```
[ ] Export all Sanity documents via API
[ ] Map Sanity _id → new UUID (keep reference map)
[ ] Transform localeString { uk, ru, en } → flat _uk, _ru, _en columns
[ ] Transform localeStringArray → TEXT[] columns
[ ] Transform sections arrays → content_sections rows with sort_order
[ ] Transform faq arrays → faq_items rows
[ ] Transform references → UUID foreign keys via ID map
[ ] Re-upload images from Sanity CDN → Vercel Blob
[ ] Update image URLs in all content
[ ] Verify row counts match: categories (5), services (30), doctors (12), equipment (18)
[ ] Verify trilingual content present for all entities
[ ] Verify sections preserved with correct types and order
[ ] Verify FAQ items preserved
[ ] Verify related doctors/services/equipment links
[ ] Verify singleton data: hero, about, site_settings, ui_strings, navigation
[ ] Run main website against Postgres — spot check every page in UA/RU/EN
```

---

## 8. Form Submission Flow (Website → CMS)

```
User fills form on website
        │
        ▼
POST /api/submit-form (Server Action)
        │
        ▼
Validate + sanitize input
        │
        ▼
INSERT into form_submissions (status: 'new')
        │
        ├──► Send Telegram notification to clinic
        │    (bot token + chat ID in env vars)
        │
        └──► Return success response to user
        
Admin opens CMS → Forms
        │
        ▼
Sees new submissions (● red dot on sidebar)
        │
        ▼
Clicks submission → marks as "read"
        │
        ▼
Calls patient → marks as "processed"
```

---

## 9. Blog Architecture (v2)

### Content Model
- **Blog Categories**: slug, title, description, SEO
- **Blog Posts**: slug, title, excerpt, body (section builder — same sections as services), cover image, author (doctor reference), tags[], published_at, SEO

### Routes (main site)
- `/blog` — posts list with category filter
- `/blog/[slug]` — post detail (rendered by section builder, same as service pages)

### CMS Screens
- Blog → Posts list (draft/published filter, search)
- Blog → New Post (section builder + metadata sidebar)
- Blog → Categories (CRUD)

### SEO
- `BlogPosting` JSON-LD schema
- Author links to doctor profile (`Physician` schema)
- Category archive pages with proper canonicals

---

## 10. Security Checklist

- [ ] All CMS routes behind auth middleware (check session cookie)
- [ ] Password hashing with bcrypt (cost factor 12)
- [ ] HTTP-only, Secure, SameSite=Strict cookies
- [ ] CSRF protection via Server Actions (built into Next.js)
- [ ] Rate limiting on login endpoint (5 attempts per minute)
- [ ] Input sanitization on all form fields (DOMPurify for rich text)
- [ ] File upload validation (type whitelist: jpg, png, webp, svg; max 10MB)
- [ ] SQL injection prevention via parameterized queries (Drizzle)
- [ ] Admin-only routes (user management) check role in Server Action
- [ ] No sensitive data in client-side JavaScript
- [ ] Environment variables for all secrets (DB connection, Blob token, Telegram bot)

---

## 11. Environment Variables Needed

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/genevity?sslmode=require

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# Auth
CMS_JWT_SECRET=random-64-char-string

# Telegram notifications (form submissions)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Existing (keep)
NEXT_PUBLIC_SITE_URL=https://genevity.com.ua
```

---

## 12. Success Criteria

- [ ] Clinic admin can log in, edit any service page in UA/RU/EN, save, and see changes on the website within 10 seconds
- [ ] Admin can upload doctor/equipment photos and they appear optimized on the site
- [ ] Admin can add/remove/reorder page sections without developer help
- [ ] Form submissions appear in real-time with Telegram notification
- [ ] Blog posts can be created and published with the same section builder
- [ ] Zero Sanity dependencies remain in the codebase
- [ ] Admin UI feels premium, fast, and intuitive — not like a developer tool
- [ ] All existing website functionality preserved (30 services, 12 doctors, 18 equipment, trilingual, SEO)
