# Next.js Foundation — Homepage Port + Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current static Vite build with a Next.js (App Router) site that reproduces the approved homepage design pixel-for-pixel, with yellow as the sole accent color, as the foundation the CMS, Shopify, and reservations phases build on top of.

**Architecture:** A TypeScript Next.js App Router project. One root layout provides fonts, global CSS, and a `LanguageProvider`. The homepage is composed of section components (Hero, Manifest, Process, Paths, WinesPreview, Place), each a client component using three shared hooks (`useReveal`, `useParallax`, `useMagnetic`) that reproduce the current vanilla-JS scroll-reveal/parallax/magnetic-button behavior. Content is still hardcoded in this phase — the CMS (a later plan) replaces the hardcoded strings with data fetched from Postgres, so components are written to take their text as local constants that a later plan can lift into props without restructuring.

**Tech stack:** Next.js (App Router, latest stable) + TypeScript + React. Plain CSS (`app/globals.css`, ported from `src/main.css`) — no CSS framework introduced, to minimize visual-regression risk on an already-approved design. Vitest + React Testing Library for logic/behavior tests. Deployed on Railway via `next start`, replacing `sirv-cli`.

**A note on testing approach for this plan specifically:** most of this plan is a faithful visual port of already-approved CSS/markup. Pixel-for-pixel CSS porting and animation timing aren't meaningfully unit-testable — forcing tests on them would be brittle busywork, not real coverage. TDD is applied where it actually catches bugs: language-toggle logic, the counter's count-up math, and reduced-motion handling. Pure markup/CSS tasks instead end with an explicit visual-verification step against the live reference at `https://chateau-amsterdam-homepage-production.up.railway.app/`.

---

## File structure

```
chateau-homepage/
├── app/
│   ├── layout.tsx            # root layout: fonts, <html lang>, LanguageProvider, header/footer
│   ├── globals.css           # ported design system (yellow-only accent)
│   └── page.tsx              # composes the six homepage sections
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── hero.tsx
│   ├── manifest.tsx
│   ├── process.tsx
│   ├── paths.tsx
│   ├── wines-preview.tsx
│   ├── place.tsx
│   └── counter.tsx
├── lib/
│   ├── language.tsx           # LanguageProvider + useLanguage()
│   ├── use-reveal.ts
│   ├── use-parallax.ts
│   └── use-magnetic.ts
├── test/
│   └── setup.ts
├── next.config.js
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

The old `vite.config.js` is removed in Task 1. `src/main.css` is removed in Task 2 once its content is ported to `app/globals.css`. `src/main.js` and `index.html` stay in place until Task 10, once every component they'd otherwise conflict with exists — deleting them earlier would leave nothing deployable mid-port.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json` (replace existing)
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `next-env.d.ts`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Delete: `vite.config.js`, `package-lock.json` (regenerated)

- [ ] **Step 1: Check installed Node version is compatible with current Next.js**

Run: `node --version`
Expected: `v18.18.0` or higher (Next.js's minimum). If lower, stop and tell the user to upgrade Node before continuing.

- [ ] **Step 2: Check the latest stable Next.js version**

Run: `npm view next version`
Expected: a version string like `15.x.x`. Use this exact version (not a guess) everywhere `next` is referenced below — substitute it into `package.json`.

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "chateau-homepage",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "<version from Step 2>",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^25.0.0"
  }
}
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

- [ ] **Step 6: Write `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 8: Write `test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 9: Remove the old Vite scaffold and install dependencies**

```bash
rm -f vite.config.js package-lock.json
rm -rf node_modules dist
npm install
```

Expected: install completes with no error. A new `package-lock.json` is generated.

- [ ] **Step 10: Verify the toolchain is wired correctly**

Run: `npx tsc --noEmit`
Expected: no errors (there are no `.ts`/`.tsx` files yet, so this just confirms the config parses).

Run: `npx vitest run`
Expected: `No test files found` — expected at this stage, confirms Vitest boots.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project, remove Vite toolchain"
```

---

### Task 2: Global design tokens (`app/globals.css`)

**Files:**
- Create: `app/globals.css`
- Delete: `src/main.css` (content ported below)

This ports `src/main.css` with one deliberate change: yellow becomes the single, permanent accent color. The old dual-theme system (`--wine` default + `.theme-yellow` override class + the header's wine/yellow dot switcher) is removed entirely — there is only one theme now, so `--theme-accent` is set once, at the root, and used consistently. This is also the fix for the "Our Story" bordeaux leftover: that bug existed because `.manifest .label` and `.manifest-title .alt` hardcoded `var(--wine-bright)` directly instead of going through `--theme-accent`. Porting through a single accent variable everywhere removes the class of bug, not just this one instance.

- [ ] **Step 1: Write `app/globals.css`**

```css
/* ============================================================
   CHATEAU AMSTERDAM — Design System
   ink / chalk paper / yellow — industrial × refined
   ============================================================ */

:root {
  /* Physical colors */
  --ink: #17140e;
  --ink-soft: #262218;
  --paper: #f1ece1;
  --paper-dim: #e7e0d0;
  --accent: #ffcc00;
  --accent-badge: #c49a00; /* darker variant for small text on light backgrounds, where pure yellow fails contrast */
  --chalk: #f7f4ec;
  --line: rgba(23, 20, 14, 0.16);
  --line-light: rgba(241, 236, 225, 0.18);

  --font-display: "Archivo", sans-serif;
  --font-serif: "Instrument Serif", serif;
  --font-mono: "IBM Plex Mono", monospace;

  --ease-out: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-inout: cubic-bezier(0.77, 0, 0.175, 1);
  --gutter: clamp(20px, 4vw, 64px);

  /* Semantic theme variables — light mode (default) */
  --theme-bg: var(--paper);
  --theme-fg: var(--ink);
  --theme-fg-muted: rgba(23, 20, 14, 0.55);
  --theme-bg-dim: var(--paper-dim);
  --theme-bg-card: var(--chalk);
  --theme-border: var(--line);
  --theme-pattern-color: rgba(23, 20, 14, 0.55);
  --theme-accent: var(--accent);
  --theme-accent-bright: var(--accent);
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-bg: var(--ink);
    --theme-fg: var(--paper);
    --theme-fg-muted: rgba(241, 236, 225, 0.6);
    --theme-bg-dim: var(--ink-soft);
    --theme-bg-card: #201c13;
    --theme-border: var(--line-light);
    --theme-pattern-color: rgba(241, 236, 225, 0.25);
    --theme-accent: var(--accent);
    --theme-accent-bright: var(--accent);
  }
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--theme-bg);
  color: var(--theme-fg);
  font-family: var(--font-display);
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  transition: background 0.4s var(--ease-out), color 0.4s var(--ease-out);
}

::selection { background: var(--theme-accent); color: var(--ink); }

img { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; border: 0; background: none; cursor: pointer; color: inherit; }

/* ---------- background pattern (tweakable) ---------- */
.bg-pattern {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  opacity: var(--pattern-o, 0.04);
}
body[data-pattern="raster"] .bg-pattern {
  background-image:
    linear-gradient(var(--theme-pattern-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--theme-pattern-color) 1px, transparent 1px);
  background-size: 88px 88px;
}
body[data-pattern="stippen"] .bg-pattern {
  background-image: radial-gradient(var(--theme-pattern-color) 1.1px, transparent 1.4px);
  background-size: 22px 22px;
}
body[data-pattern="arcering"] .bg-pattern {
  background-image: repeating-linear-gradient(45deg, var(--theme-pattern-color) 0 1px, transparent 1px 48px);
}
body[data-pattern="uit"] .bg-pattern { display: none; }

/* ---------- grain ---------- */
.grain {
  position: fixed; inset: -100px; z-index: 200; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  opacity: 0.05;
}

/* ---------- header ---------- */
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px var(--gutter);
  mix-blend-mode: difference; color: #fff;
  transition: padding 0.5s var(--ease-out);
}
.site-header.is-scrolled {
  padding: 12px var(--gutter);
  mix-blend-mode: normal;
  background: rgba(23, 20, 14, 0.85);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  color: var(--paper);
  border-bottom: 1px solid var(--line-light);
}
@media (prefers-color-scheme: dark) {
  .site-header.is-scrolled {
    background: rgba(10, 8, 5, 0.9);
    border-bottom: 1px solid rgba(241, 236, 225, 0.1);
  }
}

.brand { display: flex; flex-direction: column; align-items: flex-start; line-height: 1; }
.brand-logo { display: block; height: 34px; width: auto; filter: invert(1); }
.brand small {
  font-family: var(--font-mono); font-weight: 400; text-transform: uppercase;
  font-size: 7.5px; letter-spacing: 0.02em; margin-top: 7px; opacity: 0.7;
}

.site-nav { display: flex; align-items: center; gap: clamp(16px, 2.4vw, 36px); }
.site-nav a:not(.nav-cta) {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.14em;
  text-transform: uppercase; position: relative; padding: 4px 0;
}
.site-nav a:not(.nav-cta)::after {
  content: ""; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: right;
  transition: transform 0.45s var(--ease-out);
}
.site-nav a:not(.nav-cta):hover::after { transform: scaleX(1); transform-origin: left; }

.lang-selector { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; }
.lang-btn {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; opacity: 0.5;
  transition: opacity 0.35s var(--ease-out), font-weight 0.35s;
  cursor: pointer; border: none; background: none; color: inherit; padding: 4px 2px;
}
.lang-btn:hover { opacity: 0.8; }
.lang-btn.active { font-weight: 700; opacity: 1; }
.lang-divider { opacity: 0.5; }

