# Wijnenoverzicht en Wijndetailpagina — Design

Date: 2026-07-17
Status: Approved, ready for implementation planning

## Context

Phase 1 (Next.js foundation) and Phase 2 (CMS) are live in production. Per `docs/superpowers/specs/2026-07-16-nextjs-rebuild-design.md`, the remaining scope was Shopify integration, reservations, extra pages, and legal/compliance. The client re-sequenced that list: public subpages come first (starting with wines), then the reservation form, then the remaining extra pages, then Shopify Storefront API integration, then legal/compliance, then analytics, then loose ends and CMS tweaks.

This spec covers the first piece of that new sequence: a wine overview page and a wine detail page per bottle, reachable by clicking a wine card on the homepage. Everything else in the re-sequenced list is out of scope here and gets its own spec when its turn comes.

## Goals

- Every wine card on the homepage links to a real detail page for that bottle, with enough content to feel like more than the existing card teaser.
- A wine overview page exists as the anchor other pages (and a future "shop all wines" style entry point) can link to.
- The wine content model in the CMS gains the fields needed to support the detail page, grounded in what the client's real Shopify product pages already show today (screenshotted during design), not invented.
- The existing "click through to Shopify to actually buy" flow keeps working exactly as it does today. Nothing about checkout, cart, or live price/stock gets built in this phase.

## Out of scope

Deferred to the later "Shopify Storefront API" phase (not this spec):

- Live price and stock from Shopify.
- Cart / add-to-basket UX.
- Any change to how checkout actually happens.

Deferred to their own later phases (not this spec): the reservation form, Voor Bedrijven / Over Ons / Contact / Tour & Tastings pages, legal & compliance, analytics.

## Wine overview page

- New route, e.g. `/wijnen`.
- Intro block above the grid, stacked top to bottom (not side by side with the grid or with each other): the small mono label used elsewhere on the site (e.g. "De collectie"), then a bold headline in the same voice as the rest of the site (e.g. "Van klassiek *tot rebels*", italic accent word), then a short intro paragraph directly underneath the headline. Stacking, rather than placing the paragraph beside the headline, was chosen deliberately for simpler responsive line-breaking.
- Simple grid, reusing the existing wine-card visual treatment from the homepage (image, meta, name, tag), including its hover interaction (lift, slight rotation, shadow) unchanged. No price shown on the cards, consistent with the detail page and validated against two award-winning wine brand sites researched during design (Ashes & Diamonds, BRAND Napa Valley): neither shows price on its collection/overview page, both push price and full detail to the individual wine page.
- No filtering or sorting. Five wines today, filtering would be premature.
- Each card has a short link cue (e.g. "Bekijk deze fles →") and links to that wine's detail page.

## Wine detail page

- New route, e.g. `/wijnen/[slug]`.
- Layout: "classic product page." Photo column on the left, info column on the right. Everything essential (name, price hand-off, profile) fits without scrolling on a normal viewport. Chosen over a hero-plus-sticky-specs layout and a full narrative-scroll layout after a visual mockup comparison; both alternatives work for a portrait bottle photo too, but this one matches how the existing wine-card already centers a bottle photo, and needs no scroll to reach the buy button.
- Breadcrumb above the two-column area: `Home / Wijnen / <wine name>`.

**Photo column**, top to bottom:
1. Bottle photo (existing `image` field), in a bordered frame matching the site's card treatment.
2. "Wijn-spijs suggestie" card directly below the photo: chalk background, yellow left accent border, mono label, then the pairing text. Placed here (not in the info column) so it has its own visual weight instead of competing with the profile block for space.

