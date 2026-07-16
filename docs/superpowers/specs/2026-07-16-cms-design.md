# Chateau Amsterdam — CMS (Fase 2)

Date: 2026-07-16
Status: Approved, ready for implementation planning

## Context

Fase 1 (this repo) rebuilt the approved static design as a Next.js App Router site — one homepage composed of section components (`Hero`, `Manifest`, `Process`, `Paths`, `WinesPreview`, `Place`, plus `SiteHeader`/`SiteFooter`), each a client component reading bilingual text from local constants via `useLanguage()`'s `t(nl, en)` helper, and a hardcoded `WINES` array in `wines-preview.tsx`. There is no database, no admin surface, and no way for the client's 4-person team to change a word of copy or add a wine without a code change. Phase 1 deliberately left every section's text as local constants specifically so this phase could lift them into props without restructuring the reveal/parallax/magnetic client logic underneath.

This phase adds the CMS described in the original rebuild spec (`2026-07-16-nextjs-rebuild-design.md`): a login-gated `/admin` for text, wines, reservations, and availability, backed by Postgres and portable object storage, with the public homepage wired to read its content live from that data instead of from hardcoded strings.

## Goals

- Give the Chateau team self-service control over all homepage text (bilingual NL/EN), the wine list, incoming reservation requests, and booking availability — no code changes needed for day-to-day edits.
- Wire the existing homepage components to read their content from Postgres, so a save in `/admin` is immediately live.
- Simple, revocable team login (named accounts, no role system).
- Stay portable: Postgres (dumpable), object storage via a standard S3-compatible client (not a Railway Volume), so a future handoff to the client's own hosting party is "code + env vars + DB dump + bucket copy."

## Out of scope (deferred to a later phase)

- **Public reservation booking form** ("Boek een Tasting", both tracks). This phase builds the reservations *inbox* and *availability calendar* in `/admin` only; the schema and admin UI are ready for a public form to write into, but that form itself, its spam protection, and its confirmation emails are a later phase.
- **Shopify Storefront API integration.** Wines admin stores marketing copy and a Shopify product handle, but no live price/stock is fetched — the public wine card keeps a static "vanaf shop.chateau.amsterdam" style placeholder until the Storefront API phase.
- **New public pages** (Wijnen detail per bottle, Voor Bedrijven, Over Ons, Contact, Privacyverklaring). This phase only wires the sections that exist today. New pages arrive in a later phase and will reuse the same `content_blocks` schema.
- **Cookie consent mechanism, age-gate, legal footer/colofon text.** Tracked in the original spec's Legal & compliance section; not part of the CMS build itself.

## Tech stack & architecture

- **ORM: Drizzle**, not Prisma. SQL-shaped schema and plain-SQL migrations (readable and handoff-friendly), no generated-client cold-start overhead on Railway's Node runtime.
- **Auth: hand-rolled sessions**, not NextAuth/Auth.js. 4 named accounts (email + bcrypt-hashed password), no roles. A `sessions` table (random token, expiry) backs an httpOnly/secure/sameSite cookie — DB-backed so revoking an account is a single `DELETE`, not a wait for JWT expiry. Next.js middleware gates every `/admin/**` route, redirecting to `/admin/login` when the session is missing or expired.
- **Admin UI: Tailwind, scoped to `app/admin/**` only.** The public site's `app/globals.css` design system (protected from framework-induced regression in phase 1) is untouched; the admin panel is a new internal surface where build speed matters more than bespoke visual polish.
- **Object storage: Railway's S3-compatible bucket add-on.** Accessed through a standard S3 client library, not Railway-specific volume mounts — so the integration code is portable even though the bucket contents themselves would need copying in a future migration off Railway.
- **Content model: a generic `content_blocks` table** (page/section/field key → NL/EN value pairs) rather than one bespoke table per section. Matches how phase 1 left text as swappable local constants, and means adding a new editable field later is a data change, not a schema migration.
- **Rendering: no caching layer.** `app/page.tsx` and friends become Server Components that query Postgres per request and pass content down as props to the existing client components (which keep their reveal/parallax/magnetic hook logic unchanged). Traffic is small enough that "save in admin → immediately live" matters more than shaving a DB round-trip; caching can be layered on later if needed.

## Data model

```
users                id, email, password_hash, created_at
sessions             id, user_id, token_hash, expires_at, created_at

content_blocks       id, page, section, field_key, value_nl, value_en, updated_at, updated_by

wines                id, name, marketing_copy_nl, marketing_copy_en, story_blurb_nl, story_blurb_en,
                     image_id (fk → media), shopify_handle, sort_order, is_active, updated_at

media                id, storage_key, filename, alt_text_nl, alt_text_en, uploaded_by, created_at

reservations         id, track (standaard|zakelijk), status (nieuw|in_behandeling|bevestigd|afgewezen),
                     contact_name, email, phone, party_size, group_size, company_name,
                     occasion, preferred_period, requested_date, notes, created_at, updated_at

availability_blocks  id, date, daypart (ochtend|middag|avond|hele_dag), reason, created_at
```