.nav-cta {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  border: 1px solid currentColor; border-radius: 999px; padding: 12px 26px;
  transition: background 0.35s var(--ease-out), color 0.35s var(--ease-out);
}
.nav-cta:hover { background: #fff; color: #000; }
.site-header.is-scrolled .nav-cta:hover { background: var(--paper); color: var(--ink); }
.nav-cta::after { display: none; }

@media (max-width: 900px) {
  .site-nav a:not(.nav-cta) { display: none; }
  .lang-selector { display: none; }
}
@media (max-width: 520px) {
  .nav-cta { padding: 10px 18px; font-size: 11px; letter-spacing: 0.1em; }
}

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 16px 30px; border-radius: 999px; border: 1px solid var(--theme-fg);
  background: var(--theme-bg);
  position: relative; overflow: hidden; isolation: isolate;
  transition: color 0.4s var(--ease-out), border-color 0.4s var(--ease-out), background-color 0.4s var(--ease-out);
  will-change: transform;
}
.btn::before {
  content: ""; position: absolute; inset: -2px; z-index: -1;
  background: var(--theme-fg); border-radius: 999px;
  transform: translateY(102%); transition: transform 0.5s var(--ease-out);
}
.btn:hover { color: var(--theme-bg); }
.btn:hover::before { transform: translateY(0); }
.btn .arr { transition: transform 0.4s var(--ease-out); }
.btn:hover .arr { transform: translateX(5px); }

.btn--primary { background: var(--theme-accent); border-color: var(--theme-accent); color: var(--ink); }
.btn--primary::before { background: var(--theme-fg); }
@media (prefers-color-scheme: dark) { .btn--primary::before { background: var(--paper); } }
.btn--primary:hover { border-color: var(--theme-fg); color: var(--theme-bg); }

.btn--light { border-color: var(--chalk); color: var(--chalk); background: transparent; }
.btn--light::before { background: var(--chalk); }
.btn--light:hover { color: var(--ink); }
.btn--light:hover { background-color: var(--theme-accent); border-color: var(--theme-accent); }

/* ---------- section label ---------- */
.label {
  display: flex; align-items: center; gap: 14px;
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--theme-accent);
}
.label::before { content: "✶"; font-size: 13px; }
.label .en { opacity: 0.5; color: var(--theme-fg); }
.on-dark .label .en { color: var(--paper); }

/* ---------- reveal primitives ---------- */
.rv { opacity: 0; transform: translateY(36px); transition: opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out); }
.rv.in { opacity: 1; transform: none; }
.rv-line { display: block; overflow: hidden; padding-bottom: 0.14em; margin-bottom: -0.14em; }
.rv-line > span { display: block; transform: translateY(112%); transition: transform 1s var(--ease-out); }
.rv-line.in > span { transform: none; }

@media (prefers-reduced-motion: reduce) {
  .rv, .rv-line > span { opacity: 1 !important; transform: none !important; transition: none !important; }
  .marquee-track { animation: none !important; }
}

/* ============================================================
   HERO
   ============================================================ */
.hero { min-height: 100svh; display: flex; flex-direction: column; padding: 110px var(--gutter) 0; position: relative; }
.hero-top {
  display: flex; justify-content: space-between; gap: 16px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--theme-fg-muted);
  border-bottom: 1px solid var(--theme-border); padding-bottom: 14px;
}
.hero-top .rv-line > span { white-space: nowrap; }
@media (max-width: 1100px) { .hero-top span:nth-child(2) { display: none; } }
@media (max-width: 640px) { .hero-top span:nth-child(3) { display: none; } }

.hero-title {
  font-stretch: 125%; font-weight: 800; text-transform: uppercase;
  font-size: clamp(34px, 10.8vw, 190px); line-height: 0.86; letter-spacing: -0.02em;
  margin-top: clamp(28px, 5vh, 64px); position: relative;
}
.hero-title .row { display: flex; justify-content: center; align-items: baseline; gap: 0.35em; }
.hero-title .row:nth-child(2) { justify-content: center; }

.hero-script {
  position: absolute; z-index: 3; left: 50%; top: 50%;
  transform: translate(-50%, -50%) rotate(-5deg);
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  text-transform: none; letter-spacing: 0;
  font-size: clamp(34px, 4.6vw, 84px); line-height: 1;
  color: var(--theme-accent); white-space: nowrap;
  opacity: 0; transition: opacity 1.2s var(--ease-out) 1.1s, transform 1.2s var(--ease-out) 1.1s;
}
.hero.loaded .hero-script { opacity: 1; transform: translate(-50%, -58%) rotate(-5deg); }

.hero-deck {
  flex: 1; display: grid; grid-template-columns: minmax(280px, 1fr) 1.4fr;
  gap: clamp(24px, 4vw, 72px); align-items: end; padding: clamp(28px, 5vh, 60px) 0 0;
}
.hero-intro { padding-bottom: clamp(24px, 4vh, 48px); }
.hero-intro p { font-size: clamp(17px, 1.35vw, 21px); line-height: 1.55; max-width: 34ch; text-wrap: pretty; }
.hero-intro p em { font-family: var(--font-serif); font-style: italic; font-size: 1.12em; }
.hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 30px; }

.hero-media { position: relative; height: clamp(260px, 44vh, 480px); margin-bottom: clamp(24px, 4vh, 48px); }
.hero-media .media-clip { height: 100%; overflow: hidden; border-radius: 2px; }
.hero-media .pwrap { height: 112%; margin-top: -6%; }
.hero-media img { width: 100%; height: 100%; object-fit: cover; }
.hero-media figcaption {
  position: absolute; left: 0; bottom: -26px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--theme-fg-muted);
}
@media (max-width: 1100px) { .hero-media figcaption { display: none; } }
@media (max-width: 860px) {
  .hero-deck { grid-template-columns: 1fr; }
  .hero-media { order: -1; height: 36vh; margin-bottom: 0; }
}
.hero .rv-line > span { transition-duration: 1.2s; }

/* ---------- marquee ---------- */
.marquee {
  position: relative; z-index: 2; background: var(--theme-accent); color: var(--ink);
  overflow: hidden; white-space: nowrap; margin: 0 calc(-1 * var(--gutter));
  padding: 13px 0; user-select: none;
  transition: background-color 0.4s var(--ease-out), color 0.4s;
}
.marquee-track { display: inline-flex; gap: 0; animation: marquee 30s linear infinite; }
.marquee span {
  font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.22em;
  text-transform: uppercase; padding: 0 28px; position: relative;
}
.marquee span::after { content: "✶"; position: absolute; right: -8px; opacity: 0.6; }
@keyframes marquee { to { transform: translateX(-50%); } }

/* ============================================================
   MANIFEST (dark) — "Our story"
   ============================================================ */
.manifest { position: relative; z-index: 2; background: var(--ink); color: var(--paper); padding: clamp(90px, 14vh, 170px) var(--gutter); }
.manifest .label { color: var(--theme-accent); }

.manifest-title {
  font-stretch: 125%; font-weight: 800; text-transform: uppercase;
  font-size: clamp(46px, 7.6vw, 132px); line-height: 0.92; letter-spacing: -0.01em;
  margin-top: 36px;
}
.manifest-title .alt {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  text-transform: none; letter-spacing: 0; color: var(--theme-accent); font-size: 1.06em;
}

.manifest-body { display: grid; grid-template-columns: 1fr minmax(300px, 560px); gap: 40px; margin-top: clamp(40px, 7vh, 80px); }
.manifest-body .rule { border-top: 1px solid var(--line-light); }
.manifest-body p { font-size: clamp(17px, 1.5vw, 22px); line-height: 1.65; color: rgba(241,236,225,0.85); text-wrap: pretty; padding-top: 28px; }
.manifest-body p strong { color: var(--paper); font-weight: 600; }
@media (max-width: 860px) { .manifest-body { grid-template-columns: 1fr; } }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: clamp(60px, 10vh, 110px); border-top: 1px solid var(--line-light); }
.stat { padding: 30px clamp(12px, 2vw, 32px) 6px clamp(18px, 2.4vw, 40px); border-right: 1px solid var(--line-light); }
.stat:first-child { padding-left: 0; }
.stat:last-child { border-right: 0; }
.stat .num { font-stretch: 125%; font-weight: 800; line-height: 1; font-size: clamp(34px, 4.4vw, 72px); letter-spacing: -0.01em; }
.stat .num sub { font-size: 0.4em; vertical-align: baseline; font-weight: 600; }
.stat .desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(241,236,225,0.6); margin-top: 16px; line-height: 1.9; }
@media (max-width: 760px) {
  .stats { grid-template-columns: 1fr 1fr; }
  .stat:nth-child(2) { border-right: 0; }
  .stat { border-bottom: 1px solid var(--line-light); }
  .stat:nth-child(n+3) { border-bottom: 0; }
}

/* ============================================================
   PROCES
   ============================================================ */
.process { padding: clamp(90px, 14vh, 170px) var(--gutter); }
.process-grid { display: grid; grid-template-columns: minmax(280px, 1fr) 1.5fr; gap: clamp(40px, 6vw, 110px); margin-top: 30px; }
.process-sticky { position: sticky; top: 120px; align-self: start; }
.process-sticky h2 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(38px, 4.6vw, 76px); line-height: 0.95; letter-spacing: -0.01em; }
.process-sticky h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }
.process-sticky .sub { margin-top: 22px; max-width: 30ch; color: var(--theme-fg-muted); font-size: 16px; }
@media (max-width: 900px) {
  .process-grid { grid-template-columns: 1fr; gap: 28px; }
  .process-sticky { position: static; }
}

.step { display: grid; grid-template-columns: 64px 1fr 200px; gap: clamp(18px, 2.6vw, 36px); align-items: start; padding: clamp(30px, 4.5vh, 48px) 0; border-top: 1px solid var(--theme-border); }
.step:last-child { border-bottom: 1px solid var(--theme-border); }
.step .idx { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.1em; color: var(--theme-accent); padding-top: 6px; }
.step h3 { font-stretch: 118%; font-weight: 700; text-transform: uppercase; font-size: clamp(22px, 2.2vw, 32px); letter-spacing: 0.01em; line-height: 1.05; }
.step h3 small { display: block; font-family: var(--font-mono); font-weight: 400; font-size: 10px; letter-spacing: 0.26em; color: var(--theme-fg-muted); margin-top: 7px; }
.step p { margin-top: 14px; color: var(--theme-fg); opacity: 0.8; font-size: 16px; max-width: 44ch; text-wrap: pretty; }
.step-img { width: 100%; height: 150px; object-fit: cover; border-radius: 2px; }
.step .slotwrap { position: relative; transition: transform 0.6s var(--ease-out); }
.step:hover .slotwrap { transform: rotate(-2deg) scale(1.03); }
@media (max-width: 760px) {
  .step { grid-template-columns: 44px 1fr; }
  .step .slotwrap { grid-column: 2; }
}