**Info column**, top to bottom:
1. Meta line (existing `meta` field, e.g. "N°03 · Rood · Bourgognestijl").
2. Wine name (existing `name`).
3. Tag (existing `tag`, italic accent color, unchanged).
4. Description (new field, short paragraph — matches the length of the client's existing Shopify product descriptions, not a long-form essay).
5. "Wijnprofiel" block: two groups side by side with a vertical gap between them, not a strict alternating 2-column grid (an alternating grid produced an inconsistent border between the two columns' differing row counts during design review).
   - Left group, short facts: Jaargang, Druif, Alcoholpercentage.
   - Right group, longer fields: Type, Regio, Landbouwtechniek, Vinificatie.
   - Every field has a horizontal divider below it except the last field in its own group (no trailing divider before the block's own border).
6. Buy button, label "Bestel deze fles" (not "Bestel via Shopify"). No subtext or explanation is shown beneath it. Both choices are deliberate: the goal is a seamless single-site feel where the visitor never has to register that Shopify is involved at all. See "Buy button: bridge vs. end state" below for what this button actually does today versus what it becomes later.

**Below the two-column area, full width:**
"Misschien vind je dit ook leuk" — a handful of other active wines, reusing the existing card component. Deliberately not framed as "andere mensen kochten ook zoiets" (customers who bought this also bought): that framing implies real purchase-correlation data, which lives in Shopify's Admin API and order history, both explicitly out of scope for this project. Showing it anyway without the data behind it would be an unsubstantiated claim to a real visitor.

## Buy button: bridge vs. end state

This is the one part of the page whose current implementation is deliberately temporary, and the distinction must be explicit in the code, not just in this document.

**Current implementation (this phase):**
- The button links directly to the wine's existing Shopify product page (same destination the current homepage already sends people to).
- Label: "Bestel deze fles." No visible subtext.
- The component implementing this button must carry a code comment (not user-facing, a real `{/* ... */}` / `//` comment, never rendered) stating plainly that this is a temporary bridge, and describing the end state below, so a future implementer doesn't mistake the direct link for the intended final design.

**End state (built in the later Shopify Storefront API phase, not now):**
- The button becomes an "In winkelmandje" action that adds the item to a cart, using the Storefront API's Cart object, and opens a slide-in drawer.
- The customer can add and remove wines and stays on this site throughout.
- Only the final payment step redirects once to Shopify's hosted checkout.
- Price and stock become live at that point, fetched server-side via the Storefront API (server-side so the access token stays private and the data is always fresh).
- The direct-Shopify-link pattern from the current phase is replaced wholesale at that point, not extended or reused elsewhere.

## New CMS fields (wines)

All new fields are optional and ship empty. Grounded in what the client's real, currently-live Shopify product pages already show (verified via screenshots during design), not invented. Real values must come from the client via the CMS wine form, not be fabricated as placeholder-but-plausible content for a real, sellable product.

| Field | Bilingual (NL/EN)? | Example |
|---|---|---|
| `description` | Yes | "Gerijpt op eikenhouten vaten, middenin Amsterdam-Noord..." |
| `grapes` | No (proper nouns / blend list) | "Chardonnay, macabeo, viognier" |
| `vintage` | No | "2023" or "blend" |
| `wineType` | Yes | "Elegante, medium-bodied rode wijn" |
| `region` | Yes | "Bourgogne-druiven, gevinifieerd in Amsterdam-Noord" |
| `farmingMethod` | Yes | "Conventioneel (FR)" |
| `vinification` | Yes | "Gerijpt op Franse eik" |
| `abv` | No (numeric) | 13.0 |
| `foodPairing` | Yes | "Heerlijk bij gegrilde eend..." |

Reused, no schema change needed: `name`, `tag`, `meta`, `image`, `active`, `shopifyHandle`.

The CMS wine form (wizard) needs new inputs for each of the fields above, on top of what it already has.

## Design tokens

No new tokens. This is public-site work, so it inherits `app/globals.css`'s existing brand system (ink/paper/accent colors, Archivo/Instrument Serif/IBM Plex Mono fonts, 2px sharp corners, 999px pill buttons), not the separate `app/admin/admin.css` token set used by the CMS.

## Decisions log

- Wine pages live on our own site rather than linking straight to Shopify's storefront, per the original master spec's Storefront API + hosted-checkout decision, and because a redirect-only approach would contradict the explicit ask for a detail page with real feel and story, not just a bare product listing.
- Layout: classic/compact product page over a hero-plus-sticky-specs layout and a full narrative-scroll layout, decided via a visual mockup comparison of all three.
- Content fields grounded in the client's own live Shopify product page (screenshotted during this session: description, grape/blend list, a structured "Wijnprofiel" popup with vintage/type/grape/region/farming technique/vinification/ABV, and a "Wijn-spijs suggestie" popup), rather than invented from scratch. The Shopify page's own local-pickup/fulfillment info was deliberately not carried over, that stays a Shopify/checkout concern.
- Unlike the Shopify reference, "Wijnprofiel" and "Wijn-spijs suggestie" are shown directly on the page, not behind click-to-open modals. Chosen to match the "everything essential visible without extra clicks" reasoning behind the classic-product-page layout choice above.
- "Misschien vind je dit ook leuk" chosen over "andere mensen kochten ook zoiets" specifically to avoid an unsubstantiated data claim (see "Below the two-column area" above).
- Buy button intentionally obscures the Shopify hand-off (label plus no subtext) to support a single seamless-site feel. This is a deliberate today-state, not a permanent one, hence the required code comment describing the end state.
- Wijnprofiel fields are grouped by content type (short facts vs. longer descriptive fields) rather than in strict alternating-row order, both for readability and because the alternating-row version produced an inconsistent border depending on which column had more rows.
- Wine overview page's no-price, no-filter approach was cross-checked against real examples (Ashes & Diamonds' `/shop`, BRAND Napa Valley's `/our-wines/`) rather than decided on taste alone: both hide price on the overview and rely on the detail page for the real content, matching what was already decided here independently.
