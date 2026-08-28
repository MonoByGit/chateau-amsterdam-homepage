# Chateau Amsterdam — Official Website & CMS

De officiële website en het Content Management Systeem voor **Chateau Amsterdam** (Urban Winery Amsterdam-Noord).

- **Productie Live URL:** `https://chateau.amsterdam`
- **CMS Beheer URL:** `https://chateau.amsterdam/admin`
- **Versie:** `v1.0.0` (Productie Release)

---

## Stack & Technologie

- **Frontend:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database:** PostgreSQL 14+ via Drizzle ORM
- **E-mail Engine:** Resend Transactional REST API
- **Media Opslag:** S3-compatibel (Tigris / Cloudflare R2 / AWS S3)
- **E-commerce:** Shopify Storefront API

---

## Snelle Start

1. **Clone repository:**
   ```bash
   git clone https://github.com/MonoByGit/chateau-amsterdam.git
   cd chateau-amsterdam
   ```

2. **Dependencies installeren:**
   ```bash
   npm ci
   ```

3. **Omgevingsvariabelen instellen:**
   Kopieer `.env.example` naar `.env.local` en vul de database- en API-sleutels in.

4. **Database importeren:**
   ```bash
   psql -d <jouw_database> -f database_export.sql
   ```

5. **Lokaal starten:**
   ```bash
   npm run dev
   ```

6. **Productie build & start:**
   ```bash
   npm run build
   npm run start
   ```

---

## Overdracht & Hosting

Raadpleeg [`OVERDRACHT_HOSTINGPARTNER.md`](./OVERDRACHT_HOSTINGPARTNER.md) voor de volledige technische specificaties, server-configuraties en DNS-instellingen voor livegang.
