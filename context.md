# Aarisha project context

> Single living reference for the project's current state. Maintained per RULES.md §8.1 —
> one shared file for every operating document (RULES.md, UISKILL.md). Change history
> lives in `Changelog.md`, never here.

## Purpose

**Aarisha** is a luxury women's accessories brand storefront. The repository contains:

- A **vanilla-JS marketing and catalogue storefront** (`frontend/index.html` + `frontend/styles.css` + `frontend/script.js`) presenting brand story, category collections, featured items, social imagery, and contact details in a **deep forest green + antique gold** visual system ("Heritage Gold & Forest" v3, see `DESIGN.md`) built around a gold **Rani ki Vav (stepwell) monument line-art backdrop** with a cursor line-glow.
- A **FastAPI catalogue API** (`backend/app/main.py`) backed by **Supabase (Postgres)**, serving products, category listings, and WhatsApp order drafts.
- A **cart drawer** on the storefront whose only ordering path is a WhatsApp deep link generated server-side.

The frontend is static, but product data, stock, and order-draft pricing all come from the API.

## Quick start

Full setup and deployment instructions live in `README.md`. Summary:

1. Create a Supabase project and run `supabase-schema.sql` in its SQL editor.
2. Copy `backend/.env.example` to `backend/.env` and set every value.
3. Run the API from `backend/` (`.env` is read relative to the working directory):

   ```powershell
   python -m uvicorn app.main:app --reload   # API at http://127.0.0.1:8000
   ```

4. Serve **`frontend/`** with any static server (e.g. `python -m http.server 5500` inside `frontend/`) — the storefront calls `http://127.0.0.1:8000` when the hostname is `localhost`/`127.0.0.1`. Port 5500 matches the default CORS allowlist (`ALLOWED_ORIGINS`, defined in `main.py` `Settings`; `.env` can override it).

API docs are at `http://127.0.0.1:8000/docs` while the API runs. On Vercel the API is served same-domain under `/api` and the frontend auto-detects it (see "Architecture").

## Technology

| Area | Implementation |
| --- | --- |
| Frontend markup | Semantic HTML5 in `frontend/index.html` |
| Styling | Plain CSS (`frontend/styles.css`) with custom properties, responsive media queries, animations, and inline SVG ornaments/icons; no framework |
| Frontend interaction | Vanilla JavaScript in `frontend/script.js` |
| Fonts | Google Fonts: **Bodoni Moda** (display/headings) + **Manrope** (body/labels) |
| API | FastAPI (`backend/app/main.py`), served locally by uvicorn, on Vercel via `api/index.py` (mounted under `/api`) |
| Database | Supabase Postgres via the REST API (`/rest/v1/...`), using the server-side service-role key |
| Auth | None — no user accounts; all API routes are public |
| External services | Supabase (data), WhatsApp (`wa.me`) deep links, Google Sheets API v4 (customer roster sync via service account) |
| Dependencies | `backend/requirements.txt` (Vercel: `api/requirements.txt`): fastapi, uvicorn, httpx, pydantic-settings, email-validator, google-auth |
| Operating docs | `RULES.md` (agent rules), `UISKILL.md` (UI/UX & motion manual), `DESIGN.md` (design system — v3), `Changelog.md` (change log) |

## Repository structure

```text
The-aarisha/
├── frontend/                # ALL static frontend files live here (v3 migration)
│   ├── index.html           # Storefront: nav, hero, collections, featured, about, why, insta, contact, footer, modal, cart drawer
│   ├── styles.css           # Design tokens, layout, motion, components, responsive rules
│   ├── script.js            # Storefront behavior: API fetch, reveal, modal, cart, WhatsApp order, backdrop glow
│   ├── Logo.png             # Brand logo (footer, favicon)
│   ├── necklace.jpeg        # Collection-card cover — Neck Pieces
│   ├── bracelets.jpeg       # Collection-card cover — Bracelets
│   ├── earrings.jpeg        # Collection-card cover — Earrings
│   ├── rings.jpeg           # Collection-card cover — Rings
│   └── placeholder.svg      # Fallback for missing/broken product images
├── context.md               # This guide
├── DESIGN.md                # Frontend design system reference (v3 "Heritage Gold & Forest")
├── RULES.md                 # Agent operating rules
├── UISKILL.md               # UI/UX & motion design operating manual
├── README.md                # Setup + deployment instructions
├── supabase-schema.sql      # DB schema: products table, category constraint, performance indexes, RLS policies (mirrors root supabase_production.sql)
├── vercel.json              # Rewrites: /api/* → api/index.py; other root paths → /frontend/*
├── .gitignore               # Ignores .env, .env.*, backend/.env, venvs, and secrets
├── .env                     # Local/root environment configuration (gitignored)
├── api/
│   ├── index.py             # Vercel entrypoint: mounts the catalogue app under /api, serves frontend/ files
│   └── requirements.txt     # Vercel dependency manifest (mirrors backend/requirements.txt)
└── backend/
    ├── requirements.txt
    ├── .env                 # Backend environment configuration (gitignored)
    ├── .env.example         # Documented environment template (never commit populated .env)
    └── app/
        ├── __init__.py
        └── main.py          # FastAPI app: settings, public product routes, WhatsApp link
```

