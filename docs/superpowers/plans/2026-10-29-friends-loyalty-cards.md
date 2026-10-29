# Friends Loyalty Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An admin issues a 10% or 15% friends card for a named person; the friend adds it to Apple Wallet or Google Wallet from a private link; staff scan the card's QR code and see name, discount and status.

**Architecture:** Pure domain code in `src/lib/loyalty/` (tiers, tokens, URLs, validation, artwork, Apple pass JSON, Google object/JWT), one Postgres table, server actions for the admin, a public add page `/card/<addToken>`, a staff scan page `/admin/scan/<verifyToken>`, and a deny-by-default path gate for a new `frontdesk` role enforced in `src/proxy.ts`. Wallet images are pre-rendered PNGs committed to the repo.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Neon Postgres via `sql` from `@/lib/db/client`, vitest (`npm test`, files `src/**/*.test.ts`), `jose` (already installed), new deps `passkit-generator`, `qrcode`, dev dep `@resvg/resvg-js`.

**Spec:** `docs/superpowers/specs/2026-10-29-friends-loyalty-cards-design.md` (read its "Amendments made while planning" section last; it overrides earlier text). Approved visual preview: `docs/superpowers/specs/assets/2026-10-29-friends-cards-preview.html`.

## Global Constraints

- Work on `develop`; run `git branch --show-current` before every commit; never push `main`. Commit messages end with the attribution line from the session. Do not touch `src/lib/roapp/*`, `src/components/booking/*`, `/booking`.
- Two independent tokens per card: `addToken` and `verifyToken`, each 24 random bytes as base64url (32 chars, regex `^[A-Za-z0-9_-]{32}$`). No sequential public numbers. A token of one kind must never resolve a card for the other kind.
- Tiers: `10` and `15`. 10% card: background `#D6C6B1`, text `#33291F`, label `#5F4F3F`, dark logo `LogoFullDark.svg`. 15% card: background `#1B1714`, text `#F2ECE2`, label `#A89888`, light logo `LogoFullLight.svg`. Symbol marks: `public/brand/LogoDark.svg`, `LogoLight.svg`.
- Card copy (Ukrainian only): eyebrow `Власник картки`, artwork label `ПЕРСОНАЛЬНА ЗНИЖКА`, percentage `−10%` / `−15%` (U+2212) in artwork only, `organizationName` / Google `cardTitle` `GENEVITY`. No card number, no status line, no expiry, no QR caption, no repeated percentage text outside the artwork. Cards never expire.
- Apple: style `storeCard`, only the name in `secondaryFields`, no `primaryFields`, QR (`PKBarcodeFormatQR`) with the verify URL, no `altText`. Google: Generic pass, `subheader` = eyebrow, `header` = name, QR barcode with the verify URL.
- Verify URL base `https://admin.genevity.com.ua` in production, path `/scan/<verifyToken>`; this is baked into issued cards and must not change afterwards. Env: `LOYALTY_VERIFY_BASE_URL`, `LOYALTY_PUBLIC_BASE_URL` (default `https://genevity.com.ua`), `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_PASS_CERT_PEM`, `APPLE_PASS_KEY_PEM`, `APPLE_PASS_KEY_PASSPHRASE`, `APPLE_WWDR_PEM`, `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON`. Missing wallet env must degrade (hide the button / return 503), never crash a page.
- Issue and cancel: `session.role === "admin"` only, re-checked in every server action. Scanning: any logged-in role. `frontdesk` may reach only `/admin/login`, `/admin/scan`, `/admin/scan/<verifyToken>`. Existing roles' access must not change.
- Privacy: `/card/*` and `/admin/scan/*` are `noindex`, `Cache-Control: no-store`, not in the sitemap. Holder names never go to analytics. No secrets, `.p12` or PEM files in the repo.
- New admin copy goes in all three locales of `src/app/(admin)/admin/_i18n/strings.ts`. Client components must not import `@/lib/db/client` (see `src/lib/guards/client-server-boundary.test.ts`).
- Database is shared with production. Applying a migration needs the user's go-ahead. Test cards use holder names starting `TEST` and are cancelled afterwards.

## Review Focus

