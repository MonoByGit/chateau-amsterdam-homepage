# Overdracht — echte Shopify/Umami-koppeling + laatste audit + deploy

Datum: 2026-07-18
Status: klaar voor nieuwe sessie, volle focus

## Context voor de volgende sessie

Dit is een vervolg op dezelfde sessie die 1a (Shopify cart-module, mocked), legal/compliance,
het mobiele hamburgermenu en de volledige audit (qa/design-review/benchmark/cso) heeft gebouwd.
Alles hieronder staat live gecommit op `main` (laatste commit `b87feb3`), lokaal getest en
gebouwd. Niets hiervan is nog naar Railway gepusht/gedeployed.

**Begin de nieuwe sessie met:** `git log --oneline -15` om de commits te zien, en dit document.

## Wat al klaar is (deze sessie)

- `feat(shopify)` `3602f6d` — volledige cart-module (`lib/shopify/`, `lib/cart/`), slide-in
  drawer, "In winkelmandje"-knop met nette fallback zolang de token ontbreekt. Getest end-to-end
  tegen een tijdelijke test-wijn (aangemaakt en weer verwijderd, geen productiedata geraakt).
- `feat(compliance)` `1aaf480` — cookiebanner (privacy-vriendelijk, reject-by-default),
  18+-leeftijdscheck (nee-route naar alcoholinfo.nl), `/privacybeleid`, `/algemene-voorwaarden`.
  **Let op:** de juridische tekst is door mij geschreven, niet door een jurist gecontroleerd —
  vermeld dit als je het aan de klant oplevert.
- `feat(nav)` `edb6372` — echt hamburgermenu (was: alles verstopt op mobiel zonder vervanging).
  Zie de commit message voor een genuine bug die onderweg gevonden en gefixed is
  (`mix-blend-mode` corrumpeerde het paneel toen het in de header genest zat).
- `style(design)` `5777a76` + `security` `b87feb3` — twee fixes uit de audit zelf (44px
  tap-targets, en een client/server-bundlinggrens rond het Shopify-token).
- Volledige audit gedraaid: `/qa` (exhaustive), `/design-review`, `/benchmark`, `/cso` (daily).
  Rapporten staan in `.gstack/qa-reports/`, `.gstack/design-reports/`, `.gstack/security-reports/`
  (lokaal, gitignored). Geen openstaande bevindingen — alles gevonden is gefixed.

## Wat nog moet gebeuren (in de nieuwe sessie)

### 1. Shopify Storefront API — echt koppelen (was taak 1b)

Dusty is nu ingelogd in Shopify via de Comet-browser (Chrome-extensie beschikbaar om mee te kijken).
Nodig:
- **Storefront API access token**: Shopify admin (chateau.amsterdam) → Instellingen → Apps en
  verkoopkanalen → Apps ontwikkelen → app aanmaken → Storefront API → token genereren. Vereiste
  scopes: leestoegang op producten/varianten (voor `productByHandle`), schrijftoegang op carts
  (`unauthenticated_write_checkouts`/cart-scopes — check de exacte scope-namen in de huidige
  Shopify-adminversie, kunnen verschillen van wat ik nu weet).
- **Exacte store domain** (iets als `chateau-amsterdam.myshopify.com`) — navragen/opzoeken, niet
  gokken.
- Zet beide in `.env.local` lokaal én als Railway-variabelen op productie:
  `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` (zie `.env.local.example` voor het volledige
  overzicht, incl. optionele `SHOPIFY_API_VERSION`, default `2025-10` in `lib/shopify/client.ts`).
- Test daadwerkelijk end-to-end: fles toevoegen aan winkelmandje, hoeveelheid aanpassen, naar
  checkout, en bevestig dat je op een echte Shopify-checkoutpagina met het juiste product landt.
  Dit is de enige stap die je niet kan goedkeuren zonder 'm live te proberen.

### 2. Umami — echt koppelen

Blijft op Dusty's eigen Railway-account (bevestigd, open source self-hosted, blijft zo totdat de
klant er expliciet om vraagt — is een extraatje, niet iets waar ze om gevraagd hebben).
- Maak in die Umami-instance een nieuwe "website" aan voor **`chateau.amsterdam`** (niet de
  tijdelijke Railway-preview-URL — zo hoeft er bij een latere hosting-overstap niets in Umami
  aangepast te worden, alleen het domein moet er straks naartoe wijzen).
