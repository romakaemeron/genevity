# GENEVITY — Medical Longevity Center Website

## 🚨 CRITICAL: BRANCH POLICY — READ BEFORE ANY WORK 🚨

**v2 is now LIVE on `main` / `genevity.com.ua`. Work on `develop`; merge to `main` only with explicit per-merge confirmation.**

- **ALL work happens on the `develop` branch.** Never commit/push directly to `main`.
- `main` is protected on GitHub (direct pushes blocked, PR required, force-push disabled) and auto-deploys to production (`genevity.com.ua`).
- `develop` auto-deploys to a Vercel preview URL (`genevity-git-develop-*.vercel.app`). Use this for everything: content, features, schema changes, experiments.
- Merging `develop` → `main` is allowed via PR, but **treat `main` carefully: ask the user to confirm before each merge** — a merge ships everything on `develop` to production, not just the latest change.
- Before any `git push`, `git commit`, or branch-changing command: verify you are on `develop` with `git branch --show-current`. If it says `main`, STOP and switch.
- Never push directly to `main` (`git push origin main`) — always go through a PR.

**Sanity:** single `production` dataset shared by both branches (intentional — the landing and v2 read the same content). Schema additions are safe since Sanity is schemaless at the API level. If a v2 change would break the live landing, coordinate before merging.

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