> v2 records `NEW_DESIGN.md` and `IMPLEMENTATION_PLAN.md` were deleted during the v3
> migration (2026-08-11); `DESIGN.md` now carries the v3 content. The admin portal
> (`frontend/admin.html`), its backend auth stack, and dead assets were removed on
> 2026-08-12 (see `Changelog.md`).

### Asset-status note

The Git index previously tracked `Earrings/`, `Rings/`, and `Bracelets/` product-photo folders at the repo root, but they are **absent from the current working tree**. The storefront now renders catalogue products from the API, and `script.js` swaps any failed image to `placeholder.svg`; the Instagram grid is explicitly set to placeholders (`instaImages.fill('placeholder.svg')`). Restore the folders (or re-point product images in Supabase to hosted URLs) to show real photography. Note: the four collection-card cover images in `frontend/` (`necklace.jpeg`/`bracelets.jpeg`/`earrings.jpeg`/`rings.jpeg`) are real photos and are not affected by this gap.

## Feature list

### Implemented
- **v3 "Heritage Gold & Forest" design (Stitch migration, 2026-08-11)**: deep forest green (`#1B3428` canvas, `#00180e` deepest) + antique gold (`#C9A24B`) + warm ivory plaques; Bodoni Moda + Manrope; full-page restyle of nav, hero (mirror frame + brand headline), step-well divider, category grid, footer, modal, and cart drawer.
- **Fixed heritage backdrop**: one full-screen gold Rani ki Vav **monument line-art** layer behind every section at low rest opacity (0.12) with an edge vignette. The artwork is a highly detailed perspective view of the stepwell (processed from the owner's reference drawing `Gemini_Generated_Image_jgukn1jgukn1jguk.png` to a gold-on-transparent PNG `frontend/monument-lineart.png`) showing ornate columns, galleries, descending steps, and a surveyor figure.
- **Cursor line-glow**: a drop-shadowed glow copy of the artwork is masked to the cursor via rAF-throttled `--glow-x/--glow-y` (~240px window) so the **lines themselves emit light** (not a radial light source); touch/keyboard devices get a 9s ambient pulse; `prefers-reduced-motion` renders a static raised motif instead.
- Nav with three-part layout (**brand left, links centre, icon actions right** — explicit `grid-column` placement), sticky blur + gold hairline after 80px scroll; cart icon in the nav carries the live count badge. Nav links: Collections / Heritage / Testimonials / Contact. Below 900px the links collapse into a full-screen hamburger menu (brand left, ☰ + 🛍 right) with focus management and Escape/link-click close; the placeholder Search/Account icon buttons hide below 600px so the brand, hamburger, and cart stay uncrowded. Nav links and the brand close any open overlay (modal/menu/cart) before scrolling, so they work from the product section too.
- Hero: Ornate baroque gold mirror frame (`mirror-frame.png`), "Anti Tarnish Fine Jewellery" eyebrow, "The Aarisha" display headline, italic tagline, and a prominent radiant Antique Gold jewel CTA ("Explore Collections") featuring a 4.5s specular light shimmer, an ambient breathing golden halo, and a dynamic arrow hover drift.
- Scrolling "Step-Well" divider (three descending gold lines) as the section break.
- Four collection cards (Neck Pieces, Bracelets, Earrings, Rings) as ivory plaques with an offset gold frame and hover lift, opening the full-screen product modal. Each card's cover image is a real product photograph (`necklace.jpeg`/`bracelets.jpeg`/`earrings.jpeg`/`rings.jpeg`); `placeholder.svg` is only the fallback for broken images.
- Catalogue loaded live from the API: "Reflecting you" featured strip (`GET /products`, cards with Add to Cart + Order on WhatsApp) and category modal (`GET /products/{category}`).
- Cart drawer: session-scoped (`sessionStorage`), quantity +/- controls, remove, live count badge, scrim overlay. Adding to cart triggers vivid tactile feedback (button ripple, "Added ✓" state with gold shimmer), a floating product image jewel that glides in a parabolic arc to the cart icon, a burst of 12 radial architectural golden lines and ring shockwave encircling the cart icon, cart badge bump, and an elevated luxury plaque toast notification ("Added to Cart", `role="status"` + `aria-live`) that auto-dismisses after ~2.8s. All motion respects `prefers-reduced-motion: reduce`.
- **Order on WhatsApp**: POSTs cart items to `/orders/whatsapp-link`, opens the generated `wa.me` draft, clears the cart on success. Product cards also have a per-product **Order on WhatsApp** button that POSTs just that item (quantity 1) without touching the cart. No payment/checkout exists.
- **Google Sheets Customer Sync**: When an order is placed (both single items and cart), customer details (`Customer Name` and `Phone No.`) are asynchronously synchronized to a connected Google Sheet (`GOOGLE_SPREADSHEET_ID`) using Google Sheets API v4 via a Service Account (`service_account.json` or `GOOGLE_SERVICE_ACCOUNT_JSON`). Concurrency-safe and prevents duplicate entries by normalizing and matching against core mobile digits (last 10 digits). Runs non-blocking via FastAPI `BackgroundTasks` so WhatsApp ordering is never delayed.
- Reveal-on-scroll animations (`.reveal`, `.reveal-left`, `.reveal-right`) via IntersectionObserver with sibling stagger.
- About / brand-story section (signature line + three "mirror"-themed story paragraphs), Testimonials section (five 5-star reviews from Indian/Gujarati customers), Instagram placeholder grid, contact section (visible; form remains a non-functional placeholder).
- Footer: three-column grid (brand + logo, links, contact with phone numbers), flare divider, social icons.
- Supabase schema with RLS (`products` readable publicly; service-role key used server-side).

### In-progress / known gaps
- Contact form is visible but non-functional (prevents default submit; no backend). Social links are `href="#"` placeholders.
- Instagram grid renders real posts when `INSTAGRAM_ACCESS_TOKEN` is configured (`GET /instagram/posts`, cached 10 min), otherwise placeholder tiles. All Instagram references link to `https://www.instagram.com/the.aarisha_/`.
- Product photography folders missing from the working tree (see Asset-status note).

### Planned / not built
- No product detail page, payments, order recording, stock management UI, or customer accounts.

## Architecture

### Data flow
```
Browser (storefront)
   │  fetch()  ──►  API base
   │                ├─ local:    http://127.0.0.1:8000
   │                └─ deployed: {origin}/api   (Vercel rewrite → api/index.py → mounted catalogue app)
   ▼
FastAPI app  ──►  Supabase REST (/rest/v1/products)
   │                (service-role key, server-side only)
   ├─ POST /orders/whatsapp-link builds a wa.me deep link with server-side prices
   └─ BackgroundTask ──► Google Sheets API v4 (appends unique [Name, Phone] to Sheet1)
```

- **API base detection** (in `script.js`): if `location.hostname` is `127.0.0.1` or `localhost`, use `http://127.0.0.1:8000`; otherwise use `${location.origin}/api`.
- **Static serving on Vercel**: `vercel.json` rewrites `/api/(.*)` to the function and `/(.*)` to `/frontend/$1`, so all non-API root paths (including `/`, `/index.html`, `/styles.css`, `/script.js`, `/Logo.png`, `/placeholder.svg`) resolve into `frontend/`. `api/index.py` keeps FastAPI fallback routes that serve the same files from `frontend/`.
- **Secrets** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BRAND_WHATSAPP_NUMBER`, `INSTAGRAM_ACCESS_TOKEN`, `GOOGLE_SPREADSHEET_ID`, `service_account.json` / `GOOGLE_SERVICE_ACCOUNT_JSON`) live only in backend env vars / `.env` — never in browser code.
- **CORS**: allowlist from `ALLOWED_ORIGINS` (default `http://127.0.0.1:5500,http://localhost:5500`).
- **WhatsApp flow**: the order phone number never appears in page source; the browser only receives a `wa.me` deep link from the API. (Support phone numbers shown in the footer come from the Stitch design export and are not the WhatsApp ordering number.)

### API routes (FastAPI, `backend/app/main.py`)
- `GET /health`
- `GET /products` — all products, newest first
- `GET /products/{category}` — category = `rings | necklaces | bracelets | earrings`
- `POST /orders/whatsapp-link` — validates items against live stock/prices, returns a WhatsApp draft URL
- `GET /instagram/posts` — recent Instagram media (Basic Display API, token-gated, 10-min in-memory cache); empty list when unconfigured or on upstream error

## Key conventions & patterns

- **Design tokens** live in `:root` in `frontend/styles.css` (colors, fonts, easing curves). Change brand colors/typography there, not per component. The v3 token set is `--forest-*` (deep/dark/darker/base/high/highest), `--gold*`, `--white`, `--off-white`, `--ink` — the old `--olive-*` names were replaced in the migration.
- **One ground rule**: every surface is a forest ground; gold is the single accent (borders, icons, linework); warm ivory plaques (`--off-white`) carry cards/info panels with `--ink`/`--gold-dark` text for contrast.
- **Motif artwork**: the storefront uses two identical `<img>` tags (`.motif-base` and `.motif-glow`) pointing to the processed gold-on-transparent PNG `frontend/monument-lineart.png`. Every motif layer is `aria-hidden` + `pointer-events: none` (decorative only).
- **Backdrop**: the storefront uses one fixed `.heritage-bg[data-glow]` layer (base + glow copies, `--glow-x/--glow-y` line-glow).
- **Frontend is dependency-free**: plain HTML/CSS/JS, inline SVG icons, Google Fonts import only.
- **Money formatting** uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`; prices from the API are `numeric(10,2)`.
- **Category keys**: storefront card `data-category` (`Earrings`, `Rings`, `Bracelets`, `NeckPieces`) maps via `apiCategories` to API slugs (`earrings`, `rings`, `bracelets`, `necklaces`) and via `displayNames` to display labels.
- **Cart persistence** is per-tab `sessionStorage` (`aarisha-cart-v1`).
- **Image fallback**: a global capture-phase `error` listener swaps any broken `<img>` to `placeholder.svg`.
- **Safety guards**: WhatsApp order item quantity bounds (1–99, max 50 items); product reads are public and read-only.

## Where to make changes

| Change | Primary location | Notes |
| --- | --- | --- |
| Page copy, section order, contact details | `frontend/index.html` | Update associated links/IDs when moving sections. |
| Brand colors, fonts, layout, animations, breakpoints | `frontend/styles.css` → `:root` tokens + component rules | Prefer tokens over per-component hex values. |
| Storefront behavior (reveal, modal, cart, WhatsApp, glow) | `frontend/script.js` | All inside a `DOMContentLoaded` listener; the backdrop glow block is the only design-coupled logic. |
| Product catalogue (name, price, stock, image, category) | Supabase `products` table (dashboard / SQL editor) | Product data is **not** hard-coded in the frontend anymore. |
| Motif artwork | PNG asset (`frontend/monument-lineart.png`) | The processed image is loaded via `<img>` tags in `.heritage-bg` in `index.html`. |
| API behavior / validation | `backend/app/main.py` | `.env` config in `backend/`; restart uvicorn (`--reload` handles it). |
| DB schema | `supabase-schema.sql` | Run changes in the Supabase SQL editor; keep RLS in mind. |
| Deployment routing | `vercel.json` + `api/index.py` | Vercel only; local dev uses uvicorn + a static server on `frontend/`. |

## JavaScript behavior (storefront)

All storefront JS initializes inside a `DOMContentLoaded` listener in `frontend/script.js`:

- Broken-image fallback to `placeholder.svg`.
- Sticky navbar styling after 80px of scroll.
- Mobile navigation: the hamburger toggle (left of the centered brand, `☰` ⇄ `×` icon swap via `aria-expanded`) opens a full-screen menu; focus moves to it, Escape/backdrop/link-click closes it, and focus returns to the toggle. Overlays (menu/modal/cart) trap Tab focus while open and are `inert` + `visibility:hidden` when closed.
- Heritage-backdrop line-glow: rAF-throttled `--glow-x/--glow-y` + `.glowing` on `.heritage-bg[data-glow]` (fine pointers), `.pulse` ambient fallback (touch/keyboard), reduced-motion gate.
- `IntersectionObserver` reveal animations with sibling stagger (`index * 150ms`).
- Featured strip fetched from `GET /products` (cards animate in with `80ms` stagger) with mouse drag-to-scroll.
- Instagram grid rendered as placeholder tiles (observed for reveals).
- Category modal populated from `GET /products/{category}`; empty categories show a "Coming Soon — Stay Tuned" message; Escape or back button closes; body scroll locks while open; Tab focus is trapped and returned to the opening card on close. Collection cards are keyboard-operable (Enter/Space). The modal sits **below the fixed navbar** (`z-index` 950 vs 1000) so the nav stays visible while browsing (the navbar gains `.modal-open` glass styling while the modal is up); a sticky top bar (back button + compact category label) pins under the navbar while products scroll — the label fades in via `.has-scrolled` only after the large heading scrolls away, so the category name is never shown twice.
- Cart: `sessionStorage`-backed, add/increase/decrease/remove, badge count, total, drawer + scrim open/close; drawer traps focus and restores it to the cart button on close; a visually-hidden `aria-live` region announces count changes; the featured strip scrolls with Left/Right arrow keys.
- WhatsApp order: requires every cart item to carry a `serverProductId`; on success opens the draft and clears the cart.
- Smooth scrolling for same-page anchor links.

## UI/Motion

Active operating manual: `UISKILL.md` (codename `Weave`). Design-system source of truth: `DESIGN.md` (v3 "Heritage Gold & Forest"). Summary of the current UI/motion state:

- **Component foundation**: hand-rolled vanilla CSS/JS — no React, Tailwind, or component library. Tokens in `frontend/styles.css` `:root` are the shared system (see `DESIGN.md`).
- **v3 "Heritage Gold & Forest" redesign (applied 2026-08-11, migrated from the Stitch export)**: palette is **deep forest green + antique gold** — `--forest` `#1b3428` page ground, `--forest-deep` `#00180e` deepest, `--gold` `#c9a24b` accent, `--off-white` `#ece1ce` ivory plaques, `--white` `#cce9d8` text. Typography moved to **Bodoni Moda + Manrope**. Layout: fixed top nav (links / brand / icons), full-height hero with an ornate gold mirror frame, step-well divider, 4-up category grid with offset gold frames, 3-column footer. A single fixed `.heritage-bg` replaces the v2 per-section motif layers.
- **Responsive + a11y hardening (updated 2026-09-12)**: navbar switches to flex space-between at ≤900px with hamburger menu + cart flush right and brand flush left (eliminating the 3-column CSS Grid `1fr` minimum-content expansion that previously pushed the cart off-screen on phones). Search/Account hidden ≤900px. Vertical-only scroll reveals at ≤768px (eliminates horizontal `translateX(±60px)` document overflow). Both `html` and `body` enforce `overflow-x: hidden` with `max-width: 100%`. Focus traps + focus return for modal/drawer/menu, `inert` closed overlays, cart `aria-live`, keyboard-operable collection cards, skip link, `scroll-padding-top` for anchored sections, `100svh` hero, 36px+ touch targets, unified scroll lock. Zero horizontal overflow verified across 320/360/375/480/768/1024/1440px viewports.
- **Signature interaction — cursor line-glow**: the gold monument line-art is rendered twice — a dim base copy (rest opacity 0.12) and a drop-shadowed glow copy masked to a ~240px window around the pointer (`--glow-x`/`--glow-y` updated rAF-throttled; opacity + mask-position only, compositor-friendly). Because the glow copy carries `drop-shadow`, **the lines themselves glow** rather than a radial light source. Touch/keyboard devices get a 9s ambient pulse (`.pulse`) instead; `prefers-reduced-motion: reduce` disables both and renders the motif at a static raised opacity.
- **Signature interaction — Add to cart spatial choreography & radial golden halo (2026-09-12)**: Clicking "Add to Cart" triggers localized button ripple and a gold confirmation state ("Added ✓"). A framed jewel thumbnail clone of the actual product image glides in an arced trajectory via WAAPI to the navbar cart icon. Upon arrival, an SVG radial halo of 12 delicate architectural golden rays bursts outward around the cart icon along with a gold ring shockwave and badge bump. An elevated luxury toast notification ("Added to Cart") slides up with emerald/gold styling. All animations respect `prefers-reduced-motion: reduce`.
- **Motion budget classification**: marketing/brand site — motion part of the brand experience, restrained. Motion inventory: scroll reveals (fade + translate, one-shot, sibling stagger 150ms), hero entrance stagger, category-card hover lift (`-8px`) + image scale (`1.05`) + gold frame reveal, product-card hover lift, button fill-gold + glow (`box-shadow: 0 0 16px rgba(235,193,102,.35)`) at `:hover`/`:focus-visible`, modal/drawer slide+fade, staggered card entrances (`80–150ms`), backdrop ambient pulse (9s).
- **Motion tokens in use**: `--transition-smooth` (default); `--transition-glow: cubic-bezier(0.4, 0, 0.2, 1)` (glow fade, 0.25s); `--transition-bounce` defined but unreferenced. Durations remain component-specific (0.25–0.8s) rather than a shared scale — candidate improvement per UISKILL.md §5.4.
- **Known deviations to track** (UISKILL.md §2): the backdrop ambient pulse is infinite and unpausable (decorative, disabled under reduced motion); no skeletons (content pops in); no per-component focus styles beyond the global `:focus-visible` outline and button glows. The contact form is visible but a non-functional placeholder. Price text on ivory plaques renders `--gold-dark`/`--ink` instead of gold (gold-on-ivory ≈ 2.4:1, below WCAG AA) — deliberate deviation from the raw Stitch palette. (Focus trap/return, `inert` closed overlays, cart `aria-live`, keyboard-operable collection cards, and the unified scroll lock were added 2026-08-16 — see the feature list.)

## Current functional boundaries

- Contact form/`#contact` section is visible (v3) but remains a placeholder: it deliberately prevents default submit and sends nothing.
- Social and navigation `href="#"` links are placeholders needing real URLs.
- Cart is per-tab (`sessionStorage`); a refresh in the same tab keeps it, a new tab does not.
- WhatsApp is the only ordering path; the API records no orders and takes no payment.
- No authentication or user accounts remain; the API is fully public (catalogue reads + WhatsApp order link).
- Prices shown to the customer are server-derived at the moment the WhatsApp link is requested.
- The frontend lives in `frontend/` — any new static asset must be placed there and referenced with root-relative paths from the page files.

## Guidance for contributors and AI agents

- **Read `RULES.md` first** — it governs agent behavior, planning/approval, security, and mandates updating `Context.md` + `Changelog.md` after every run that changes the project.
- Read `UISKILL.md` before touching UI/motion, and keep `DESIGN.md` in sync when tokens/components change.
- Preserve the forest/gold visual language, the one-ground rule, the ivory-plaque card treatment, and the heritage-backdrop glow system when adding UI (see `DESIGN.md` v3).
- Keep the frontend dependency-free unless a requested feature justifies tooling.
- Server-side: never expose the service-role key to the browser; validate input at the API boundary.
- Test both desktop and mobile layouts after styling/modal changes; sanity-check ~375px, ~768px, ~1024px, ~1440px.
- Check `git status` before committing; restoring the missing product-photo folders is important for a visually complete site.

## Deployment

- **Vercel**: the repo deploys the FastAPI function at `/api` plus the static frontend under `frontend/` (via `vercel.json` rewrites and `api/index.py`). Non-API root paths rewrite to `/frontend/$1`. Set the values from `backend/.env` as Vercel Production environment variables — never upload the `.env` file. The storefront automatically uses `/api` when deployed.
- **Local**: uvicorn for the API + any static server for `frontend/` (see Quick start).
- No build step is needed for the frontend; the host must preserve relative paths (`Logo.png`, `placeholder.svg`) within `frontend/`.