/* ============================================================
   PATHS — Taste / Pour / Drink
   ============================================================ */
.paths { position: relative; z-index: 2; background: var(--theme-bg-dim); padding: clamp(90px, 14vh, 170px) 0 clamp(70px, 10vh, 130px); transition: background-color 0.4s var(--ease-out); }
.paths .label { padding: 0 var(--gutter); }
.paths-intro { padding: 0 var(--gutter); margin-top: 30px; margin-bottom: clamp(40px, 7vh, 80px); display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 24px; }
.paths-intro h2 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(38px, 5.4vw, 90px); line-height: 0.94; }
.paths-intro h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }
.paths-intro p { max-width: 34ch; color: var(--theme-fg-muted); font-size: 16px; }

.path {
  display: grid; grid-template-columns: 56px minmax(200px, 0.9fr) 1.2fr 170px 56px;
  gap: clamp(16px, 2.4vw, 40px); align-items: center;
  padding: clamp(26px, 4vh, 44px) var(--gutter);
  border-top: 1px solid var(--theme-border);
  position: relative; overflow: hidden; cursor: pointer;
  transition: background 0.5s var(--ease-out), color 0.5s var(--ease-out), border-color 0.5s;
}
.path:last-of-type { border-bottom: 1px solid var(--theme-border); }
.path .idx { font-family: var(--font-mono); font-size: 12px; color: var(--theme-accent); transition: color 0.5s; }
.path .word {
  font-stretch: 125%; font-weight: 800; text-transform: uppercase;
  font-size: clamp(40px, 5.6vw, 96px); line-height: 0.9; letter-spacing: -0.01em;
  color: transparent; -webkit-text-stroke: 1.5px var(--theme-fg);
  transition: color 0.5s var(--ease-out), -webkit-text-stroke-color 0.5s var(--ease-out);
}
.path .info h3 { font-weight: 700; font-size: clamp(17px, 1.4vw, 21px); font-stretch: 112%; text-transform: uppercase; letter-spacing: 0.04em; }
.path .info p { margin-top: 8px; font-size: 15px; color: var(--theme-fg); opacity: 0.7; max-width: 44ch; transition: color 0.5s, opacity 0.5s; }
.path .thumb { height: 110px; transition: transform 0.6s var(--ease-out); }
.path-thumb-img { width: 100%; height: 100%; object-fit: cover; border-radius: 2px; }
.path .go {
  width: 52px; height: 52px; border: 1px solid var(--theme-fg); border-radius: 50%;
  display: grid; place-items: center; font-size: 19px;
  transition: background 0.4s var(--ease-out), color 0.4s var(--ease-out), border-color 0.4s, transform 0.4s var(--ease-out);
}
.path:hover { background: var(--theme-fg); color: var(--theme-bg); }
.path:hover .word { color: var(--theme-accent); -webkit-text-stroke-color: transparent; }
.path:hover .info p { color: var(--theme-bg); opacity: 0.8; }
.path:hover .thumb { transform: rotate(-2.5deg) scale(1.06); }
.path:hover .go { background: var(--theme-accent); border-color: var(--theme-accent); color: var(--ink); transform: rotate(-45deg); }
@media (max-width: 980px) {
  .path { grid-template-columns: 40px 1fr 64px; }
  .path .info { grid-column: 2; }
  .path .thumb { display: none; }
}

/* ============================================================
   WIJNEN
   ============================================================ */
.wines { padding: clamp(90px, 14vh, 170px) 0; }
.wines-head { padding: 0 var(--gutter); display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: clamp(36px, 6vh, 70px); }
.wines-head h2 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(38px, 5.4vw, 90px); line-height: 0.94; margin-top: 30px; }
.wines-head h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }

