# Changelog

> Running log of every change made to the project, in reverse-chronological order, one
> timestamped heading per work session/run. Maintained per RULES.md §8.1 — every
> operating document (RULES.md, UISKILL.md) writes into this single shared file under
> category-tagged subsections.

## [2026-09-22 21:15]

### [Category: Dev] — Production Supabase Credentials Applied
What changed:
- Updated `SUPABASE_URL` to `https://mbsrziyhkqicoiwywotv.supabase.co` in both `backend/.env` and root `.env`.
- Updated `SUPABASE_SERVICE_ROLE_KEY` to the project's production service role JWT in both `backend/.env` and root `.env`.
Why: Applied live production Supabase project URL and service role credentials provided by project owner.
Verification: Executed test suite (`python -m unittest discover backend/tests`) — 4/4 tests passed.

## [2026-09-22 21:12]

### [Category: Dev] — Supabase Production Database Schema & Environment Calibrations
What changed:
- **Production Database Schema Integration** (`supabase_production.sql`, `supabase-schema.sql`):
  - Created master production PostgreSQL schema in workspace root (`supabase_production.sql`) to initialize the production Supabase database.
  - Added table definition for `products` with columns `id`, `name`, `price`, `original_price`, `category`, `image_url`, `description`, `in_stock`, and `created_at`.
  - Expanded category check constraint to safely support `rings`, `necklaces`, `neckpieces`, `necklace`, `bracelets`, and `earrings`.
  - Added B-tree performance indexes: `idx_products_category`, `idx_products_created_at`, and `idx_products_in_stock`.
  - Enabled Row Level Security (RLS) with public select policy (`Allow public read access`) and explicit service role policy (`Allow service role full access`).
  - Synchronized repository schema `supabase-schema.sql` to match `supabase_production.sql`.
- **Environment & Security Hardening** (`backend/.env`, `backend/.env.example`, `.env`, `.gitignore`):
  - Updated `backend/.env` with structured sections, comments, and deployment instructions for Supabase, WhatsApp orders, CORS origins, and Google Sheets sync.
  - Updated `backend/.env.example` template with comprehensive setup instructions.
  - Created root `.env` to support both root FastAPI / Vercel execution and local backend runs seamlessly.
  - Updated `.gitignore` to ignore `.env` and `.env.*` at root in addition to `backend/.env`.
- **Documentation** (`context.md`):
  - Updated file tree and architecture notes in `context.md` reflecting schema and environment structure.
Why: Owner requested a final production SQL file in the root directory to run in the new production Supabase database and calibration of environment files for both repositories.
Verification: Ran backend test suite (`python -m unittest discover backend/tests`) passing 4/4 tests; confirmed schema constraints align with FastAPI models and frontend catalog categories.

## [2026-09-22 20:55]

### [Category: Dev] — Google Cloud Sheets API Integration: Customer Sync & Phone Deduplication
What changed:
- **Backend Customer Sync Pipeline** (`backend/app/main.py`):
  - Integrated Google Sheets API v4 via Service Account authentication (`google.oauth2.service_account` & `google.auth.transport.requests`).
  - Added token management with caching and automatic refresh.
  - Implemented `normalize_phone_core` to extract canonical 10-digit mobile numbers, preventing duplicates across varied formatting (e.g. `+91 99243 43003` vs `9924343003`).
  - Implemented `sync_customer_to_google_sheet(name, phone)`: queries Column B (`values/Sheet1!B:B`) to verify uniqueness, and appends `[customer_name, customer_phone]` using `valueInputOption=RAW` to prevent Google Sheets from interpreting phone numbers starting with `+` as formulas.
  - Hooked into `/orders/whatsapp-link` via FastAPI `BackgroundTasks` so that both single product orders and cart orders are recorded asynchronously without adding checkout latency.
- **Environment & Configuration** (`backend/app/main.py`, `backend/.env.example`):
  - Added `google_spreadsheet_id`, `google_service_account_file`, and `google_service_account_json` configuration settings.
  - Configured `SettingsConfigDict` to check both `.env` and `backend/.env`.
- **Security & Dependencies** (`.gitignore`, `backend/requirements.txt`, `api/requirements.txt`):
  - Added `google-auth>=2.20.0,<3` to requirement manifests.
  - Added `*service_account*.json`, `credentials*.json`, and `backend/*.json` to `.gitignore` to guarantee service account private keys are never committed to version control.
- **Documentation** (`context.md`):
  - Updated technology, external services, dependencies, feature list, and data flow architecture sections to document the Google Sheets integration.
Why: Owner requested storing customer names and phone numbers in a Google Sheet (`Customer Name | Phone No.`) from all website orders (individual and cart orders) with duplicate prevention keyed on customer phone numbers, using Google Cloud Console API.
Verification: Integration tests confirmed Service Account authentication, Column B duplicate checking, raw appending of new contacts, skipping of duplicate contacts across different number formats, and zero impact on WhatsApp link generation.

## [2026-09-12 16:35]

### [Category: UI] — Standout "Explore Collections" Hero CTA with Specular Shimmer, Ambient Halo & Directional Chevron
What changed:
- **Visual Weight & Dominance** (`frontend/styles.css`): Elevated the primary hero CTA from an understated outline button into a luminous Solid Antique Gold Jewel Plaque using a curated multi-stop metallic gradient (`linear-gradient(135deg, #f3d487, var(--gold-light), var(--gold), #ab822b)`), framed with a crisp outer rim (`1px solid rgba(243, 212, 135, 0.7)`).
- **Typography & High Contrast**: Switched text color to Deep Forest Green (`#00180e`, `font-weight: 700`, `letter-spacing: 0.16em`) guaranteeing high-contrast legibility and WCAG AA compliance against the gold background.
- **Micro-Animations & Motion**:
  - Specular jewelry light sweep (`@keyframes ctaShimmer` on a 4.5s loop) sweeping across the button surface without disturbing content.
  - Ambient breathing aura (`@keyframes ctaHaloPulse` on a 3.6s cycle) utilizing pseudo-element with `--gold` and `--gold-light` radial glow to naturally draw the visitor's eye.
  - Interactive hover/focus state elevating with `translateY(-3px)` and expanding golden drop shadow.
  - Directional indicator: Added inline SVG chevron arrow (`.btn-arrow`) that smoothly drifts forward (`translateX(4px)`) on hover.
