# Chateau Amsterdam — Next.js Rebuild + CMS + Reservations

Date: 2026-07-16
Status: Approved, ready for implementation planning

## Context

The current site (this repo) is a static Vite build (`index.html` + `src/main.js` + `src/main.css`), deployed on Railway via `sirv-cli`. The visual design was approved by the client and is live at `chateau-amsterdam-homepage-production.up.railway.app`. All content (text, wine list, prices) is hardcoded in the HTML — there is no CMS, no backend, no database.

The client (Chateau Amsterdam) is mid-restart with a small team (4 people) and reduced institutional knowledge. Their real, currently-live site is `chateau.amsterdam` (separate from this rebuild), which links out to a fully separate Shopify storefront at `shop.chateau.amsterdam` for the webshop, account, and cart. Reservations for tastings currently go through a plain request form (`chateau.amsterdam/reserveren/`) with no calendar, no payment, and manual confirmation by staff.

This project replaces the current static homepage with a full Next.js site that adds a CMS, live Shopify product data, and a proper reservation-request system — while keeping everything the small team needs to self-manage without outside help.

## Goals

- Rebuild the approved design 1:1 in Next.js (App Router), as a foundation for everything below
- Give the Chateau team a simple CMS to manage all text, the wine list, and images themselves
- Add a wine overview + wine detail page per bottle, with live price/stock from Shopify
- Add a proper two-track reservation system (standard tastings vs. corporate/group quotes), with team-managed availability
- Handle the legal requirements that come with selling alcohol and collecting personal data
- Ship something mobile-first, since tourists are a large share of visitors
- Stay on Railway for now, built portably for a future handoff to the client's own hosting party

## Out of scope

- Online payment for tastings (pricing is quote-based / negotiated, especially for corporate bookings — see Reservations section)
- Shopify Admin API / order management (Storefront API only — see Shopify Integration)
- Executing the actual hosting handoff (we build for portability; the migration itself is a future, separate task)

## Tech stack & architecture

- **Framework:** Next.js, App Router, latest stable. Server Components by default; Server Actions for form submissions (reservations) and CMS mutations.
- **Hosting:** Railway (Node), same as today. Built without Railway-specific lock-in (no reliance on Railway Volumes for anything that must survive a host migration) so a future handoff is "code + env vars + DB dump."
- **Database:** Postgres (Railway-managed). Stores: page/section content (bilingual), wine entries (marketing copy + Shopify product reference — not price/stock, which stays live from Shopify), reservation requests, availability/blackout calendar, admin accounts.
- **Image storage:** Portable object storage (e.g. Cloudflare R2 or equivalent S3-compatible bucket), not a Railway Volume, for the same portability reason.
- **Auth (admin/CMS):** Simple shared team login, hashed passwords, secure session cookies (httpOnly, secure, sameSite). No multi-role permission system — not needed at this team size.
- **Email:** Transactional email service (e.g. Resend) for the two reservation-flow notifications (see below).
- **Analytics:** Umami (cookieless, no personal data collected — falls outside cookie-consent requirements).

## Sitemap

All pages bilingual (NL/EN) via the existing language-toggle pattern.

- Home
- Wijnen (overview) → Wijn (detail page per bottle)
- Voor Bedrijven
- Over Ons
- Contact
- Boek een Tasting (two-track reservation flow)
- Privacyverklaring (new, required — see Legal & compliance)

## Design

- Primary color becomes **yellow** (confirmed as the client's actual established brand color — it's already what `shop.chateau.amsterdam` uses to match its Shopify theme to the main brand).
- Fix the remaining bordeaux-red styling under "Our Story" that should have followed the yellow theme.
- Rebuild all current interactions (parallax, magnetic buttons, scroll reveals, counters, language toggle, light/dark toggle) faithfully as React components — this is a full rebuild of the frontend layer, not a simple port, even though the output must look identical.
- Shared layout (header/footer/nav) across all pages so new subpages inherit the same design system automatically.

## CMS (`/admin`, login-gated)

- **Content editor:** per-page/per-section text fields, bilingual (NL/EN pairs), covering the same sections that exist today (hero, story, process steps, visiting info, etc.) plus the new pages.
- **Wines:** add/edit/remove wine entries — marketing description, story blurb, image, and a link to the corresponding Shopify product (for live price/stock). No manual price/stock entry — that would drift from Shopify's own POS-linked data.
- **Reservations inbox:** every incoming request (both tracks, see below) in one list, with status (nieuw / in behandeling / bevestigd / afgewezen).
- **Beschikbaarheid:** mark specific dates or recurring days/dayparts as unavailable, so the public reservation flow only offers slots the (small) team can actually staff.
- **Media library:** image upload, used by both content and wine entries.

## Shopify integration

Researched against the client's real, currently-live setup:
- `chateau.amsterdam` (their current live site) does **not** embed Shopify at all — it plain-links out to `shop.chateau.amsterdam`, a fully separate Shopify storefront, for Webshop/Account/Cart. That shop is themed to visually match the main brand (same yellow, same nav) despite being a different domain.
- Reservations are entirely separate from Shopify — a plain request form, no online payment.