.wine-row { display: flex; gap: clamp(16px, 2vw, 28px); overflow-x: auto; padding: 26px var(--gutter) 30px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.wine-row::-webkit-scrollbar { display: none; }
.wine-card {
  flex: 0 0 clamp(240px, 24vw, 320px); scroll-snap-align: start;
  background: var(--theme-bg-card); border: 1px solid var(--theme-border);
  z-index: 2; padding: 26px 26px 30px; position: relative;
  transition: transform 0.6s var(--ease-out), box-shadow 0.6s var(--ease-out), background-color 0.4s var(--ease-out), border-color 0.4s;
}
.wine-card:hover { transform: translateY(-10px) rotate(-1deg); box-shadow: 0 30px 60px -30px rgba(23,20,14,0.35); }
@media (prefers-color-scheme: dark) { .wine-card:hover { box-shadow: 0 30px 60px -30px rgba(0,0,0,0.65); } }
.wine-card .meta { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--theme-fg-muted); margin-bottom: 18px; }
.wine-img-wrap { width: 100%; height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.wine-packshot { max-width: 100%; max-height: 100%; object-fit: contain; }
.wine-card h3 { margin-top: 22px; font-stretch: 118%; font-weight: 700; text-transform: uppercase; font-size: 19px; letter-spacing: 0.02em; }
.wine-card .tag { font-family: var(--font-serif); font-style: italic; color: var(--accent-badge); font-size: 17px; margin-top: 4px; }
@media (prefers-color-scheme: dark) { .wine-card .tag { color: var(--theme-accent); } }
.wine-card .price { font-family: var(--font-mono); font-size: 13px; margin-top: 14px; color: var(--theme-fg-muted); }

.wines-foot { padding: 10px var(--gutter) 0; display: flex; gap: 14px; }

/* ============================================================
   DE PLEK
   ============================================================ */
.place { position: relative; z-index: 2; min-height: 92vh; display: flex; align-items: flex-end; background: var(--ink); color: var(--paper); overflow: hidden; }
.place-media { position: absolute; inset: -12% 0; z-index: 0; }
.place-media img { width: 100%; height: 100%; object-fit: cover; }
.place::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(23,20,14,0.25) 0%, rgba(23,20,14,0.78) 78%, rgba(23,20,14,0.92) 100%);
  pointer-events: none;
}
.place-inner { position: relative; z-index: 2; width: 100%; padding: clamp(80px, 12vh, 140px) var(--gutter) clamp(50px, 7vh, 80px); pointer-events: none; }
.place-inner .label { color: var(--theme-accent); }
.place-inner h2 { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(40px, 6.4vw, 110px); line-height: 0.92; margin-top: 28px; max-width: 14ch; }
.place-inner h2 em { font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; color: var(--theme-accent); }
.place-grid { display: grid; grid-template-columns: repeat(3, minmax(180px, 1fr)) auto; gap: clamp(20px, 3vw, 48px); align-items: end; margin-top: clamp(36px, 6vh, 64px); border-top: 1px solid var(--line-light); padding-top: 28px; }
.place-grid > div { pointer-events: auto; }
.place-grid h4 { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--theme-accent); margin-bottom: 12px; }
.place-grid p { font-size: 15px; line-height: 1.7; color: rgba(241,236,225,0.85); }
@media (max-width: 860px) { .place-grid { grid-template-columns: 1fr 1fr; } }

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer { position: relative; z-index: 2; background: var(--ink); color: var(--paper); padding: clamp(70px, 10vh, 120px) var(--gutter) 36px; border-top: 1px solid var(--line-light); }
.footer-cheers { font-stretch: 125%; font-weight: 800; text-transform: uppercase; font-size: clamp(56px, 13.5vw, 240px); line-height: 0.82; letter-spacing: -0.02em; }
.footer-cheers em { display: block; font-family: var(--font-serif); font-style: italic; font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--theme-accent); font-size: clamp(22px, 2.8vw, 52px); line-height: 1.15; margin-top: 22px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: clamp(24px, 4vw, 60px); margin-top: clamp(50px, 8vh, 90px); padding-top: 40px; border-top: 1px solid var(--line-light); }
.footer-grid h4 { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--theme-accent); margin-bottom: 16px; }
.footer-grid a, .footer-grid p { display: block; font-size: 14px; color: rgba(241,236,225,0.75); line-height: 2.1; }
.footer-grid a:hover { color: var(--paper); }
.footer-note { max-width: 30ch; font-size: 14px; }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 60px; padding-top: 22px; border-top: 1px solid var(--line-light); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(241,236,225,0.45); }
.footer-logo { display: block; height: 18px; width: auto; filter: invert(1); opacity: 0.55; }
@media (max-width: 860px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
```

- [ ] **Step 2: Delete the old stylesheet**

```bash
rm src/main.css
```

- [ ] **Step 3: Verify — search for any remaining hardcoded wine-red references**

Run: `grep -rn "wine\|#8d2134\|#a82740" app/globals.css`
Expected: no matches. If any appear, replace them with `var(--theme-accent)` — that's exactly the class of bug being fixed in this task.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: port design system to app/globals.css, yellow as sole accent"
```

---

### Task 3: Language provider (`lib/language.tsx`)

Replaces the vanilla-JS `setLanguage`/`langButtons` logic. Behavior to preserve exactly: default to saved `localStorage` preference, else browser language (`en` if it starts with "en", else `nl`); persist on change; expose the current language and a setter.

**Files:**
- Create: `lib/language.tsx`
- Test: `lib/language.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/language.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./language";

function Probe() {
  const { lang, setLang } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang("en")}>to-en</button>
      <button onClick={() => setLang("nl")}>to-nl</button>
    </div>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to nl when there is no saved preference and navigator.language is not English", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("nl");
  });

  it("defaults to en when navigator.language starts with en and there is no saved preference", () => {
    vi.stubGlobal("navigator", { language: "en-US" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("prefers the saved localStorage language over navigator.language", () => {
    localStorage.setItem("preferred-lang", "en");
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("en");
  });

  it("updates state and persists to localStorage when setLang is called", () => {
    vi.stubGlobal("navigator", { language: "nl-NL" });
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText("to-en"));
    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(localStorage.getItem("preferred-lang")).toBe("en");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/language.test.tsx`
Expected: FAIL — `Cannot find module './language'` (file doesn't exist yet).

- [ ] **Step 3: Write `lib/language.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "nl" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "nl";
  const saved = window.localStorage.getItem("preferred-lang");
  if (saved === "en" || saved === "nl") return saved;
  return navigator.language.startsWith("en") ? "en" : "nl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem("preferred-lang", next);
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
```

Note: the initial render is always `"nl"` (avoids a server/client hydration mismatch, since `localStorage`/`navigator` aren't available during server rendering), then corrects to the real preference in an effect immediately after mount. This is the same trade-off the original vanilla-JS version had implicitly (it ran after the HTML had already painted in `nl` — the `lang` attribute default) — not a regression.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/language.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add LanguageProvider replacing vanilla-JS language toggle"
```

Addendum (added during Task 7 review, folded back into this task since it's the same file): once `SiteHeader` became the first real consumer of `useLanguage()`, code review flagged that every bilingual component was about to reinvent its own `lang === "nl" ? x : y` ternary or local `t()` helper independently (the plan's own Task 8 sample already did this). `LanguageContextValue` and the provider's returned value both gained a third member, `t: (nl: string, en: string) => string`, implemented as `lang === "nl" ? nl : en` and memoized alongside `setLang`. `lib/language.tsx` and `lib/language.test.tsx` (one more test, covering that `t()` tracks language changes) were updated in place — this isn't a new task, just documenting that `useLanguage()` now returns `{ lang, setLang, t }` instead of `{ lang, setLang }` for every task from here on.

---

### Task 4: Scroll-reveal hook (`lib/use-reveal.ts`)

Replaces the `IntersectionObserver` + `.rv`/`.rv-line` logic in `main.js`. Returns a ref to attach and a boolean; the component decides its own class names (`rv`/`rv-line`) so this hook stays presentation-agnostic.

**Files:**
- Create: `lib/use-reveal.ts`
- Test: `lib/use-reveal.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// lib/use-reveal.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useReveal } from "./use-reveal";

function Probe({ delay = 0 }: { delay?: number }) {
  const { ref, isVisible } = useReveal(delay);
  return (
    <div ref={ref} data-testid="target">
      {isVisible ? "visible" : "hidden"}
    </div>
  );
}

let observedCallback: IntersectionObserverCallback;

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      observedCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useReveal", () => {
  it("starts hidden", () => {
    render(<Probe />);
    expect(screen.getByTestId("target").textContent).toBe("hidden");
  });

  it("becomes visible immediately when intersecting with no delay", () => {
    render(<Probe delay={0} />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("visible");
  });

  it("waits for the given delay before becoming visible", () => {
    vi.useFakeTimers();
    render(<Probe delay={0.2} />);
    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("hidden");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("target").textContent).toBe("visible");
  });

  it("does not become visible when not intersecting", () => {
    render(<Probe />);
    act(() => {
      observedCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("target").textContent).toBe("hidden");
  });

  it("clears the pending timeout on unmount instead of leaving it dangling", () => {
    vi.useFakeTimers();
    const { unmount } = render(<Probe delay={0.5} />);

    act(() => {
      observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    // The delayed reveal's setTimeout should be the only pending timer.
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    // Effect cleanup must clear it — nothing left pending after unmount.
    expect(vi.getTimerCount()).toBe(0);

    // Advancing timers past the delay must not throw or try to update
    // the unmounted component (regression case for the bug where the
    // cleanup was mistakenly returned from inside the IntersectionObserver
    // callback instead of from the effect itself, so it never actually ran).
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });
});
```

Note: the manual `observedCallback(...)` invocations and `vi.advanceTimersByTime(...)` calls are wrapped in `act(...)` from `@testing-library/react`. Calling the observer callback directly (not through `fireEvent` or any React-recognized event system) means React doesn't know a state update is coming; without `act()`, the assertion on `textContent` runs before React's concurrent scheduler has flushed the update to the DOM, so the test would flakily read the pre-update value and print an "not wrapped in act(...)" warning. `act()` is the correct fix on the test side — no synchronous-flush trick (e.g. `flushSync`) is needed in the hook itself, since a real browser's IntersectionObserver firing and updating the DOM on the next tick is imperceptible to the user.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/use-reveal.test.tsx`
Expected: FAIL — `Cannot find module './use-reveal'`.

- [ ] **Step 3: Write `lib/use-reveal.ts`**

```ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useReveal(delay = 0) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeout = setTimeout(() => setIsVisible(true), delay * 1000);
            } else {
              setIsVisible(true);
            }
            observer.unobserve(el);
            return;
          }
        }
      },
      // Thresholds copied from the legacy src/main.js scroll-reveal logic —
      // not arbitrary, do not "clean up": 0.18 intersection ratio and a
      // -6% bottom rootMargin trigger the reveal slightly before an element
      // is fully in view, and `delay` is expressed in seconds (matching the
      // stagger delays main.js read off `data-delay` attributes).
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [delay]);

  return { ref, isVisible };
}
```

Note: the original sample here had a real bug, caught during implementation — `IntersectionObserverCallback` doesn't treat a per-entry `return () => clearTimeout(timeout)` as an effect cleanup (that's only meaningful for `useEffect`'s own return value), so the pending timer was never actually cleared. The fix hoists `timeout` to the effect scope, clearing it in the real `useEffect` cleanup (see the code above). A separate concern — `setIsVisible` from inside the observer callback not reliably committing before an assertion when the callback is invoked manually in tests — is a test-side issue, not a hook-side one: wrapping the manual `observedCallback(...)` calls in `act(...)` (see Step 1's test code) is the correct fix, since a real IntersectionObserver in the browser updates the DOM on the next tick regardless. An earlier iteration of this hook mistakenly reached for `flushSync` to paper over the missing `act()` wrapping; that was reverted as unnecessary once the test was fixed properly.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/use-reveal.test.tsx`
Expected: PASS, 5 tests, no "not wrapped in act(...)" warnings.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useReveal hook replacing vanilla-JS scroll reveal"
```

---

### Task 5: Parallax and magnetic-button hooks

These reproduce continuous scroll/mouse-driven effects that are inherently about live browser layout (`getBoundingClientRect`, `requestAnimationFrame`) rather than discrete state transitions — jsdom doesn't lay out elements, so a unit test here would only prove the mocks were called, not that the effect works. Skipping tests for these two hooks specifically (unlike Task 4's `useReveal`, which has real branching logic worth covering) and relying on the Task 9 visual-verification step instead.

**Files:**
- Create: `lib/use-parallax.ts`
- Create: `lib/use-magnetic.ts`
- Test: `lib/use-magnetic.test.tsx` (covers only the discrete branching/cleanup logic below — not the continuous mousemove physics, which stays untested for the same jsdom-can't-do-real-layout reason as the rest of this task)

- [ ] **Step 1: Write `lib/use-parallax.ts`**

```ts
"use client";

import { useEffect, useRef } from "react";

export function useParallax(speed = 0.1) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ticking = false;
    let rafId: number | undefined;

    function apply() {
      if (!el) return;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) {
        ticking = false;
        return;
      }
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translateY(${(-center * speed).toFixed(1)}px)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return ref;
}
```

- [ ] **Step 2: Write `lib/use-magnetic.ts`**

```ts
"use client";

import { useEffect, useRef } from "react";

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverCapable = window.matchMedia("(hover: hover)").matches;
    if (reduced || !hoverCapable) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    function onMouseMove(e: MouseEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.translate = `${x * strength}px ${y * strength}px`;
    }

    function onMouseLeave() {
      if (!el) return;
      el.style.transition = "translate 0.6s cubic-bezier(0.19,1,0.22,1)";
      el.style.translate = "0px 0px";
      timeout = setTimeout(() => {
        if (el) el.style.transition = "";
      }, 600);
    }

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      if (timeout) clearTimeout(timeout);
    };
  }, [strength]);

  return ref;
}
```

Note: both hooks hoist their pending timer/frame handle (`timeout`, `rafId`) to effect scope and clear them in the real `useEffect` cleanup — the same fix Task 4 needed for `useReveal`. Code review of an earlier draft of this task caught the identical bug shape reappearing here (a `mouseleave`-triggered `setTimeout` that was never tracked or cleared), which is why it's written correctly above rather than left as a trap for whoever reads this later.

- [ ] **Step 3: Write `lib/use-magnetic.test.tsx`**

Covers the branching/cleanup logic that IS meaningfully testable in jsdom (unlike the continuous mousemove math): reduced-motion gating, hover-capability gating, and the timeout-cleanup regression.

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useMagnetic } from "./use-magnetic";

function Probe({ strength = 0.3 }: { strength?: number }) {
  const ref = useMagnetic(strength);
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} data-testid="target">
      CTA
    </button>
  );
}