`reservations` is one table covering both tracks (with nullable track-specific columns) rather than two separate tables, since the original spec requires both tracks to land in one shared inbox with one status model.

## Features

**Auth (`/admin/login`, middleware-gated `/admin/**`)** — login form, session cookie on success, logout clears the session row + cookie. No self-service signup; the 4 accounts are seeded directly since there's no invite flow needed at this size.

**Content editor (`/admin/content`)** — one editable form per existing homepage section (Header, Hero, Marquee, Manifest/Story, Process, Paths, Wines intro, Place, Footer), each a set of NL/EN field pairs backed by `content_blocks`, saved via a Server Action. A one-time seed script extracts today's hardcoded strings into initial rows so the cutover is a non-event. Each public component's local text constants are replaced by props fed from a server-side `getContent(page, section)` call in `app/page.tsx`; if a row is missing, the field falls back to its current hardcoded default rather than rendering blank.

**Wines admin (`/admin/wines`)** — list, add/edit/remove, drag-to-reorder. Each entry: marketing copy + story blurb (NL/EN), image (from media library), Shopify product handle (plain text, validated non-empty but not verified against Shopify yet), active toggle. `WinesPreview` reads active wines from Postgres instead of the hardcoded `WINES` array; price stays a static placeholder until the Shopify phase.

**Reservations inbox (`/admin/reservations`)** — list filterable by status/track, detail view, status transitions (nieuw → in behandeling → bevestigd/afgewezen) via Server Action. A seed script creates sample requests (both tracks) so the inbox is demonstrable before the public form exists in a later phase.

**Availability calendar (`/admin/availability`)** — month-grid, click a date (optionally a specific daypart) to toggle blocked/unblocked, backed by `availability_blocks`. Explicit blocked entries, not a recurrence-rule engine — simpler for a 4-person team marking real absences, and matches the original incident (one specific unflagged date) that motivated this feature.

**Media library (`/admin/media`)** — upload (drag/drop or file picker) straight to the Railway bucket via Server Action, storing key/filename/alt text in `media`; consumed by the wines image picker. The content editor covers text only in this phase — today's section images (hero photo, process step photos, place photo) are approved brand photography that changes rarely, so they stay static assets rather than gaining a media-backed image field; that can be added later if a real need shows up.

## Testing

- Vitest + RTL for logic, consistent with phase 1: password hashing/session helpers, Server Action input validation, availability-blocking logic, reservation status-transition rules, and content-fallback behavior (missing `content_blocks` row → hardcoded default, never blank).
- DB-touching repository functions (`lib/db/wines.ts`, `lib/db/reservations.ts`, etc.) are unit-tested against a real local Postgres test database (not mocked) — query correctness is exactly what needs proving.
- Full Server Action wiring (cookies, redirects, end-to-end admin flows) is verified manually in the browser against a dev database, mirroring phase 1's visual-verification fallback for things that don't unit-test cheaply.

## Security

- bcrypt password hashing.
- CSRF protection via Next.js Server Actions' built-in origin checks.
- Basic in-memory rate limiting on `/admin/login` attempts.
- Upload validation (file type/size) on the media library endpoint.
- No public-facing forms exist yet in this phase, so honeypot/Turnstile-style spam protection is deferred to the public reservation-form phase.

## Migration & seeding

- Drizzle migrations are committed to the repo as plain SQL.
- A separate, re-runnable seed script populates: initial `content_blocks` rows (extracted from today's hardcoded component text), the 4 user accounts, and sample reservation requests for inbox demonstration. Seeding is not baked into a migration.

## Decisions log

- ORM: Drizzle over Prisma — SQL-shaped, portable, no generated-client cold-start cost.
- Auth: hand-rolled DB-backed sessions over NextAuth — 4 named accounts, no roles, simple revocation.
- Admin UI: Tailwind scoped to `/admin` only — the public site's hand-ported CSS system stays untouched; the admin panel has no pixel-perfect design to protect.
- Object storage: Railway's S3-compatible bucket over Cloudflare R2 — one dashboard, standard S3 client keeps the integration code portable even though the bucket contents would need copying in a future off-Railway migration.
- Content model: generic `content_blocks` (page/section/field key) over per-section tables — matches phase 1's "local constants as swappable props" design, avoids a migration for every new copy field.
- Reservations: one shared table for both tracks — required by the "single inbox" behavior from the original spec.
- Scope: admin-only for reservations (no public form), no Shopify integration, no new public pages — all deferred to a later phase per the client's explicit phase-2 summary; this phase covers wiring today's existing homepage sections plus the full admin surface.