- Zet `NEXT_PUBLIC_UMAMI_WEBSITE_ID` en `NEXT_PUBLIC_UMAMI_SCRIPT_URL` in `.env.local` en als
  Railway-variabelen.
- **Let op de `NEXT_PUBLIC_`-valkuil**: deze vars worden tijdens de *build* in de JS-bundle
  gebakken, niet pas runtime gelezen. Zodra de klant later zelf herbouwt op hun eigen hosting,
  moeten deze twee vars daar expliciet gezet worden, anders stopt tracking stilzwijgend (geen
  crash, gewoon een gat in de data). Zet dit ook in de uiteindelijke overdrachtsdocumentatie naar
  de klant.
- `components/analytics-script.tsx` laadt het script pas na cookie-consent (ook al is Umami zelf
  cookieless) en rendert niets zolang de env vars leeg zijn — dus dit is al veilig te deployen
  zonder de echte waarden, maar analytics doet dan simpelweg nog niks.

### 3. Safari/Firefox — handmatige klik-through (was onderdeel van taak 6)

Firefox staat niet geïnstalleerd op deze Mac. Computer-use kan Safari alleen read-only bekijken
(geen klik/type — harde beperking van die tool). Dusty is gevraagd zelf door te klikken
(cookiebanner, leeftijdscheck, mobiel hamburgermenu via Responsive Design-modus) — **de uitkomst
daarvan is niet teruggekomen in deze sessie**. Check dit als eerste in de nieuwe sessie: vraag of
hij het al gedaan heeft, of doe het samen met hem voor je verder gaat.

### 4. Laatste volledige regressie + deploy

Zodra 1-3 kloppen:
```bash
npx vitest run
npx tsc --noEmit
npm run build        # niet tegelijk met een draaiende dev-server — geeft anders corrupte
                      # .next/types-bestanden (zelf tegenaan gelopen deze sessie, makkelijk te
                      # herkennen aan " 2.ts"-bestanden in .next/types/, gewoon .next verwijderen
                      # en opnieuw bouwen)
railway up --service chateau-amsterdam-2.0 --detach
```
Daarna: poll `railway status --json` tot de nieuwe commit-hash op SUCCESS staat, curl de live URL
voor een 200, en loop de volledige site nog een keer door op de live Railway-URL (niet alleen
lokaal) — inclusief de nieuwe cookiebanner/leeftijdscheck/hamburgermenu en de echte Shopify-flow.

Sluit af met hetzelfde soort rapport als voorgaande sessies: per onderdeel wat er is
gecontroleerd, en bevestig de live Railway-URL.

## Geparkeerd voor later (expliciet niet nu, niet belangrijk voor oplevering aan de klant)

Dusty gaat het hele pakketje ooit overdragen aan de hostingpartij van de klant, zodra zij
akkoord zijn. De klant is een heel klein, niet-technisch team — dus zo min mogelijk van hen
vragen, en wat er gevraagd wordt moet 1-op-1 door te sturen zijn naar hun hostingpartij zonder
dat zij het zelf hoeven te snappen.

- **Media-opslag: besloten.** Wordt **Cloudflare R2** (Dusty gebruikt dit zelf al, eenvoudig
  op te zetten, S3-compatible dus geen enkele codewijziging nodig in `lib/storage/s3.ts` —
  alleen `AWS_ENDPOINT_URL`/`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_S3_BUCKET_NAME`
  aanpassen naar de R2-waardes). Nog te bepalen: bucket op Dusty's eigen Cloudflare-account
  (zoals Umami — blijft gewoon bij hem) of een nieuw account voor de klant. Kan bij de
  daadwerkelijke overdracht besloten worden, hoeft nu niet.
- **Database** (Postgres, nu op Railway): moet op enig moment gedumpt en hersteld worden naar
  een database die de klant zelf beheert. Enige echte openstaande vraag hiervoor.
- **Vragen om kant-en-klaar door te sturen naar hun hostingpartij** (bewust kort en simpel
  gehouden, puur om te forwarden, de klant hoeft de antwoorden niet zelf te begrijpen):
  1. Kunnen jullie een Node.js-website hosten?
  2. Hebben jullie een PostgreSQL-database beschikbaar, of kunnen jullie die toevoegen?
  3. Wie kan de DNS-instellingen van chateau.amsterdam aanpassen zodra de website bij jullie
     moet komen?

Dit hoeft pas opgepakt te worden zodra de klant akkoord is — nu ligt de prioriteit bij een
volledig werkende site die naar de klant kan voor review.
