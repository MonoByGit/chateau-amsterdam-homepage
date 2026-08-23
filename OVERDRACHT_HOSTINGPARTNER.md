# Overdracht & Technische Specificaties: Chateau Amsterdam Website

Dit document bevat alle benodigde technische specificaties, build-instructies, omgevingsvariabelen en DNS-instellingen voor de hostingpartner om de nieuwe Chateau Amsterdam website en applicatie live te zetten.

---

## 1. Repository & Stack

| Onderdeel | Specificatie |
| :--- | :--- |
| **Git Repository** | `https://github.com/MonoByGit/chateau-amsterdam-homepage` |
| **Productie Branch** | `main` |
| **Framework** | Next.js 15 (App Router, React 19, TypeScript) |
| **Runtime** | Node.js 20+ (LTS) |
| **Database** | PostgreSQL 14+ (beheerd via Drizzle ORM) |
| **E-mail Engine** | Resend Transactional Email API (REST) |

---

## 2. Omgevingsvariabelen (Environment Variables)

Stel de volgende variabelen in op de hostingomgeving (bijv. via `.env` of het server control panel):

```env
# 1. Database (PostgreSQL)
DATABASE_URL="postgresql://<GEBRUIKERSNAAM>:<WACHTWOORD>@<HOST>:<POORT>/<DATABASE>?sslmode=require"

# 2. Applicatie URLs & Beveiliging
PUBLIC_SITE_URL="https://chateau.amsterdam"
SESSION_SECRET="<GENEREER_EEN_VEILIGE_RANDOM_STRING_MIN_32_TEKENS>"
RESERVATION_ACTION_SECRET="<GENEREER_EEN_VEILIGE_RANDOM_STRING_MIN_32_TEKENS>"
ADMIN_PASSWORD_HASH=""

# 3. Transactiemails & Reserveringen (Resend API)
RESEND_API_KEY="re_your_resend_api_key_here"
SENDER_EMAIL="Chateau Amsterdam <reserveringen@updates.chateau.amsterdam>"
SALES_EMAIL="sales@chateau.amsterdam"

# 4. Media Opslag (S3 / Cloudflare R2 / AWS - Optioneel)
AWS_ENDPOINT_URL=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET_NAME=""
AWS_DEFAULT_REGION="auto"

# 5. Shopify Storefront API (Optioneel voor live winkelmand)
SHOPIFY_STORE_DOMAIN=""
SHOPIFY_STOREFRONT_TOKEN=""
SHOPIFY_API_VERSION="2025-10"
```

---

## 3. Build & Deployment Stappen

### Optie A: Node.js / Serverless / PaaS (bijv. Railway, Vercel, VPS)
1. **Dependencies installeren:**
   ```bash
   npm ci
   ```
2. **Database Schema & Migraties uitvoeren:**
   ```bash
   npx drizzle-kit migrate
   ```
   *(Optioneel om initiële CMS defaults/teksten te laden indien de database leeg is: `npm run db:seed`)*
3. **Productie Build genereren:**
   ```bash
   npm run build
   ```
4. **Applicatie starten:**
   ```bash
   npm run start
   ```

### Optie B: Docker Container
De repository bevat een complete Dockerfile. Builden en draaien kan direct via:
```bash
docker build -t chateau-amsterdam .
docker run -p 3000:3000 --env-file .env chateau-amsterdam
```

---

## 4. DNS Instellingen voor Livegang (De Switch)

Zodra de applicatie draait op de servers van de hostingpartner, moeten de DNS-records voor `chateau.amsterdam` worden omgezet vanaf de oude WordPress-server:

### 4.1 Hoofddomein (Website Verkeer)
* **Apex Domein (`@` / `chateau.amsterdam`):**  
  Verwijzen naar het IP-adres (A-record) of ALIAS/ANAME van de nieuwe server.
* **Subdomein (`www.chateau.amsterdam`):**  
  CNAME verwijzing naar het nieuwe serveradres.

### 4.2 E-mail Verificatie Subdomein (`updates.chateau.amsterdam`)
> [!NOTE]
> De DNS-records voor het transactiemails-subdomein (`updates.chateau.amsterdam`) zijn **reeds geverifieerd** (DKIM, SPF, MX) via Resend. Hier hoeft niets meer aan gewijzigd te worden.

---

## 5. Beheerders & CMS Toegang

* **CMS Inlog URL:** `https://chateau.amsterdam/admin`
* **Functionaliteiten:**
  * Live overzicht en filteren van Particuliere Tastings en Zakelijke Events.
  * Directe 1-Click acties (*Bevestigen* en *Wijzigen*).
  * Interactief verplaatsingsformulier (datum, tijdslot, gezelschap, notities).
  * Automatische synchronisatie met team- en klantagenda's via `.ics` en Google Calendar.
  * Contentbeheer en foto-upload voor alle pagina's en email-templates.

---

## 6. Vragen & Contact
Voor technische vragen over de codebase of API-koppelingen kan contact worden opgenomen met **Mono by Dusty** (`studio@monobydusty.com`).