- Holder names with apostrophes, hyphens, Cyrillic, emoji, `<script>`, 200 characters, whitespace-only: stored trimmed, escaped on every page, rejected when empty or over 80 characters, never break the pass JSON or Google JWT.
- Token crossover and probing: add token on the scan page, verify token on `/card/*` or the pass route, wrong-length and non-base64url tokens all give not-found without querying the DB.
- Revoked card consistency: add page, pass route (410), Google save link (none), scan page (cancelled) agree; revoking twice is harmless.
- Missing wallet configuration on a preview: add page renders with the unavailable button hidden; pass route returns 503; admin issue still works.
- `frontdesk` bypass attempts: `/admin/scan/../forms`, `/admin//forms`, trailing slash, percent-encoded dots, `/api/admin/forms/export`, a server action posted to another admin page, and the `admin.` host rewrite (`/forms` becomes `/admin/forms`). Also: login `next` parameter must not allow open redirects (`//evil.com`, `https://…`, `/\evil`).

---

### Task 1: Domain core (types, tiers, tokens, URLs, validation)

**Files:**
- Create: `src/lib/loyalty/types.ts`, `tiers.ts`, `tokens.ts`, `urls.ts`, `validation.ts`
- Test: `src/lib/loyalty/tokens.test.ts`, `urls.test.ts`, `validation.test.ts`, `tiers.test.ts`

**Interfaces:**
- Produces: `types.ts`: `type Tier = 10 | 15`; `type CardStatus = "active" | "revoked"`; `interface LoyaltyCard { id: string; addToken: string; verifyToken: string; holderName: string; tier: Tier; status: CardStatus; issuedBy: string | null; issuedAt: Date; revokedBy: string | null; revokedAt: Date | null; googleObjectId: string | null }`.
- `tiers.ts`: `TIERS: readonly Tier[]`; `isTier(v: unknown): v is Tier`; `interface TierStyle { background: string; foreground: string; label: string; stripFrom: string; stripTo: string; line: string; lineOpacity: number; numberGradient: [string, string]; logo: "dark" | "light" }`; `TIER_STYLE: Record<Tier, TierStyle>` (10: stripFrom `#D6C6B1`, stripTo `#E6D9C7`, line `#5A4D42`, lineOpacity 0.4, numberGradient `["#4E4137","#33291F"]`, logo dark; 15: stripFrom `#1B1714`, stripTo `#352E28`, line `#E2D5C1`, lineOpacity 0.26, numberGradient `["#FAF9F6","#C4B8AC"]`, logo light; colors from Global Constraints).
- `tokens.ts`: `generateToken(): string`; `isWellFormedToken(s: unknown): s is string`.
- `urls.ts`: `getPublicBase(): string`; `getVerifyBase(): string`; `addPageUrl(addToken: string): string` (`<public>/card/<token>`); `verifyUrl(verifyToken: string): string` (`<verifyBase>/scan/<token>`). No trailing-slash duplication.
- `validation.ts`: `parseIssueInput(raw: { name: unknown; tier: unknown }): { ok: true; name: string; tier: Tier } | { ok: false; error: string }`.