- **HTML Markup** (`frontend/index.html`): Updated the hero CTA anchor tag with the directional arrow SVG and proper accessibility attributes.
Why: Owner request for the "Explore Collections" button to be significantly more noticeable, stand out, and draw visitors' eyes using captivating, theme-aligned animation.
Verification: Browser verification confirmed specular light sweep, breathing halo, high-contrast typography, interactive hover drift, and proper rendering across viewport widths.

## [2026-09-12 16:25]

### [Category: UI] — Eliminate Mobile Viewport Horizontal Overflow & Modernize Responsive Navbar
What changed:
- **Global Viewport & Overflow Containment** (`frontend/styles.css`): Enforced `overflow-x: hidden; width: 100%; max-width: 100%;` on both `html` and `body` (removed `max-width: 100vw` which caused scrollbar overflow). Added `overflow-x: clip` to `main` and `.footer`.
- **Navbar Layout Overhaul** (`frontend/styles.css`): Replaced the 3-column desktop grid (`1fr auto 1fr`) at `@media (max-width: 900px)` with a fluid `display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 100%; box-sizing: border-box;`. Ensured `.nav-brand` sits flush left (`min-width: 0; flex-shrink: 1; text-overflow: ellipsis; white-space: nowrap;`) and `.nav-actions` sits flush right (`flex-shrink: 0;`).
- **Placeholder Button Cleanup** (`frontend/styles.css`): Hidden non-functional Search and Account buttons at `<= 900px` (when hamburger toggle appears) rather than waiting for `<= 600px`, reducing `.nav-actions` from 218px to 94px and preventing intermediate tablet/phone layout collision.
- **Scroll Reveal Translation Containment** (`frontend/styles.css`): Normalized `.reveal-left` and `.reveal-right` at `<= 768px` to use vertical translations (`translateY(24px)`) instead of horizontal `translateX(±60px)`, eliminating off-screen elements pushing the document width out prior to reveal.
- **Mobile Fine-Tuning** (`frontend/styles.css`): Refined padding, brand typography, and touch targets across `600px` and `360px` breakpoints; constrained `.collection-card-frame` to `inset: -4px`.
- **Toast Tag Correction** (`frontend/index.html`): Updated the luxury toast tag to "Added to Cart" per owner request.
Why: Owner reported bad mobile UX where mobile users had to scroll right to see content, cutting off "THE AARISHA" on the left and pushing the cart icon off-screen on the right.
Root cause: The desktop 3-column CSS Grid forced column 1 and column 3 to expand symmetrically via `1fr` minimum content sizing (`min-width: auto`), combined with `translateX(60px)` scroll reveals and `max-width: 100vw` lacking `overflow-x: hidden` on `body`.
Verification: Verified in Chrome across mobile viewports (360px, 375px, 502px) confirming 0 overflowing elements, zero horizontal scrolling, and both brand mark and hamburger+cart icons 100% visible on load.

## [2026-09-12 16:15]

### [Category: UI] — Vivid Add-to-Cart Product Image Flight, Radial Golden Halo & Luxury Toast
What changed:
- **Button Micro-Interaction** (`frontend/styles.css`, `frontend/script.js`): Added tactile golden ripple emanating from click coordinates, followed by a smooth button state transition to "Added ✓" with a warm gold shimmer/glow (`--gold-light`, `box-shadow: 0 0 22px rgba(235, 193, 102, 0.55)`), cleanly auto-reverting after 1200ms.
- **Flying Product Image Preview** (`frontend/styles.css`, `frontend/script.js`): Replaced single dot particle with a floating jewel clone of the actual product image (`.cart-flying-img`) framed by a 2px Antique Gold border with outer glow. It smoothly glides in an arced trajectory via Web Animations API (WAAPI on compositor thread) directly toward the navbar cart bag icon.
- **Radial Golden Lines Halo & Cart Feedback** (`frontend/styles.css`, `frontend/script.js`): On arrival at `#cartToggle`, triggers an architectural burst of 12 radiating golden rays (`.cart-radial-rays`) encircling the cart icon, a golden shockwave ring (`.ring-burst`), and an elastic cart badge scale bump (`#cartCount.bump`).
- **Elevated Luxury Toast** (`frontend/index.html`, `frontend/styles.css`): Upgraded `#cartToast` into a regal Deep Forest plaque with double-line gold framing, emerald/gold checkmark badge, uppercase gold tag "Added to Cart", and high-contrast product title. Auto-dismisses smoothly after 2.8s.
- **Accessibility & Reduced Motion**: All animations wrapped with `prefers-reduced-motion: reduce` fallback; toast preserves `role="status"` and `aria-live="polite"`.
Why: Owner request for vivid, theme-matching Add-to-Cart interaction with actual product image flight, encircling radial golden lines on the cart icon, and "Added to Cart" toast notification.
Verification: Browser verification confirmed button feedback, image flight, radial burst lines on `#cartToggle`, badge bump, and toast notification appearance.

## [2026-08-17 00:45]

