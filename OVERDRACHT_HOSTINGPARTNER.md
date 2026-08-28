# Overdracht & Technische Specificaties: Chateau Amsterdam Website

Dit document bevat alle benodigde technische specificaties, build-instructies, database-export en DNS-instellingen voor de hostingpartner om de nieuwe Chateau Amsterdam website en applicatie live te zetten op `chateau.amsterdam`.

---

## 1. Wat zit er in het overdrachtspakket?

1. **Broncode (Git repository of ZIP):** Complete Next.js 16 applicatie (TypeScript, Tailwind, Drizzle ORM, React 19).
2. **Database Export (`database_export.sql`):** Volledige SQL dump met alle tabellen, 126 geredigeerde contentblokken (NL & EN), initiële team-accounts (`didier@`, `sales@`, `floor@`), reserveringen en beschikbaarheidsblokken.
3. **Environment Template (`.env.example`):** Alle benodigde variabelen voor Resend, Shopify, S3 Media en Database.
4. **Dockerfile & .dockerignore:** Voor containerized hosting (Docker, Kubernetes, Coolify, Cloud Run of VPS).

---

## 2. Technische Stack & Vereisten

| Onderdeel | Specificatie |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, React 19, TypeScript) |
| **Node.js Versie** | Node.js 20+ of Node.js 22 LTS |
| **Database** | PostgreSQL 14+ (met `pgcrypto` of `uuid-ossp` voor `gen_random_uuid()`) |
| **E-mail Engine** | Resend REST API (subdomein `updates.chateau.amsterdam` is reeds geverifieerd) |
| **Media Opslag** | S3-compatibele storage (Tigris / Cloudflare R2 / AWS S3) |
| **Shopify Integratie** | Shopify Storefront API |

---

## 3. Database Installatie & Data Import

De hostingpartner kan de database opzetten op hun eigen PostgreSQL server via:

```bash
# 1. Maak een schone database aan (bijv. chateau_production)
createdb chateau_production

# 2. Importeer het complete schema en alle data in één commando:
psql -d chateau_production -f database_export.sql
```

*Automatische migraties bij opstarten:*  
De applicatie voert bij elke start automatisch veilige, idempotente schema-controles uit (`npm run db:migrate`).

---

## 4. Omgevingsvariabelen (Environment Variables)

Plaats de volgende variabelen in het hosting panel of in `.env`:

```env
# 1. PostgreSQL Database
DATABASE_URL="postgresql://<GEBRUIKERSNAAM>:<WACHTWOORD>@<HOST>:5432/<DATABASE>?sslmode=require"

# 2. Productie Domein & Port
PUBLIC_SITE_URL="https://chateau.amsterdam"
NODE_ENV="production"
PORT=3000

# 3. Transactiemails & Inlogcodes (Resend API)
RESEND_API_KEY="re_your_resend_api_key_here"
SENDER_EMAIL="Chateau Amsterdam <no-reply@updates.chateau.amsterdam>"
SALES_EMAIL="sales@chateau.amsterdam"

# 4. Media Storage (S3 / Tigris)
AWS_ENDPOINT_URL="https://t3.storageapi.dev"
AWS_ACCESS_KEY_ID="tid_GeBzNrFpfgGmUIfCuQ_ZqxZmaQOFbrICAswXcjziHoENvbawKF"
AWS_SECRET_ACCESS_KEY="tsec_FYNnr5y9JdHhSAqk+xPur30TXhjGUe4kghbqCXFC3HrQWp7E_GJLl+XyNW0XEJoeXl2TF5"
AWS_S3_BUCKET_NAME="chateau-media-fwmefitwhff"
AWS_DEFAULT_REGION="auto"

# 5. Shopify Storefront API
SHOPIFY_STORE_DOMAIN="chateau-amsterdam-winery.myshopify.com"
SHOPIFY_STOREFRONT_TOKEN="a6b31f8499491a468cd76cf1f8bdfd2b"

# 6. Cookieless Analytics (Umami)
NEXT_PUBLIC_UMAMI_WEBSITE_ID="7979bc7c-df6e-4805-bd51-9bed0a78239b"
NEXT_PUBLIC_UMAMI_SCRIPT_URL="https://umami-softwareumami-production-a78e.up.railway.app/script.js"
```

---

## 5. Build & Start Opties

### Optie A: Direct via Node.js / PM2 / VPS / Vercel / Railway
```bash
# Dependencies installeren
npm ci

# Productie build draaien
npm run build

# Starten op poort 3000 (of geconfigureerde $PORT)
npm run start
```

### Optie B: Docker Container
```bash
# Image builden
docker build -t chateau-amsterdam .

# Container starten
docker run -d -p 3000:3000 --env-file .env --name chateau-site chateau-amsterdam
```

---

## 6. DNS Switch naar Live Domein (`chateau.amsterdam`)

Zodra de applicatie draait en getest is op het test-IP/subdomein van de hostingpartner, moeten de DNS-records voor `chateau.amsterdam` worden omgezet vanaf de oude server:

1. **Apex Domein (`@` / `chateau.amsterdam`):**  
   * Type: `A` (of `ALIAS`/`ANAME` bij modern DNS management)  
   * Waarde: IP-adres van de nieuwe server.
2. **Subdomein `www` (`www.chateau.amsterdam`):**  
   * Type: `CNAME`  
   * Waarde: Verwijzing naar hoofddomein of server hostname.
3. **E-mail Subdomein (`updates.chateau.amsterdam`):**  
   * **Reeds geverifieerd:** De DKIM, SPF en MX records voor dit subdomein staan reeds goed in DNS via Resend en hoeven **niet** gewijzigd te worden.

---

## 7. Beheer & Inloggen in het CMS

* **Inlogpagina:** `https://chateau.amsterdam/admin`
* **Inlogmethode:** Passwordless (1-klik e-mail magic link of 6-cijferige verificatiecode).
* **Standaard geautoriseerde teamleden:**
  * `didier@chateau.amsterdam`
  * `sales@chateau.amsterdam`
  * `floor@chateau.amsterdam`
  * `studio@monobydusty.com` (technisch support)
* Nieuwe collega's kunnen eenvoudig worden toegevoegd via het CMS onder `/admin/account`.

---

## 8. Vragen & Contact
Voor technische vragen tijdens de migratie of overdracht:  
**Mono by Dusty** — `studio@monobydusty.com`