- [ ] **Step 1: Write failing tests**
  - `tokens.test.ts`: `generateToken()` matches `^[A-Za-z0-9_-]{32}$`; 2000 calls are unique; `isWellFormedToken` rejects `""`, 31 chars, 33 chars, `"a".repeat(31)+"="`, `"../".padEnd(32,"a")`, non-strings.
  - `urls.test.ts`: with `LOYALTY_VERIFY_BASE_URL="https://admin.genevity.com.ua/"` (trailing slash) `verifyUrl("T")` is `https://admin.genevity.com.ua/scan/T`; with no env it defaults to that same host; `addPageUrl` defaults to `https://genevity.com.ua/card/<token>`.
  - `validation.test.ts`: `"  Олена   Коваленко "` → `Олена Коваленко`; `"О'Нілл-Коваленко"` accepted; `""`, whitespace-only, 81 chars, a name with `\n` or `\u0000` rejected; tier `"10"`, `10`, `"15"` accepted; `"20"`, `0`, `undefined` rejected; `<b>x</b>` accepted verbatim (escaping is the renderer's job).
  - `tiers.test.ts`: `isTier(10)`, `isTier(15)` true; `isTier("10")` false; both styles define every field.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty` → FAIL (modules missing).
- [ ] **Step 3:** Implement the five files per Interfaces (use `crypto.randomBytes(24).toString("base64url")`; name length counted in characters, min 2 max 80).
- [ ] **Step 4:** `npx vitest run src/lib/loyalty` → PASS.
- [ ] **Step 5:** Commit `feat(loyalty): domain core (tiers, tokens, urls, input validation)`.

---

### Task 2: Migration and database queries

**Files:**
- Create: `scripts/migrations/027_loyalty_cards.sql`, `scripts/run-migration-027.ts` (copy the pattern of `scripts/run-migration-026.ts`), `src/lib/db/queries/loyalty.ts`
- Modify: `src/lib/db/queries/index.ts` only if other queries are re-exported there (follow the existing convention; the guard test forbids client imports of the DB client)

**Interfaces:**
- Consumes: `LoyaltyCard`, `Tier` (Task 1), `generateToken`.
- Produces (all in `queries/loyalty.ts`, server-only): `insertCard(input: { holderName: string; tier: Tier; issuedBy: string }): Promise<LoyaltyCard>`; `getCardById(id: string): Promise<LoyaltyCard | null>`; `getCardByAddToken(token: string): Promise<LoyaltyCard | null>`; `getCardByVerifyToken(token: string): Promise<LoyaltyCard | null>`; `listCards(): Promise<LoyaltyCard[]>` (newest first); `markRevoked(id: string, revokedBy: string): Promise<LoyaltyCard | null>` (only changes an active card; an already revoked card is returned unchanged; unknown id → null); `setGoogleObjectId(id: string, objectId: string): Promise<void>`. Token getters return `null` without querying when `isWellFormedToken` is false.

- [ ] **Step 1:** Write the migration: `loyalty_cards(id uuid primary key default gen_random_uuid(), add_token text not null unique, verify_token text not null unique, holder_name text not null, tier smallint not null check (tier in (10,15)), status text not null default 'active' check (status in ('active','revoked')), issued_by uuid, issued_at timestamptz not null default now(), revoked_by uuid, revoked_at timestamptz, google_object_id text)`. Check `cms_users.id`'s type and whether `cms_users.role` has a CHECK constraint (`grep -rn "cms_users" scripts/migrations`); match `issued_by` to the real id type and, if a role CHECK exists, widen it to include `'frontdesk'` in this same migration.
- [ ] **Step 2:** Write `run-migration-027.ts`. **Do not run it.** Ask the user for a go-ahead first (shared production database); after approval run `npx tsx scripts/run-migration-027.ts` and confirm the table exists.
- [ ] **Step 3:** Implement the query module (map snake_case rows to `LoyaltyCard`; `insertCard` generates both tokens and retries once on unique violation).
- [ ] **Step 4:** `npx tsc --noEmit` passes. After the migration is applied, run a throwaway script (not committed) that inserts a `TEST` card, reads it by both tokens, revokes it twice and confirms the second call leaves `revokedAt` unchanged.
- [ ] **Step 5:** Commit `feat(loyalty): loyalty_cards table and queries`.

---

### Task 3: `frontdesk` role and server-side path gate

**Files:**
- Create: `src/lib/auth/roles.ts`, `src/lib/auth/session-secret.ts`, `src/lib/auth/next-path.ts`, `src/lib/auth/session-edge.ts`, `src/proxy.test.ts`, `src/lib/auth/roles.test.ts`, `src/lib/auth/next-path.test.ts`
- Modify: `src/proxy.ts`, `src/app/(admin)/admin/_actions/auth.ts` (use shared secret helper; login redirect), `src/app/(admin)/admin/login/page.tsx` (carry `next`), `src/app/(admin)/admin/_actions/super.ts:31,90` (role lists), `src/app/(admin)/admin/super/users/_components/users-panel.tsx` (`ROLE_LABELS`, the two `<select>`s), `_components/sidebar.tsx` and `_components/admin-sidebar.tsx` (`Role` type; `ROLE_LEVEL` gains `frontdesk: 0`), `_i18n/strings.ts` (role label text if present)

**Interfaces:**
- Produces: `roles.ts`: `type Role = "admin" | "marketing" | "support" | "frontdesk"`; `ROLE_LEVEL: Record<Role, number>` (admin 3, marketing 2, support 1, frontdesk 0); `canAccessPath(role: string, pathname: string): boolean`. Non-`frontdesk` roles always `true` (unchanged behavior). `frontdesk` is `true` only for exactly `/admin/login`, `/admin/scan`, `/admin/scan/<token matching ^[A-Za-z0-9_-]{32}$>` (optional single trailing slash); anything containing `..`, `//`, `\`, `%`, or `/api/admin` is `false`; unknown role strings are treated as `frontdesk`.
- `session-secret.ts`: `getJwtSecret(): Uint8Array` (same value logic as today: `process.env.CMS_JWT_SECRET || "genevity-cms-dev-secret"`). `auth.ts` uses it.
- `session-edge.ts`: `readSessionRole(cookieValue: string | undefined): Promise<string | null>` (verifies the `cms_session` JWT with `jose`; `null` when absent or invalid).
- `next-path.ts`: `safeNextPath(raw: string | null | undefined): string | null` returns `raw` only when it starts with `/admin/`, has no `//`, `\`, `:` or `..`, else `null`; `afterLoginPath(role: string, next: string | null): string` returns `next` if safe and `canAccessPath(role, next)`, else `/admin/scan` for `frontdesk` and `/admin/dashboard` otherwise.

- [ ] **Step 1: Write failing tests**
  - `roles.test.ts`: frontdesk allowed: `/admin/login`, `/admin/scan`, `/admin/scan/` + 32-char token; denied: `/admin/forms`, `/admin/dashboard`, `/admin/scan/short`, `/admin/scan/../forms`, `/admin//forms`, `/admin/scan/%2e%2e/forms`, `/admin/scan/<token>/x`, `/api/admin/forms/export`, `/admin/loyalty`, `/admin/super/users`; `canAccessPath("support", "/admin/forms")`, `("admin", "/admin/anything")`, `("marketing", "/api/admin/analytics")` all `true`; `canAccessPath("nonsense", "/admin/forms")` false.
  - `next-path.test.ts`: `//evil.com`, `https://evil.com`, `/\evil.com`, `/admin/../x`, `""`, `null` → `null`; `/admin/scan/<token>` kept; `afterLoginPath("frontdesk", "/admin/forms")` → `/admin/scan`; `afterLoginPath("admin", null)` → `/admin/dashboard`.
  - `proxy.test.ts`: build `NextRequest`s with a `cms_session` cookie signed by `getJwtSecret()` for role `frontdesk`: `GET /admin/forms` → status 403; `GET /admin/scan/<token>` → not 403; `GET /api/admin/forms/export` → 403; host `admin.genevity.com.ua` + `/forms` → 403; host `admin.genevity.com.ua` + `/scan/<token>` → not 403; same paths with a `support` cookie → not 403; no cookie → unchanged behavior (not 403).
- [ ] **Step 2:** `npx vitest run src/lib/auth src/proxy.test.ts` → FAIL.
- [ ] **Step 3:** Implement `roles.ts`, `session-secret.ts`, `next-path.ts`, `session-edge.ts`.
- [ ] **Step 4:** Wire `src/proxy.ts`: before the admin-host and `/admin` branches, compute the effective path (on the `admin.` host prefix `/admin` when missing), and when the path is under `/admin` or `/api/admin`, read the session role from the cookie and return `new NextResponse("Forbidden", { status: 403 })` if `!canAccessPath(role, effectivePath)`. Extend `config.matcher` with `"/api/admin/:path*"` so API routes are gated too. Make `/card/*` bypass `intlMiddleware` like `/admin/*` does. Run `grep -rn "getSession\|cms_session" src/app/api` and gate any other session-reading API route the same way.
- [ ] **Step 5:** Update the login flow: login page forwards `?next=` as a hidden field; the login action redirects to `afterLoginPath(role, safeNextPath(next))`. Update `super.ts` role lists, `users-panel.tsx` (new option and label `Рецепція`, description "Лише сканування карток друзів"), sidebar `Role`/`ROLE_LEVEL`.
- [ ] **Step 6:** `npx vitest run` → all PASS (including the client/server boundary test); `npx tsc --noEmit`.
- [ ] **Step 7:** Commit `feat(auth): frontdesk role with deny-by-default path gate`.

---

### Task 4: Artwork and wallet image assets

**Files:**
- Create: `src/lib/loyalty/art.ts`, `src/lib/loyalty/art.test.ts`, `scripts/generate-loyalty-assets.ts`, `scripts/fonts/TenorSans-Regular.ttf`, `scripts/fonts/Mulish-SemiBold.ttf` (OFL fonts from github.com/google/fonts `ofl/tenorsans`, `ofl/mulish`), generated PNGs under `src/lib/loyalty/assets/apple/<10|15>/` and `public/loyalty/`, `src/lib/loyalty/assets.test.ts`
- Modify: `package.json` (devDependency `@resvg/resvg-js`)

**Interfaces:**
- Produces: `art.ts`: `artSvg(opts: { tier: Tier; width: number; height: number }): string` — pure port of the preview's `art()` with no name (gradient background from `stripFrom` to `stripTo`, 30 wave lines masked in from the right, label `ПЕРСОНАЛЬНА ЗНИЖКА` in Mulish 600, `−<pct>%` in Tenor Sans filled with the tier's `numberGradient`; label at y=0.27h, number baseline y=0.76h, sizes 0.075h and 0.4h).
- Files produced by the script: Apple per tier `logo.png` (160×36 pt-scale: `logo.png`, `logo@2x.png`, `logo@3x.png`), `strip.png` / `strip@2x.png` / `strip@3x.png` (375×144 / 750×288 / 1125×432), `icon.png` / `icon@2x.png` / `icon@3x.png` (29 / 58 / 87 px square: symbol mark on the tier background). Google: `public/loyalty/google-hero-<tier>.png` (1032×336), `public/loyalty/google-logo-<tier>.png` (660×660, symbol mark centered on a circle filled `#6B5E51` for 10 and `#3A322B` for 15).

