# Friends loyalty cards (Apple Wallet + Google Wallet)

Status: design approved by the user (visual design approved in the preview; this document is awaiting final read-through).
Branch: `develop`. This feature is independent of the RoApp booking work and is a candidate for a cherry-pick PR to `main` later, with per-merge confirmation (see CLAUDE.md).

## Intent

The founder wants to give friends of the clinic a personal discount card that lives in the phone's wallet. There are two kinds: **10%** and **15%**. They are not public: an admin issues each card by hand in the admin panel, for a named person. Staff at the clinic scan the card's QR code and see who the card belongs to and what discount it carries.

The cards must feel premium. That is the point of the feature: it is a gesture, not a loyalty programme.

## Goals

- An admin can issue a card (holder name + 10% or 15%) from the admin panel in under a minute.
- Right after issuing, the admin can either show the friend a QR code on screen (friend scans it with their phone and adds the card) or copy a link and send it remotely.
- The friend can add the card to **Apple Wallet** (iPhone) or **Google Wallet** (Android) from that link.
- Staff scan the QR code on the card with a normal phone camera and see: holder name, discount, status (active or cancelled).
- An admin can cancel a card. A cancelled card shows as cancelled when scanned.
- The two card designs match the approved preview exactly (see "Approved design").

## Non-goals

- No public sign-up, no self-service, no friend accounts.
- No balances, points, visit history, redemption tracking or expiry dates. Cards do not expire.
- No automatic discount in booking or RoApp. Staff apply the discount by hand.
- No push updates to Apple cards already on a phone (that needs an Apple "pass web service"). Cancellation is enforced at the scan page, not on the phone (see "Cancelling").
- No languages other than Ukrainian on the cards and the scan page. The admin UI follows the existing admin language handling.
- No card number, no status line, no expiry on the card face. The user explicitly asked for these to be left out to keep it premium.

## Anti-goals (would make it a failure even if it technically works)

- The scan page shows a friend's name to anyone who scans the QR code. It must not: a photo of a card in a chat must not leak a name to a stranger.
- A guessable card identifier (sequential numbers) that lets someone enumerate cards.
- Cards that look like generic wallet templates: the approved design is the bar.

## Approved design

The approved preview is saved at `docs/superpowers/specs/assets/2026-10-29-friends-cards-preview.html` (open it in a browser). It is the visual source of truth. Summary:

**Two tiers**

| | 10% card | 15% card |
|---|---|---|
| Feel | light, warm champagne, still premium | brand dark, extremely premium |
| Background | `#D6C6B1` (a sandy, brand-brown champagne; still light, tuned to sit close to the brand taupe) | `#1B1714` |
| Main text | `#33291F` | `#F2ECE2` |
| Label text | `#5F4F3F` | `#A89888` |
| Logo | `LogoFullDark.svg` (dark logo) | `LogoFullLight.svg` (light logo) |

**Artwork (strip on Apple, banner on Google).** A soft gradient with fine overlapping wave lines (guilloche-style, faded in from the right), the small label "ПЕРСОНАЛЬНА ЗНИЖКА" in Mulish 600, and the large "−10%" / "−15%" in Tenor Sans. The percentage is part of the image, so it is in the brand font. The friend's name is **not** in the artwork.

**Apple Wallet** (store card): logo top-left, strip image, then the friend's name with the eyebrow label "Власник картки" above it (label 12.5px, regular, muted, no capitals, no letter-spacing, about 4px above the name; name about 20px, regular-to-medium, normal case), then the QR code on a white tile. No other fields. No caption under the QR code.

**Google Wallet** (generic pass): logo + "GENEVITY" at the top, banner image, then the friend's name with the same eyebrow label above it, then the QR code. No status, no number, and no repeated percentage text (the percentage appears only in the banner image).

**Fonts.** Apple and Google only render text in their own system fonts. So the brand fonts (Tenor Sans, Mulish) appear only in images (logo, strip/banner). The name and the eyebrow label are normal wallet text. This was discussed and accepted.