function stubMatchMedia({ reducedMotion, hover }: { reducedMotion: boolean; hover: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : hover,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useMagnetic", () => {
  it("does not attach mousemove/mouseleave listeners when prefers-reduced-motion is set", () => {
    stubMatchMedia({ reducedMotion: true, hover: true });
    const addSpy = vi.spyOn(Element.prototype, "addEventListener");

    render(<Probe />);
    const el = screen.getByTestId("target");
    const eventsOnEl = addSpy.mock.calls
      .filter((_, i) => addSpy.mock.contexts[i] === el)
      .map((call) => call[0]);

    expect(eventsOnEl).not.toContain("mousemove");
    expect(eventsOnEl).not.toContain("mouseleave");
  });

  it("does not attach mousemove/mouseleave listeners when hover is not supported", () => {
    stubMatchMedia({ reducedMotion: false, hover: false });
    const addSpy = vi.spyOn(Element.prototype, "addEventListener");

    render(<Probe />);
    const el = screen.getByTestId("target");
    const eventsOnEl = addSpy.mock.calls
      .filter((_, i) => addSpy.mock.contexts[i] === el)
      .map((call) => call[0]);

    expect(eventsOnEl).not.toContain("mousemove");
    expect(eventsOnEl).not.toContain("mouseleave");
  });

  it("clears the pending transition-reset timeout on unmount instead of leaving it dangling", () => {
    stubMatchMedia({ reducedMotion: false, hover: true });
    vi.useFakeTimers();

    const { unmount } = render(<Probe />);
    const el = screen.getByTestId("target");

    fireEvent.mouseLeave(el);

    // The transition-reset setTimeout scheduled in onMouseLeave should be
    // the only pending timer at this point.
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    // Effect cleanup must clear it — nothing left pending after unmount.
    // This is the regression case for the bug where the timeout was
    // scheduled inside onMouseLeave but never hoisted to effect scope,
    // so cleanup could never clear it (same bug shape as use-reveal.ts).
    expect(vi.getTimerCount()).toBe(0);
  });
});
```

Note: the spy on `addEventListener` must be created *before* `render()`, and on `Element.prototype` (not the element instance, which doesn't exist yet) — spying on the element after render would silently miss every call made during the effect that runs on mount, making the "not called" assertions vacuously true regardless of whether the hook actually behaves correctly.

- [ ] **Step 4: Verify the project still typechecks and tests pass**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx vitest run`
Expected: all test files pass, including the new `lib/use-magnetic.test.tsx` (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useParallax and useMagnetic hooks"
```

---

### Task 6: Counter component

Reproduces the count-up stat animation (`data-count`, `data-format="dots"`). This has real branching logic (easing, reduced-motion short-circuit, number formatting) worth covering with tests.

**Files:**
- Create: `components/counter.tsx`
- Test: `components/counter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/counter.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Counter } from "./counter";

let observedCallback: IntersectionObserverCallback;

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      observedCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Counter", () => {
  it("renders 0 before becoming visible", () => {
    render(<Counter target={91} />);
    expect(screen.getByTestId("counter").textContent).toBe("0");
  });

  it("jumps straight to the target when prefers-reduced-motion is set", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Counter target={91} />);
    observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(screen.getByTestId("counter").textContent).toBe("91");
  });

  it("formats with thousands dots when format='dots'", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<Counter target={200000} format="dots" />);
    observedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(screen.getByTestId("counter").textContent).toBe((200000).toLocaleString("nl-NL"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/counter.test.tsx`
Expected: FAIL — `Cannot find module './counter'`.

- [ ] **Step 3: Write `components/counter.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

function format(value: number, useDots: boolean): string {
  const rounded = Math.round(value);
  return useDots ? rounded.toLocaleString("nl-NL") : rounded.toString();
}

export function Counter({ target, format: fmt }: { target: number; format?: "dots" }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(el);

          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduced) {
            setDisplay(format(target, fmt === "dots"));
            return;
          }

          const duration = 1600;
          const start = performance.now();
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setDisplay(format(target * eased, fmt === "dots"));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, fmt]);

  return (
    <span ref={ref} data-testid="counter">
      {display}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/counter.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Counter component with count-up animation"
```

---

### Task 7: Site header

**Files:**
- Create: `components/site-header.tsx`

- [ ] **Step 1: Write `components/site-header.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";

const NAV_LINKS: Array<{ href: string; nl: string; en: string }> = [
  { href: "#verhaal", nl: "Het verhaal", en: "Our story" },
  { href: "#proces", nl: "Het proces", en: "The process" },
  { href: "#wijnen", nl: "Wijnen", en: "Wines" },
  { href: "#bedrijven", nl: "Voor bedrijven", en: "For businesses" },
  { href: "#bezoek", nl: "Bezoek", en: "Visit" },
];

export function SiteHeader() {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <a className="brand" href="#top">
        <img className="brand-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo" />
        <small>Urban&nbsp;Winery&nbsp;·&nbsp;aan&nbsp;het&nbsp;IJ</small>
      </a>
      <nav className="site-nav" aria-label="Main Navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {t(link.nl, link.en)}
          </a>
        ))}

        <div className="lang-selector">
          <button
            type="button"
            className={`lang-btn${lang === "nl" ? " active" : ""}`}
            onClick={() => setLang("nl")}
            aria-label="Switch to Dutch"
            aria-pressed={lang === "nl"}
          >
            NL
          </button>
          <span className="lang-divider">/</span>
          <button
            type="button"
            className={`lang-btn${lang === "en" ? " active" : ""}`}
            onClick={() => setLang("en")}
            aria-label="Switch to English"
            aria-pressed={lang === "en"}
          >
            EN
          </button>
        </div>

        <a className="nav-cta" href="#paden">
          {t("Boek een tasting", "Book a tasting")}
        </a>
      </nav>
    </header>
  );
}
```

Note: the theme (wine/yellow) dot switcher from the original header is gone — there is only one theme now, so nothing to switch. Uses `t()` from `useLanguage()` (added as an addendum to Task 3, see above) for the bilingual strings — `lang` itself is still needed directly for the active-button styling/`aria-pressed`, which isn't a translation.

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors (will still fail on the missing `@/lib/language` path alias only if `tsconfig.json`'s `paths` isn't picked up — re-check Task 1 Step 4 if so).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add SiteHeader component"
```

---

### Task 8: Site footer

**Files:**
- Create: `components/site-footer.tsx`

- [ ] **Step 1: Write `components/site-footer.tsx`**

```tsx
"use client";

import { useLanguage } from "@/lib/language";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer on-dark">
      <div className="footer-cheers">
        Proost
        <em>santé, cheers, salud</em>
      </div>
      <div className="footer-grid">
        <div>
          <h4>Chateau Amsterdam</h4>
          <p className="footer-note">
            {t(
              "Urban winery aan het IJ. Druiven uit heel Europa, wijn uit Noord, sinds 2017.",
              "Urban winery on the IJ. Grapes from all over Europe, wine from Amsterdam-Noord, since 2017."
            )}
          </p>
        </div>
        <div>
          <h4>{t("Ontdek", "Discover")}</h4>
          <a href="#verhaal">{t("Het verhaal", "Our story")}</a>
          <a href="#proces">{t("Het proces", "The process")}</a>
          <a href="#wijnen">{t("De collectie", "The collection")}</a>
        </div>
        <div>
          <h4>{t("Doen", "Do")}</h4>
          <a href="#paden">Tours &amp; tastings</a>
          <a href="#bedrijven">{t("Voor bedrijven", "For businesses")}</a>
          <a href="#wijnen">Webshop</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:info@chateau.amsterdam">info@chateau.amsterdam</a>
          <a href="https://www.instagram.com/chateauamsterdam/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.linkedin.com/company/chateau-amsterdam/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <img className="footer-logo" src="/assets/chateau-logo.png" alt="Chateau Amsterdam Logo Monochromatic" />
        <span>© 2026 Chateau Amsterdam</span>
      </div>
    </footer>
  );
}
```

Note: the legal footer additions (KvK/address colofon, NIX18 notice, privacy-policy link) belong to the Legal & Compliance plan, not this one — this task only ports what exists today.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add SiteFooter component"
```

---

### Task 9: Homepage sections (Hero, Manifest, Process, Paths, WinesPreview, Place)

This is the bulk of the visual port. Each section is a client component using the hooks from Tasks 3–6. Given the "no meaningful unit test" reasoning in the plan header, each section's step is: write the component, then move on — the whole page gets one combined visual-verification pass in Task 11, which is where any mistakes in this task actually get caught.

Two conventions, established by review before this task shipped, apply throughout: ref casts use `as React.RefObject<HTMLXxxElement>` (matching the element type each ref attaches to), not `as any` — and any list of items whose members need their own `useReveal` call (Manifest's stats, Process's steps, Paths's rows, WinesPreview's cards) extracts each item into its own small child component (`Stat`, `Step`, `PathRow`, `WineCard`), so each `useReveal` call lives in its own component instance rather than being called inside a `.map()` callback in the parent's body — safe either way for a fixed-length array, but the child-component form is the more defensible pattern if any of these lists ever becomes CMS-driven (variable length) later.

Wherever a bilingual string is a plain string (not JSX with embedded tags like `<em>`), it's written using `t(nl, en)` from `useLanguage()` (added in Task 3's addendum, established as the convention in `SiteHeader`/`SiteFooter`). Wherever the two language variants contain embedded JSX, it's written as a plain `lang === "nl" ? (...) : (...)` conditional instead, since `t()` only accepts strings.

**Files:**
- Create: `components/hero.tsx`
- Create: `components/manifest.tsx`
- Create: `components/process.tsx`
- Create: `components/paths.tsx`
- Create: `components/wines-preview.tsx`
- Create: `components/place.tsx`

- [ ] **Step 1: Write `components/hero.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";

const MARQUEE_ITEMS: Array<{ nl: string; en: string } | string> = [
  { nl: "Eerste urban winery van Nederland", en: "First urban winery in the Netherlands" },
  { nl: "De grootste van Europa", en: "The largest in Europe" },
  "Druiven uit FR · DE · IT · ES · NL",
  { nl: "Tastings tussen de tanks", en: "Tastings among the tanks" },
  { nl: "Zero waste sinds dag één", en: "Zero waste since day one" },
];

function MarqueeTrack({ lang }: { lang: "nl" | "en" }) {
  return (
    <>
      {MARQUEE_ITEMS.map((item, i) => (
        <span key={i}>{typeof item === "string" ? item : lang === "nl" ? item.nl : item.en}</span>
      ))}
    </>
  );
}