- [ ] **Step 1: Write failing tests**
  - `art.test.ts`: `artSvg({tier:10,width:375,height:144})` contains `−10%`, `ПЕРСОНАЛЬНА ЗНИЖКА`, `viewBox="0 0 375 144"`, font family `Tenor Sans`; tier 15 contains `−15%` and the `#352E28` gradient stop; output is identical on repeated calls; it takes no holder name.
  - `assets.test.ts`: using `sharp(file).metadata()`, every file listed above exists with the exact dimensions.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/art.test.ts` → FAIL.
- [ ] **Step 3:** Implement `art.ts` (copy the geometry from the preview's `art()` function, parameterised by `TIER_STYLE`).
- [ ] **Step 4:** Implement the generator with `@resvg/resvg-js` (`font: { fontFiles: [...], loadSystemFonts: false, defaultFontFamily: "Mulish" }` so a missing font fails visibly instead of silently falling back). Render logos from `public/brand/*.svg`. Run `npx tsx scripts/generate-loyalty-assets.ts`, open `strip@3x.png` and `google-hero-15.png` and check Tenor Sans glyphs (not a fallback serif) and compare against the preview. Then run `npx vitest run src/lib/loyalty` → PASS.
- [ ] **Step 5:** Commit `feat(loyalty): wallet artwork and generated image assets`.

---

### Task 5: Apple pass

**Files:**
- Create: `src/lib/loyalty/apple.ts`, `src/lib/loyalty/apple.test.ts`, `scripts/loyalty-prepare-apple-certs.sh`
- Modify: `package.json` (`passkit-generator`)

**Interfaces:**
- Consumes: `LoyaltyCard`, `TIER_STYLE`, `verifyUrl`, assets from Task 4.
- Produces: `class WalletNotConfiguredError extends Error`; `isAppleConfigured(): boolean`; `buildPassJson(card: LoyaltyCard, cfg: { passTypeIdentifier: string; teamIdentifier: string }): Record<string, unknown>`; `generatePkpass(card: LoyaltyCard): Promise<Buffer>` (throws `WalletNotConfiguredError` when env is missing). `loyalty-prepare-apple-certs.sh <p12> <wwdr.cer>` prints the four base64 env values (uses `openssl pkcs12 -legacy`; key re-encrypted with a passphrase the script asks for; WWDR converted from DER).

- [ ] **Step 1: Write failing tests** (`apple.test.ts`): for a tier-10 card named `Олена Коваленко`: `backgroundColor` `rgb(214,198,177)`, `foregroundColor` `rgb(51,41,31)`, `labelColor` `rgb(95,79,63)`; tier 15 `rgb(27,23,20)` / `rgb(242,236,226)` / `rgb(168,152,136)`; `storeCard.secondaryFields` deep-equals `[{ key: "holder", label: "Власник картки", value: "Олена Коваленко" }]`; no `primaryFields`, `headerFields`, `auxiliaryFields`; `barcodes` is exactly `[{ format: "PKBarcodeFormatQR", message: verifyUrl(card.verifyToken), messageEncoding: "iso-8859-1" }]` with no `altText`; `serialNumber === card.id`; `organizationName === "GENEVITY"`; `passTypeIdentifier`/`teamIdentifier` taken from cfg; a name containing `"` and `\` and emoji survives `JSON.stringify` round-trip. A second test, `describe.skipIf(!process.env.APPLE_PASS_CERT_PEM)`, generates a pkpass and checks the zip contains `pass.json`, `manifest.json`, `signature`, `strip@3x.png`, `logo.png`, `icon.png`.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/apple.test.ts` → FAIL.
- [ ] **Step 3:** Implement with `passkit-generator`'s `PKPass.from` using the per-tier images from `src/lib/loyalty/assets/apple/<tier>/` (read from disk with `fs`; Next must trace them: reference them through `path.join(process.cwd(), …)` and add `outputFileTracingIncludes` for the pass route in `next.config.ts`).
- [ ] **Step 4:** `npx vitest run src/lib/loyalty/apple.test.ts` → PASS; `npx tsc --noEmit`.
- [ ] **Step 5:** Commit `feat(loyalty): apple wallet pass generation`.

---

### Task 6: Google pass

**Files:**
- Create: `src/lib/loyalty/google.ts`, `src/lib/loyalty/google.test.ts`, `scripts/setup-google-wallet-classes.ts`

**Interfaces:**
- Consumes: `LoyaltyCard`, `TIER_STYLE`, `verifyUrl`, `getPublicBase`, `setGoogleObjectId`.
- Produces: `isGoogleConfigured(): boolean`; `genericClassId(issuerId: string, tier: Tier): string` (`<issuer>.genevity_friends_<tier>`); `genericObjectId(issuerId: string, card: LoyaltyCard): string` (`<issuer>.<card.id>`); `buildGenericClass(issuerId: string, tier: Tier): object`; `buildGenericObject(issuerId: string, card: LoyaltyCard): object`; `signSaveJwt(card: LoyaltyCard, creds: { issuerId: string; clientEmail: string; privateKey: string }): Promise<string>`; `createSaveUrl(card: LoyaltyCard): Promise<string | null>` (`null` when not configured; returns `https://pay.google.com/gp/v/save/<jwt>`); `expireObject(card: LoyaltyCard): Promise<void>` (OAuth2 JWT-bearer token with scope `https://www.googleapis.com/auth/wallet_object.issuer`, then `PATCH https://walletobjects.googleapis.com/walletobjects/v1/genericObject/<id>` with `{ state: "EXPIRED" }`; 404 is not an error).

- [ ] **Step 1: Write failing tests** (`google.test.ts`): `buildGenericObject` for a tier-15 card has `state: "ACTIVE"`, `classId` equal to `genericClassId`, `cardTitle.defaultValue.value === "GENEVITY"`, `subheader.defaultValue.value === "Власник картки"`, `header.defaultValue.value === card.holderName`, `hexBackgroundColor === "#1B1714"`, `barcode` `{ type: "QR_CODE", value: verifyUrl(card.verifyToken) }` with no `alternateText`, `heroImage.sourceUri.uri` ending `/loyalty/google-hero-15.png`, `logo.sourceUri.uri` ending `/loyalty/google-logo-15.png`, and no field containing the text `%`. `signSaveJwt` with a key generated by `jose.generateKeyPair("RS256", { extractable: true })`: the JWT verifies with the public key, header `alg` RS256, payload `iss` = client email, `aud` `google`, `typ` `savetowallet`, `origins` includes the public base, `payload.genericObjects[0].id` equals `genericObjectId`. `expireObject` with `vi.stubGlobal("fetch")`: first call to the token endpoint, second a PATCH to the right URL with body `{"state":"EXPIRED"}`; a 404 from PATCH resolves, a 500 rejects.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/google.test.ts` → FAIL.
- [ ] **Step 3:** Implement with `jose` (`SignJWT`, `importPKCS8`); no Google client libraries. Class bodies: `GenericClass` with `id`, `issuerName: "GENEVITY"`, `reviewStatus: "UNDER_REVIEW"`-compatible minimal fields (check current Wallet Objects REST docs for required class fields before finalising).
- [ ] **Step 4:** Write `scripts/setup-google-wallet-classes.ts` (inserts both classes; on 409 patches). It needs real credentials; leave it unrun until the user provides them.
- [ ] **Step 5:** `npx vitest run src/lib/loyalty/google.test.ts` → PASS. Commit `feat(loyalty): google wallet object, save link and expiry`.

---

### Task 7: Admin issuing, list, detail and cancelling

**Files:**
- Create: `src/lib/loyalty/qr.ts`, `src/lib/loyalty/qr.test.ts`, `src/app/(admin)/admin/_actions/loyalty.ts`, `src/app/(admin)/admin/loyalty/layout.tsx` (copy the guard in `super/layout.tsx`: non-admin → redirect), `loyalty/page.tsx`, `loyalty/[id]/page.tsx`, `loyalty/_components/issue-form.tsx`, `loyalty/_components/share-panel.tsx`, `loyalty/_components/revoke-button.tsx`
- Modify: `package.json` (`qrcode`, `@types/qrcode`), `_components/admin-sidebar.tsx` (and `sidebar.tsx` if it is still imported anywhere: `grep -rn "components/sidebar" src`), `_i18n/strings.ts` (`nav.items.loyalty`, a `loyaltyPage` block, all three locales)

**Interfaces:**
- Consumes: Task 1–3 and 5–6 modules, `logChange` from `@/lib/audit`, `requireSession`.
- Produces: `qr.ts`: `qrSvg(text: string): Promise<string>` (SVG string from `qrcode`, error correction `M`, margin 1). Server actions in `_actions/loyalty.ts` (`"use server"`): `issueCard(prev: IssueState, formData: FormData): Promise<IssueState>` where `IssueState = { error?: string }` and success calls `redirect(`/admin/loyalty/${card.id}`)`; `revokeCardAction(id: string): Promise<{ ok: boolean; googleWarning?: string; error?: string }>`. Both start with `requireAdmin()` (throws `Forbidden` unless `session.role === "admin"`). Audit entries: `logChange({ action: "create" | "update", entityType: "loyalty_card", entityId, entityLabel: holderName })`.

- [ ] **Step 1: Write failing tests**: `qr.test.ts`: `qrSvg("https://genevity.com.ua/card/x")` starts with `<svg` and contains a `path`; an `_actions/loyalty.test.ts` with `vi.mock` of `requireSession` and the queries: `issueCard` with a `support` session throws `Forbidden` and inserts nothing; with an admin session and `name=" "` returns `{ error }` and inserts nothing; `revokeCardAction` with an admin session calls `markRevoked` then `expireObject`; when `expireObject` rejects it still returns `{ ok: true, googleWarning: <message> }`.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/qr.test.ts "src/app/(admin)/admin/_actions/loyalty.test.ts"` → FAIL.
- [ ] **Step 3:** Implement `qr.ts` and the actions. After a Google save link exists, `setGoogleObjectId` is called when the card is first saved to Google (the object is created by the save-link JWT, so store the deterministic id at issue time).
- [ ] **Step 4:** Build the pages following the existing admin look (`AdminPageHeader`, tables like `reviews/_components/reviews-table.tsx`). List: name, tier, status, issued date. Issue form: name input + two tier choices. Detail: large share QR of `addPageUrl(card.addToken)`, a copy-link button (client component, `navigator.clipboard` with a selectable-text fallback), card preview image from `public/loyalty`, status, and a two-step cancel button. The cancel area states in Ukrainian that the card disappears from iPhones only when scanned as cancelled, and from Android immediately. Add the sidebar item (admin only, icon `BadgePercent`) and all three locale strings.
- [ ] **Step 5:** `npx vitest run` PASS, `npx tsc --noEmit`, `npm run lint`. Start `npm run dev`, log in as admin, issue a `TEST` card, confirm redirect to the detail page, QR visible, list shows it.
- [ ] **Step 6:** Commit `feat(loyalty): admin issuing, list, detail and cancel`.

---

### Task 8: Staff scan page

**Files:**
- Create: `src/app/(admin)/admin/scan/page.tsx`, `src/app/(admin)/admin/scan/[token]/page.tsx`, `src/lib/loyalty/scan-view.ts`, `src/lib/loyalty/scan-view.test.ts`

**Interfaces:**
- Produces: `scanView(card: LoyaltyCard | null): { kind: "not-found" } | { kind: "active" | "revoked"; name: string; discountLabel: string; issuedOn: string }` (`discountLabel` is `"−10%"`/`"−15%"`; `issuedOn` formatted `dd.mm.yyyy` in `Europe/Kyiv`).

- [ ] **Step 1: Write failing test** (`scan-view.test.ts`): `null` → `not-found`; active tier-10 card → `{ kind: "active", discountLabel: "−10%", name, issuedOn }`; revoked → `kind: "revoked"`; a card issued `2026-12-31T22:30:00Z` formats `01.01.2027`.
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/scan-view.test.ts` → FAIL; implement; → PASS.
- [ ] **Step 3:** `[token]/page.tsx`: `export const dynamic = "force-dynamic"`, `await requireSession()` (an unauthenticated visitor must be sent to `/admin/login?next=<path>`; check how `requireSession` redirects and add the `next` parameter there using `safeNextPath`), `getCardByVerifyToken`, render big name, discount and a green "Активна" or a red full-width "СКАСОВАНО" block; not-found shows "Картку не знайдено". The index page `scan/page.tsx` shows one instruction line and the logout control. Add `robots: noindex` metadata. Strings in Ukrainian.
- [ ] **Step 4:** Manual check in `npm run dev`: logged out → login → returns to the scan page; with a `frontdesk` user (create one in `/admin/super/users`) the scan page works and `/admin/forms` returns 403; a revoked `TEST` card shows the red state.
- [ ] **Step 5:** Commit `feat(loyalty): staff scan page`.

---

### Task 9: Public add page and Apple pass route

**Files:**
- Create: `src/app/(card)/layout.tsx` (use `RootHtml` with `chrome={false}` like `src/app/(admin)/layout.tsx`, `robots: "noindex, nofollow"`), `src/app/(card)/card/[addToken]/page.tsx`, `src/app/api/loyalty/pass/[addToken]/route.ts`, `src/app/api/loyalty/pass/[addToken]/route.test.ts`, `src/lib/loyalty/wallet-buttons.ts`, `src/lib/loyalty/wallet-buttons.test.ts`

**Interfaces:**
- Consumes: Tasks 1, 2, 5, 6.
- Produces: `walletButtonOrder(userAgent: string | null): ["apple", "google"] | ["google", "apple"]` (iPhone/iPad/Mac user agents first Apple; everything else Google first). `GET /api/loyalty/pass/<addToken>`: malformed token or unknown → 404; revoked → 410; Apple not configured → 503; otherwise 200 `application/vnd.apple.pkpass`, `Content-Disposition: attachment; filename="genevity-friends.pkpass"`, `Cache-Control: no-store`.

- [ ] **Step 1: Write failing tests**: `wallet-buttons.test.ts` (iPhone UA → apple first; Android UA → google first; `null` → google first). `route.test.ts` with `vi.mock` of the queries and `apple.ts`: malformed token → 404 and `getCardByAddToken` not called; unknown → 404; revoked → 410; `isAppleConfigured` false → 503; active → 200 with the three headers; a *verify* token passed in the add position → 404 (the mock keyed by add token returns null).
- [ ] **Step 2:** `npx vitest run src/lib/loyalty/wallet-buttons.test.ts src/app/api/loyalty` → FAIL; implement; → PASS.
- [ ] **Step 3:** Build the page (server component, `dynamic = "force-dynamic"`, `noindex`, `Cache-Control: no-store` via `headers` in the route segment config or `next.config.ts` headers for `/card/:path*`): unknown → `notFound()`; revoked → "Картку скасовано" with no buttons; active → the strip artwork for the tier, eyebrow `Власник картки`, the name (React-escaped), then the buttons ordered by `walletButtonOrder(headers().get("user-agent"))`. The Apple button links to `/api/loyalty/pass/<addToken>` (hidden if `!isAppleConfigured()`); the Google button is an `<a>` to `await createSaveUrl(card)` (hidden when `null`). If neither is configured show "Додавання тимчасово недоступне". Never output the verify token anywhere on this page. Confirm `/card/*` is absent from `src/app/sitemap.ts` and add `Disallow: /card/` to `src/app/robots.ts`.
- [ ] **Step 4:** Manual check in `npm run dev`: open the `TEST` card's add link on desktop and in a phone-width window; both button states (configured or not); view source shows no verify token.
- [ ] **Step 5:** Commit `feat(loyalty): public add-to-wallet page and apple pass route`.

---

### Task 10: Credentials, real-device acceptance, release checks

**Files:**
- Modify: `CLAUDE.md` (a short "Loyalty cards" note: env vars, the permanent scan URL, how to issue), nothing else unless a defect is found

This task needs the user: real certificates and phones.

- [ ] **Step 1:** User runs `scripts/loyalty-prepare-apple-certs.sh ~/Documents/genevity-pass.p12 <WWDR .cer>` locally and gives the four values to be stored with `vercel env add` (Preview for `develop`; Production later). The user supplies the Google issuer id and service-account JSON; run `npx tsx scripts/setup-google-wallet-classes.ts`. Add `LOYALTY_VERIFY_BASE_URL` and `LOYALTY_PUBLIC_BASE_URL` for each environment. Google images are only reachable from `https://genevity.com.ua/loyalty/…` once deployed to `main`; until then test Google with `LOYALTY_PUBLIC_BASE_URL` pointing at the preview host (disable preview deployment protection for `/loyalty/*` or test after the merge).
- [ ] **Step 2:** On the `develop` preview: issue a `TEST` 10% and a `TEST` 15% card; add each to a real iPhone and a real Android phone; screenshot all four. Compare with the approved preview. Fix spacing or ordering defects found (Google line order is the known unknown) and re-show the user.
- [ ] **Step 3:** Scan each card from a phone logged in as a `frontdesk` user: name, discount, status shown. Scan while logged out: only the login page, then the card after login. Cancel a card: scan shows red; Google card shows expired.
- [ ] **Step 4:** `npm test && npm run lint && npm run build` all pass. Cancel the `TEST` cards.
- [ ] **Step 5:** Commit `docs: loyalty cards setup notes`. Do not merge to `main`; shipping to `main` is a cherry-pick PR and needs the user's explicit go-ahead at that time (CLAUDE.md).