**Real-device check.** The preview is an approximation of the wallet layouts. Exact spacing, text sizes and, for Google, the order of the banner versus text lines must be confirmed on a real iPhone and a real Android phone before the feature is considered done. Google requires a header text line on every generic pass; the intent is that the friend's name takes that role, and if Google forces a different order than the preview shows, the builder adjusts and shows the user.

## How it works

### Two different QR codes (do not confuse them)

1. **Share QR (admin screen only).** After issuing, the admin screen shows a large QR code that encodes the card's *add-to-wallet link*. The friend scans it with their phone camera to open the add page. Used when the friend is in the clinic.
2. **Card QR (on the card in the wallet).** It encodes the card's *verification URL*. Staff scan it.

### Card identifier

Each card has **two separate** random, unguessable tokens (each at least 128 bits, URL-safe, e.g. 22+ characters): an **add token** (used in the add-to-wallet link, which is sent to the friend) and a **verify token** (printed only in the card's QR code). They must be independent: someone who photographs the QR code or sees it in a chat must not be able to reach the add page and read the name. The reverse is not achievable and not needed: whoever holds the add link installs the card and therefore receives the verify token inside it (and the Google save link, a signed JWT, embeds the pass payload including the QR value). That is accepted by design. The verify token opens only the staff-only scan page. There are no sequential public numbers.

### Add-to-wallet page (public, unguessable link)

`https://genevity.com.ua/card/<token>`

Shows the card artwork, the friend's name, and two buttons: "Додати в Apple Wallet" and "Додати в Google Wallet". On iPhone it should lead with Apple, on Android with Google; the other is still reachable. It does not need a login: the link itself is the secret, and it only reveals the friend's own name and discount. If the card is cancelled, the page says so and offers no add buttons. Must be `noindex`, excluded from the sitemap, and not locale-prefixed in a way that breaks sharing. Ukrainian only.

- Apple button downloads the `.pkpass` file (generated and signed on request, MIME type `application/vnd.apple.pkpass`).
- Google button opens a "Save to Google Wallet" link (`https://pay.google.com/gp/v/save/<signed JWT>`).

### Verification (staff scan)

The card QR encodes `https://admin.genevity.com.ua/loyalty/verify/<verify token>` in production (`src/proxy.ts` rewrites every path on the `admin.` host to `/admin/*`, so the page itself lives at `src/app/(admin)/admin/loyalty/verify/[token]`). **This host is permanent once real cards exist**: the URL is baked into the passes, and installed Apple passes cannot be updated. On a Vercel preview there is one host, and the same page is at `/admin/loyalty/verify/<token>`; preview-issued test cards will therefore point at the preview host and are for testing only. It requires a logged-in CMS session with any role (admin, marketing, support, or the new front-desk role below). If the scanner is not logged in they are sent to the login page and returned to the card after login. A non-staff person who scans sees only the login page. The page shows, large and clear: holder name, discount (10% or 15%), status (active or cancelled), and the issue date. A cancelled card is shown in an unmistakable warning style.

The base URL for the QR code is configurable (`LOYALTY_VERIFY_BASE_URL`): `https://admin.genevity.com.ua` in production, the preview origin on `develop` previews.

Staff need a CMS account and a logged-in session on their phone for the scan page to show anything (the session cookie lasts 30 days, see `getSession` in `_actions/auth.ts`). **Front-desk staff do not have accounts yet.** Creating them is part of rollout (the existing Users page at `/admin/super/users`).

### New "front desk" role (decided by the user)

Front-desk staff get a new, narrow role (suggested identifier `frontdesk`, label "Рецепція") that can **only** open the card verification page, the login page and logout. They must not reach form submissions, chats, reviews, content or anything else, because those contain patient data and the phones are not controlled.

Important finding about the existing code: roles are hierarchical (`ROLE_LEVEL` in `sidebar.tsx` and `admin-sidebar.tsx`: admin 3, marketing 2, support 1), and the sidebar only *hides* links. Several admin pages and server actions only check that a session exists (`(admin)/layout.tsx` checks `getSession()` only), so a narrow role cannot rely on the sidebar. The restriction must be **deny-by-default and enforced on the server**: for a `frontdesk` session, every `/admin/*` path and `/api/admin/*` route except an explicit allowlist (login, logout, `/admin/loyalty/verify/*`, static assets the page needs) is refused or redirected, and this must also cover server actions (they post to the page's own path) and API routes. The proxy (`src/proxy.ts`, which already uses `jose` and the session cookie) or a shared guard are the natural places; the choice is the builder's, but an allowlist, not a denylist. Also update: the role validation lists in `_actions/super.ts` (both create and update), the role dropdowns and `ROLE_LABELS` in `super/users/_components/users-panel.tsx`, the `Role` types and `ROLE_LEVEL` maps (a new role must not accidentally rank above `support`), and the sidebar (a `frontdesk` user sees no sidebar, or only the scan entry). Acceptance test: logged in as `frontdesk`, requests to `/admin/forms`, `/admin/chats`, `/admin/dashboard`, `/api/admin/forms/export` and a server action on any other page all fail; the verify page works.

### Admin panel

New section "Картки друзів" (Loyalty cards) in the admin sidebar, **admin role only** (`minRole: "admin"`, and every server action re-checks `session.role === "admin"`; follow the pattern in `_actions/super.ts`).

- **List:** holder name, tier, status, issued date, issued by. Cancelled cards are visible, not deleted.
- **Issue form:** holder name (required, trimmed, reasonable max length) and tier (10% or 15%). After saving, go to the card's detail screen.
- **Card detail:** the share QR (large, for showing to a friend), a "copy link" button, the card preview, status, and a "Cancel card" action (with a confirmation step in the page). Optionally a "reinstate" action (builder's call; see below).
- Every issue and cancel is written to the audit log with `logChange` (`src/lib/audit.ts`).
- Admin UI follows existing admin components and the admin i18n handling in `src/app/(admin)/admin/_i18n`.

### Cancelling

- Cancel sets status to `revoked`, with who and when. The verify page and the add page then show the cancelled state.
- Google: also patch the wallet object so it shows as inactive/expired on the phone (Google supports updating objects through the API).
- Apple: the card stays on the phone unchanged, because updating an installed Apple pass requires a pass web service plus push notifications, which is out of scope. The scan page is the authority. This must be stated plainly in the admin UI next to the cancel button: "Картка зникне не відразу на iPhone, але при скануванні буде позначена як скасована."
- Names can be edited? **No** in v1. To fix a typo the admin cancels and issues a new card (builder's call; keep it simple).

## Data

New table via a new SQL migration in `src/lib/db/migrations/` (next number after `012`), following the existing migration style (Neon Postgres, plain SQL):

`loyalty_cards`: `id` (uuid, pk), `add_token` (text, unique, not null), `verify_token` (text, unique, not null), `holder_name` (text), `tier` (smallint, 10 or 15, check constraint), `status` (text: `active` | `revoked`, default `active`), `issued_by` (cms user id), `issued_at`, `revoked_by`, `revoked_at`, plus whatever the builder needs for Google object bookkeeping (object id). Apple's pass serial number is the card `id`.

Assume the Neon database is **shared** between `develop` previews and production (as the Sanity dataset is). The migration is additive and safe, but any card issued from a preview is a real row in the shared table. Test cards use clearly fake holder names (starting with "TEST") and are cancelled afterwards. The builder applies the migration to the database only with the user's go-ahead.

Queries live under `src/lib/db/queries/` like the existing modules. Keep the `"use client"` / `sql` boundary rule in mind (see `src/lib/guards/client-server-boundary.test.ts`): no client component may import the DB client.

## Wallet integration

### Apple

- Pass style: `storeCard`. Fields: only the name (with the eyebrow as its label) and the barcode. `organizationName`: "GENEVITY". Barcode format `PKBarcodeFormatQR`, message = the verification URL, no `altText`.
- Images per tier: `logo` (the correct light or dark logo), `strip` (artwork, generated per tier, can be generated once per tier and cached). Provide @1x/@2x/@3x PNGs. `icon` is required by Apple and must also be supplied.
- Colors: `backgroundColor`, `foregroundColor`, `labelColor` per tier table above.
- Signing: Pass Type ID certificate, its private key, and Apple's WWDR intermediate certificate. A maintained library such as `passkit-generator` is the suggested route (builder's call).
- The `.pkpass` is generated and signed on request in a server route (Node runtime, not Edge). Secrets come from environment variables.

### Google

- Pass type: Generic. One `GenericClass` per tier (created once via a script, idempotent), and one `GenericObject` per card. Object id derived from issuer id plus card id.
- "Save to Google Wallet" is a signed JWT (RS256, service account key) containing the object (and class on first save), as documented by Google Wallet API. `jose` is already a dependency.
- Colors via `hexBackgroundColor` per tier. Google picks text color itself. Images: `logo` (square, circular crop, so the symbol mark is placed on a colored circle), `heroImage` (banner artwork).
- On cancel, patch the object to inactive/expired.

### Artwork generation

The strip and banner come from the approved preview's artwork function (wave lines, gradient, label, large percentage). Both tiers are fixed, so generate each image once per tier and ship or cache it (builder's call: pre-generated PNG files committed to the repo, or generated at build/first request). Fonts needed in the images: Tenor Sans and Mulish; make sure the fonts are actually available to whatever renders the images (a silent fallback to a default font is the failure to avoid). Sizes: Apple strip 375×144 pt (render @1x, @2x, @3x), Google hero 1032×336 px.

## Logo files

All needed logo files exist in `public/brand/`: the full wordmark logos `LogoFullDark.svg` (dark) and `LogoFullLight.svg` (light), and the symbol-only marks `LogoDark.svg` (`#2D2D2D`) and `LogoLight.svg` (`#FAF9F6`), used for Google's circular logo and the Apple `icon`.

## Build order

The user has confirmed that both developer accounts exist (Apple, belonging to their other clinic; Google Wallet API). It is not known whether the Pass Type ID, the certificates or the service account exist yet, so assume not. Build everything that needs no credentials first: migration, queries, admin screens, add page, verify page, artwork, and the pkpass and Google JWT code behind environment checks. Wallet integration is then the last phase and is tested on real devices once the credentials exist. Real-device acceptance cannot be scheduled until the user provides them (and, for Google, until publishing access is approved; see below).

## Configuration and credentials (needed from the user before real testing)

The user has an Apple Developer account (belonging to their other clinic) and a Google Wallet API setup. Environment variables (production on Vercel; `develop` preview too for testing):

- `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_PASS_CERT` (signing certificate, base64), `APPLE_PASS_CERT_PASSWORD`, `APPLE_WWDR_CERT` (base64)
- `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON`
- `LOYALTY_VERIFY_BASE_URL`

**What the user must create** (the builder gives the user these steps again at the time):

1. *Apple:* in developer.apple.com, Certificates, Identifiers & Profiles, create an Identifier of type **Pass Type IDs** (for example `pass.com.genevity.friends`). Create a **Pass Type ID Certificate** for it using a certificate request made on a Mac in Keychain Access; download it, export it with its private key as a `.p12` file with a password. Note the **Team ID**. Download Apple's **WWDR** intermediate certificate. Creating identifiers requires the Account Holder or Admin role. The team's name is not shown on the card face; `organizationName` ("GENEVITY") is what the pass declares.
2. *Google:* in the Google Pay & Wallet Console, note the **Issuer ID**. In Google Cloud, enable the Google Wallet API, create a **service account**, download its JSON key, and add the service account's email as a user in the Wallet Console. A new issuer is in **demo mode**: only listed test accounts can save passes. Before real friends use it, request **publishing access** in the console for the Generic pass type; Google reviews this and the time is outside our control. Test accounts can be added meanwhile.

## Security and privacy

- Tokens are random and long. Public pages reveal only that card's own name and discount.
- The verify page is behind the CMS session and is not cached publicly (no ISR, `Cache-Control: no-store`).
- `noindex` on `/card/<token>`; not in the sitemap; robots disallow is acceptable but `noindex` is the guarantee.
- Rate-limit or otherwise protect the public add page and pkpass route against token guessing (at minimum, constant-time-ish lookups by token and no information leak between "not found" and "cancelled" beyond what is intended).
- Private keys and certificates only in environment variables, never committed, never logged.
- Holder names are personal data: do not put them in analytics events.

## Constraints from the repository

- Work on `develop`. Never push `main`. This feature does not touch RoApp or `/booking`, so it may later be cherry-picked to `main` through a PR, with the user's confirmation at that moment.
- Next.js 16 App Router, TypeScript strict, Tailwind v4. Admin is under `src/app/(admin)/admin/`. Use existing admin patterns (server actions, `requireSession`, `logChange`).
- Run `npm run build` and `npm run lint` before declaring done.
- New copy is Ukrainian.

## Left to the builder

- Library choices (`passkit-generator` or hand-rolled signing, QR library for the admin share QR).
- How artwork images are produced and stored.
- Exact URL structure and whether the admin host needs special handling for the verify URL.
- Whether "reinstate a cancelled card" exists (default: no).
- Layout details inside the admin screens, as long as they match existing admin styling.
- Test approach: unit tests for token generation, status logic and JWT/pass generation; manual verification on real devices for the wallets.

## Done means

- Both tiers can be issued, added to Apple Wallet on a real iPhone and to Google Wallet on a real Android phone, and look like the approved preview (within what the wallets allow).
- Scanning the card QR as a logged-in staff member shows the name, discount and status; as a logged-out person shows nothing but the login page.
- Cancelling works as described.
- Build and lint pass. The user has seen real screenshots from real devices.

## Amendments made while planning (2026-10-29)

These supersede the earlier text where they differ.

- **Scan URL is shorter and fixed now:** the card QR encodes `https://admin.genevity.com.ua/scan/<verify token>` (the `admin.` host rewrites it to `/admin/scan/<token>`; on a preview it is `/admin/scan/<token>`). It lives outside `/admin/loyalty` because that area is admin-only while scanning must work for every staff role. `/admin/scan` (no token) is a small landing page for front-desk accounts. This URL is baked into issued cards and must not change afterwards.
- **Apple certificate storage:** the `.p12` uses legacy encryption that Node cannot read directly. A script converts it once to PEM files; the environment variables become `APPLE_PASS_CERT_PEM`, `APPLE_PASS_KEY_PEM`, `APPLE_PASS_KEY_PASSPHRASE`, `APPLE_WWDR_PEM` (each base64 of the PEM), plus `APPLE_PASS_TYPE_ID` (`pass.com.genevity.friends`) and `APPLE_TEAM_ID` (`PJL9Y7HXZ8`). The `.p12` itself never goes in the repo or in Vercel.
- **Google images are public files:** Google fetches logo and banner by public HTTPS URL, so they ship as static files in `public/loyalty/` and are referenced by `LOYALTY_PUBLIC_BASE_URL` (default `https://genevity.com.ua`). They only exist on the live site after the feature is deployed to `main`.
- **Add page route:** `/card/<add token>` lives in its own route group with no locale handling; the proxy lets `/card/*` bypass the i18n middleware the way it does for `/admin/*`.
- **Google field mapping:** `subheader` = "Власник картки" (the eyebrow), `header` = the holder's name, `cardTitle` = "GENEVITY".