export function Hero() {
  const { lang, t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useParallax(0.08);
  const introReveal = useReveal(0.55);
  const ctaReveal = useReveal(0.7);
  const mediaReveal = useReveal(0.45);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className={`hero${loaded ? " loaded" : ""}`} id="top">
      <div className="hero-top">
        <span className="rv-line in">
          <span>Est. 2017 · Amsterdam-Noord</span>
        </span>
        <span className="rv-line in">
          <span>52.3914°N&nbsp;&nbsp;4.9131°E · aan het IJ</span>
        </span>
        <span className="rv-line in">
          <span>{t("Wijn uit de stad, voor de stad", "Wine from the city, for the city")}</span>
        </span>
      </div>

      <h1 className="hero-title">
        <span className="row rv-line in">
          <span>Chateau</span>
        </span>
        <span className="row rv-line in">
          <span>Amsterdam</span>
        </span>
        <span className="hero-script">{t("de urban winery", "the urban winery")}</span>
      </h1>

      <div className="hero-deck">
        <div className="hero-intro">
          <p ref={introReveal.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introReveal.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>
                Druiven uit heel Europa, gekoeld naar een machinefabriek aan het IJ gebracht. Daar maken wij wijn:{" "}
                <em>geen wijngaard, wel wijn.</em>
              </>
            ) : (
              <>
                Grapes from all over Europe, transported chilled to a machine factory on the IJ. That&apos;s where we
                make wine: <em>no vineyard, still wine.</em>
              </>
            )}
          </p>
          <div ref={ctaReveal.ref as React.RefObject<HTMLDivElement>} className={`hero-ctas rv${ctaReveal.isVisible ? " in" : ""}`}>
            <a className="btn btn--primary" href="#paden">
              {t("Boek een tasting", "Book a tasting")} <span className="arr">→</span>
            </a>
            <a className="btn" href="#bedrijven">
              {t("Voor bedrijven", "For businesses")} <span className="arr">→</span>
            </a>
          </div>
        </div>
        <figure ref={mediaReveal.ref as React.RefObject<HTMLElement>} className={`hero-media rv${mediaReveal.isVisible ? " in" : ""}`}>
          <div className="media-clip">
            <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="pwrap">
              <img
                src="/assets/hero-winery.png"
                alt="Chateau Amsterdam Winery Interior Hall with stainless steel tanks and oak barrels"
              />
            </div>
          </div>
          <figcaption>
            {t("↳ De makerij, Johan van Hasseltweg, Noord", "↳ The winery, Johan van Hasseltweg, Amsterdam-Noord")}
          </figcaption>
        </figure>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <MarqueeTrack lang={lang} />
          <MarqueeTrack lang={lang} />
        </div>
      </div>
    </section>
  );
}
```

Note on the `.rv-line in` items in `hero-top`/`hero-title`: these are rendered already-visible (`in` class hardcoded) rather than wired to `useReveal`, because they're above the fold and always in view on first paint — matching the original site's practical effect without an unnecessary IntersectionObserver on elements that never need to wait for scroll.

- [ ] **Step 2: Write `components/manifest.tsx`**

```tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { Counter } from "./counter";

const STATS: Array<{ target: number; format?: "dots"; suffix?: string; nl: string; en: string; delay: number }> = [
  { target: 91, nl: "Decanter-punten voor wijn uit Noord", en: "Decanter points for wine from North", delay: 0 },
  { target: 1500, format: "dots", suffix: " m²", nl: "Machinefabriek aan het IJ", en: "Machine factory on the IJ", delay: 0.1 },
  { target: 5, nl: "Landen waar onze druiven groeien", en: "Countries where our grapes grow", delay: 0.2 },
  { target: 200000, format: "dots", suffix: "+", nl: "Flessen per jaar, gemaakt in Noord", en: "Bottles per year, made in North", delay: 0.3 },
];

