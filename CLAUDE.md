# GENEVITY — Medical Longevity Center Website

## Project Overview
Medical clinic website for GENEVITY (Дніпро, Україна). Aesthetic medicine & longevity center.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (CSS-first config in `globals.css`)
- **Animations:** Framer Motion
- **i18n:** next-intl (Ukrainian default, Russian, English)
- **Fonts:** Cormorant Garamond (headings), Montserrat (body) via `next/font/google`

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

### Routing
- All routes under `src/app/[locale]/`
- Locale prefix: `as-needed` (no prefix for default `uk`)
- Sub-pages in `(pages)/` route group
- Path translations defined in `src/i18n/routing.ts`

### Key Directories
```
src/
├── app/[locale]/          # Pages & layouts
│   ├── (pages)/           # Sub-pages (pro-tsentr, poslugy, likari, blog, kontakty)
│   └── globals.css        # Design tokens & typography presets
├── components/
│   ├── layout/            # Header, Footer
│   ├── sections/          # Homepage sections (Hero, Services, FAQ, etc.)
│   └── ui/                # Reusable components (Button, SectionHeader, Icons)
├── i18n/                  # next-intl routing & request config
├── lib/                   # Framer Motion animation presets
└── messages/              # Translation JSON files (uk.json, ru.json, en.json)
```

### Design System
- Colors: `--color-main` (#8B7B6B taupe), `--color-champagne` (#FAF9F6), `--color-rosegold` (#C0CFD5)
- Typography classes: `.heading-1`, `.heading-2`, `.heading-3`, `.body-l`, `.body-strong`, `.body-m`, `.body-s`
- Spacing: section (120px), block (64px), element (32px), card (24px), inner (16px)
- Border radius: buttons (12px), cards (16px), pills (999px)

### Conventions
- All page components are `"use client"` (Framer Motion dependency)
- Translations via `useTranslations()` hook
- Animation presets from `@/lib/motion` (fadeInUp, staggerContainer, viewportConfig)
- Path alias: `@/` → `./src/`
- Ukrainian is the canonical/default language

### Current State
- Homepage: fully built with all sections
- Sub-pages: scaffolded with placeholder content (hardcoded Ukrainian text, not yet i18n-ized)
- Images: all placeholders (no real assets yet)
- No backend/CMS integration
- No Schema.org structured data yet