### [Category: Dev] — Instagram everywhere: hyperlinks + real posts via the Basic Display API
What changed:
- **Hyperlinks**: all five Instagram references in `frontend/index.html` now point to `https://www.instagram.com/the.aarisha_/` with `target="_blank" rel="noopener"` — the section-heading handle (new `.insta-handle` with hover underline), the "Visit our Instagram →" button, the contact-details handle (new `.contact-detail-link`), the footer handle link, and the footer Instagram social icon.
- **Backend** (`backend/app/main.py`): new `GET /instagram/posts` — reads an optional `INSTAGRAM_ACCESS_TOKEN` setting, fetches the account's recent media from the Instagram **Basic Display API** (`graph.instagram.com/me/media`) with httpx, maps to `{id, alt, image, permalink}` (thumbnail for videos/carousels, caption→alt, max 5), and caches in-memory for 10 minutes (Graph API rate limit is 200/hr). Missing token or upstream error → empty list, never a crash. `api/index.py` needs no change — the route is mounted automatically under `/api`.
- **Frontend** (`frontend/script.js`): the Instagram grid fetches `/instagram/posts` and renders each post as an `<a href=permalink target=_blank rel=noopener>` image tile (lazy-loaded, caption as alt); on empty/failed responses it falls back to the five placeholder tiles. No token configured → placeholders, so the site keeps working.
- `.env.example` + `README.md`: documented `INSTAGRAM_ACCESS_TOKEN` (server-side only).
Why: Owner request — link Instagram everywhere and show a few real posts in the Instagram section (profile: instagram.com/the.aarisha_).
Verification: `node --check` + `py_compile` pass; headless-Chrome probe — all five links resolve to the profile, grid renders permalink-anchored tiles when the API returns posts, and falls back to 5 placeholders on an empty response.
Owner action still required: create a Meta developer app + long-lived Basic Display token and set `INSTAGRAM_ACCESS_TOKEN` in `backend/.env` (local) and Vercel env vars. Until then the section shows placeholders.

## [2026-08-17 00:30]

### [Category: UI] — Replace "Why Aarisha" with a Testimonials section (5 reviews)
What changed:
- `frontend/index.html`: the value-prop section (`id="why"`) became **Testimonials** (`id="testimonials"`): heading "Testimonials" + five `<figure>` reviews (gold ★★★★★ with `role="img"` rating labels, italic serif quotes, customer name + city). The two nav links formerly labelled "Bespoke" (desktop links + mobile menu) now read "Testimonials" and point at `#testimonials`. Reviews: Kinjal Patel (Ahmedabad), Riddhi Shah (Surat), Meera Desai (Vadodara), Hetal Joshi (Rajkot), Ishita Trivedi (Mumbai) — approved by the owner.
- `frontend/styles.css`: `.why-*` rules replaced by `.testimonials-*` — a centered `flex-wrap` grid (3 per row desktop, 2 tablet, 1 phone) so all five reviews stay visible; star, quote, and attribution styling matching the heritage look. Section class renamed `.why-section` → `.testimonials-section` across base + 1200/768/600 media queries.
Why: Owner request — replace the Why Aarisha value props with customer testimonials, five visible, from Indian/Gujarati customers.
Verification: headless-Chrome probe at 375/768/1024/1440px — 5 reviews render (rows 1×5 / 2+2+1 / 2+2+1 / 3+2), heading + nav label "Testimonials", zero overflow. No leftover `why-*`/Bespoke references; CSS braces balanced.

## [2026-08-17 00:15]

### [Category: UI] — Move "The Story of Aarisha" to the true viewport centre
What changed: `frontend/index.html` — the heading moved out of `.about-right` (inside the two-column grid) to a full-width `.about-story-title` element above the grid, between the ornamental divider and the quote/story columns. `frontend/styles.css` — the `.about-right h2` rule became `.about-story-title` (same Bodoni styling, `text-align: center`, `margin: 10px 0 44px`). The title now sits at the page's true centre on every viewport instead of the centre of the right text column (~55% of the page).
Why: Owner feedback — the title was centred within the text column, not the viewport.
Verification: headless-Chrome probe at 375/768/1024/1440px — heading outside the grid, centre within ~1px of the content-viewport centre (the measured 7px delta equals half the scrollbar width), zero overflow.

## [2026-08-17 00:05]

### [Category: UI] — Centre the "The Story of Aarisha" heading
What changed: `frontend/styles.css` — added `text-align: center` to `.about-right h2` so the story heading is centred on desktop (it was left-aligned inside the right column; mobile already centred it via the ≤768 rule). Body paragraphs stay left-aligned for readability.
Why: Owner feedback — the story title looked off-centre on desktop.

## [2026-08-16 23:55]

### [Category: UI] — Rewrite the "Story of Aarisha" section copy
What changed: `frontend/index.html` — replaced the old quote + single-paragraph brand story in the about section with the owner's new copy: the left column now carries the signature line "Aarisha ~ reflecting beauty, inside & out.", and the right column holds three new story paragraphs (Gujarati "mirror" meaning; mirror-inspired jewellery that reveals rather than overpowers; celebration of quiet, detail-level beauty). `frontend/styles.css` — added `.about-right p + p { margin-top: 18px }` so the stacked paragraphs breathe (the reset removes paragraph margins).
Why: Owner request — new brand-story copy for the about section.

## [2026-08-16 23:45]

### [Category: UI] — Rename "Handpicked for You" section heading to "Aarisha on You"
What changed: `frontend/index.html` — the featured-strip section heading (`#featured`) now reads "Aarisha on You" instead of "Handpicked for You". Also updated the matching section-label comment in `frontend/styles.css`. No other markup, styles, or behavior changed.
Why: Owner request — new brand copy for the featured section.

### [Category: UI] — Rename "Aarisha on You" section heading to "Reflecting you"
What changed: `frontend/index.html` — the featured-strip section heading (`#featured`) now reads "Reflecting you" instead of "Aarisha on You". Also updated the matching section-label comment in `frontend/styles.css`. No other markup, styles, or behavior changed.
Why: Owner request — refined brand copy for the featured section.