function Stat({ stat, lang }: { stat: (typeof STATS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal(stat.delay);
  return (
    <div ref={reveal.ref as React.RefObject<HTMLDivElement>} className={`stat rv${reveal.isVisible ? " in" : ""}`}>
      <div className="num">
        <Counter target={stat.target} format={stat.format} />
        {stat.suffix ? <sub>{stat.suffix}</sub> : null}
      </div>
      <div className="desc">{lang === "nl" ? stat.nl : stat.en}</div>
    </div>
  );
}

export function Manifest() {
  const { lang, t } = useLanguage();
  const label = useReveal();
  const title1 = useReveal();
  const title2 = useReveal(0.15);
  const body = useReveal();

  return (
    <section className="manifest on-dark" id="verhaal">
      <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
        {t("Het verhaal", "Our story")} <span className="en">· no vineyard, still wine</span>
      </div>
      <h2 className="manifest-title">
        <span ref={title1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title1.isVisible ? " in" : ""}`}>
          <span>{t("Geen wijngaard.", "No vineyard.")}</span>
        </span>
        <span ref={title2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title2.isVisible ? " in" : ""}`}>
          <span className="alt">{t("Wel wijn.", "Still wine.")}</span>
        </span>
      </h2>
      <div className="manifest-body">
        <div></div>
        <div className="rule">
          <p ref={body.ref as React.RefObject<HTMLParagraphElement>} className={`rv${body.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>
                Sinds 2017 reizen druiven van families en boeren uit heel Europa gekoeld naar Amsterdam-Noord. In een
                oude machinefabriek aan het IJ, tussen <strong>stalen tanks, betonnen eieren, amforen en eikenhouten
                vaten</strong>, worden ze wijn. Omdat we de stad als wijngaard hebben, zijn we vrijer dan elke
                klassieke producent. Riesling die Moscatel ontmoet? Hier kan het.
              </>
            ) : (
              <>
                Since 2017, grapes from families and farmers all over Europe travel chilled to Amsterdam-Noord. In an
                old machine factory on the IJ, between <strong>steel tanks, concrete eggs, amphorae, and oak
                barrels</strong>, they become wine. Because we have the city as our vineyard, we are freer than any
                classic producer. Riesling meeting Moscatel? Here it&apos;s possible.
              </>
            )}
          </p>
        </div>
      </div>
      <div className="stats">
        {STATS.map((stat) => (
          <Stat key={stat.nl} stat={stat} lang={lang} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `components/process.tsx`**

```tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";

const STEPS: Array<{ idx: string; nlTitle: string; enTitle: string; nlBody: string; enBody: string; img: string; alt: string }> = [
  {
    idx: "01",
    nlTitle: "De druif",
    enTitle: "The grape",
    nlBody: "Geselecteerde boeren en families in Frankrijk, Duitsland, Italië, Spanje en Nederland. Biologisch geteeld, op het juiste moment met de hand geplukt.",
    enBody: "Selected farmers and families in France, Germany, Italy, Spain, and the Netherlands. Organically grown, hand-picked at the perfect moment.",
    img: "/assets/step-druif.png",
    alt: "Close-up of hands picking organic red wine grapes into a rustic wooden box",
  },
  {
    idx: "02",
    nlTitle: "De reis",
    enTitle: "The journey",
    nlBody: "Gekoeld transport naar Noord. Onderweg weken de schillen al. De eerste meters van de wijn worden op de snelweg gemaakt.",
    enBody: "Chilled transport to North. The skins are already macerating along the way. The wine's first meters are made on the highway.",
    img: "/assets/step-reis.png",
    alt: "Crates of fresh grapes inside a cold storage delivery truck with condensation",
  },
  {
    idx: "03",
    nlTitle: "De makerij",
    enTitle: "The winery",
    nlBody: "Staal, beton, amfora of eik: er is weinig dat hier niet kan. Ons eigen lab waakt over elke liter, van most tot botteling.",
    enBody: "Steel, concrete, amphora, or oak: there is little that isn't possible here. Our own lab watches over every liter, from must to bottling.",
    img: "/assets/step-makerij.png",
    alt: "Winemaker measuring wine levels near large stainless steel fermentation tanks",
  },
  {
    idx: "04",
    nlTitle: "De fles",
    enTitle: "The bottle",
    nlBody: "Gebotteld aan het IJ. En zero waste: schillen en pitten worden bier, grappa en onze eigen Piquette d'Amsterdam.",
    enBody: "Bottled on the IJ. And zero waste: skins and seeds become beer, grappa, and our own Piquette d'Amsterdam.",
    img: "/assets/step-fles.png",
    alt: "Automated bottling and labeling machine with wine bottles in a row",
  },
];

function Step({ step, lang }: { step: (typeof STEPS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal();
  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`step rv${reveal.isVisible ? " in" : ""}`}>
      <div className="idx">{step.idx}</div>
      <div>
        <h3>
          {lang === "nl" ? step.nlTitle : step.enTitle} <small>{lang === "nl" ? step.enTitle : step.nlTitle}</small>
        </h3>
        <p>{lang === "nl" ? step.nlBody : step.enBody}</p>
      </div>
      <div className="slotwrap">
        <img src={step.img} alt={step.alt} className="step-img" />
      </div>
    </article>
  );
}

export function Process() {
  const { lang, t } = useLanguage();
  const heading = useReveal();
  const sub = useReveal(0.15);

  return (
    <section className="process" id="proces">
      <div className="label rv in">
        Het proces <span className="en">· grape to glass</span>
      </div>
      <div className="process-grid">
        <div className="process-sticky">
          <h2 ref={heading.ref as React.RefObject<HTMLHeadingElement>} className={`rv${heading.isVisible ? " in" : ""}`}>
            {lang === "nl" ? (
              <>Van boer tot fles, <em>dwars door de stad.</em></>
            ) : (
              <>From farmer to bottle, <em>straight through the city.</em></>
            )}
          </h2>
          <p ref={sub.ref as React.RefObject<HTMLParagraphElement>} className={`sub rv${sub.isVisible ? " in" : ""}`}>
            {t(
              "Wij verplaatsen de druif, niet de wijn. Daardoor zie je hier van dichtbij hoe wijn écht gemaakt wordt.",
              "We move the grape, not the wine. This lets you experience close-up how wine is truly made."
            )}
          </p>
        </div>
        <div className="process-steps">
          {STEPS.map((step) => (
            <Step key={step.idx} step={step} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `components/paths.tsx`**

```tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";

const PATHS: Array<{
  idx: string;
  word: string;
  href: string;
  nlTitle: string;
  enTitle: string;
  nlBody: string;
  enBody: string;
  img: string;
  alt: string;
  ariaLabel: string;
}> = [
  {
    idx: "01",
    word: "Taste",
    href: "#paden",
    nlTitle: "Tours & tastings",
    enTitle: "Tours & tastings",
    nlBody: "Proef 7 wijnen tussen de tanks, met verhaal en bites. Voor bezoekers van de stad, vriendengroepen en iedereen die wil weten hoe stadswijn smaakt.",
    enBody: "Taste 7 wines between the tanks, complete with stories and bites. For city visitors, groups of friends, and anyone who wants to know how urban wine tastes.",
    img: "/assets/path-taste.png",
    alt: "Wine tasting flight with four glasses of different wines on a barrel",
    ariaLabel: "Boek een tasting",
  },
  {
    idx: "02",
    word: "Pour",
    href: "#bedrijven",
    nlTitle: "Voor bedrijven & horeca",
    enTitle: "For businesses & hospitality",
    nlBody: "Grote afname, private label, relatiegeschenken en events in de winery. Eén aanspreekpunt, scherpe staffels, geproduceerd op 10 minuten van CS.",
    enBody: "Bulk orders, private label, corporate gifts, and events in the winery. A single point of contact, volume discounts, produced 10 minutes from Central Station.",
    img: "/assets/path-pour.png",
    alt: "Beautifully decorated long event table inside the industrial winery hall",
    ariaLabel: "Plan een gesprek",
  },
  {
    idx: "03",
    word: "Drink",
    href: "#wijnen",
    nlTitle: "De webshop",
    enTitle: "The webshop",
    nlBody: "De volledige collectie, thuisbezorgd. Van klassieke monocépages tot blends die alleen in Noord kunnen bestaan.",
    enBody: "The complete collection, delivered to your door. From classic single-varietals to blends that could only exist in North.",
    img: "/assets/path-drink.png",
    alt: "Hand pulling a red wine bottle out of a stylish cardboard box",
    ariaLabel: "Naar de webshop",
  },
];

function PathRow({ path, lang }: { path: (typeof PATHS)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal();

  function handleRowClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const target = document.querySelector(path.href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      ref={reveal.ref as React.RefObject<HTMLDivElement>}
      className={`path rv${reveal.isVisible ? " in" : ""}`}
      id={path.href === "#bedrijven" ? "bedrijven" : undefined}
      onClick={handleRowClick}
    >
      <div className="idx">{path.idx}</div>
      <div className="word">{path.word}</div>
      <div className="info">
        <h3>{lang === "nl" ? path.nlTitle : path.enTitle}</h3>
        <p>{lang === "nl" ? path.nlBody : path.enBody}</p>
      </div>
      <div className="thumb">
        <img src={path.img} alt={path.alt} className="path-thumb-img" />
      </div>
      <a className="go" href={path.href} aria-label={path.ariaLabel}>
        →
      </a>
    </div>
  );
}

export function Paths() {
  const { lang, t } = useLanguage();
  const introHeading1 = useReveal();
  const introHeading2 = useReveal(0.12);
  const introBody = useReveal(0.2);

  return (
    <section className="paths" id="paden">
      <div className="label rv in">
        {t("Kies je glas", "Choose your glass")} <span className="en">· choose your glass</span>
      </div>
      <div className="paths-intro">
        <h2>
          <span ref={introHeading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading1.isVisible ? " in" : ""}`}>
            <span>{t("Voor proevers, schenkers", "For tasters, pourers")}</span>
          </span>
          <span ref={introHeading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading2.isVisible ? " in" : ""}`}>
            <span>
              &amp; <em>{t("thuisdrinkers.", "home drinkers.")}</em>
            </span>
          </span>
        </h2>
        <p ref={introBody.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introBody.isVisible ? " in" : ""}`}>
          {t(
            "Toerist, inkoper of liefhebber: iedereen drinkt hier dezelfde wijn. Alleen de weg ernaartoe verschilt.",
            "Tourist, buyer, or wine lover: everyone here drinks the same wine. Only the path there differs."
          )}
        </p>
      </div>
      {PATHS.map((path) => (
        <PathRow key={path.idx} path={path} lang={lang} />
      ))}
    </section>
  );
}
```

- [ ] **Step 5: Write `components/wines-preview.tsx`**

The homepage keeps a short preview row of the collection; the full catalogue with live Shopify data is the `/wijnen` overview page built in a later plan (the Shopify integration phase). This preview stays hardcoded — it's replaced wholesale, not incrementally, when that plan lands.

```tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";

const WINES: Array<{
  n: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
  img: string;
  alt: string;
  delay: number;
}> = [
  { n: "N°01", meta: "Wit · Pfalz, DE", name: "Riesling", nlTag: "de klassieker", enTag: "the classic", price: "€ 16,50", img: "/assets/wine-1.png", alt: "Riesling White Wine Bottle Packshot", delay: 0 },
  { n: "N°02", meta: "Wit · blend, DE × ES", name: "Riesling × Moscatel", nlTag: "kan alleen in Noord", enTag: "only in North", price: "€ 18,-", img: "/assets/wine-2.png", alt: "Riesling Moscatel Blend White Wine Bottle Packshot", delay: 0.08 },
  { n: "N°03", meta: "Rood · Bourgogne-stijl", name: "Pinot Noir", nlTag: "op eik gerijpt", enTag: "aged in oak", price: "€ 19,50", img: "/assets/wine-3.png", alt: "Pinot Noir Red Wine Bottle Packshot", delay: 0.16 },
  { n: "N°04", meta: "Oranje · skin contact", name: "Amber Blend", nlTag: "voor de avonturiers", enTag: "for the adventurers", price: "€ 17,50", img: "/assets/wine-4.png", alt: "Amber Blend Orange Wine Bottle Packshot", delay: 0.24 },
  { n: "N°05", meta: "Sprankel · zero waste", name: "Piquette d'Amsterdam", nlTag: "tweede leven van de schil", enTag: "second life of the grape skin", price: "€ 12,50", img: "/assets/wine-5.png", alt: "Piquette d'Amsterdam Sparkling Wine Bottle Packshot", delay: 0.32 },
];

function WineCard({ wine, lang }: { wine: (typeof WINES)[number]; lang: "nl" | "en" }) {
  const reveal = useReveal(wine.delay);
  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`wine-card rv${reveal.isVisible ? " in" : ""}`}>
      <div className="meta">
        <span>{wine.n}</span>
        <span>{wine.meta}</span>
      </div>
      <div className="wine-img-wrap">
        <img src={wine.img} alt={wine.alt} className="wine-packshot" />
      </div>
      <h3>{wine.name}</h3>
      <div className="tag">{lang === "nl" ? wine.nlTag : wine.enTag}</div>
      <div className="price">{wine.price}</div>
    </article>
  );
}

export function WinesPreview() {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t("De collectie", "The collection")} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t("Van klassiek", "From classic")}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t("tot ", "to ")}
                <em>{t("eigenwijs.", "rebellious.")}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={cta.ref as React.RefObject<HTMLAnchorElement>} className={`btn rv${cta.isVisible ? " in" : ""}`} href="#wijnen">
          {t("Shop alle wijnen", "Shop all wines")} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {WINES.map((wine) => (
          <WineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Write `components/place.tsx`**

```tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";

export function Place() {
  const { t } = useLanguage();
  const parallaxRef = useParallax(0.12);
  const label = useReveal();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const address = useReveal();
  const hours = useReveal(0.1);
  const route = useReveal(0.2);
  const cta = useReveal(0.3);

  return (
    <section className="place on-dark" id="bezoek">
      <div ref={parallaxRef as React.RefObject<HTMLDivElement>} className="place-media">
        <img
          src="/assets/place-hal.png"
          alt="Chateau Amsterdam Winery exterior at waterfront in Amsterdam-Noord during evening blue hour"
        />
      </div>
      <div className="place-inner">
        <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
          {t("De plek", "The venue")} <span className="en">· visit us</span>
        </div>
        <h2>
          <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
            <span>{t("Een machinefabriek", "A machine factory")}</span>
          </span>
          <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
            <span>
              <em>{t("aan het IJ.", "on the IJ.")}</em>
            </span>
          </span>
        </h2>
        <div className="place-grid">
          <div ref={address.ref as React.RefObject<HTMLDivElement>} className={`rv${address.isVisible ? " in" : ""}`}>
            <h4>{t("Adres", "Address")}</h4>
            <p>
              Johan van Hasseltweg
              <br />
              Amsterdam-Noord
            </p>
          </div>
          <div ref={hours.ref as React.RefObject<HTMLDivElement>} className={`rv${hours.isVisible ? " in" : ""}`}>
            <h4>{t("Open", "Hours")}</h4>
            <p>
              {t("Wo t/m zo", "Wed thru Sun")}
              <br />
              {t("12.00 tot 18.30", "12:00 to 18:30")}
            </p>
          </div>
          <div ref={route.ref as React.RefObject<HTMLDivElement>} className={`rv${route.isVisible ? " in" : ""}`}>
            <h4>Route</h4>
            <p>
              {t("Pont vanaf CS, 10 min fietsen", "Ferry from Central Station, 10 min bike")}
              <br />
              {t("of metro 52 → Noorderpark", "or metro 52 → Noorderpark")}
            </p>
          </div>
          <div ref={cta.ref as React.RefObject<HTMLDivElement>} className={`rv${cta.isVisible ? " in" : ""}`}>
            <a className="btn btn--light" href="#bezoek">
              {t("Plan je bezoek", "Plan your visit")} <span className="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Verify the project typechecks**

Run: `npx tsc --noEmit`
Expected: no errors. Fix any before moving on — this is the step that catches typos in the prop/type shapes across all six files.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: port homepage sections to React components"
```

---

### Task 10: Root layout, page composition, and assets

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Modify: move `public/assets/*`, `public/icons.svg`, `public/favicon.svg` (already in `public/`, no change needed — Next.js serves `public/` at the root automatically, same as the current setup)
- Delete: `index.html`, `src/main.js`

- [ ] **Step 1: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  title: "Chateau Amsterdam · Urban Winery Amsterdam-Noord",
  description:
    "Eerste urban winery van Nederland, gevestigd in Amsterdam-Noord. Druiven uit heel Europa, gemaakt aan het IJ. Boek een tasting of proeverij tussen de stalen tanks.",
  openGraph: {
    title: "Chateau Amsterdam · Urban Winery",
    description: "Geen wijngaard. Wel wijn. Druiven uit heel Europa, wijn gemaakt aan het IJ in Amsterdam-Noord.",
    images: ["/assets/place-hal.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chateau Amsterdam · Urban Winery",
    description: "Geen wijngaard. Wel wijn. Druiven uit heel Europa, wijn gemaakt aan het IJ in Amsterdam-Noord.",
    images: ["/assets/place-hal.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Winery",
  name: "Chateau Amsterdam",
  image: "https://chateau.amsterdam/assets/place-hal.png",
  "@id": "https://chateau.amsterdam/#winery",
  url: "https://chateau.amsterdam/",
  telephone: "+31200000000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Johan van Hasseltweg",
    addressLocality: "Amsterdam-Noord",
    addressRegion: "Noord-Holland",
    postalCode: "1021",
    addressCountry: "NL",
  },
  geo: { "@type": "GeoCoordinates", latitude: 52.3914, longitude: 4.9131 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "12:00",
    closes: "18:30",
  },
  sameAs: ["https://www.instagram.com/chateauamsterdam/", "https://www.linkedin.com/company/chateau-amsterdam/"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${archivo.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body data-pattern="arcering" style={{ ["--pattern-o" as any]: 0.04 }}>
        <LanguageProvider>
          <div className="grain" />
          <div className="bg-pattern" />
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
```

Note: `next/font/google`'s generated CSS variables (`--font-archivo` etc.) need mapping onto the font-family tokens `globals.css` already uses (`--font-display`, `--font-serif`, `--font-mono`). Add this mapping at the top of `app/globals.css`'s `:root` block, right after the font declarations:

- [ ] **Step 2: Wire the font variables into `app/globals.css`**

Open `app/globals.css` and replace:

```css
  --font-display: "Archivo", sans-serif;
  --font-serif: "Instrument Serif", serif;
  --font-mono: "IBM Plex Mono", monospace;
```

with:

```css
  --font-display: var(--font-archivo), sans-serif;
  --font-serif: var(--font-instrument-serif), serif;
  --font-mono: var(--font-ibm-plex-mono), monospace;
```

- [ ] **Step 3: Write `app/page.tsx`**

```tsx
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifest />
      <Process />
      <Paths />
      <WinesPreview />
      <Place />
    </>
  );
}
```

- [ ] **Step 4: Delete the old entry point**

```bash
rm index.html src/main.js
```

`src/main.js` is fully superseded by this point — every behavior it implemented (language toggle, reveals, parallax, magnetic buttons, counters, header scroll state) was ported to the hooks and components in Tasks 3–9, and nothing in the Next.js app references it.

- [ ] **Step 5: Confirm assets are already in place**

Run: `ls public/assets | head -20`
Expected: the same asset filenames referenced throughout (`chateau-logo.png`, `hero-winery.png`, `step-druif.png`, `wine-1.png` … `wine-5.png`, `path-taste.png`, `path-pour.png`, `path-drink.png`, `place-hal.png`) are present. If `public/` doesn't exist yet or is missing files, move the current project's `public/assets` directory there before continuing — do not proceed to Step 6 with missing images.

- [ ] **Step 6: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass — 19 tests across 4 files (`lib/language.test.tsx`, `lib/use-reveal.test.tsx`, `lib/use-magnetic.test.tsx`, `components/counter.test.tsx`), reflecting the tests added across Tasks 3–6.

- [ ] **Step 7: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds, prints a route summary including `/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire up root layout and homepage, remove old Vite entry point"
```

Addenda found while executing this task (the point where the whole app first actually builds, so several latent issues from earlier tasks surfaced here):

- `next.config.js` (from Task 1) used CommonJS `module.exports`, but `package.json` has `"type": "module"` — Node treated the file as ESM and `npm run build` failed with `module is not defined`. Fixed to `export default nextConfig;`.
- `tsconfig.json`'s `jsx: "preserve"` (from Task 1) gets forcibly rewritten to `jsx: "react-jsx"` by Next.js itself on every build/dev run in this installed version — a mandatory config Next enforces, not an optional choice. Inert in effect (`noEmit: true` means `tsc` never does the real JSX transform; Next's own build pipeline does that), just worth knowing this isn't something to "fix back."
- `metadataBase` was missing from `app/layout.tsx`'s `metadata` export. Without it, Next.js resolves relative OG/Twitter image URLs against a `http://localhost:3000` fallback **at build time**, meaning production social-share previews (Slack, WhatsApp, LinkedIn, X, iMessage) would silently point at a dead localhost URL. Fixed by setting `metadataBase: new URL("https://chateau.amsterdam")`, matching the domain already hardcoded in the JSON-LD structured data.
- The `--pattern-o` CSS custom-property style cast was tightened from `{ ["--pattern-o" as any]: 0.04 }` (casts the object key, silently bypassing type-checking on anything else added to that object later) to `{ "--pattern-o": 0.04 } as React.CSSProperties` (casts the whole object once).

---

### Task 11: Railway deploy config and visual verification

**Files:**
- Modify: `package.json` (already has the right `start` script from Task 1)

- [ ] **Step 1: Run the dev server locally**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000`.

- [ ] **Step 2: Visually compare against the live reference**

Open `http://localhost:3000` and `https://chateau-amsterdam-homepage-production.up.railway.app/` side by side. Check specifically:
- Header nav, language toggle (NL/EN), and scroll-shrink behavior on scroll
- Hero: title reveal animation, script tagline fade-in, marquee scroll
- "Het verhaal" / Our story section: label and "Wel wijn." now render in **yellow**, not bordeaux — this is the exact bug being fixed, check it first
- Process section: sticky heading behavior while scrolling past the four steps
- Paths section: hover states on each row (background invert, word color, thumbnail rotate)
- Wines row: horizontal scroll/snap, card hover lift
- "De plek" section: parallax on the background image while scrolling
- Footer: all links present and correct
- Toggle language to EN and re-check every section above
- Resize to a phone-width viewport (375px) and re-check header, hero stacking, and wine-row horizontal scroll

Expected: visually identical to the reference in every respect **except** the accent color, which is yellow everywhere (including "Our Story", which was the reported bug).

- [ ] **Step 3: Production build smoke test**

Run: `npm run build && PORT=3001 npm run start`
Open `http://localhost:3001` and spot-check the homepage loads correctly in the production build (not just `next dev`).

Stop the server (`Ctrl+C`) once confirmed.

- [ ] **Step 4: Commit any fixes found during verification**

If Step 2 surfaced any visual mismatch, fix it in the relevant component/CSS file from earlier tasks and commit separately:

```bash
git add -A
git commit -m "fix: visual QA corrections after Next.js port"
```

(Skip this step if Step 2 found nothing to fix.)

**Verification results (2026-07-16):** `npm run dev` and a from-scratch `npm run build && PORT=3001 npm run start` both succeeded; the production server responded `200` and served real page content (verified via `curl`). Visual comparison against `https://chateau-amsterdam-homepage-production.up.railway.app/` confirmed:
- Header, nav, language toggle, and hero all match the reference exactly, including the yellow "de urban winery" script accent.
- The specific reported bug — the "Our Story" section staying bordeaux — is fixed: `getComputedStyle` on `.manifest .label`, `.manifest-title .alt`, `.place-inner .label`, `.footer-cheers em`, `.footer-grid h4`, and `.btn--primary`'s background all resolve to `rgb(255, 204, 0)` (`#FFCC00`), with `.wine-card .tag` correctly resolving to the darker `rgb(196, 154, 0)` (`#C49A00`) badge variant — confirmed in both NL and EN.
- Language toggle (NL → EN) correctly updates `document.documentElement.lang`, nav/CTA/hero/footer copy, and persists.
- Mobile viewport (375×812) layout — including a large empty gap below the hero's script tagline — matches the live reference's own mobile layout pixel-for-pixel in structure; this is a pre-existing characteristic of `min-height: 100svh` on `.hero`, not a regression introduced by the port.
- One session-specific tooling limitation: this session's Browser-pane screenshot capture reliably went blank for any scrolled viewport state (reproduced across gesture scroll, JS `scrollTo`, and keyboard `Page_Down`, across multiple tabs), while remaining fully reliable at `scrollY = 0` immediately after a fresh navigation. Compensated by verifying scrolled sections via `getComputedStyle`/`get_page_text`/DOM queries instead of pixel screenshots — arguably a more precise check for a color-value bug than eyeballing a screenshot would have been, but worth knowing about if a future session hits the same blank-screenshot symptom.

No visual mismatches required a code fix at this stage (Step 4 skipped).

---

## Self-review notes

- **Spec coverage:** this plan covers the spec's "Design" section (Next.js rebuild, yellow-only accent, bordeaux leftover fix, faithful interaction port) and lays the file/component structure the CMS, Shopify, and reservations plans build on. It intentionally does **not** cover CMS, Shopify, reservations, additional pages, legal/compliance, security hardening, or Umami — those are separate plans per the spec's phased sequencing, written once this foundation exists and the real component shape is known.
- **Placeholder scan:** no TBD/TODO markers; every step has complete, runnable code.
- **Type consistency:** `useReveal(delay)` returns `{ ref, isVisible }` consistently across Tasks 4 and every section component in Task 9 — checked against every call site above. `useLanguage()` returns `{ lang, setLang }` consistently between Task 3 and its four consumers (header, footer, and every section component).