Decision: **Shopify Storefront API**, not Admin API, and not an iframe.
- iframe was considered and rejected: Shopify blocks framing its checkout for security (X-Frame-Options), and framing just the product list gives poor, unstyled UX with no design control — not how the client does it today either.
- The Storefront API token is separate from, and much lighter-weight than, the Admin API token the client is still waiting on — it can be self-created in Shopify admin in minutes, so this does not need to wait.
- The new wine overview/detail pages fetch live price, stock, and images from Shopify via the Storefront API (same account that drives their POS, so always in sync).
- "Bestel nu" hands off to Shopify's own hosted checkout — same handoff model as today, just wrapped in on-brand pages instead of a bare Shopify listing.

## Reservations

Current real-world baseline (from the live site): a plain contact-style form, no calendar, no payment, manual confirmation, max 4 people self-service (larger groups handled by a follow-up email).

New design — **two tracks, neither with online payment** (tasting pricing is quote/negotiated, especially for corporate bookings, so an online-payment flow would create price mismatches):

1. **Standaard proeverij** (individuals, small tourist groups): calendar/date picker limited to days the team has marked available, party size, contact details.
2. **Zakelijk / grote groepen** (offerte-basis): company name, contact person, group size, occasion, preferred period, wishes — tagged separately in the inbox as an "offerte-aanvraag" so staff know a quote/negotiation step comes first.

Both tracks:
- Land in the same CMS reservations inbox with status tracking, so nothing is lost when the small team is stretched thin (this was a direct response to a real incident: a tasting request came in while the whole 4-person team was effectively on holiday, and nobody had flagged the date as unavailable).
- Trigger an automatic internal notification email (so staff don't have to babysit the admin inbox) and an automatic acknowledgment email to the requester.
- Respect the availability calendar — unavailable dates/dayparts simply aren't offered.

## Legal & compliance

- **Age verification (18+):** required under the Reclamecode voor Alcoholhoudende Dranken. Entry gate on first visit ("Ben je 18 jaar of ouder?"), remembered via cookie so returning visitors aren't re-gated, plus a persistent NIX18/responsible-drinking notice in the footer.
- **Company info footer ("colofon"):** legally required for a commercial site (Dienstenrichtlijn). Use the details already public on the client's current site: KvK 37096100, Johan van Hasseltweg 51, 1021 KN Amsterdam.
- **Privacyverklaring (AVG/GDPR):** new page. Covers what's collected via the reservation forms (name/email/phone/comments), why, retention period, and how someone can request access/deletion.
- **Cookie consent:** only non-essential/tracking cookies require it. Umami is cookieless and collects no personal data, so it sits outside this requirement entirely — no banner needed for analytics. Build the consent mechanism to gate any *future* tracking cookie regardless, so it's ready if that ever changes.
- **Accessibility:** the EU Accessibility Act (June 2025) covers e-commerce, but has a micro-enterprise exemption (<10 staff) that Chateau Amsterdam likely qualifies for. Build reasonably accessible anyway (contrast, alt text, keyboard navigation) — cheap to do from scratch, protects them if they grow.

## Security

- HTTPS everywhere (automatic via Railway).
- Hashed admin passwords, secure session cookies, CSRF protection on forms.
- Spam protection (honeypot / Turnstile-style) on the public reservation and contact forms.
- Rate limiting on public form endpoints.
- Defined retention + deletion process for reservation data (GDPR storage-limitation principle).
- No card/payment data ever touches our stack — that stays entirely inside Shopify's checkout (PCI scope stays with Shopify).

## Mobile

Mobile-first, not a retrofit — treated as a hard requirement, not a nice-to-have, since tourists are expected to be a large share of visitors. Explicit testing on phone-sized viewports for the Shopify-linked pages, the reservation calendar, and the CMS-driven content, since those are the pieces most likely to break first on small screens.

## Decisions log (for traceability)

- Framework: Next.js App Router (over staying static, over Astro) — chosen because a backend is needed regardless (CMS + reservations), and Next unifies frontend/backend/multi-page routing in one codebase the client already knows.
- Hosting/data: Railway + Postgres + portable object storage (over a Railway Volume) — driven by the planned future handoff to the client's own hosting party.
- Shopify: Storefront API + hosted-checkout handoff (over iframe, over full custom headless checkout) — matches how the client already operates today, avoids checkout-framing restrictions, and doesn't block on the Admin API token.
- Reservations: request-based, two tracks, no online payment (over instant paid booking) — driven directly by the client's pricing model (quote-based, mostly B2B) and by a real incident where an unflagged unavailable date led to an unwanted booking.
- Sitemap: matches the client's current live site's page set (Voor Bedrijven / Over Ons / Contact as standalone pages) rather than staying a pure one-pager.
- Domain: stays on the Railway subdomain for now — no custom domain work in this phase.
- Language: NL/EN toggle extends to all new pages and both reservation forms.