## [2026-08-16 23:30]

### [Category: UI] — Add-to-cart toast, bag→cart rename, two buttons on every product card
What changed:
- **Toast**: added a brand-styled toast (`.toast` — ivory plaque, gold border, gold ✓ icon, fixed bottom-centre, `role="status"` + `aria-live="polite"`, auto-dismiss ~2.6s, `pointer-events: none` so it never blocks taps). `showToast()` fires from `addToCart()`, so adding from the modal or the featured strip confirms with "{name} added to cart".
- **bag→cart**: "Your Bag"→"Your Cart", "Close bag"→"Close cart", "Add to Bag"→"Add to Cart", "Your bag is waiting…"→"Your cart is waiting…", aria-live "in your bag"→"in your cart", plus the matching comments and `context.md` feature descriptions (historical `Changelog.md` entries left as-is).
- **Two buttons on product cards** (modal cards + featured-strip cards): a shared `.card-actions` wrapper now holds **Add to Cart** (primary dark/gold) and **Order on WhatsApp** (new outline secondary). Out-of-stock disables both and labels the add button "Out of Stock". The per-product WhatsApp button POSTs just that item (quantity 1) to `/orders/whatsapp-link` and opens the `wa.me` draft — independent of the cart; the drawer's whole-cart WhatsApp order is unchanged. Featured cards gained interactivity (they were display-only) and store their buttons per card.
Why: Owner request — visible confirmation when adding to cart, consistent "cart" terminology, and direct order paths (cart vs WhatsApp) on every product card.
Verification: headless-Chrome probe at 375/1024px with a stubbed catalogue API — featured and modal cards each render both buttons with correct in/out-of-stock states, toast appears on add (featured + modal) and auto-dismisses, drawer header reads "Your Cart", zero overflow. `node --check` passes.

## [2026-08-16 23:10]

### [Category: UI] — Navbar reorder (brand left, links centred) + nav links now work over the product modal
What changed:
- `frontend/index.html`: reordered the navbar children to **brand → nav-links → nav-actions** and moved the mobile hamburger toggle back into `.nav-actions` — desktop now reads THE AARISHA (left) · Collections/Heritage/Bespoke/Contact (centre) · icons (right); mobile reads THE AARISHA (left) · ☰ + 🛍 (right).
- `frontend/styles.css`: pinned explicit grid placement so the order survives every breakpoint (`grid-column: 1` + `justify-self: start` on `.nav-brand`, `grid-column: 2` + `justify-self: center` on `.nav-links`, `grid-column: 3` + `justify-self: end` on `.nav-actions`) — this matters because auto-placement would misplace the actions when nav-links are `display:none` ≤900px. Removed the toggle's obsolete `justify-self: start`.
- `frontend/script.js`: the anchor smooth-scroll handler now closes whatever overlay is open (mobile menu → collection modal → cart drawer) *before* scrolling — previously, clicking a nav link while the product modal was open scrolled the locked page behind the modal, so the navigation appeared to do nothing.
Why: Owner request — brand should sit left with navigation centred, and the navigation links must actually work from the product (category-modal) section.
Verification: headless-Chrome probe at 375/768/1024/1440px — brand left / links centred (within ~7px of viewport/2) / actions right; with the modal open, clicking a nav link closes it, releases the scroll lock, and lands the target section at the 96px navbar clearance; zero horizontal overflow.

## [2026-08-16 22:50]

### [Category: UI] — De-duplicate the category name in the product modal (progressive disclosure)
What changed:
- `frontend/styles.css`: the compact category label in the sticky top bar (`.modal-topbar-title`) is now hidden by default (`opacity: 0`, `pointer-events: none`) and fades in only under `.collection-modal.has-scrolled` — so the category name is never shown twice. Also added `.navbar.modal-open` (same glass surface as `.navbar.scrolled`) so the navbar stays legible above the modal even when the page is at the top.
- `frontend/script.js`: a passive `scroll` listener on the modal toggles `.has-scrolled` once `scrollTop` passes the large heading's `offsetTop` (transform-independent, computed when the modal opens); the navbar gains/ loses `.modal-open` when the modal opens/closes.
Why: Owner feedback (screenshot) — the category name appeared twice in the modal (compact label in the pinned bar + large heading below the divider); the label now collapses in as the heading scrolls away, the standard iOS-style pattern.
Verification: headless-Chrome probe at 375/768/1440px — label hidden at rest, `.has-scrolled` toggles past the threshold, label renders at opacity 1 once the (probe-disabled) fade completes, navbar `.modal-open` applied, zero overflow.

## [2026-08-16 22:30]

### [Category: UI] — Navbar stays visible over the product modal + sticky back-button bar
What changed:
- `frontend/styles.css`: lowered `.collection-modal` `z-index` from 1100 → **950** (below the fixed navbar's 1000) so the navbar — links/brand/cart icons — remains visible above the category modal while browsing products. The mobile menu (1050) and cart drawer (3000) still layer above it, so their close controls are never covered.
- Added a **sticky top bar** (`.modal-topbar`) inside the modal: the Back to Collections button (left) + a compact category label (centered, `aria-hidden` duplicate of the h2) pin just below the navbar while products scroll beneath — `top: 84px` desktop, 76px ≤1200, 68px ≤768 — with a solid forest-deep ground so cards scroll under cleanly. Replaces the old `.collection-modal-title-row`; the big centered category title + ornamental divider remain as scrolling content.
- `frontend/index.html`: restructured the modal header — sticky topbar (back button + compact label) above the big title + divider.
- `frontend/script.js`: populates the compact topbar label from the same category display name (`#modalTopbarTitle`).
Why: Owner request — the navbar should stay visible throughout the site (it was fully hidden under the opaque full-screen modal), and the back button should stay within easy reach without obstructing product browsing (it previously scrolled out of view with the content).
Verification: headless-Chrome probe at 320/375/600/768/1024/1440px — `navbar.z(1000) > modal.z(950)` everywhere, topbar `position: sticky` with the right per-breakpoint offset, label populates on open, zero horizontal overflow.

## [2026-08-16 22:05]

### [Category: UI] — Fix mobile navbar: icon swap, centered brand, left hamburger
What changed:
- `frontend/index.html`: moved the `#menuToggle` button out of `.nav-actions` to be the **first child of `.navbar`**, so the mobile grid becomes ☰ (left) | brand (center) | actions (right) — the brand is now truly centered instead of sitting left-of-center.
- `frontend/styles.css`: added the previously-missing icon-swap rules (`.menu-icon-close` hidden by default; `.menu-icon-open` hidden when `aria-expanded="true"`) — before this, **both** the hamburger and the X rendered stacked inside the button. At ≤900px the toggle is `justify-self: start` and gets a 44px tap target with a subtle gold hairline (`border-color: rgba(201,162,75,.35)`, compound `.nav-icon-btn.nav-menu-toggle` selector so it beats the 40px rule in the 600px block).
Why: Owner feedback — the mobile navbar looked broken: two icons stacked in the button and an off-center brand.
Verification: headless-Chrome computed-style probe at 320/375/600/768/900px — only the hamburger icon renders when closed (X hidden), toggle sits left, brand center within ~8px of viewport/2, zero horizontal overflow.

## [2026-08-16 21:45]

### [Category: UI] — Responsive + accessible navigation and overlay hardening for all viewports
What changed:
- **Mobile navigation (new)**: added a hamburger toggle (`.nav-menu-toggle`, `aria-expanded`/`aria-controls`) and a full-screen, brand-styled mobile menu (`.mobile-menu` — forest-deep ground, gold hairline links, 56px touch targets, close button). The inline nav links now collapse into the hamburger at `≤900px` (previously `≤768px`) — this fixes a real overflow bug in the 769–850px range where the three-column nav (links/brand/icons) exceeded the viewport and silently clipped the cart icon behind `overflow-x: hidden`. The two non-functional placeholder icon buttons (Search/Account) are hidden `≤600px` so the brand mark, hamburger, and cart never crowd on small phones.
- **Overlay accessibility (UISKILL.md §9.2)**: collection modal, cart drawer, and mobile menu now trap Tab/Shift+Tab focus while open, restore focus to the trigger on close, and are `inert` + `visibility: hidden` when closed so their controls leave the tab order. Modal and drawer got `role="dialog"`/`aria-modal`/`aria-labelledby`; the cart drawer and modal body scroll-locks were unified into one `updateScrollLock()` helper that never un-locks one overlay while another is open.
- **Keyboard & ARIA**: collection cards are now keyboard-operable (`role="button"`, `tabindex="0"`, Enter/Space opens the modal — the existing `:focus-visible` hover-lift rule already styled them). Added a visually-hidden `aria-live="polite"` region announcing cart count changes, and a skip-to-content link that reveals on first Tab.
- **Navigation UX**: `scroll-padding-top: 96px` on `html` so anchored sections (Collections/Heritage/Bespoke/Contact) land below the fixed navbar instead of underneath it; Escape now closes the topmost overlay (menu → modal → cart); the featured strip is keyboard-scrollable via Left/Right arrows (smooth, `auto` under reduced motion).
- **Responsive polish**: hero uses `100svh` (with `100vh` fallback) to avoid mobile URL-bar height jumps; cart quantity/remove buttons enlarged to 36×36px min at `≤768px`; cart drawer padding tightened to 20px at `≤600px`; nav icon buttons enlarged to 40px at `≤600px`.
- `DESIGN.md`: responsive section updated (hamburger at 900px, search/account hidden ≤600px).
Why: Owner request — the site was not adequately responsive and lacked mobile navigation and overlay accessibility; this brings navigation and interaction up to the UISKILL.md/RULES.md bars (touch targets, keyboard parity, focus management, no hover-only interactions, no viewport overflow) across ~320px to 1440px.
Bug fixed (if applicable): 769–850px nav overflow clipped the cart icon; mobile viewports had no way to reach the Collections/Heritage/Bespoke/Contact sections; hidden modal/drawer controls remained keyboard-focusable; anchored sections scrolled underneath the fixed navbar.
Verification: `node --check` on `script.js`; headless-Chrome render (JS executes, reveals fire, no console errors); iframe overflow probe shows `scrollWidth == clientWidth` (zero horizontal overflow) at 320/375/480/768/1024/1440.

## [2026-08-16 21:19]

### [Category: UI] — Real product photos as collection-card cover images
What changed: Replaced the `placeholder.svg` cover image on all four "Curated Collections" cards in `frontend/index.html` with the real product photographs the owner added to `frontend/`: `necklace.jpeg` (Neck Pieces), `bracelets.jpeg` (Bracelets), `earrings.jpeg` (Earrings), `rings.jpeg` (Rings). Only the four `<img src>` attributes changed; no CSS or JS was touched — `.collection-card-img img` already crops with `object-fit: cover` on a 3/4 aspect ratio, and the existing capture-phase error listener still falls back to `placeholder.svg` for any image that fails to load.
Why: Owner request — each product type now shows its actual photo as the card cover instead of the placeholder graphic.

## [2026-08-12 22:45]

### [Category: UI] — Replace hero Jharokha SVG with ornate gold mirror frame
What changed:
- Extracted the baroque gold mirror frame from the owner's brand asset `the_aarisha.png` to `frontend/mirror-frame.png` (209×279, gold-on-transparent — outer green and inner white made transparent).
- `frontend/index.html`: Replaced the 14-line inline SVG Jharokha arch + diamond motif (`.jharokha-frame`) with a single `<img>` tag loading `mirror-frame.png` (`.mirror-frame`).
- `frontend/styles.css`: Replaced `.jharokha-frame`, `.jharokha-arch`, `.hero-diamond` rules with `.mirror-frame` + `.mirror-frame-img` (172×230px, `object-fit: contain`, gold `drop-shadow`). Updated the 600px responsive breakpoint to scale the frame to 140×187px.
- Docs updated: `DESIGN.md` (key motifs, shapes, motion inventory), `context.md` (feature list, v3 redesign description).
Why: The owner provided a brand card (`the_aarisha.png`) with an ornate baroque gold mirror frame and requested it replace the basic Jharokha arch SVG in the hero section.

## [2026-08-12 22:40]

### [Category: UI] — Processed perspective Rani ki Vav image backdrop + styling integration
What changed:
- Processed the detailed monochrome perspective line drawing `Gemini_Generated_Image_jgukn1jgukn1jguk.png` to a gold-on-transparent (`#c9a24b`) PNG `frontend/monument-lineart.png` (616 KB) using PIL & NumPy, preserving variable stroke-width and hatching details.
- `frontend/index.html`: Removed the legacy ~240-line inline SVG sprite elements (cornices, columns, niches, steps, etc.). Replaced the two `<svg class="motif">` layers within the `.heritage-bg` container with `<img>` tags pointing to `monument-lineart.png`.
- `frontend/styles.css`: Adapted `.heritage-bg .motif` to support `<img>` scaling using `object-fit: cover; object-position: center bottom;` to preserve the original viewport composition. Removed obsolete `.u-full` and `.u-slim` visibility rules from standard declarations and the 768px media query.
- Docs updated: Updated `DESIGN.md` and `context.md` to reflect the transition from SVG sprites to the high-detail transparent PNG asset.
Why: The owner requested replacing the basic elevation-sketch monument backdrop with the detailed perspective composition from `Gemini_Generated_Image_jgukn1jgukn1jguk.png` while maintaining the identical green backdrop, text content, and interactive cursor line-glow.

## [2026-08-12 22:20]

### [Category: UI] — Detailed Rani ki Vav backdrop artwork + raised rest opacity
What changed: Rebuilt the heritage-backdrop monument line-art in `frontend/index.html` (inline sprites `stepwell-motif` + `stepwell-motif-slim`) from a sparse ~60-line sketch into a highly ornate Rani ki Vav facade matching the owner's reference image (`Gemini_Generated_Image_jgukn1jgukn1jguk.png`, supplied this run): full-width cornice/frieze band (terminal brackets, repeated cusped frieze arches, dentil band, hanging pendant drops), corner diamond lattices (full variant only), a three-tiered central shrine (finial spike, nested cusped arches per tier, inner sanctum with hanging chain-lamps + bells, flanking colonnettes), jharokha side pavilions with balustrade balconies + plinths, a divider line, two colonnade bands of pointed arches with columns, a niche row (outer/inner arches + finial spikes + pillars), six descending step treads, and a central well (double rings, spokes, diagonals) with ground line. Same viewBox (1200×800), same `<g>` stroke attributes, same symbol IDs, so no JS/CSS structure changed. `frontend/styles.css`: raised the backdrop rest opacity from 0.07 → 0.12 (`.motif-base`, `heritage-pulse` keyframes, and the `prefers-reduced-motion` static variant) so the detailed ornament reads at rest while staying a muted backdrop. The existing cursor line-glow (drop-shadowed `.motif-glow` masked to `--glow-x/--glow-y`) is untouched and now reveals the richer artwork. Docs updated: `DESIGN.md` (motif section — new artwork description + 0.12 rest opacity), `context.md` (feature list + UI/Motion signature interaction).
Why: Owner request — the existing monument line-art was "very basic with no details"; the reference image shows an ornate, densely detailed Indian stepwell/monument facade. Owner confirmed via ask_user: keep the current forest-green backdrop and `--gold #C9A24B` line colour, render the detailed Rani ki Vav composition, raise rest opacity to ~0.12, and keep the lines acting as a light source that glows on hover. Web content/text unchanged.

## [2026-08-12]

### [Category: Dev] — Remove admin portal and dead assets
What changed: Deleted the admin portal and every file/block that only served it, plus unused duplicates, per owner decision (the admin portal is historical and not needed).
- Deleted files: `frontend/admin.html` (admin panel UI), `backend/generate_password_hash.py` (admin password-hash generator), `frontend/assets/stepwell-motif.svg` (master artwork — sprites are inlined in `index.html` and were never loaded at runtime), and the root `requirements.txt` (duplicate of `backend/requirements.txt`; Vercel manifest now lives at `api/requirements.txt`).
- `backend/app/main.py`: removed the entire admin stack — `/admin/login`, `/admin/products` (POST/PATCH/DELETE), `/admin/products/deduplicate`, `Credentials`, `limit_login`, `token`, `verify_password`, `current_admin`, `drive_image_url`, `ProductInput`/`ProductPatch`, and the `admin_email`/`admin_password_hash`/`jwt_secret`/`jwt_minutes` settings; dropped PyJWT, bcrypt, and now-unused imports. Only public routes remain: `/health`, `/products`, `/products/{category}`, `/orders/whatsapp-link`.
- `api/index.py`: removed the `/admin.html` and `/admin` fallback routes.
- `backend/requirements.txt` + `api/requirements.txt`: removed PyJWT and bcrypt.
- `backend/.env` + `backend/.env.example`: removed `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.
- `frontend/styles.css`: removed the admin-only `.stepwell-bg` block (`.u-full`/`.u-slim` rules kept — the storefront still uses them).
- `supabase-schema.sql`: removed the unused `cart_items` table and its RLS line (nothing in the codebase ever read or wrote it).
- Docs updated to match: `context.md`, `README.md`, `DESIGN.md` (admin references dropped).
Why: Owner decision — the admin portal is historical and no longer needed; the audit also removed duplicates and dead schema/assets.

## [2026-08-11 23:05]

### [Category: UI] — v3 "Heritage Gold & Forest" migration (Stitch design) + frontend/ restructure
What changed: Replaced the v2 olive/white/gold "Stepwell" design with the Stitch-generated "Heritage Gold & Forest" design (deep forest green + antique gold Rani ki Vav monument backdrop), and moved all static frontend files into a new `frontend/` folder.
- **Restructure**: created `frontend/` and moved `index.html`, `styles.css`, `script.js`, `admin.html`, `Logo.png`, `placeholder.svg`, and `assets/stepwell-motif.svg` into it; all JS hooks, IDs, classes, and data-* attributes preserved.
- `frontend/index.html`: new layout per the Stitch export — fixed top nav (links / brand / icons with the cart bag as `#cartToggle` + `#cartCount` badge), full-height hero with Jharokha arch frame + gem icon, "Anti Tarnish Fine Jewellery" eyebrow, "The Aarisha" display headline, step-well divider, "Curated Collections" 4-up ivory-plaque grid with offset gold frames (category order: Neck Pieces, Bracelets, Earrings, Rings), featured strip, about, why, instagram, contact, 3-column footer (brand + logo, links, contact with phones), plus the unchanged collection modal, cart drawer, and scrim. Marquee section replaced by the step-well divider.
- `frontend/styles.css`: new `:root` token set — `--forest-*` (deep `#00180e`, dark `#0a2419`, darker `#062015`, base `#1b3428`, high `#162f23`, highest `#213a2e`), `--gold #c9a24b`, `--gold-light #ebc166`, `--gold-pale #f1e6d3`, `--gold-dark #8a6a1f`, `--white #cce9d8`, `--off-white #ece1ce`, `--ink #1c352a` — replacing the old `--olive-*` names (v2 `--olive-*` tokens removed). Fonts switched to Bodoni Moda + Manrope. New `.heritage-bg` fixed backdrop system (base + drop-shadowed `.motif-glow` masked to the cursor — lines glow, not a radial light source), static `.stepwell-bg` variant for admin, gold hairline inputs, global `:focus-visible`, responsive breakpoints (1200/768/600/360) and a `prefers-reduced-motion` block.
- `frontend/script.js`: ONLY the motif/glow block changed — `.heritage-bg[data-glow]` replaces the v2 `.stepwell-bg[data-glow]` per-section layers; the rAF-throttled `--glow-x/--glow-y` approach is kept with document-level listeners (the layer is fixed full-screen); frieze-tiling code removed; ambient `.pulse` + reduced-motion gates preserved. All other logic (API fetch, cart, WhatsApp, modal, reveals, image fallback) is byte-identical.
- `frontend/admin.html`: inline styles restyled to the forest/gold tokens (page `--forest-deep`, dialog `--forest`, gold hairlines `rgba(201,162,75,…)`); inline sprite updated to the new monument artwork; the admin inline script is byte-identical.
- `frontend/assets/stepwell-motif.svg`: new gold Rani ki Vav monument line-art (grand pavilion with festooned arches, side jharokha arches, colonnade, niche rows, descending steps, well shaft) — same symbol IDs (`stepwell-motif`, `stepwell-motif-slim`, `stepwell-frieze`, `stepwell-shaft`) kept in sync with the page sprites.
- `api/index.py`: static fallback routes now serve from `frontend/` (FRONTEND_DIR). `vercel.json`: the catch-all rewrite is now `/(.*)` → `/frontend/$1` so all non-API root paths resolve into the new folder.
- `DESIGN.md`: rewritten as the v3 "Heritage Gold & Forest" design-system spec (from the Stitch zip's DESIGN.md, adapted to the vanilla-CSS tokens). Deleted `NEW_DESIGN.md` and `IMPLEMENTATION_PLAN.md` (v2 records) per owner decision.
Why: Owner request — adopt the Stitch-generated design while preserving 100% of the existing functionality/logic/backend integration; cosmetic + structural migration only (no backend/API/schema changes). DESIGN.md handling (rewrite) and v2-doc deletion were confirmed by the owner via ask_user.

### [Category: Dev] — Update context.md for the v3 state; deployment routing for frontend/
What changed: `context.md` fully updated — new repository tree (frontend/ folder, deleted v2 docs), v3 design/feature/conventions sections (forest/gold tokens, heritage-backdrop glow, one-ground rule), updated UI/Motion summary, local-serve instructions (serve `frontend/`), and deployment notes (Vercel rewrites to `/frontend/$1`, api/index.py fallback paths). `api/index.py` and `vercel.json` updated so static files are served from `frontend/` (see UI entry).
Why: RULES.md §8.1 requires Context.md and Changelog.md to reflect every project change; documentation must describe the current implementation, not stale paths.

## [2026-08-11 19:12]

### [Category: UI] — Implement the v2 "Stepwell" redesign (olive/gold/white + Rani ki Vav motif)
What changed: Implemented the approved v2 design (IMPLEMENTATION_PLAN.md) across the frontend.
- `styles.css`: palette migrated to `--olive-*` / `--gold #C9A227` / `--white` / `--off-white` / `--olive-ink*`; new `--transition-glow` token; `.stepwell-bg` system (rest-opacity layers, two-ground color logic, masked `.motif-glow` keyed to `--glow-x/--glow-y`, ambient `.pulse`, frieze strips with ≤360px shaft swap, slim-variant swap ≤768px); button/card/FAB glow pulse on `:hover`/`:focus-visible`; new global `prefers-reduced-motion` block (instant transitions, static raised motif, no glow/pulse); hero-parallax + ornament styles removed; contact styled.
- `index.html`: hidden motif sprite added; `.stepwell-bg` layer added to every section (navbar frieze, hero, marquee frieze, about on-white, collections, modal — kept fixed behind the scrolling grid, featured on-white, why, instagram on-white, contact, footer frieze, cart-drawer vertical strip); v1 hero/about mandala ornaments removed; contact section un-hidden; inline icon hex (`#C9A96E`) replaced with `currentColor` (parent tints gold).
- `script.js`: rAF-throttled cursor-glow tracker (`hover:hover and pointer:fine` gate) setting `--glow-x/--glow-y` + `.glowing`; ambient `.pulse` for touch/keyboard (Tab-key detection); reduced-motion gate; static frieze tiling (9 `<use>` tiles per strip); hero parallax handler removed.
- `admin.html`: inline styles swapped to olive/white tokens (gold hairlines `rgba(201,162,39,…)`); stepwell layer at 0.04 opacity; sprite added; behavior unchanged.
- New `assets/stepwell-motif.svg` — master monoline artwork with `#stepwell-motif`, `#stepwell-motif-slim`, `#stepwell-frieze`, `#stepwell-shaft` symbols (architecture only, no figurative carving).
Why: Approved redesign per NEW_DESIGN.md — the brand shifts to olive/gold/white unified by the stepwell motif with a cursor-reactive glow as the signature interaction; `prefers-reduced-motion` becomes a hard requirement (closes the v1 gap); contact shown and hero parallax removed per owner decisions.

### [Category: Dev] — Promote DESIGN.md to v2, update context.md
What changed: `DESIGN.md` now carries the v2 "Stepwell" content (promoted from `NEW_DESIGN.md`, which remains as the versioned spec snapshot). `context.md` updated: repo tree (assets/, DESIGN.md/NEW_DESIGN.md/IMPLEMENTATION_PLAN.md descriptions), feature list (motif system, glow/pulse, reduced-motion, visible contact), key conventions (two-ground rule, sprite-sync rule), rewritten `## UI/Motion` section, functional boundaries, and guidance. Also created `IMPLEMENTATION_PLAN.md` earlier this session (19:02 entry).
Why: RULES.md §8.1 — Context.md and Changelog.md must reflect every project change; UISKILL.md §12 keeps DESIGN.md as the single design source of truth.
Bug fixed (if applicable): v1 gap — no `prefers-reduced-motion` handling anywhere on the site; now implemented globally.
Root cause (if applicable): v1 shipped without a reduced-motion strategy; v2 mandates it because the glow system adds continuously-animated content.
Known deviation: modal-product-card price renders `--olive-ink` on the light info panel instead of gold for WCAG contrast (gold-on-white ≈ 2.4:1) — tracked in `context.md → UI/Motion`.

## [2026-08-11 19:02]

### [Category: Dev] — Save the Stepwell v2 UI implementation plan; no code changed
What changed: Created `IMPLEMENTATION_PLAN.md` at the project root — the full
implementation plan for the UI v2 "Stepwell" redesign specified in `NEW_DESIGN.md`
(olive/gold/white palette, Rani ki Vav motif system with cursor glow, admin restyle,
`prefers-reduced-motion` support). No source code was written, edited, or deleted:
implementation is gated on explicit owner approval per RULES.md §2.2. Owner decisions
already captured in the plan: contact section becomes visible, hero parallax removed,
`DESIGN.md` promoted to the v2 content after implementation. Also added `NEW_DESIGN.md`
and `IMPLEMENTATION_PLAN.md` to the repository tree in `context.md`.
Why: RULES.md §2 requires an approved plan before any code change; RULES.md §8.1
requires Context.md and Changelog.md updates after any run that changes the project
(this run's change is the plan file and the context tree entry).

## [2026-08-11 18:21]

### [Category: Dev] — Rewrite context.md for the full-stack project state
What changed: Replaced the entire `context.md`. The old version described a static-only
project (no backend, `categoryData`/`productImages` in `script.js`, custom cursor,
hamburger menu) that no longer matches the repository. The new version documents the
current full-stack reality: FastAPI catalogue API (`backend/app/main.py`) with Supabase,
the storefront + cart + WhatsApp order flow, the admin panel, Vercel deployment
(`api/index.py` + `vercel.json`), the Supabase schema, `RULES.md`/`UISKILL.md` operating
documents, current folder/file structure, implemented/in-progress/planned feature list,
architecture & data flow, API routes, key conventions, a "Where to make changes" table,
the storefront JavaScript behavior, a dedicated `## UI/Motion` subsection, current
functional boundaries, contributor guidance, and deployment notes.
Why: RULES.md §8.1 requires a single living context document that reflects the project's
current state so new developers and agents can get oriented without asking; the previous
content was stale and misleading (referenced data structures and UI that were removed
when the API, cart, and admin panel were added).

### [Category: UI] — Create DESIGN.md design-system reference
What changed: Created `DESIGN.md` at the project root. It documents the current frontend
design system derived from `styles.css`, `index.html`, `script.js`, and `admin.html`:
design philosophy and motion budget; all `:root` design tokens (dark-green/ivory/gold
palette with hex values and usage, Cormorant Garamond + Jost typography with the full
type scale, spacing, elevation/border conventions); every component (nav, buttons, hero,
marquee, ornamental divider, about, collection cards, modal, featured strip, why,
instagram, contact, footer, cart drawer + FAB, admin panel); inline-SVG iconography
conventions; responsive breakpoints (1200/768/600/360 + admin 1250/600); states and
interactions; the current accessibility baseline and gaps; the motion inventory with
easing/duration tokens; and a Definition-of-Done checklist for new UI work.
Why: UISKILL.md §4/§14 designates `DESIGN.md` as the design-context source of truth for
the project — the shared reference that prevents agents from fabricating a parallel
design system and enables design-system-drift checks. It also gives the `## UI/Motion`
subsection of `context.md` a full companion document to point at.
