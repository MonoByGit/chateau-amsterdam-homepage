# Chateau Amsterdam — CMS (Fase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a login-gated `/admin` CMS (text editor, wines, reservations inbox, availability calendar, media library) backed by Postgres and portable object storage, with the existing homepage wired to read its content live from that data instead of from hardcoded strings — per `docs/superpowers/specs/2026-07-16-cms-design.md`.

**Architecture:** Drizzle ORM against Postgres (local dev via docker-compose, production via Railway's managed Postgres, already provisioned). Auth is hand-rolled DB-backed sessions (bcrypt + sha256-hashed tokens), gated by Next.js's `proxy.ts` (the framework's current name for what used to be `middleware.ts`). The public site moved into an `app/(site)/` route group so `/admin` can have its own independent root layout with Tailwind v4 scoped to just that subtree — the public site's hand-ported `globals.css` stays untouched. Content is a generic `content_blocks` (page/section/field_key → NL/EN value) table; public Server Components fetch it per-request (no caching layer) and pass it down as props to the existing client components, whose reveal/parallax/magnetic hook logic is unchanged. Media uploads go to Railway's own S3-compatible bucket (already provisioned) via `@aws-sdk/client-s3`.

**Tech Stack:** Next.js 16.2.10 (App Router) + TypeScript + React 19, Drizzle ORM + `pg`, bcryptjs, Tailwind v4 (admin only), `@aws-sdk/client-s3`, Vitest + React Testing Library, `tsx` for one-off scripts, Docker Compose for local Postgres.

---

## Provisioned infrastructure (already done, before Task 1)

This plan assumes the following Railway resources already exist and are wired to the `chateau-amsterdam-2.0` service — no task in this plan creates them:

- **Postgres** (`ghcr.io/railwayapp-templates/postgres-ssl:18`), with `DATABASE_URL` (private) and `DATABASE_PUBLIC_URL` (public proxy) set as variables on the app service.
- **S3-compatible bucket** `chateau-media` (region `ams`), with `AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_DEFAULT_REGION` set as variables on the app service.
- **`.env.local`** (gitignored) already contains local-dev equivalents: `DATABASE_URL` pointing at a docker-compose Postgres (`postgresql://postgres:postgres@localhost:5433/chateau_dev` — host port `5433`, not the default `5432`, to avoid clashing with any other local Postgres install already using that port) and the same bucket credentials (the bucket is shared between local dev and production — only the database differs). `.env.local.example` (committed) documents the required keys with blank values.

---

### Task 1: CMS toolchain — dependencies, local Postgres, migration runner

Adds every package the CMS phase needs (ORM, driver, password hashing, Tailwind for the admin surface, S3 client for media, `tsx` for one-off scripts), a docker-compose-based local Postgres for dev and for the DB-touching tests added in later tasks, and a re-runnable migration script. No app code changes yet — this is pure toolchain setup, so (mirroring how phase-1's Task 1 scaffold was verified) it ends with boot-verification steps rather than a unit test.

**Files:**
- Modify: `package.json`
- Create: `docker-compose.yml`
- Create: `scripts/migrate.ts`
- Modify: `test/setup.ts`

- [ ] **Step 1: Confirm bcryptjs 3.x ships its own TypeScript types**

Run: `npm view bcryptjs@3.0.3 types`
Expected: `umd/index.d.ts` — this confirms bcryptjs 3.x bundles its own type declarations. The separately-published `@types/bcryptjs` package predates bcryptjs's own types and is redundant for 3.x (installing it alongside would risk a duplicate/conflicting declaration). Do **not** add `@types/bcryptjs` to `package.json`.

- [ ] **Step 2: Modify `package.json`**

Add the CMS dependencies/devDependencies and three new scripts. Full resulting file:

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
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts"
  },
  "dependencies": {
    "next": "16.2.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "drizzle-orm": "^0.45.2",
    "pg": "^8.22.0",
    "bcryptjs": "^3.0.3",
    "@aws-sdk/client-s3": "^3.1088.0"
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
    "jsdom": "^25.0.0",
    "drizzle-kit": "^0.31.10",
    "@types/pg": "^8.20.0",
    "tailwindcss": "^4.3.2",
    "@tailwindcss/postcss": "^4.3.2",
    "postcss": "^8",
    "tsx": "^4",
    "dotenv": "^16"
  }
}
```

`db:seed` points at `scripts/seed.ts`, which doesn't exist until a later chunk wires all seed modules together — running `npm run db:seed` right after this task will fail with a "cannot find module" error, and that's expected until that task lands.

- [ ] **Step 3: Install**

Run: `npm install`
Expected: install completes with no error. `package-lock.json` now includes `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, `bcryptjs`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `@aws-sdk/client-s3`, `tsx`, `dotenv`.

- [ ] **Step 4: Write `docker-compose.yml`**

Local dev Postgres, for `next dev` and for the DB-touching tests added starting in Task 3. Production uses Railway's own managed Postgres (already provisioned and already wired to the Railway service as `DATABASE_URL`/`DATABASE_PUBLIC_URL`) — this compose file is dev-only and never deployed.

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: chateau_dev
    ports:
      - "127.0.0.1:5433:5432"
    volumes:
      - chateau_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d chateau_dev"]
      interval: 2s
      timeout: 3s
      retries: 10

volumes:
  chateau_pg_data:
```

Bound to `127.0.0.1` only (not all interfaces) since this container uses default `postgres/postgres` credentials — no reason to expose it beyond localhost. Host port `5433` (not the standard `5432`) to avoid clashing with any other local Postgres install already using the default port on the development machine; only the host-side port differs; the container's own internal port stays `5432`.

- [ ] **Step 5: Start local Postgres**

Run: `docker compose up -d postgres`
Expected: image pulls (first run only) and the container starts.

Run: `docker compose ps`
Expected: the `postgres` service shows `STATUS` as `Up (healthy)`.

`.env.local` already has `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/chateau_dev` pointing at this container — no env file changes needed here.

- [ ] **Step 6: Write `scripts/migrate.ts`**

Runs any pending Drizzle migrations via the node-postgres migrator. Re-runnable — already-applied migrations are tracked by drizzle-kit's own migrations table and skipped.

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  await migrate(db, { migrationsFolder: "./drizzle" });

  await pool.end();
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

There's no `./drizzle` folder yet — `npm run db:migrate` isn't runnable until Task 2 generates it. That's expected; this step only creates the script.

- [ ] **Step 7: Modify `test/setup.ts` to load `.env.local`**

Vitest doesn't get Next.js's automatic `.env.local` loading, but the DB-touching tests added starting in Task 3 need `process.env.DATABASE_URL`. Load it the same way `scripts/migrate.ts` does, via `dotenv`, so every test file gets it for free through the existing global `setupFiles` wiring.

```ts
import "@testing-library/jest-dom/vitest";
import { config } from "dotenv";

config({ path: ".env.local" });
```

- [ ] **Step 8: Verify the toolchain still boots**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx vitest run`
Expected: `Test Files  4 passed (4)`, `Tests  19 passed (19)` — identical to the pre-existing baseline (`lib/use-magnetic.test.tsx`, `lib/use-reveal.test.tsx`, `lib/language.test.tsx`, `components/counter.test.tsx`). No new test files exist yet, so this just confirms the dependency/config additions didn't break anything already there.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json docker-compose.yml scripts/migrate.ts test/setup.ts
git commit -m "chore: add CMS toolchain (Drizzle, pg, bcryptjs, Tailwind, S3 client) and local Postgres"
```

---

### Task 2: Drizzle schema, config, and first migration

**Files:**
- Create: `lib/db/schema.ts`
- Create: `drizzle.config.ts`
- Create: `drizzle/` (generated migration SQL + snapshot metadata, via `db:generate`)

- [ ] **Step 1: Write `lib/db/schema.ts`**

Every table/column name here is load-bearing — every repository function in this plan (and every later chunk's repository code) imports these exact exports.

```ts
import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, date, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentBlocks = pgTable("content_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  page: text("page").notNull(),
  section: text("section").notNull(),
  fieldKey: text("field_key").notNull(),
  valueNl: text("value_nl").notNull(),
  valueEn: text("value_en").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
}, (table) => ({
  uniqueField: uniqueIndex("content_blocks_page_section_field_key_idx").on(table.page, table.section, table.fieldKey),
}));

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageKey: text("storage_key").notNull(),
  filename: text("filename").notNull(),
  altTextNl: text("alt_text_nl").notNull().default(""),
  altTextEn: text("alt_text_en").notNull().default(""),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wines = pgTable("wines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  metaNl: text("meta_nl").notNull(),
  metaEn: text("meta_en").notNull(),
  tagNl: text("tag_nl").notNull(),
  tagEn: text("tag_en").notNull(),
  imageId: uuid("image_id").references(() => media.id),
  shopifyHandle: text("shopify_handle").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reservationTrackEnum = pgEnum("reservation_track", ["standaard", "zakelijk"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["nieuw", "in_behandeling", "bevestigd", "afgewezen"]);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  track: reservationTrackEnum("track").notNull(),
  status: reservationStatusEnum("status").notNull().default("nieuw"),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  partySize: integer("party_size"),
  groupSize: integer("group_size"),
  companyName: text("company_name"),
  occasion: text("occasion"),
  preferredPeriod: text("preferred_period"),
  requestedDate: date("requested_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const availabilityDaypartEnum = pgEnum("availability_daypart", ["ochtend", "middag", "avond", "hele_dag"]);

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  daypart: availabilityDaypartEnum("daypart").notNull().default("hele_dag"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueBlock: uniqueIndex("availability_blocks_date_daypart_idx").on(table.date, table.daypart),
}));
```

- [ ] **Step 2: Write `drizzle.config.ts`**

Same `.env.local` loading as `scripts/migrate.ts` (Task 1) — not the bare `dotenv/config` default, which reads a plain `.env` file that doesn't exist in this repo.

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Generate the initial migration**

Run: `npm run db:generate`
Expected: creates `drizzle/0000_<auto-generated-name>.sql` plus a `drizzle/meta/` snapshot folder. The SQL file contains `CREATE TYPE` statements for `reservation_track`, `reservation_status`, `availability_daypart`, and `CREATE TABLE` statements for all 7 tables (`users`, `sessions`, `content_blocks`, `media`, `wines`, `reservations`, `availability_blocks`), including the two unique indexes.

- [ ] **Step 4: Confirm local Postgres is running (from Task 1)**

Run: `docker compose up -d postgres`
Expected: `Container ... Running` (no-op if already up).

- [ ] **Step 5: Apply the migration**

Run: `npm run db:migrate`
Expected: prints `Migrations applied.` with no errors.

- [ ] **Step 6: Verify every table and enum type exists**

Run: `docker compose exec -T postgres psql -U postgres -d chateau_dev -c "\dt"`
Expected: lists `users`, `sessions`, `content_blocks`, `media`, `wines`, `reservations`, `availability_blocks` (7 rows).

Run: `docker compose exec -T postgres psql -U postgres -d chateau_dev -c "\dT"`
Expected: lists `reservation_track`, `reservation_status`, `availability_daypart` (3 rows).

- [ ] **Step 7: Commit**

```bash
git add lib/db/schema.ts drizzle.config.ts drizzle
git commit -m "feat: add Drizzle schema for auth, content, wines, reservations, availability"
```

---

### Task 3: Database client (`lib/db/client.ts`)

A thin, shared Drizzle instance every repository function in this plan imports. Given the "no mocks against a real Postgres" testing philosophy this whole plan uses for DB code, this task proves the connection string and driver wiring are correct with a real query before anything else builds on top of it.

**Files:**
- Create: `lib/db/client.ts`
- Test: `lib/db/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/client.test.ts
import { describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "./client";

describe("db client", () => {
  it("connects to Postgres and can run a trivial query", async () => {
    const result = await db.execute(sql`select 1 as one`);
    expect(result.rows[0]).toEqual({ one: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/client.test.ts`
Expected: FAIL — `Cannot find module './client'` (file doesn't exist yet).

- [ ] **Step 3: Write `lib/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

- [ ] **Step 4: Run test to verify it passes**

Requires local Postgres running (`docker compose up -d postgres`, from Task 1/2).

Run: `npx vitest run lib/db/client.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add lib/db/client.ts lib/db/client.test.ts
git commit -m "feat: add shared Drizzle db client"
```

---

### Task 4: Password hashing (`lib/auth/password.ts`)

Thin wrappers around bcryptjs. Real branching (hash vs. verify, correct vs. incorrect password) — full TDD. Uses real bcryptjs rather than mocking it: it's fast enough at 10 salt rounds in a test suite, and mocking a hashing library would prove nothing about whether the wrapper actually hashes correctly.

**Files:**
- Create: `lib/auth/password.ts`
- Test: `lib/auth/password.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/auth/password.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("returns a bcrypt hash, not the plain password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toBe("correct horse battery staple");
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it("produces a different hash for the same password on each call (random salt)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct plain-text password", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(verifyPassword("s3cret!", hash)).resolves.toBe(true);
  });

  it("returns false for an incorrect plain-text password", async () => {
    const hash = await hashPassword("s3cret!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/password.test.ts`
Expected: FAIL — `Cannot find module './password'`.

- [ ] **Step 3: Write `lib/auth/password.ts`**

```ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/password.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/password.ts lib/auth/password.test.ts
git commit -m "feat: add bcrypt password hashing helpers"
```

---

### Task 5: Session tokens (`lib/auth/session.ts`)

Pure functions only — token generation and hashing. No DB access here (that's Task 7); these are unit-testable without touching Postgres. Real logic (format, uniqueness, determinism) — full TDD.

**Files:**
- Create: `lib/auth/session.ts`
- Test: `lib/auth/session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/auth/session.test.ts
import { describe, it, expect } from "vitest";
import { generateSessionToken, hashSessionToken } from "./session";

describe("generateSessionToken", () => {
  it("returns a 64-character lowercase hex string (32 random bytes)", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns a different token on every call", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
  });
});

describe("hashSessionToken", () => {
  it("returns a 64-character lowercase hex string (sha256 digest)", () => {
    const hash = hashSessionToken("some-token");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic: the same token always hashes to the same value", () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("produces different hashes for different tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(hashSessionToken(a)).not.toBe(hashSessionToken(b));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/session.test.ts`
Expected: FAIL — `Cannot find module './session'`.

- [ ] **Step 3: Write `lib/auth/session.ts`**

Session tokens are high-entropy random values (not user-chosen, unlike passwords), so a fast cryptographic hash is appropriate here instead of bcrypt — the point of hashing at rest is so a stolen DB dump doesn't hand over live session tokens, not to slow down brute-forcing a low-entropy secret.

```ts
import { randomBytes, createHash } from "node:crypto";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/session.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/session.ts lib/auth/session.test.ts
git commit -m "feat: add session token generation and hashing helpers"
```

---

### Task 6: Users repository (`lib/db/users.ts`)

First DB-touching repository. Tested against the real local Postgres from Task 1/2 (not mocked) — query correctness against the actual `users` table (unique email constraint, UUID defaults, timestamp defaults) is exactly what needs proving. `beforeEach`/`afterEach` truncate the table so tests don't leak state into each other.

**Files:**
- Create: `lib/db/users.ts`
- Test: `lib/db/users.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "./client";
import { users } from "./schema";
import { createUser, findUserByEmail, findUserById } from "./users";

beforeEach(async () => {
  await db.delete(users);
});

afterEach(async () => {
  await db.delete(users);
});

describe("users repository", () => {
  it("creates a user and returns the inserted row", async () => {
    const user = await createUser("jan@chateau.amsterdam", "hashed-password");
    expect(user.id).toBeTruthy();
    expect(user.email).toBe("jan@chateau.amsterdam");
    expect(user.passwordHash).toBe("hashed-password");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("finds a user by email", async () => {
    await createUser("marie@chateau.amsterdam", "hashed-password");
    const found = await findUserByEmail("marie@chateau.amsterdam");
    expect(found?.email).toBe("marie@chateau.amsterdam");
  });

  it("returns null when no user matches the given email", async () => {
    const found = await findUserByEmail("nobody@chateau.amsterdam");
    expect(found).toBeNull();
  });

  it("finds a user by id", async () => {
    const created = await createUser("piet@chateau.amsterdam", "hashed-password");
    const found = await findUserById(created.id);
    expect(found?.id).toBe(created.id);
  });

  it("returns null when no user matches the given id", async () => {
    const found = await findUserById("00000000-0000-0000-0000-000000000000");
    expect(found).toBeNull();
  });

  it("rejects a second user with the same email", async () => {
    await createUser("duplicate@chateau.amsterdam", "hashed-password");
    await expect(createUser("duplicate@chateau.amsterdam", "another-hash")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/users.test.ts`
Expected: FAIL — `Cannot find module './users'`.

- [ ] **Step 3: Write `lib/db/users.ts`**

```ts
import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

export type User = typeof users.$inferSelect;

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Requires local Postgres running with migrations applied (Task 1/2).

Run: `npx vitest run lib/db/users.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/users.ts lib/db/users.test.ts
git commit -m "feat: add users repository, tested against real Postgres"
```

---

### Task 7: Sessions repository (`lib/db/sessions.ts`)

Real branching logic (valid/missing/expired token) against the `sessions` table, including its foreign key to `users`. Tested against real Postgres, seeding a user first via Task 6's repository since `sessions.userId` is a required FK.

**Files:**
- Create: `lib/db/sessions.ts`
- Test: `lib/db/sessions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/sessions.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { sessions, users } from "./schema";
import { createUser } from "./users";
import { createSession, validateSession, deleteSession } from "./sessions";
import { hashSessionToken } from "@/lib/auth/session";

async function cleanTables() {
  await db.delete(sessions);
  await db.delete(users);
}

beforeEach(cleanTables);
afterEach(cleanTables);

describe("sessions repository", () => {
  it("creates a session with a ~30-day expiry and returns the raw token", async () => {
    const user = await createUser("session-user@chateau.amsterdam", "hashed-password");
    const before = Date.now();
    const { token, expiresAt } = await createSession(user.id);

    expect(token).toMatch(/^[0-9a-f]{64}$/);
    const daysUntilExpiry = (expiresAt.getTime() - before) / (1000 * 60 * 60 * 24);
    expect(daysUntilExpiry).toBeGreaterThan(29.9);
    expect(daysUntilExpiry).toBeLessThan(30.1);
  });

  it("validates a session created for a real token and returns the owning userId", async () => {
    const user = await createUser("valid-session@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    const result = await validateSession(token);
    expect(result).toEqual({ userId: user.id });
  });

  it("returns null for a token that was never issued", async () => {
    const result = await validateSession("0".repeat(64));
    expect(result).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const user = await createUser("expired-session@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    // Force the session's expiry into the past, bypassing createSession's
    // 30-day default, to exercise validateSession's expiry check itself.
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(sessions.tokenHash, hashSessionToken(token)));

    const result = await validateSession(token);
    expect(result).toBeNull();
  });

  it("deletes a session so a subsequent validateSession call returns null", async () => {
    const user = await createUser("logout-user@chateau.amsterdam", "hashed-password");
    const { token } = await createSession(user.id);

    await deleteSession(token);

    const result = await validateSession(token);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/sessions.test.ts`
Expected: FAIL — `Cannot find module './sessions'`.

- [ ] **Step 3: Write `lib/db/sessions.ts`**

```ts
import { eq, gt, and } from "drizzle-orm";
import { db } from "./client";
import { sessions } from "./schema";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ userId, tokenHash, expiresAt });

  // Only the hash is ever stored — the raw token is returned once, here,
  // for the caller to put in a cookie. It cannot be recovered from the DB.
  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashSessionToken(token);
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return session ? { userId: session.userId } : null;
}

export async function deleteSession(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/sessions.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/sessions.ts lib/db/sessions.test.ts
git commit -m "feat: add sessions repository (create/validate/delete), tested against real Postgres"
```

---

### Task 8: Admin auth shell — proxy, cookie, login, layout, logout

This is the largest task in this chunk because it's where every piece from Tasks 4–7 gets wired into an actual gated `/admin` surface. It bundles: an architecture fix that the original brief's assumption didn't account for (see Step 1), the shared cookie contract, request-gating logic (real branching → TDD), and the login/layout/logout UI (Server Action wiring, which per this plan's own testing strategy is verified manually against a dev database rather than unit-tested).

**Files:**
- Delete: `app/layout.tsx` (content moves to `app/(site)/layout.tsx`, unchanged)
- Delete: `app/page.tsx` (content moves to `app/(site)/page.tsx`, unchanged)
- Create: `app/(site)/layout.tsx`
- Create: `app/(site)/page.tsx`
- Create: `lib/auth/session-cookie.ts`
- Create: `proxy.ts`
- Test: `proxy.test.ts`
- Create: `app/admin/login/actions.ts`
- Create: `app/admin/login/login-form.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/admin.css`
- Create: `postcss.config.mjs`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/actions.ts`

- [ ] **Step 1: Move the public site into a `(site)` route group — required before an isolated `/admin` layout is possible**

The original assumption was that `app/admin/layout.tsx` could simply be "a normal nested layout." It can't, as written today: `app/layout.tsx` is the app's one root layout — it already renders `<html>`/`<body>`, `LanguageProvider`, `SiteHeader`, and `SiteFooter` for every route in `app/**`, `/admin` included. Next.js only allows **one** layout per route to render `<html>`/`<body>` (the "root layout"), and per the framework's own rule, "any layout without a `layout.js` above it is a root layout" — so the fix is to remove the single top-level `app/layout.tsx` and let two independent trees each have their own root layout: `app/(site)/layout.tsx` for the public homepage (route group — doesn't affect the URL, `/` still resolves via `app/(site)/page.tsx`) and `app/admin/layout.tsx` for the gated admin surface (Step 9 below). This is exactly what the CMS spec calls for anyway ("Tailwind scoped to `app/admin/**` only... the public site's hand-ported CSS system stays untouched") — without this split, either the admin panel would inherit the public site's header/footer/fonts, or React would throw on nested `<html>` tags.

Move the existing root layout, verbatim, to its new path:

```tsx
// app/(site)/layout.tsx
import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chateau.amsterdam"),
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
      <body data-pattern="arcering" style={{ "--pattern-o": 0.04 } as React.CSSProperties}>
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

And the homepage, verbatim, to its new path:

```tsx
// app/(site)/page.tsx
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

Note the import path change in the moved layout: `./globals.css` becomes `../globals.css`, since `app/globals.css` itself doesn't move.

```bash
mkdir -p "app/(site)"
git mv app/layout.tsx "app/(site)/layout.tsx"
git mv app/page.tsx "app/(site)/page.tsx"
```

(then hand-edit the import path in the moved layout file per above, since `git mv` doesn't rewrite file contents).

- [ ] **Step 2: Verify the public site is unaffected by the move**

Run: `npx vitest run`
Expected: `Tests  19 passed (19)` — none of the existing tests import `app/page.tsx` or `app/layout.tsx` by path, so the move doesn't touch them.

Run: `npm run build`
Expected: build succeeds; `/` still prerenders from `app/(site)/page.tsx`. Then run `npm run dev` and manually compare `http://localhost:3000/` against the pre-move version (or the deployed reference) — the route-group rename must not change any rendered output, only file location.

- [ ] **Step 3: Write `lib/auth/session-cookie.ts`**

The shared cookie contract every piece below reads from a single place instead of re-declaring the name/options.

```ts
export const SESSION_COOKIE_NAME = "chateau_admin_session";

// 30 days, matching the session's own expiresAt from lib/db/sessions.ts.
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  };
}
```

- [ ] **Step 4: Write the failing test for the request-gating logic**

This installed Next.js version is `16.2.10`. As of Next.js 16, the `middleware` file convention is deprecated and renamed to `proxy` — `export function middleware` is deprecated in favor of `export function proxy`, the file is `proxy.ts` (not `middleware.ts`), and critically, **the `edge` runtime is no longer supported for `proxy` — its runtime is always `nodejs` and cannot be configured**. This actually resolves the "verify Node middleware support" concern from the original brief in this codebase's favor: there's no edge-runtime restriction to work around, `proxy.ts` can call `validateSession` (which uses `pg`) directly with no fallback needed.

`validateSession` itself is already covered by Task 7's real-Postgres tests — this test isolates `proxy`'s own branching (allow `/admin/login` unconditionally; redirect when there's no cookie; redirect when the session is invalid/expired; allow through when valid) by mocking `lib/db/sessions`, since what needs proving here is the redirect logic, not the DB query underneath it again.

```ts
// proxy.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/sessions", () => ({
  validateSession: vi.fn(),
}));

import { validateSession } from "@/lib/db/sessions";
import { proxy } from "./proxy";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

function makeRequest(pathname: string, cookieValue?: string) {
  const req = new NextRequest(`https://example.com${pathname}`);
  if (cookieValue) {
    req.cookies.set(SESSION_COOKIE_NAME, cookieValue);
  }
  return req;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.mocked(validateSession).mockReset();
  });

  it("allows /admin/login through without checking a session", async () => {
    const res = await proxy(makeRequest("/admin/login"));
    expect(res.headers.get("location")).toBeNull();
    expect(validateSession).not.toHaveBeenCalled();
  });

  it("redirects to /admin/login when there is no session cookie", async () => {
    const res = await proxy(makeRequest("/admin/content"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin/login");
  });

  it("redirects to /admin/login when the session is invalid or expired", async () => {
    vi.mocked(validateSession).mockResolvedValue(null);
    const res = await proxy(makeRequest("/admin/content", "some-token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin/login");
  });

  it("allows the request through when the session is valid", async () => {
    vi.mocked(validateSession).mockResolvedValue({ userId: "11111111-1111-1111-1111-111111111111" });
    const res = await proxy(makeRequest("/admin/content", "some-token"));
    expect(res.headers.get("location")).toBeNull();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run proxy.test.ts`
Expected: FAIL — `Cannot find module './proxy'`.

- [ ] **Step 6: Write `proxy.ts`**

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { validateSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = await validateSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run proxy.test.ts`
Expected: PASS, 4 tests.

If `NextRequest` from `next/server` errors under the `jsdom` test environment configured in `vitest.config.ts`, that's a real environment mismatch to resolve before moving on (e.g. this test file may need an `// @vitest-environment node` docblock at its top) — do not silently skip this test.

- [ ] **Step 8: Write the login flow**

Per this plan's testing strategy, Server Action wiring (cookies + redirect together, as a real request) is verified manually against a dev database rather than unit-tested — the pure logic underneath it (`verifyPassword`, `findUserByEmail`, `createSession`) is already covered by Tasks 4, 6, and 7.

```ts
// app/admin/login/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";

export async function login(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Vul e-mailadres en wachtwoord in.";
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const { token } = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/admin/content");
}
```

```tsx
// app/admin/login/login-form.tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1 text-sm">
        E-mailadres
        <input type="email" name="email" required autoComplete="username" className="border border-neutral-400 rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Wachtwoord
        <input type="password" name="password" required autoComplete="current-password" className="border border-neutral-400 rounded px-3 py-2" />
      </label>
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      <button type="submit" disabled={isPending} className="bg-neutral-900 text-white rounded px-4 py-2 disabled:opacity-50">
        {isPending ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );
}
```

```tsx
// app/admin/login/page.tsx
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Chateau Amsterdam — Admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}
```

`app/admin/login/page.tsx` is nested under `app/admin/layout.tsx` (Step 9), so it doesn't need its own `<html>`/`<body>`.

- [ ] **Step 9: Write the Tailwind entry, scoped to `/admin` only**

```css
/* app/admin/admin.css */
@import "tailwindcss";
```

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

`app/(site)/layout.tsx` imports `../globals.css` (a plain CSS file, not run through Tailwind) and never imports `app/admin/admin.css`, so this PostCSS/Tailwind pipeline only ever applies to files that import `admin.css` — i.e. `app/admin/layout.tsx` below. `next.config.js` needs no changes; Next's built-in PostCSS support picks up `postcss.config.mjs` automatically.

- [ ] **Step 10: Write the admin shell layout and logout action**

```tsx
// app/admin/layout.tsx
import "./admin.css";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/db/sessions";
import { findUserById } from "@/lib/db/users";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/admin/content", label: "Content" },
  { href: "/admin/wines", label: "Wijnen" },
  { href: "/admin/reservations", label: "Reserveringen" },
  { href: "/admin/availability", label: "Beschikbaarheid" },
  { href: "/admin/media", label: "Media" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await validateSession(token) : null;
  const user = session ? await findUserById(session.userId) : null;

  return (
    <html lang="nl">
      <body className="bg-neutral-50 text-neutral-900">
        <div className="min-h-screen flex">
          <nav className="w-56 border-r border-neutral-200 p-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-sm px-3 py-2 rounded hover:bg-neutral-200">
                {item.label}
              </a>
            ))}
            <form action={logout} className="mt-auto">
              <button type="submit" className="text-sm px-3 py-2 rounded hover:bg-neutral-200 w-full text-left">
                Uitloggen
              </button>
            </form>
          </nav>
          <div className="flex-1 flex flex-col">
            <header className="border-b border-neutral-200 px-6 py-3 text-sm text-neutral-500">
              {user ? `Ingelogd als ${user.email}` : null}
            </header>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
```

`AdminLayout` doesn't redirect on a missing/invalid session itself — that's `proxy.ts`'s job (Step 6), which runs before this layout renders for every `/admin/**` route except `/admin/login`. Duplicating the check here would just be redundant.

```ts
// app/admin/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
```

- [ ] **Step 11: Manually verify the full login/logout round trip against the dev database**

`app/admin/content/page.tsx` (the content editor itself) doesn't exist yet — it's built in a later task in this plan. Until then, a successful login's `redirect("/admin/content")` will 404, and that's expected at this point; this step verifies the auth mechanics, not the destination page.

Seed one throwaway user directly for this manual check (Task 9's real seed script lands after this task):

Run:
```bash
npx tsx -e "
import 'dotenv/config';
import { createUser } from './lib/db/users';
import { hashPassword } from './lib/auth/password';
(async () => {
  const hash = await hashPassword('temp-password-123');
  await createUser('manual-test@chateau.amsterdam', hash);
  console.log('seeded manual-test@chateau.amsterdam / temp-password-123');
})();
"
```

Then run: `npm run dev`, and in the browser:
1. Visit `/admin/content` while logged out. Expected: redirected to `/admin/login` (proxy's no-cookie branch).
2. Log in with `manual-test@chateau.amsterdam` / `temp-password-123`. Expected: redirected toward `/admin/content` (404 is fine per the note above); a `chateau_admin_session` cookie is now set (check DevTools → Application → Cookies: `httpOnly` ✓, `SameSite=Lax`, ~30-day expiry).
3. Visit `/admin/wines` (or any other `/admin/**` path). Expected: allowed through, no redirect (proxy's valid-session branch), admin nav/layout renders with "Ingelogd als manual-test@chateau.amsterdam".
4. Click "Uitloggen". Expected: redirected to `/admin/login`, cookie cleared.
5. Try to log in with the wrong password. Expected: the login form re-renders with "Onjuiste combinatie van e-mailadres en wachtwoord." and no full page reload (confirms `useActionState` wiring).

Then clean up the throwaway user: `docker compose exec -T postgres psql -U postgres -d chateau_dev -c "delete from users where email = 'manual-test@chateau.amsterdam';"`

- [ ] **Step 12: Commit**

```bash
git add "app/(site)" lib/auth/session-cookie.ts proxy.ts proxy.test.ts app/admin postcss.config.mjs
git commit -m "feat: gate /admin behind session auth (proxy, login, logout, admin shell)"
```

---

### Task 9: Seed module for the 4 team accounts (`scripts/seed/users.ts`)

The real client emails/passwords for the 4 team members aren't known yet, so this seeds 4 clearly-labeled placeholder accounts with a randomly generated password logged to the console on first run — whoever does the production rollout swaps these for the real accounts. This exports only `seedUsers()`; it is **not** runnable standalone (no `require.main` bootstrapping) — a later chunk's integration task wires this together with the other seed modules (content, reservations) into the single `scripts/seed.ts` entry point that `npm run db:seed` already points at (from Task 1).

Upserting on the `users.email` unique constraint makes this safe to re-run — re-running doesn't create duplicate accounts, it just rotates each placeholder's password (and re-logs the new one), which is real branching logic worth covering with a real-Postgres test.

**Files:**
- Create: `scripts/seed/users.ts`
- Test: `scripts/seed/users.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// scripts/seed/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { seedUsers } from "./users";

const PLACEHOLDER_EMAILS = [
  "team1@chateau.amsterdam",
  "team2@chateau.amsterdam",
  "team3@chateau.amsterdam",
  "team4@chateau.amsterdam",
];

async function cleanSeededUsers() {
  await db.delete(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
}

beforeEach(cleanSeededUsers);
afterEach(cleanSeededUsers);

describe("seedUsers", () => {
  it("creates all 4 placeholder accounts with valid bcrypt password hashes", async () => {
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(PLACEHOLDER_EMAILS).toContain(row.email);
      expect(row.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    }
  });

  it("is idempotent: running it twice still results in exactly 4 rows", async () => {
    await seedUsers();
    await seedUsers();

    const rows = await db.select().from(users).where(inArray(users.email, PLACEHOLDER_EMAILS));
    expect(rows).toHaveLength(4);
  });

  it("rotates the password hash on a second run rather than leaving it untouched", async () => {
    await seedUsers();
    const [before] = await db.select().from(users).where(inArray(users.email, ["team1@chateau.amsterdam"]));

    await seedUsers();
    const [after] = await db.select().from(users).where(inArray(users.email, ["team1@chateau.amsterdam"]));

    expect(after.passwordHash).not.toBe(before.passwordHash);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/seed/users.test.ts`
Expected: FAIL — `Cannot find module './users'`.

- [ ] **Step 3: Write `scripts/seed/users.ts`**

```ts
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

const PLACEHOLDER_EMAILS = [
  "team1@chateau.amsterdam",
  "team2@chateau.amsterdam",
  "team3@chateau.amsterdam",
  "team4@chateau.amsterdam",
] as const;

function generatePlaceholderPassword(): string {
  return randomBytes(9).toString("base64url");
}

export async function seedUsers(): Promise<void> {
  for (const email of PLACEHOLDER_EMAILS) {
    const plainPassword = generatePlaceholderPassword();
    const passwordHash = await hashPassword(plainPassword);

    await db
      .insert(users)
      .values({ email, passwordHash })
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash },
      });

    console.log(
      `[seed:users] ${email} -> temporary password: ${plainPassword} (replace with the real client account before go-live)`
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/seed/users.test.ts`
Expected: PASS, 3 tests. Console output will show 8 `[seed:users] ...` lines (4 per `seedUsers()` call across the 3 tests that each call it once or twice) — that's expected noise from the placeholder-password logging, not a failure.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/users.ts scripts/seed/users.test.ts
git commit -m "feat: add seedUsers module for the 4 placeholder team accounts"
```

---

### Task 10: `lib/db/content.ts` repository

Repository functions for the generic `content_blocks` table (`id, page, section, field_key, value_nl, value_en, updated_at, updated_by`), owned by the foundation chunk's Drizzle schema (`lib/db/schema.ts`) and client (`lib/db/client.ts`). Tested against the real local Postgres, not mocked — query correctness against the unique `(page, section, field_key)` constraint is exactly what needs proving here.

**Files:**
- Create: `lib/db/content.ts`
- Test: `lib/db/content.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/content.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks } from "@/lib/db/schema";
import { getBlocksForSection, upsertBlock, getAllSections } from "./content";

// A dedicated, obviously-fake page value keeps this suite's writes isolated
// from any real "home" rows a developer might already have seeded locally.
const TEST_PAGE = "__test_home__";

beforeEach(async () => {
  await db.delete(contentBlocks).where(eq(contentBlocks.page, TEST_PAGE));
});

afterEach(async () => {
  await db.delete(contentBlocks).where(eq(contentBlocks.page, TEST_PAGE));
});

describe("upsertBlock + getBlocksForSection", () => {
  it("inserts a new block when none exists yet", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Nederlandse tekst", "English text");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Nederlandse tekst", valueEn: "English text" }]);
  });

  it("updates the existing row instead of inserting a duplicate on a repeat call for the same field", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Eerste versie", "First version");
    await upsertBlock(TEST_PAGE, "hero", "heading", "Tweede versie", "Second version");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Tweede versie", valueEn: "Second version" }]);
  });

  it("only returns rows scoped to the given page and section", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Hero NL", "Hero EN");
    await upsertBlock(TEST_PAGE, "manifest", "heading", "Manifest NL", "Manifest EN");

    const rows = await getBlocksForSection(TEST_PAGE, "hero");

    expect(rows).toEqual([{ fieldKey: "heading", valueNl: "Hero NL", valueEn: "Hero EN" }]);
  });

  it("records updatedBy when provided", async () => {
    // content_blocks.updated_by is a UUID FK to users.id, not free text —
    // seed a real user and assert against its id rather than an email string.
    const editor = await createUser("content-editor@chateau.amsterdam", "hashed-password");
    await upsertBlock(TEST_PAGE, "hero", "heading", "NL", "EN", editor.id);

    const [row] = await db
      .select({ updatedBy: contentBlocks.updatedBy })
      .from(contentBlocks)
      .where(eq(contentBlocks.page, TEST_PAGE));

    expect(row.updatedBy).toBe(editor.id);
  });
});

describe("getAllSections", () => {
  it("returns the distinct sections that have at least one block for a page", async () => {
    await upsertBlock(TEST_PAGE, "hero", "heading", "Hero NL", "Hero EN");
    await upsertBlock(TEST_PAGE, "hero", "sub", "Hero sub NL", "Hero sub EN");
    await upsertBlock(TEST_PAGE, "manifest", "heading", "Manifest NL", "Manifest EN");

    const sections = await getAllSections(TEST_PAGE);

    expect(sections.sort()).toEqual(["hero", "manifest"]);
  });

  it("returns an empty array when the page has no blocks at all", async () => {
    const sections = await getAllSections(TEST_PAGE);
    expect(sections).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/content.test.ts`
Expected: FAIL — `Cannot find module './content'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/content.ts
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks } from "@/lib/db/schema";

export type ContentBlockRow = {
  fieldKey: string;
  valueNl: string;
  valueEn: string;
};

export async function getBlocksForSection(page: string, section: string): Promise<ContentBlockRow[]> {
  return db
    .select({
      fieldKey: contentBlocks.fieldKey,
      valueNl: contentBlocks.valueNl,
      valueEn: contentBlocks.valueEn,
    })
    .from(contentBlocks)
    .where(and(eq(contentBlocks.page, page), eq(contentBlocks.section, section)));
}

export async function upsertBlock(
  page: string,
  section: string,
  fieldKey: string,
  valueNl: string,
  valueEn: string,
  updatedBy?: string
): Promise<void> {
  await db
    .insert(contentBlocks)
    .values({ page, section, fieldKey, valueNl, valueEn, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [contentBlocks.page, contentBlocks.section, contentBlocks.fieldKey],
      set: { valueNl, valueEn, updatedBy, updatedAt: new Date() },
    });
}

export async function getAllSections(page: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ section: contentBlocks.section })
    .from(contentBlocks)
    .where(eq(contentBlocks.page, page));
  return rows.map((row) => row.section);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/content.test.ts`
Expected: PASS, 6 tests, against the real local Postgres (requires the docker-compose DB up and `DATABASE_URL` set in `.env.local`).

- [ ] **Step 5: Commit**

```bash
git add lib/db/content.ts lib/db/content.test.ts
git commit -m "feat: add content_blocks repository (getBlocksForSection, upsertBlock, getAllSections)"
```

---

### Task 11: `lib/content/get-content.ts` helper

The piece every public Server Component calls. Merges DB rows over a caller-supplied defaults object, falling back to the hardcoded default per-field when a row is missing — this fallback behavior is the thing to actually prove, so most of this task's tests inject a fake fetcher rather than touching Postgres, plus one integration test confirming the real wiring (`getBlocksForSection` as the default fetcher) behaves the same way against the real local Postgres.

`getContent` is generic over the shape of `defaults` (`<T extends Record<string, ContentPair>>`), so its return type is exactly `T` — this is what lets every call site in Tasks 14–17 pass a typed `*_DEFAULTS` constant from `lib/content/defaults.ts` (Task 12) and get back a fully-typed content object with no casting.

**Files:**
- Create: `lib/content/get-content.ts`
- Test: `lib/content/get-content.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/get-content.test.ts
import { describe, it, expect, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contentBlocks } from "@/lib/db/schema";
import { upsertBlock } from "@/lib/db/content";
import { getContent } from "./get-content";

describe("getContent (fake repository — pure merge/fallback logic)", () => {
  it("uses the DB value when a row exists for a field", async () => {
    const fakeFetch = async () => [{ fieldKey: "heading", valueNl: "Van de DB", valueEn: "From the DB" }];

    const result = await getContent(
      "home",
      "test-section",
      { heading: { nl: "Default NL", en: "Default EN" } },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Van de DB", en: "From the DB" });
  });

  it("falls back to the hardcoded default when no DB row exists for a field", async () => {
    const fakeFetch = async () => [];

    const result = await getContent(
      "home",
      "test-section",
      { heading: { nl: "Default NL", en: "Default EN" } },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Default NL", en: "Default EN" });
  });

  it("falls back per-field when only some fields have DB rows (partial override, never blank)", async () => {
    const fakeFetch = async () => [{ fieldKey: "heading", valueNl: "Van de DB", valueEn: "From the DB" }];

    const result = await getContent(
      "home",
      "test-section",
      {
        heading: { nl: "Default heading NL", en: "Default heading EN" },
        sub: { nl: "Default sub NL", en: "Default sub EN" },
      },
      fakeFetch
    );

    expect(result.heading).toEqual({ nl: "Van de DB", en: "From the DB" });
    expect(result.sub).toEqual({ nl: "Default sub NL", en: "Default sub EN" });
  });
});

describe("getContent (real repository, real local Postgres)", () => {
  const TEST_PAGE = "__test_home__";

  afterEach(async () => {
    await db.delete(contentBlocks).where(eq(contentBlocks.page, TEST_PAGE));
  });

  it("merges a seeded DB row with an untouched default via the real getBlocksForSection wiring", async () => {
    await upsertBlock(TEST_PAGE, "get-content-integration", "heading", "Echte NL", "Real EN");

    // No fetchBlocks arg here — this exercises the real default (getBlocksForSection).
    const result = await getContent(TEST_PAGE, "get-content-integration", {
      heading: { nl: "Default heading NL", en: "Default heading EN" },
      sub: { nl: "Default sub NL", en: "Default sub EN" },
    });

    expect(result.heading).toEqual({ nl: "Echte NL", en: "Real EN" });
    expect(result.sub).toEqual({ nl: "Default sub NL", en: "Default sub EN" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/content/get-content.test.ts`
Expected: FAIL — `Cannot find module './get-content'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/content/get-content.ts
import { getBlocksForSection } from "@/lib/db/content";

export type ContentPair = { nl: string; en: string };

type FetchBlocks = (
  page: string,
  section: string
) => Promise<Array<{ fieldKey: string; valueNl: string; valueEn: string }>>;

/**
 * Fetches this section's content_blocks rows and merges them over `defaults`,
 * keyed by field_key. Any field_key present in `defaults` but missing from
 * the DB falls back to its hardcoded default rather than rendering blank —
 * that fallback is the behavior this module exists to guarantee.
 *
 * `fetchBlocks` defaults to the real repository (`getBlocksForSection`) so
 * every real call site just does `getContent(page, section, SOME_DEFAULTS)`;
 * the parameter exists so tests can inject a fake without touching Postgres.
 */
export async function getContent<T extends Record<string, ContentPair>>(
  page: string,
  section: string,
  defaults: T,
  fetchBlocks: FetchBlocks = getBlocksForSection
): Promise<T> {
  const rows = await fetchBlocks(page, section);
  const overrides = new Map(rows.map((row) => [row.fieldKey, { nl: row.valueNl, en: row.valueEn }]));

  const merged = {} as T;
  for (const fieldKey of Object.keys(defaults) as Array<keyof T>) {
    const override = overrides.get(fieldKey as string);
    merged[fieldKey] = (override as T[keyof T] | undefined) ?? defaults[fieldKey];
  }
  return merged;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/content/get-content.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/content/get-content.ts lib/content/get-content.test.ts
git commit -m "feat: add getContent helper with default-fallback merge"
```

---

### Task 12: Content defaults + seed script

**Content field-key convention** (applies to this task and Tasks 14–17 — decided here since this is where it's first codified in code):

1. Every existing `t(nl, en)` call in a component becomes exactly one `content_blocks` row: `field_key` is a short semantic name, `value_nl`/`value_en` are the two strings that were passed to `t()` today, captured verbatim.
2. Bilingual JSX blocks written as `lang === "nl" ? (...) : (...)` with an embedded inline element (`<em>`, `<strong>`) are split at that element's boundary into two or three field keys — `..._lead` / `..._em`, or `..._lead` / `..._strong` / `..._tail` — so the wrapping markup (`<em>`, `<strong>`) stays in the component (never becomes DB-driven HTML), while every word of copy on both sides of it stays independently editable. Example: Hero's intro paragraph (`intro_lead` + `intro_em`), Manifest's body (`body_lead` + `body_strong` + `body_tail`), Process's heading (`heading_lead` + `heading_em`), Paths'/WinesPreview's second heading line (`heading_line2_em`, or `heading_line2_lead` + `heading_line2_em` for WinesPreview where both halves are real bilingual text).
3. Fixed-length arrays of repeating bilingual items — Hero's `MARQUEE_ITEMS`, Manifest's `STATS`, Process's `STEPS`, Paths' `PATHS` — get one field-key pair per item per sub-field, 1-indexed: `{array}_{n}_{subfield}`, e.g. `step_2_title`, `step_2_body`, `stat_3_value`, `stat_3_desc`, `path_1_title`, `marquee_4`. The `Counter`'s numeric `target` (e.g. `91`, `200000`) is content a business plausibly wants to update (bottles/year, Decanter score, etc.), so it's stored too, as its string form in both `value_nl`/`value_en` (identical — a count isn't language-dependent) under `stat_N_value`, and parsed back with `Number(...)` in the component.
4. Non-copy, non-bilingual values that were already local constants and never flowed through `t()` or a `lang === ... ? ... : ...` conditional stay local component constants, out of `content_blocks` scope for this phase: image `src`/`alt`, `href`s/`id`s, decorative glyphs (✶, →, &amp;), the `PATHS[n].word` CSS-driving discriminator ("Taste"/"Pour"/"Drink" — intentionally identical in both languages), `Counter`'s `format`/`suffix` and every `useReveal` stagger `delay`, and the handful of literal strings that were never wrapped in `t()` to begin with: Process's "Het proces" section label, Place's "Route" sub-heading and its street-address paragraph, Footer's "Chateau Amsterdam"/"Contact" headings and the "Proost" cheers block. Converting these would be scope creep beyond "port hardcoded text to props" — they're structural/decorative, not editorial copy the client asked to control.
5. Section slugs (`section` column, page is always `"home"` in this phase) map 1:1 to the spec's own list: `header`, `hero`, `marquee`, `manifest`, `process`, `paths`, `wines`, `place`, `footer`.

**Files:**
- Create: `lib/content/defaults.ts`
- Create: `scripts/seed/content.ts`

- [ ] **Step 1: Write `lib/content/defaults.ts`**

```ts
// lib/content/defaults.ts
import type { ContentPair } from "@/lib/content/get-content";

export type { ContentPair };

export type HeaderContent = {
  nav_1_label: ContentPair;
  nav_2_label: ContentPair;
  nav_3_label: ContentPair;
  nav_4_label: ContentPair;
  nav_5_label: ContentPair;
  cta_label: ContentPair;
};

export const HEADER_DEFAULTS: HeaderContent = {
  nav_1_label: { nl: "Het verhaal", en: "Our story" },
  nav_2_label: { nl: "Het proces", en: "The process" },
  nav_3_label: { nl: "Wijnen", en: "Wines" },
  nav_4_label: { nl: "Voor bedrijven", en: "For businesses" },
  nav_5_label: { nl: "Bezoek", en: "Visit" },
  cta_label: { nl: "Boek een tasting", en: "Book a tasting" },
};

export type HeroContent = {
  eyebrow_3: ContentPair;
  script_tagline: ContentPair;
  intro_lead: ContentPair;
  intro_em: ContentPair;
  cta_primary: ContentPair;
  cta_secondary: ContentPair;
  media_caption: ContentPair;
};

export const HERO_DEFAULTS: HeroContent = {
  eyebrow_3: { nl: "Wijn uit de stad, voor de stad", en: "Wine from the city, for the city" },
  script_tagline: { nl: "de urban winery", en: "the urban winery" },
  intro_lead: {
    nl: "Druiven uit heel Europa, gekoeld naar een machinefabriek aan het IJ gebracht. Daar maken wij wijn: ",
    en: "Grapes from all over Europe, transported chilled to a machine factory on the IJ. That's where we make wine: ",
  },
  intro_em: { nl: "geen wijngaard, wel wijn.", en: "no vineyard, still wine." },
  cta_primary: { nl: "Boek een tasting", en: "Book a tasting" },
  cta_secondary: { nl: "Voor bedrijven", en: "For businesses" },
  media_caption: {
    nl: "↳ De makerij, Johan van Hasseltweg, Noord",
    en: "↳ The winery, Johan van Hasseltweg, Amsterdam-Noord",
  },
};

export type MarqueeContent = {
  marquee_1: ContentPair;
  marquee_2: ContentPair;
  marquee_3: ContentPair;
  marquee_4: ContentPair;
  marquee_5: ContentPair;
};

export const MARQUEE_DEFAULTS: MarqueeContent = {
  marquee_1: { nl: "Eerste urban winery van Nederland", en: "First urban winery in the Netherlands" },
  marquee_2: { nl: "De grootste van Europa", en: "The largest in Europe" },
  // Single-string item in the legacy array — identical in both languages today;
  // stored as a real bilingual pair so it becomes independently editable later.
  marquee_3: { nl: "Druiven uit FR · DE · IT · ES · NL", en: "Druiven uit FR · DE · IT · ES · NL" },
  marquee_4: { nl: "Tastings tussen de tanks", en: "Tastings among the tanks" },
  marquee_5: { nl: "Zero waste sinds dag één", en: "Zero waste since day one" },
};

export type ManifestContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2: ContentPair;
  body_lead: ContentPair;
  body_strong: ContentPair;
  body_tail: ContentPair;
  stat_1_value: ContentPair;
  stat_1_desc: ContentPair;
  stat_2_value: ContentPair;
  stat_2_desc: ContentPair;
  stat_3_value: ContentPair;
  stat_3_desc: ContentPair;
  stat_4_value: ContentPair;
  stat_4_desc: ContentPair;
};

export const MANIFEST_DEFAULTS: ManifestContent = {
  label: { nl: "Het verhaal", en: "Our story" },
  heading_line1: { nl: "Geen wijngaard.", en: "No vineyard." },
  heading_line2: { nl: "Wel wijn.", en: "Still wine." },
  body_lead: {
    nl: "Sinds 2017 reizen druiven van families en boeren uit heel Europa gekoeld naar Amsterdam-Noord. In een oude machinefabriek aan het IJ, tussen ",
    en: "Since 2017, grapes from families and farmers all over Europe travel chilled to Amsterdam-Noord. In an old machine factory on the IJ, between ",
  },
  body_strong: {
    nl: "stalen tanks, betonnen eieren, amforen en eikenhouten vaten",
    en: "steel tanks, concrete eggs, amphorae, and oak barrels",
  },
  body_tail: {
    nl: ", worden ze wijn. Omdat we de stad als wijngaard hebben, zijn we vrijer dan elke klassieke producent. Riesling die Moscatel ontmoet? Hier kan het.",
    en: ", they become wine. Because we have the city as our vineyard, we are freer than any classic producer. Riesling meeting Moscatel? Here it's possible.",
  },
  stat_1_value: { nl: "91", en: "91" },
  stat_1_desc: { nl: "Decanter-punten voor wijn uit Noord", en: "Decanter points for wine from North" },
  stat_2_value: { nl: "1500", en: "1500" },
  stat_2_desc: { nl: "Machinefabriek aan het IJ", en: "Machine factory on the IJ" },
  stat_3_value: { nl: "5", en: "5" },
  stat_3_desc: { nl: "Landen waar onze druiven groeien", en: "Countries where our grapes grow" },
  stat_4_value: { nl: "200000", en: "200000" },
  stat_4_desc: { nl: "Flessen per jaar, gemaakt in Noord", en: "Bottles per year, made in North" },
};

export type ProcessContent = {
  heading_lead: ContentPair;
  heading_em: ContentPair;
  sub_text: ContentPair;
  step_1_title: ContentPair;
  step_1_body: ContentPair;
  step_2_title: ContentPair;
  step_2_body: ContentPair;
  step_3_title: ContentPair;
  step_3_body: ContentPair;
  step_4_title: ContentPair;
  step_4_body: ContentPair;
};

export const PROCESS_DEFAULTS: ProcessContent = {
  heading_lead: { nl: "Van boer tot fles, ", en: "From farmer to bottle, " },
  heading_em: { nl: "dwars door de stad.", en: "straight through the city." },
  sub_text: {
    nl: "Wij verplaatsen de druif, niet de wijn. Daardoor zie je hier van dichtbij hoe wijn écht gemaakt wordt.",
    en: "We move the grape, not the wine. This lets you experience close-up how wine is truly made.",
  },
  step_1_title: { nl: "De druif", en: "The grape" },
  step_1_body: {
    nl: "Geselecteerde boeren en families in Frankrijk, Duitsland, Italië, Spanje en Nederland. Biologisch geteeld, op het juiste moment met de hand geplukt.",
    en: "Selected farmers and families in France, Germany, Italy, Spain, and the Netherlands. Organically grown, hand-picked at the perfect moment.",
  },
  step_2_title: { nl: "De reis", en: "The journey" },
  step_2_body: {
    nl: "Gekoeld transport naar Noord. Onderweg weken de schillen al. De eerste meters van de wijn worden op de snelweg gemaakt.",
    en: "Chilled transport to North. The skins are already macerating along the way. The wine's first meters are made on the highway.",
  },
  step_3_title: { nl: "De makerij", en: "The winery" },
  step_3_body: {
    nl: "Staal, beton, amfora of eik: er is weinig dat hier niet kan. Ons eigen lab waakt over elke liter, van most tot botteling.",
    en: "Steel, concrete, amphora, or oak: there is little that isn't possible here. Our own lab watches over every liter, from must to bottling.",
  },
  step_4_title: { nl: "De fles", en: "The bottle" },
  step_4_body: {
    nl: "Gebotteld aan het IJ. En zero waste: schillen en pitten worden bier, grappa en onze eigen Piquette d'Amsterdam.",
    en: "Bottled on the IJ. And zero waste: skins and seeds become beer, grappa, and our own Piquette d'Amsterdam.",
  },
};

export type PathsContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2_em: ContentPair;
  intro_body: ContentPair;
  path_1_title: ContentPair;
  path_1_body: ContentPair;
  path_2_title: ContentPair;
  path_2_body: ContentPair;
  path_3_title: ContentPair;
  path_3_body: ContentPair;
};

export const PATHS_DEFAULTS: PathsContent = {
  label: { nl: "Kies je glas", en: "Choose your glass" },
  heading_line1: { nl: "Voor proevers, schenkers", en: "For tasters, pourers" },
  heading_line2_em: { nl: "thuisdrinkers.", en: "home drinkers." },
  intro_body: {
    nl: "Toerist, inkoper of liefhebber: iedereen drinkt hier dezelfde wijn. Alleen de weg ernaartoe verschilt.",
    en: "Tourist, buyer, or wine lover: everyone here drinks the same wine. Only the path there differs.",
  },
  path_1_title: { nl: "Tours & tastings", en: "Tours & tastings" },
  path_1_body: {
    nl: "Proef 7 wijnen tussen de tanks, met verhaal en bites. Voor bezoekers van de stad, vriendengroepen en iedereen die wil weten hoe stadswijn smaakt.",
    en: "Taste 7 wines between the tanks, complete with stories and bites. For city visitors, groups of friends, and anyone who wants to know how urban wine tastes.",
  },
  path_2_title: { nl: "Voor bedrijven & horeca", en: "For businesses & hospitality" },
  path_2_body: {
    nl: "Grote afname, private label, relatiegeschenken en events in de winery. Eén aanspreekpunt, scherpe staffels, geproduceerd op 10 minuten van CS.",
    en: "Bulk orders, private label, corporate gifts, and events in the winery. A single point of contact, volume discounts, produced 10 minutes from Central Station.",
  },
  path_3_title: { nl: "De webshop", en: "The webshop" },
  path_3_body: {
    nl: "De volledige collectie, thuisbezorgd. Van klassieke monocépages tot blends die alleen in Noord kunnen bestaan.",
    en: "The complete collection, delivered to your door. From classic single-varietals to blends that could only exist in North.",
  },
};

export type WinesContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2_lead: ContentPair;
  heading_line2_em: ContentPair;
  cta_label: ContentPair;
};

export const WINES_DEFAULTS: WinesContent = {
  label: { nl: "De collectie", en: "The collection" },
  heading_line1: { nl: "Van klassiek", en: "From classic" },
  heading_line2_lead: { nl: "tot ", en: "to " },
  heading_line2_em: { nl: "eigenwijs.", en: "rebellious." },
  cta_label: { nl: "Shop alle wijnen", en: "Shop all wines" },
};

export type PlaceContent = {
  label: ContentPair;
  heading_line1: ContentPair;
  heading_line2: ContentPair;
  address_heading: ContentPair;
  hours_heading: ContentPair;
  hours_line1: ContentPair;
  hours_line2: ContentPair;
  route_line1: ContentPair;
  route_line2: ContentPair;
  cta_label: ContentPair;
};

export const PLACE_DEFAULTS: PlaceContent = {
  label: { nl: "De plek", en: "The venue" },
  heading_line1: { nl: "Een machinefabriek", en: "A machine factory" },
  heading_line2: { nl: "aan het IJ.", en: "on the IJ." },
  address_heading: { nl: "Adres", en: "Address" },
  hours_heading: { nl: "Open", en: "Hours" },
  hours_line1: { nl: "Wo t/m zo", en: "Wed thru Sun" },
  hours_line2: { nl: "12.00 tot 18.30", en: "12:00 to 18:30" },
  route_line1: { nl: "Pont vanaf CS, 10 min fietsen", en: "Ferry from Central Station, 10 min bike" },
  route_line2: { nl: "of metro 52 → Noorderpark", en: "or metro 52 → Noorderpark" },
  cta_label: { nl: "Plan je bezoek", en: "Plan your visit" },
};

export type FooterContent = {
  footer_note: ContentPair;
  discover_heading: ContentPair;
  discover_link_1: ContentPair;
  discover_link_2: ContentPair;
  discover_link_3: ContentPair;
  do_heading: ContentPair;
  do_link_2: ContentPair;
};

export const FOOTER_DEFAULTS: FooterContent = {
  footer_note: {
    nl: "Urban winery aan het IJ. Druiven uit heel Europa, wijn uit Noord, sinds 2017.",
    en: "Urban winery on the IJ. Grapes from all over Europe, wine from Amsterdam-Noord, since 2017.",
  },
  discover_heading: { nl: "Ontdek", en: "Discover" },
  discover_link_1: { nl: "Het verhaal", en: "Our story" },
  discover_link_2: { nl: "Het proces", en: "The process" },
  discover_link_3: { nl: "De collectie", en: "The collection" },
  do_heading: { nl: "Doen", en: "Do" },
  do_link_2: { nl: "Voor bedrijven", en: "For businesses" },
};
```

- [ ] **Step 2: Write `scripts/seed/content.ts`**

```ts
// scripts/seed/content.ts
import { upsertBlock } from "@/lib/db/content";
import {
  HEADER_DEFAULTS,
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  WINES_DEFAULTS,
  PLACE_DEFAULTS,
  FOOTER_DEFAULTS,
  type ContentPair,
} from "@/lib/content/defaults";

const PAGE = "home";

const SECTIONS: Array<{ section: string; defaults: Record<string, ContentPair> }> = [
  { section: "header", defaults: HEADER_DEFAULTS },
  { section: "hero", defaults: HERO_DEFAULTS },
  { section: "marquee", defaults: MARQUEE_DEFAULTS },
  { section: "manifest", defaults: MANIFEST_DEFAULTS },
  { section: "process", defaults: PROCESS_DEFAULTS },
  { section: "paths", defaults: PATHS_DEFAULTS },
  { section: "wines", defaults: WINES_DEFAULTS },
  { section: "place", defaults: PLACE_DEFAULTS },
  { section: "footer", defaults: FOOTER_DEFAULTS },
];

/**
 * Populates content_blocks with today's real homepage copy, sourced from the
 * same lib/content/defaults.ts constants the components fall back to — so
 * the seed and the fallback can never silently drift apart. Not a standalone
 * runnable script: exported for the final cross-module seed-wiring task
 * (owned elsewhere) to call alongside the user/reservation seed modules.
 * Safe to re-run — every write goes through upsertBlock's
 * onConflictDoUpdate, so re-seeding just re-asserts today's defaults.
 */
export async function seedContent(): Promise<void> {
  for (const { section, defaults } of SECTIONS) {
    for (const [fieldKey, value] of Object.entries(defaults)) {
      await upsertBlock(PAGE, section, fieldKey, value.nl, value.en);
    }
  }
}
```

- [ ] **Step 3: Run and verify against the real local Postgres**

Run: `npx tsx --env-file=.env.local -e "import('./scripts/seed/content.ts').then((m) => m.seedContent()).then(() => process.exit(0))"`
Expected: exits `0` with no errors.

Run: `psql "$DATABASE_URL" -c "select section, count(*) from content_blocks where page = 'home' group by section order by section;"`
Expected: 9 rows —
```
 section  | count
----------+-------
 footer   |     7
 header   |     6
 hero     |     7
 manifest |    14
 marquee  |     5
 paths    |    10
 place    |    10
 process  |    11
 wines    |     5
```

Run the seed a second time and re-run the same `psql` count query.
Expected: identical counts (confirms `upsertBlock`'s `onConflictDoUpdate` updates in place rather than duplicating rows on a re-seed).

- [ ] **Step 4: Commit**

```bash
git add lib/content/defaults.ts scripts/seed/content.ts
git commit -m "feat: add content defaults and seed script for today's homepage copy"
```

---

### Task 13: Admin content editor UI (`/admin/content`)

Pure UI wiring on top of Task 10's already-tested repository — no new branching logic beyond grouping submitted form fields by suffix, so this ends with manual browser verification against the dev database rather than a forced unit test, matching the spec's own testing section ("Full Server Action wiring ... is verified manually in the browser against a dev database").

**Files:**
- Create: `app/admin/content/page.tsx`
- Create: `app/admin/content/[section]/page.tsx`
- Create: `app/admin/content/[section]/content-form.tsx`
- Create: `app/admin/content/[section]/actions.ts`

- [ ] **Step 1: Write `app/admin/content/page.tsx`**

```tsx
// app/admin/content/page.tsx
import Link from "next/link";
import { getAllSections } from "@/lib/db/content";

export default async function ContentPage() {
  const sections = await getAllSections("home");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Content</h1>
      <p className="mt-1 text-sm text-gray-500">
        Kies een sectie van de homepage om de NL/EN tekst te bewerken.
      </p>
      <ul className="mt-6 divide-y divide-gray-200 rounded border border-gray-200">
        {sections.map((section) => (
          <li key={section}>
            <Link
              href={`/admin/content/${section}`}
              className="block px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 hover:underline"
            >
              {section}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/admin/content/[section]/actions.ts`**

```ts
// app/admin/content/[section]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { upsertBlock } from "@/lib/db/content";

/**
 * Form fields are named `${fieldKey}__nl` / `${fieldKey}__en` by
 * content-form.tsx — grouping by that suffix here recovers the set of
 * field_keys submitted without the page needing a separate hidden field
 * enumerating them.
 */
export async function saveSection(section: string, formData: FormData): Promise<void> {
  const fieldKeys = new Set<string>();
  for (const key of formData.keys()) {
    if (key.endsWith("__nl") || key.endsWith("__en")) {
      fieldKeys.add(key.slice(0, key.lastIndexOf("__")));
    }
  }

  for (const fieldKey of fieldKeys) {
    const valueNl = String(formData.get(`${fieldKey}__nl`) ?? "");
    const valueEn = String(formData.get(`${fieldKey}__en`) ?? "");
    await upsertBlock("home", section, fieldKey, valueNl, valueEn);
  }

  // Makes the edit immediately live on the public homepage, per the CMS's
  // no-caching-layer design.
  revalidatePath("/");
}
```

- [ ] **Step 3: Write `app/admin/content/[section]/content-form.tsx`**

```tsx
// app/admin/content/[section]/content-form.tsx
"use client";

import { useActionState } from "react";
import { saveSection } from "./actions";

type Block = { fieldKey: string; valueNl: string; valueEn: string };

async function submitSection(section: string, _prevState: string | null, formData: FormData): Promise<string> {
  await saveSection(section, formData);
  return "Opgeslagen";
}

export function ContentForm({ section, blocks }: { section: string; blocks: Block[] }) {
  const [status, formAction, isPending] = useActionState(submitSection.bind(null, section), null);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {blocks.map((block) => (
        <div key={block.fieldKey} className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700">{block.fieldKey}</label>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">NL</span>
              <textarea
                name={`${block.fieldKey}__nl`}
                defaultValue={block.valueNl}
                rows={2}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">EN</span>
              <textarea
                name={`${block.fieldKey}__en`}
                defaultValue={block.valueEn}
                rows={2}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Bezig met opslaan…" : "Opslaan"}
      </button>
      {status ? <p className="text-sm text-green-600">{status}</p> : null}
    </form>
  );
}
```

- [ ] **Step 4: Write `app/admin/content/[section]/page.tsx`**

```tsx
// app/admin/content/[section]/page.tsx
import { getBlocksForSection } from "@/lib/db/content";
import { ContentForm } from "./content-form";

export default async function ContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const blocks = await getBlocksForSection("home", section);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Content: {section}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Wijzigingen zijn direct live op de homepage zodra je op Opslaan klikt.
      </p>
      <ContentForm section={section} blocks={blocks} />
    </div>
  );
}
```

- [ ] **Step 5: Manual verification against the dev database**

Run: `npm run dev`

- Log in at `/admin/login` with a seeded account, then visit `/admin/content`.
- Confirm all 9 sections from Task 12's seed (`header, hero, marquee, manifest, process, paths, wines, place, footer`) are listed.
- Open `/admin/content/hero`, confirm every field_key seeded in Task 12 (`eyebrow_3`, `script_tagline`, `intro_lead`, `intro_em`, `cta_primary`, `cta_secondary`, `media_caption`) renders with its NL/EN textareas pre-filled with the seeded copy.
- Change `cta_primary`'s NL value to a throwaway string (e.g. `"TEST-CTA"`), click Opslaan, confirm the "Opgeslagen" confirmation appears.
- Open a second browser tab at `/` (the public homepage) and confirm the hero's primary CTA now reads `"TEST-CTA"` without restarting the dev server (proves `revalidatePath("/")` works).
- Revert the value back to `"Boek een tasting"` and re-save.

Expected: every step above behaves as described; no console errors.

- [ ] **Step 6: Commit**

```bash
git add app/admin/content
git commit -m "feat: add admin content editor UI (list, per-section form, save action)"
```

---

### Task 14: Wire SiteHeader + Hero (+ marquee)

**Files:**
- Modify: `app/(site)/layout.tsx`
- Modify: `components/site-header.tsx`
- Modify: `components/hero.tsx`
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Modify `components/site-header.tsx`**

```tsx
// components/site-header.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useMagnetic } from "@/lib/use-magnetic";
import type { HeaderContent } from "@/lib/content/defaults";

const NAV_LINKS: Array<{ href: string; fieldKey: keyof HeaderContent }> = [
  { href: "#verhaal", fieldKey: "nav_1_label" },
  { href: "#proces", fieldKey: "nav_2_label" },
  { href: "#wijnen", fieldKey: "nav_3_label" },
  { href: "#bedrijven", fieldKey: "nav_4_label" },
  { href: "#bezoek", fieldKey: "nav_5_label" },
];

export function SiteHeader({ content }: { content: HeaderContent }) {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const magneticRef = useMagnetic();

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
            {t(content[link.fieldKey].nl, content[link.fieldKey].en)}
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

        <a className="nav-cta" ref={magneticRef as React.RefObject<HTMLAnchorElement>} href="#paden">
          {t(content.cta_label.nl, content.cta_label.en)}
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Modify `components/hero.tsx`**

```tsx
// components/hero.tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";
import { useMagnetic } from "@/lib/use-magnetic";
import type { HeroContent, MarqueeContent } from "@/lib/content/defaults";

const MARQUEE_KEYS: Array<keyof MarqueeContent> = [
  "marquee_1",
  "marquee_2",
  "marquee_3",
  "marquee_4",
  "marquee_5",
];

function MarqueeTrack({ lang, marquee }: { lang: "nl" | "en"; marquee: MarqueeContent }) {
  return (
    <>
      {MARQUEE_KEYS.map((key) => (
        <span key={key}>{lang === "nl" ? marquee[key].nl : marquee[key].en}</span>
      ))}
    </>
  );
}

export function Hero({ content, marquee }: { content: HeroContent; marquee: MarqueeContent }) {
  const { lang, t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const parallaxRef = useParallax(0.08);
  const introReveal = useReveal(0.55);
  const ctaReveal = useReveal(0.7);
  const mediaReveal = useReveal(0.45);
  const primaryCtaMagnetic = useMagnetic();
  const secondaryCtaMagnetic = useMagnetic();

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
          <span>{t(content.eyebrow_3.nl, content.eyebrow_3.en)}</span>
        </span>
      </div>

      <h1 className="hero-title">
        <span className="row rv-line in">
          <span>Chateau</span>
        </span>
        <span className="row rv-line in">
          <span>Amsterdam</span>
        </span>
        <span className="hero-script">{t(content.script_tagline.nl, content.script_tagline.en)}</span>
      </h1>

      <div className="hero-deck">
        <div className="hero-intro">
          <p ref={introReveal.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introReveal.isVisible ? " in" : ""}`}>
            {lang === "nl" ? content.intro_lead.nl : content.intro_lead.en}
            <em>{lang === "nl" ? content.intro_em.nl : content.intro_em.en}</em>
          </p>
          <div ref={ctaReveal.ref as React.RefObject<HTMLDivElement>} className={`hero-ctas rv${ctaReveal.isVisible ? " in" : ""}`}>
            <a className="btn btn--primary" ref={primaryCtaMagnetic as React.RefObject<HTMLAnchorElement>} href="#paden">
              {t(content.cta_primary.nl, content.cta_primary.en)} <span className="arr">→</span>
            </a>
            <a className="btn" ref={secondaryCtaMagnetic as React.RefObject<HTMLAnchorElement>} href="#bedrijven">
              {t(content.cta_secondary.nl, content.cta_secondary.en)} <span className="arr">→</span>
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
          <figcaption>{t(content.media_caption.nl, content.media_caption.en)}</figcaption>
        </figure>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <MarqueeTrack lang={lang} marquee={marquee} />
          <MarqueeTrack lang={lang} marquee={marquee} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Modify `app/(site)/layout.tsx`**

```tsx
// app/(site)/layout.tsx
import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getContent } from "@/lib/content/get-content";
import { HEADER_DEFAULTS } from "@/lib/content/defaults";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chateau.amsterdam"),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerContent = await getContent("home", "header", HEADER_DEFAULTS);

  return (
    <html lang="nl" className={`${archivo.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body data-pattern="arcering" style={{ "--pattern-o": 0.04 } as React.CSSProperties}>
        <LanguageProvider>
          <div className="grain" />
          <div className="bg-pattern" />
          <SiteHeader content={headerContent} />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
```

(`<SiteFooter />` is still called with no props here — Task 16 adds its content prop; leaving it unwired for now would only be a type error once Task 16's `SiteFooter` signature change lands, and this task doesn't touch `site-footer.tsx`.)

- [ ] **Step 4: Modify `app/(site)/page.tsx`**

```tsx
// app/(site)/page.tsx
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import { HERO_DEFAULTS, MARQUEE_DEFAULTS } from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest />
      <Process />
      <Paths />
      <WinesPreview />
      <Place />
    </>
  );
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual visual verification**

Run: `npm run dev`. Compare `http://localhost:3000` against `https://chateau-amsterdam-homepage-production.up.railway.app/`:
- Header nav labels, language toggle, scroll-shrink behavior, and the "Boek een tasting" CTA all match, in both NL and EN.
- Hero: eyebrow line 3, script tagline, intro paragraph (with its emphasized closing clause), both CTAs, and the media caption all match, in both NL and EN.
- Marquee: all 5 items scroll correctly and match text, in both NL and EN.

Expected: no visual or text regression versus the live reference.

- [ ] **Step 7: Commit**

```bash
git add app/(site)/layout.tsx app/(site)/page.tsx components/site-header.tsx components/hero.tsx
git commit -m "feat: wire SiteHeader and Hero (incl. marquee) to CMS content"
```

---

### Task 15: Wire Manifest + Process

**Files:**
- Modify: `components/manifest.tsx`
- Modify: `components/process.tsx`
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Modify `components/manifest.tsx`**

```tsx
// components/manifest.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { Counter } from "./counter";
import type { ManifestContent } from "@/lib/content/defaults";

const STAT_META: Array<{
  valueKey: keyof ManifestContent;
  descKey: keyof ManifestContent;
  format?: "dots";
  suffix?: string;
  delay: number;
}> = [
  { valueKey: "stat_1_value", descKey: "stat_1_desc", delay: 0 },
  { valueKey: "stat_2_value", descKey: "stat_2_desc", format: "dots", suffix: " m²", delay: 0.1 },
  { valueKey: "stat_3_value", descKey: "stat_3_desc", delay: 0.2 },
  { valueKey: "stat_4_value", descKey: "stat_4_desc", format: "dots", suffix: "+", delay: 0.3 },
];

function Stat({
  meta,
  content,
  lang,
}: {
  meta: (typeof STAT_META)[number];
  content: ManifestContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal(meta.delay);
  const target = Number(content[meta.valueKey].nl);
  const desc = lang === "nl" ? content[meta.descKey].nl : content[meta.descKey].en;

  return (
    <div ref={reveal.ref as React.RefObject<HTMLDivElement>} className={`stat rv${reveal.isVisible ? " in" : ""}`}>
      <div className="num">
        <Counter target={target} format={meta.format} />
        {meta.suffix ? <sub>{meta.suffix}</sub> : null}
      </div>
      <div className="desc">{desc}</div>
    </div>
  );
}

export function Manifest({ content }: { content: ManifestContent }) {
  const { lang, t } = useLanguage();
  const label = useReveal();
  const title1 = useReveal();
  const title2 = useReveal(0.15);
  const body = useReveal();

  return (
    <section className="manifest on-dark" id="verhaal">
      <div ref={label.ref as React.RefObject<HTMLDivElement>} className={`label rv${label.isVisible ? " in" : ""}`}>
        {t(content.label.nl, content.label.en)} <span className="en">· no vineyard, still wine</span>
      </div>
      <h2 className="manifest-title">
        <span ref={title1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title1.isVisible ? " in" : ""}`}>
          <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
        </span>
        <span ref={title2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${title2.isVisible ? " in" : ""}`}>
          <span className="alt">{t(content.heading_line2.nl, content.heading_line2.en)}</span>
        </span>
      </h2>
      <div className="manifest-body">
        <div></div>
        <div className="rule">
          <p ref={body.ref as React.RefObject<HTMLParagraphElement>} className={`rv${body.isVisible ? " in" : ""}`}>
            {lang === "nl" ? content.body_lead.nl : content.body_lead.en}
            <strong>{lang === "nl" ? content.body_strong.nl : content.body_strong.en}</strong>
            {lang === "nl" ? content.body_tail.nl : content.body_tail.en}
          </p>
        </div>
      </div>
      <div className="stats">
        {STAT_META.map((meta) => (
          <Stat key={meta.valueKey} meta={meta} content={content} lang={lang} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Modify `components/process.tsx`**

```tsx
// components/process.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import type { ProcessContent } from "@/lib/content/defaults";

const STEP_META: Array<{
  idx: string;
  titleKey: keyof ProcessContent;
  bodyKey: keyof ProcessContent;
  img: string;
  alt: string;
}> = [
  {
    idx: "01",
    titleKey: "step_1_title",
    bodyKey: "step_1_body",
    img: "/assets/step-druif.png",
    alt: "Close-up of hands picking organic red wine grapes into a rustic wooden box",
  },
  {
    idx: "02",
    titleKey: "step_2_title",
    bodyKey: "step_2_body",
    img: "/assets/step-reis.png",
    alt: "Crates of fresh grapes inside a cold storage delivery truck with condensation",
  },
  {
    idx: "03",
    titleKey: "step_3_title",
    bodyKey: "step_3_body",
    img: "/assets/step-makerij.png",
    alt: "Winemaker measuring wine levels near large stainless steel fermentation tanks",
  },
  {
    idx: "04",
    titleKey: "step_4_title",
    bodyKey: "step_4_body",
    img: "/assets/step-fles.png",
    alt: "Automated bottling and labeling machine with wine bottles in a row",
  },
];

function Step({
  meta,
  content,
  lang,
}: {
  meta: (typeof STEP_META)[number];
  content: ProcessContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal();
  const title = content[meta.titleKey];

  return (
    <article ref={reveal.ref as React.RefObject<HTMLElement>} className={`step rv${reveal.isVisible ? " in" : ""}`}>
      <div className="idx">{meta.idx}</div>
      <div>
        <h3>
          {title.nl} <small>{title.en}</small>
        </h3>
        <p>{lang === "nl" ? content[meta.bodyKey].nl : content[meta.bodyKey].en}</p>
      </div>
      <div className="slotwrap">
        <img src={meta.img} alt={meta.alt} className="step-img" />
      </div>
    </article>
  );
}

export function Process({ content }: { content: ProcessContent }) {
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
            {lang === "nl" ? content.heading_lead.nl : content.heading_lead.en}
            <em>{lang === "nl" ? content.heading_em.nl : content.heading_em.en}</em>
          </h2>
          <p ref={sub.ref as React.RefObject<HTMLParagraphElement>} className={`sub rv${sub.isVisible ? " in" : ""}`}>
            {t(content.sub_text.nl, content.sub_text.en)}
          </p>
        </div>
        <div className="process-steps">
          {STEP_META.map((meta) => (
            <Step key={meta.idx} meta={meta} content={content} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: the section label ("Het proces") is not itself a `t()` call in the source today (unlike every other section's label) — per the field-key convention documented in Task 12, it stays a hardcoded local string; this preserves current (pre-existing) behavior exactly rather than introducing a new translation this task wasn't asked to add.

- [ ] **Step 3: Modify `app/(site)/page.tsx`**

```tsx
// app/(site)/page.tsx
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import { HERO_DEFAULTS, MARQUEE_DEFAULTS, MANIFEST_DEFAULTS, PROCESS_DEFAULTS } from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths />
      <WinesPreview />
      <Place />
    </>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual visual verification**

Run: `npm run dev`. Compare against `https://chateau-amsterdam-homepage-production.up.railway.app/`:
- "Het verhaal"/"Our story": label, both heading lines (still rendering in yellow, not bordeaux), the body paragraph's bolded clause, and all 4 stat blocks (count-up animation to the correct numbers, correct suffixes " m²"/"+", correct descriptions) all match, in both NL and EN.
- "Het proces"/process section: sticky heading (with its emphasized closing clause), sub-copy, and all 4 steps (title + secondary-language title + body) match, in both NL and EN.

Expected: no visual or text regression versus the live reference.

- [ ] **Step 6: Commit**

```bash
git add app/(site)/page.tsx components/manifest.tsx components/process.tsx
git commit -m "feat: wire Manifest and Process to CMS content"
```

---

### Task 16: Wire Paths + Place + SiteFooter

**Files:**
- Modify: `components/paths.tsx`
- Modify: `components/place.tsx`
- Modify: `components/site-footer.tsx`
- Modify: `app/(site)/layout.tsx`
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Modify `components/paths.tsx`**

```tsx
// components/paths.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { PathsContent } from "@/lib/content/defaults";

const PATH_META: Array<{
  idx: string;
  word: string;
  href: string;
  titleKey: keyof PathsContent;
  bodyKey: keyof PathsContent;
  img: string;
  alt: string;
  ariaLabel: string;
}> = [
  {
    idx: "01",
    word: "Taste",
    href: "#paden",
    titleKey: "path_1_title",
    bodyKey: "path_1_body",
    img: "/assets/path-taste.png",
    alt: "Wine tasting flight with four glasses of different wines on a barrel",
    ariaLabel: "Boek een tasting",
  },
  {
    idx: "02",
    word: "Pour",
    href: "#bedrijven",
    titleKey: "path_2_title",
    bodyKey: "path_2_body",
    img: "/assets/path-pour.png",
    alt: "Beautifully decorated long event table inside the industrial winery hall",
    ariaLabel: "Plan een gesprek",
  },
  {
    idx: "03",
    word: "Drink",
    href: "#wijnen",
    titleKey: "path_3_title",
    bodyKey: "path_3_body",
    img: "/assets/path-drink.png",
    alt: "Hand pulling a red wine bottle out of a stylish cardboard box",
    ariaLabel: "Naar de webshop",
  },
];

function PathRow({
  meta,
  content,
  lang,
}: {
  meta: (typeof PATH_META)[number];
  content: PathsContent;
  lang: "nl" | "en";
}) {
  const reveal = useReveal();
  const goMagnetic = useMagnetic();

  function handleRowClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const target = document.querySelector(meta.href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      ref={reveal.ref as React.RefObject<HTMLDivElement>}
      className={`path rv${reveal.isVisible ? " in" : ""}`}
      id={meta.href === "#bedrijven" ? "bedrijven" : undefined}
      onClick={handleRowClick}
    >
      <div className="idx">{meta.idx}</div>
      <div className="word">{meta.word}</div>
      <div className="info">
        <h3>{lang === "nl" ? content[meta.titleKey].nl : content[meta.titleKey].en}</h3>
        <p>{lang === "nl" ? content[meta.bodyKey].nl : content[meta.bodyKey].en}</p>
      </div>
      <div className="thumb">
        <img src={meta.img} alt={meta.alt} className="path-thumb-img" />
      </div>
      <a className="go" ref={goMagnetic as React.RefObject<HTMLAnchorElement>} href={meta.href} aria-label={meta.ariaLabel}>
        →
      </a>
    </div>
  );
}

export function Paths({ content }: { content: PathsContent }) {
  const { lang, t } = useLanguage();
  const introHeading1 = useReveal();
  const introHeading2 = useReveal(0.12);
  const introBody = useReveal(0.2);

  return (
    <section className="paths" id="paden">
      <div className="label rv in">
        {t(content.label.nl, content.label.en)} <span className="en">· choose your glass</span>
      </div>
      <div className="paths-intro">
        <h2>
          <span ref={introHeading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading1.isVisible ? " in" : ""}`}>
            <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
          </span>
          <span ref={introHeading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${introHeading2.isVisible ? " in" : ""}`}>
            <span>
              & <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
            </span>
          </span>
        </h2>
        <p ref={introBody.ref as React.RefObject<HTMLParagraphElement>} className={`rv${introBody.isVisible ? " in" : ""}`}>
          {t(content.intro_body.nl, content.intro_body.en)}
        </p>
      </div>
      {PATH_META.map((meta) => (
        <PathRow key={meta.idx} meta={meta} content={content} lang={lang} />
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Modify `components/place.tsx`**

```tsx
// components/place.tsx
"use client";

import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useParallax } from "@/lib/use-parallax";
import { useMagnetic } from "@/lib/use-magnetic";
import type { PlaceContent } from "@/lib/content/defaults";

export function Place({ content }: { content: PlaceContent }) {
  const { t } = useLanguage();
  const parallaxRef = useParallax(0.12);
  const label = useReveal();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const address = useReveal();
  const hours = useReveal(0.1);
  const route = useReveal(0.2);
  const cta = useReveal(0.3);
  const ctaMagnetic = useMagnetic();

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
          {t(content.label.nl, content.label.en)} <span className="en">· visit us</span>
        </div>
        <h2>
          <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
            <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
          </span>
          <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
            <span>
              <em>{t(content.heading_line2.nl, content.heading_line2.en)}</em>
            </span>
          </span>
        </h2>
        <div className="place-grid">
          <div ref={address.ref as React.RefObject<HTMLDivElement>} className={`rv${address.isVisible ? " in" : ""}`}>
            <h4>{t(content.address_heading.nl, content.address_heading.en)}</h4>
            <p>
              Johan van Hasseltweg
              <br />
              Amsterdam-Noord
            </p>
          </div>
          <div ref={hours.ref as React.RefObject<HTMLDivElement>} className={`rv${hours.isVisible ? " in" : ""}`}>
            <h4>{t(content.hours_heading.nl, content.hours_heading.en)}</h4>
            <p>
              {t(content.hours_line1.nl, content.hours_line1.en)}
              <br />
              {t(content.hours_line2.nl, content.hours_line2.en)}
            </p>
          </div>
          <div ref={route.ref as React.RefObject<HTMLDivElement>} className={`rv${route.isVisible ? " in" : ""}`}>
            <h4>Route</h4>
            <p>
              {t(content.route_line1.nl, content.route_line1.en)}
              <br />
              {t(content.route_line2.nl, content.route_line2.en)}
            </p>
          </div>
          <div ref={cta.ref as React.RefObject<HTMLDivElement>} className={`rv${cta.isVisible ? " in" : ""}`}>
            <a className="btn btn--light" ref={ctaMagnetic as React.RefObject<HTMLAnchorElement>} href="#bezoek">
              {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Note: `Route`'s heading and the street-address paragraph are not `t()` calls in the source today (they read identically in both languages) and stay hardcoded, per the Task 12 convention.

- [ ] **Step 3: Modify `components/site-footer.tsx`**

```tsx
// components/site-footer.tsx
"use client";

import { useLanguage } from "@/lib/language";
import type { FooterContent } from "@/lib/content/defaults";

export function SiteFooter({ content }: { content: FooterContent }) {
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
          <p className="footer-note">{t(content.footer_note.nl, content.footer_note.en)}</p>
        </div>
        <div>
          <h4>{t(content.discover_heading.nl, content.discover_heading.en)}</h4>
          <a href="#verhaal">{t(content.discover_link_1.nl, content.discover_link_1.en)}</a>
          <a href="#proces">{t(content.discover_link_2.nl, content.discover_link_2.en)}</a>
          <a href="#wijnen">{t(content.discover_link_3.nl, content.discover_link_3.en)}</a>
        </div>
        <div>
          <h4>{t(content.do_heading.nl, content.do_heading.en)}</h4>
          <a href="#paden">Tours &amp; tastings</a>
          <a href="#bedrijven">{t(content.do_link_2.nl, content.do_link_2.en)}</a>
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

- [ ] **Step 4: Modify `app/(site)/layout.tsx`**

```tsx
// app/(site)/layout.tsx
import type { Metadata } from "next";
import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getContent } from "@/lib/content/get-content";
import { HEADER_DEFAULTS, FOOTER_DEFAULTS } from "@/lib/content/defaults";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://chateau.amsterdam"),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerContent = await getContent("home", "header", HEADER_DEFAULTS);
  const footerContent = await getContent("home", "footer", FOOTER_DEFAULTS);

  return (
    <html lang="nl" className={`${archivo.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body data-pattern="arcering" style={{ "--pattern-o": 0.04 } as React.CSSProperties}>
        <LanguageProvider>
          <div className="grain" />
          <div className="bg-pattern" />
          <SiteHeader content={headerContent} />
          <main id="main-content">{children}</main>
          <SiteFooter content={footerContent} />
        </LanguageProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Modify `app/(site)/page.tsx`**

```tsx
// app/(site)/page.tsx
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import {
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  PLACE_DEFAULTS,
} from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);
  const pathsContent = await getContent("home", "paths", PATHS_DEFAULTS);
  const placeContent = await getContent("home", "place", PLACE_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths content={pathsContent} />
      <WinesPreview />
      <Place content={placeContent} />
    </>
  );
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Manual visual verification**

Run: `npm run dev`. Compare against `https://chateau-amsterdam-homepage-production.up.railway.app/`:
- Paths section: label, both intro heading lines (with "& home drinkers."/"& thuisdrinkers." emphasis), intro body, and all 3 path rows (title + body, hover states unaffected) match, in both NL and EN.
- "De plek"/"The venue": label, both heading lines, address block, hours block, route block, and CTA all match, in both NL and EN.
- Footer: note paragraph, "Ontdek"/"Discover" links, "Doen"/"Do" links (including the "Voor bedrijven"/"For businesses" link), and all static content (Contact, cheers block, bottom bar) all match, in both NL and EN.

Expected: no visual or text regression versus the live reference.

- [ ] **Step 8: Commit**

```bash
git add app/(site)/layout.tsx app/(site)/page.tsx components/paths.tsx components/place.tsx components/site-footer.tsx
git commit -m "feat: wire Paths, Place, and SiteFooter to CMS content"
```

---

### Task 17: Wire WinesPreview heading/label/CTA only

Scope note: this task touches only the `label`, `h2` heading, and "Shop alle wijnen" CTA text in `components/wines-preview.tsx`. The `WINES` array and `WineCard` component are explicitly out of scope (owned by the Shopify-integration chunk) and are reproduced unchanged below only because this is a full-file modification.

**Files:**
- Modify: `components/wines-preview.tsx`
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: Modify `components/wines-preview.tsx`**

```tsx
// components/wines-preview.tsx
"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { WinesContent } from "@/lib/content/defaults";

// Unchanged — owned by a different chunk (Shopify integration). Do not edit
// as part of this task.
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

// Unchanged — owned by a different chunk.
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

export function WinesPreview({ content }: { content: WinesContent }) {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);
  const ctaMagnetic = useMagnetic();
  // The "Shop alle wijnen" link already carries the useReveal ref directly
  // (unlike the other magnetic targets, whose reveal refs sit on a
  // surrounding container). Compose both refs on the same node instead of
  // dropping either effect.
  const setCtaRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      cta.ref.current = node;
      ctaMagnetic.current = node;
    },
    [cta.ref, ctaMagnetic]
  );

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t(content.label.nl, content.label.en)} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t(content.heading_line2_lead.nl, content.heading_line2_lead.en)}
                <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={setCtaRef} className={`btn rv${cta.isVisible ? " in" : ""}`} href="#wijnen">
          {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
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

- [ ] **Step 2: Modify `app/(site)/page.tsx`**

```tsx
// app/(site)/page.tsx
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { WinesPreview } from "@/components/wines-preview";
import { Place } from "@/components/place";
import { getContent } from "@/lib/content/get-content";
import {
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  PLACE_DEFAULTS,
  WINES_DEFAULTS,
} from "@/lib/content/defaults";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);
  const pathsContent = await getContent("home", "paths", PATHS_DEFAULTS);
  const placeContent = await getContent("home", "place", PLACE_DEFAULTS);
  const winesContent = await getContent("home", "wines", WINES_DEFAULTS);

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths content={pathsContent} />
      <WinesPreview content={winesContent} />
      <Place content={placeContent} />
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual visual verification**

Run: `npm run dev`. Compare against `https://chateau-amsterdam-homepage-production.up.railway.app/`:
- Wines section: label, both heading lines ("Van klassiek" / "tot eigenwijs."), and the "Shop alle wijnen" CTA all match, in both NL and EN.
- The 5 wine cards themselves (name, tag, price, image) are unaffected — confirm no regression there either, since this task's edit sits directly above them in the same file.

Expected: no visual or text regression versus the live reference.

- [ ] **Step 5: Commit**

```bash
git add app/(site)/page.tsx components/wines-preview.tsx
git commit -m "feat: wire WinesPreview heading and CTA to CMS content"
```

---

### Task 18: S3 storage wrapper (`lib/storage/s3.ts`)

A thin wrapper around `@aws-sdk/client-s3` so every other task talks to object storage through two functions instead of the SDK directly. Real network calls to the bucket aren't a unit test; the S3 client is mocked with `aws-sdk-client-mock`, and real upload/fetch behavior is verified manually in Task 20's browser-verification step.

**Correction confirmed against the real bucket (this is not the original draft's assumption — that assumption was wrong):** the original plan assumed a plain `getPublicUrl(key): string` would work once the virtual-host URL shape was right. Confirmed empirically instead: this Railway S3-compatible bucket has no public-read option at all — neither a `public-read` object ACL on `PutObjectCommand` nor an unauthenticated GET reaches the object; both return `AccessDenied`. The actual, verified fix is `getObjectUrl(key): Promise<string>`, an async function returning a presigned GET URL (`@aws-sdk/s3-request-presigner`, `expiresIn: 86400`). Every call site below and in Tasks 21/23/24 uses `getObjectUrl` (awaited), not `getPublicUrl`.

**Files:**
- Create: `lib/storage/s3.ts`
- Test: `lib/storage/s3.test.ts`
- Modify: `package.json` (add `@aws-sdk/client-s3` dependency, `aws-sdk-client-mock` devDependency)

- [ ] **Step 1: Check the latest stable `@aws-sdk/client-s3` version**

Run: `npm view @aws-sdk/client-s3 version`
Expected: a version string like `3.x.x` (e.g. `3.1088.0` at the time of writing). Use this exact version below.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install @aws-sdk/client-s3
npm install -D aws-sdk-client-mock
```
Expected: `package.json` gains `@aws-sdk/client-s3` under `dependencies` and `aws-sdk-client-mock` under `devDependencies`; `package-lock.json` updates.

- [ ] **Step 3: Write the failing test**

```ts
// lib/storage/s3.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getPublicUrl, uploadObject } from "./s3";

const s3Mock = mockClient(S3Client);

describe("uploadObject", () => {
  beforeEach(() => {
    s3Mock.reset();
    vi.stubEnv("AWS_S3_BUCKET_NAME", "chateau-media-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends a PutObjectCommand with the given key, body, and content type", async () => {
    s3Mock.on(PutObjectCommand).resolves({});

    await uploadObject("media/test-key.jpg", Buffer.from("fake-image-bytes"), "image/jpeg");

    const calls = s3Mock.commandCalls(PutObjectCommand);
    expect(calls).toHaveLength(1);
    expect(calls[0].args[0].input).toMatchObject({
      Bucket: "chateau-media-test",
      Key: "media/test-key.jpg",
      ContentType: "image/jpeg",
    });
  });

  it("throws when AWS_S3_BUCKET_NAME is not set", async () => {
    vi.stubEnv("AWS_S3_BUCKET_NAME", "");
    await expect(uploadObject("media/x.jpg", Buffer.from("x"), "image/png")).rejects.toThrow(
      "AWS_S3_BUCKET_NAME is not set"
    );
  });
});

describe("getPublicUrl", () => {
  beforeEach(() => {
    vi.stubEnv("AWS_ENDPOINT_URL", "https://bucket-production.up.railway.app");
    vi.stubEnv("AWS_S3_BUCKET_NAME", "chateau-media-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a virtual-host-style public URL from the endpoint and bucket", () => {
    const url = getPublicUrl("media/abc-test.jpg");
    expect(url).toBe("https://chateau-media-test.bucket-production.up.railway.app/media/abc-test.jpg");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run lib/storage/s3.test.ts`
Expected: FAIL — `Cannot find module './s3' or its corresponding type declarations` (the file doesn't exist yet).

- [ ] **Step 5: Write minimal implementation**

```ts
// lib/storage/s3.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET_NAME is not set");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export function getPublicUrl(storageKey: string): string {
  const endpoint = process.env.AWS_ENDPOINT_URL;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!endpoint || !bucket) {
    throw new Error("AWS_ENDPOINT_URL and AWS_S3_BUCKET_NAME must be set");
  }

  const { protocol, host } = new URL(endpoint);
  return `${protocol}//${bucket}.${host}/${storageKey}`;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run lib/storage/s3.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json lib/storage/s3.ts lib/storage/s3.test.ts
git commit -m "feat: add S3 storage wrapper (upload + public URL)"
```

---

### Task 19: Media repository (`lib/db/media.ts`)

Strict TDD against the real local Postgres dev database (via `DATABASE_URL`, already set in `.env.local`) — query correctness against a real database is exactly what this task proves, not something to mock.

**Assumption (flagged):** `media.uploadedBy` is treated as a nullable FK — these tests insert rows with `uploadedBy: null` rather than seeding a `users` row, since this chunk doesn't own `lib/db/schema.ts`'s exact column constraints (owned by the foundation chunk, tasks 1–9). If that column turns out to be `NOT NULL` in the shipped schema, these tests need a seeded test user instead — flagged for the plan integrator to reconcile.

**Files:**
- Create: `lib/db/media.ts`
- Test: `lib/db/media.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/media.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { db } from "./client";
import { media } from "./schema";
import { createMedia, deleteMedia, listMedia } from "./media";

describe("media repository", () => {
  afterEach(async () => {
    await db.delete(media);
  });

  it("createMedia inserts a row and returns it", async () => {
    const row = await createMedia({
      storageKey: "media/test-key.jpg",
      filename: "test-key.jpg",
      altTextNl: "Test afbeelding",
      altTextEn: "Test image",
      uploadedBy: null,
    });

    expect(row.id).toBeDefined();
    expect(row.storageKey).toBe("media/test-key.jpg");
    expect(row.altTextNl).toBe("Test afbeelding");
  });

  it("listMedia returns rows most-recent first", async () => {
    const first = await createMedia({
      storageKey: "media/a.jpg",
      filename: "a.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await createMedia({
      storageKey: "media/b.jpg",
      filename: "b.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });

    const rows = await listMedia();
    expect(rows[0].id).toBe(second.id);
    expect(rows[1].id).toBe(first.id);
  });

  it("deleteMedia removes the row", async () => {
    const row = await createMedia({
      storageKey: "media/c.jpg",
      filename: "c.jpg",
      altTextNl: null,
      altTextEn: null,
      uploadedBy: null,
    });

    await deleteMedia(row.id);

    const rows = await listMedia();
    expect(rows.find((r) => r.id === row.id)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/media.test.ts`
Expected: FAIL — `Cannot find module './media' or its corresponding type declarations` (the file doesn't exist yet). Requires the local Postgres from `docker-compose` to already be running with `DATABASE_URL` pointing at it, per the foundation chunk's setup.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/media.ts
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { media } from "./schema";

export type Media = typeof media.$inferSelect;

export type MediaInput = {
  storageKey: string;
  filename: string;
  altTextNl: string | null;
  altTextEn: string | null;
  uploadedBy: string | null;
};

export async function createMedia(input: MediaInput): Promise<Media> {
  const [row] = await db.insert(media).values(input).returning();
  return row;
}

export async function listMedia(): Promise<Media[]> {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function deleteMedia(id: string): Promise<void> {
  await db.delete(media).where(eq(media.id, id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/media.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/media.ts lib/db/media.test.ts
git commit -m "feat: add media repository (create/list/delete)"
```

---

### Task 20: Media library admin UI (`/admin/media`)

Upload validation (file type/size) is real branching logic, so it's extracted into a pure function and TDD'd on its own before the Server Action uses it, per the plan's hard rule on upload-validation logic. The rest of this task — the page and the Server Action wiring around `uploadObject`/`createMedia` — is UI/plumbing with no new branching logic of its own, so it ends in a manual browser-verification step instead of a forced unit test, mirroring the foundation plan's approach to non-testable wiring.

**Assumption (flagged):** the Server Action calls a `getCurrentUser()` helper from `@/lib/auth/session` to attribute the upload's `uploadedBy` — this chunk doesn't own the auth implementation (tasks 1–9). If the real helper has a different name/return shape, the plan integrator should adjust this one call site; everything else in this task is independent of that detail.

**Files:**
- Create: `lib/storage/validate-upload.ts`
- Test: `lib/storage/validate-upload.test.ts`
- Create: `app/admin/media/actions.ts`
- Create: `app/admin/media/page.tsx`

- [ ] **Step 1: Write the failing test for upload validation**

```ts
// lib/storage/validate-upload.test.ts
import { describe, expect, it } from "vitest";
import { validateUpload } from "./validate-upload";

describe("validateUpload", () => {
  it("accepts a JPEG under the size limit", () => {
    expect(validateUpload({ type: "image/jpeg", size: 1024 })).toBeNull();
  });

  it("accepts a file exactly at the 8MB limit", () => {
    expect(validateUpload({ type: "image/png", size: 8 * 1024 * 1024 })).toBeNull();
  });

  it("rejects an unsupported file type", () => {
    expect(validateUpload({ type: "application/pdf", size: 1024 })).toBe(
      'Bestandstype "application/pdf" wordt niet ondersteund. Gebruik JPEG, PNG of WebP.'
    );
  });

  it("rejects a file over the 8MB limit", () => {
    expect(validateUpload({ type: "image/webp", size: 8 * 1024 * 1024 + 1 })).toBe(
      "Bestand is te groot. Maximaal 8MB toegestaan."
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/storage/validate-upload.test.ts`
Expected: FAIL — `Cannot find module './validate-upload' or its corresponding type declarations`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/storage/validate-upload.ts
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return `Bestandstype "${file.type}" wordt niet ondersteund. Gebruik JPEG, PNG of WebP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Bestand is te groot. Maximaal 8MB toegestaan.";
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/storage/validate-upload.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit the validation function**

```bash
git add lib/storage/validate-upload.ts lib/storage/validate-upload.test.ts
git commit -m "feat: add upload validation (file type + size)"
```

- [ ] **Step 6: Write the Server Action**

```ts
// app/admin/media/actions.ts
"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createMedia } from "@/lib/db/media";
import { uploadObject } from "@/lib/storage/s3";
import { validateUpload } from "@/lib/storage/validate-upload";

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadMedia(formData: FormData): Promise<void> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/media?error=${encodeURIComponent("Geen bestand geselecteerd.")}`);
  }

  const validationError = validateUpload({ type: file.type, size: file.size });
  if (validationError) {
    redirect(`/admin/media?error=${encodeURIComponent(validationError)}`);
  }

  const altTextNl = (formData.get("altTextNl") as string) || null;
  const altTextEn = (formData.get("altTextEn") as string) || null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = `media/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  await uploadObject(storageKey, buffer, file.type);

  const user = await getCurrentUser();
  await createMedia({
    storageKey,
    filename: file.name,
    altTextNl,
    altTextEn,
    uploadedBy: user?.id ?? null,
  });

  redirect("/admin/media");
}
```

- [ ] **Step 7: Write the page**

```tsx
// app/admin/media/page.tsx
import { listMedia } from "@/lib/db/media";
import { getPublicUrl } from "@/lib/storage/s3";
import { uploadMedia } from "./actions";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const items = await listMedia();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Media</h1>
        <p className="text-sm text-neutral-500">Upload afbeeldingen voor gebruik bij wijnen.</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <form
        action={uploadMedia}
        encType="multipart/form-data"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="file">
            Afbeelding
          </label>
          <input
            required
            type="file"
            id="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="altTextNl">
            Alt-tekst (NL)
          </label>
          <input
            type="text"
            id="altTextNl"
            name="altTextNl"
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="altTextEn">
            Alt-tekst (EN)
          </label>
          <input
            type="text"
            id="altTextEn"
            name="altTextEn"
            className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Uploaden
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <img
              src={getPublicUrl(item.storageKey)}
              alt={item.altTextNl ?? item.filename}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="truncate px-2 py-1 text-xs text-neutral-500">{item.filename}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, log in at `/admin/login`, navigate to `/admin/media`.
- Select a real small test image (JPEG or PNG, well under 8MB) and submit the form.
- Expected: redirect back to `/admin/media`, the new thumbnail appears in the grid, and opening its `<img>` `src` URL directly in a new browser tab loads the image (confirms the Task 18 `getPublicUrl` assumption holds against the real bucket — fix `getPublicUrl` now if it doesn't).
- Try uploading a `.pdf` or an oversized file and confirm the red validation-error banner renders with the correct Dutch message.

- [ ] **Step 9: Commit**

```bash
git add app/admin/media/actions.ts app/admin/media/page.tsx
git commit -m "feat: add media library admin UI"
```

---

### Task 21: Reusable image picker (`components/admin/image-picker.tsx`)

A controlled, presentation-only component: given a list of media items, a selected value, and an `onChange` callback, it renders a clickable grid and reports the clicked id. No file I/O or server calls live here — those stay in the parent page (Task 23). The click-to-select wiring is simple but real (not animation/layout logic that jsdom can't exercise), so it gets a real RTL test rather than a manual-only check.

**Files:**
- Create: `components/admin/image-picker.tsx`
- Test: `components/admin/image-picker.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/admin/image-picker.test.tsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImagePicker } from "./image-picker";

const media = [
  { id: "media-1", url: "https://example.test/one.jpg", filename: "one.jpg", altText: "Eerste afbeelding" },
  { id: "media-2", url: "https://example.test/two.jpg", filename: "two.jpg", altText: "Tweede afbeelding" },
];

describe("ImagePicker", () => {
  it("calls onChange with the clicked item's id", () => {
    const onChange = vi.fn();
    render(<ImagePicker media={media} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("option", { name: "Tweede afbeelding" }));

    expect(onChange).toHaveBeenCalledWith("media-2");
  });

  it("marks the item matching value as selected", () => {
    render(<ImagePicker media={media} value="media-1" onChange={vi.fn()} />);

    expect(screen.getByRole("option", { name: "Eerste afbeelding" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Tweede afbeelding" })).toHaveAttribute("aria-selected", "false");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/image-picker.test.tsx`
Expected: FAIL — `Cannot find module './image-picker' or its corresponding type declarations`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// components/admin/image-picker.tsx
"use client";

export type PickerMediaItem = {
  id: string;
  url: string;
  filename: string;
  altText: string;
};

export function ImagePicker({
  media,
  value,
  onChange,
}: {
  media: PickerMediaItem[];
  value: string | null;
  onChange: (mediaId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6" role="listbox" aria-label="Kies een afbeelding">
      {media.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`overflow-hidden rounded-md border-2 ${selected ? "border-neutral-900" : "border-transparent"}`}
          >
            <img src={item.url} alt={item.altText} className="aspect-square w-full object-cover" />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/image-picker.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add components/admin/image-picker.tsx components/admin/image-picker.test.tsx
git commit -m "feat: add reusable admin image picker component"
```

---

### Task 22: Wines repository (`lib/db/wines.ts`)

Strict TDD against the real local Postgres dev database, same as Task 19. Covers CRUD plus `reorderWines`, whose sort-order-assignment logic is exactly the kind of thing the plan's hard rule calls out for a real seeded test.

**Assumption (flagged):** `wines.imageId` is a nullable FK — tests create wines with `imageId: null` since no media row is needed to exercise CRUD/ordering. Task 24 seeds a real media row when it tests the image join.

**Files:**
- Create: `lib/db/wines.ts`
- Test: `lib/db/wines.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/wines.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { db } from "./client";
import { wines } from "./schema";
import { createWine, deleteWine, getWine, listWines, reorderWines, updateWine, type WineInput } from "./wines";

function wineInput(overrides: Partial<WineInput> = {}): WineInput {
  return {
    name: "Testwijn",
    metaNl: "Wit · Test, NL",
    metaEn: "White · Test, NL",
    tagNl: "de testfles",
    tagEn: "the test bottle",
    imageId: null,
    shopifyHandle: `test-handle-${Math.random().toString(36).slice(2)}`,
    isActive: true,
    ...overrides,
  };
}

describe("wines repository", () => {
  afterEach(async () => {
    await db.delete(wines);
  });

  it("createWine inserts a row and assigns the next sortOrder", async () => {
    const first = await createWine(wineInput({ name: "Eerste" }));
    const second = await createWine(wineInput({ name: "Tweede" }));

    expect(first.sortOrder).toBe(0);
    expect(second.sortOrder).toBe(1);
  });

  it("getWine returns the matching row, or null when not found", async () => {
    const created = await createWine(wineInput());
    expect((await getWine(created.id))?.name).toBe("Testwijn");
    expect(await getWine("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("listWines orders by sortOrder", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C" }));

    const rows = await listWines({});
    expect(rows.map((w) => w.id)).toEqual([a.id, b.id, c.id]);
  });

  it("listWines({ activeOnly: true }) filters out inactive wines", async () => {
    const active = await createWine(wineInput({ name: "Actief", isActive: true }));
    await createWine(wineInput({ name: "Inactief", isActive: false }));

    const rows = await listWines({ activeOnly: true });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(active.id);
  });

  it("updateWine changes the given fields", async () => {
    const created = await createWine(wineInput());
    await updateWine(created.id, { name: "Nieuwe naam" });
    expect((await getWine(created.id))?.name).toBe("Nieuwe naam");
  });

  it("deleteWine removes the row", async () => {
    const created = await createWine(wineInput());
    await deleteWine(created.id);
    expect(await getWine(created.id)).toBeNull();
  });

  it("reorderWines updates sortOrder to match the given array position", async () => {
    const a = await createWine(wineInput({ name: "A" }));
    const b = await createWine(wineInput({ name: "B" }));
    const c = await createWine(wineInput({ name: "C" }));

    await reorderWines([c.id, a.id, b.id]);

    const rows = await listWines({});
    expect(rows.map((w) => w.id)).toEqual([c.id, a.id, b.id]);
    expect(rows.map((w) => w.sortOrder)).toEqual([0, 1, 2]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: FAIL — `Cannot find module './wines' or its corresponding type declarations`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/wines.ts
import { asc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { wines } from "./schema";

export type Wine = typeof wines.$inferSelect;

export type WineInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
};

export async function listWines({ activeOnly = false }: { activeOnly?: boolean } = {}): Promise<Wine[]> {
  if (activeOnly) {
    return db.select().from(wines).where(eq(wines.isActive, true)).orderBy(asc(wines.sortOrder));
  }
  return db.select().from(wines).orderBy(asc(wines.sortOrder));
}

export async function getWine(id: string): Promise<Wine | null> {
  const [row] = await db.select().from(wines).where(eq(wines.id, id));
  return row ?? null;
}

export async function createWine(input: WineInput): Promise<Wine> {
  const [{ maxSortOrder }] = await db
    .select({ maxSortOrder: sql<number>`coalesce(max(${wines.sortOrder}), -1)` })
    .from(wines);

  const [row] = await db
    .insert(wines)
    .values({ ...input, sortOrder: maxSortOrder + 1 })
    .returning();
  return row;
}

export async function updateWine(id: string, input: Partial<WineInput>): Promise<void> {
  await db
    .update(wines)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(wines.id, id));
}

export async function deleteWine(id: string): Promise<void> {
  await db.delete(wines).where(eq(wines.id, id));
}

export async function reorderWines(orderedIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.update(wines).set({ sortOrder: index }).where(eq(wines.id, id));
    }
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/wines.ts lib/db/wines.test.ts
git commit -m "feat: add wines repository (CRUD + reorder)"
```

---

### Task 23: Wines admin UI (`/admin/wines`)

**Drag-to-reorder decision:** up/down buttons calling `reorderWines`, not a drag-and-drop library. A 4-person team reordering a 5–10 item wine list doesn't need pointer-based dragging to be usable, and pulling in a DnD dependency (e.g. `@dnd-kit/core`) for that marginal benefit contradicts the spec's own stated tradeoff for this admin surface ("build speed matters more than bespoke visual polish"). If real drag-and-drop is wanted later, `@dnd-kit/core` (actively maintained, no jQuery-era baggage) would be the pick — but that's a follow-up, not this task.

The up/down swap math is real sort-order logic (the plan's hard rule calls this out explicitly), so it's extracted into a pure function and TDD'd before the Server Action uses it — same pattern as Task 20's upload validation. Shopify-handle/name non-empty validation gets the same treatment. The page/form wiring itself has no further branching logic worth unit-testing, so it ends in a manual verification step.

**Files:**
- Create: `lib/validation/wine-input.ts`
- Test: `lib/validation/wine-input.test.ts`
- Create: `lib/wines/reorder.ts`
- Test: `lib/wines/reorder.test.ts`
- Create: `app/admin/wines/actions.ts`
- Create: `app/admin/wines/wine-form.tsx`
- Create: `app/admin/wines/image-field.tsx`
- Create: `app/admin/wines/page.tsx`
- Create: `app/admin/wines/new/page.tsx`
- Create: `app/admin/wines/[id]/page.tsx`

- [ ] **Step 1: Write the failing test for input validation**

```ts
// lib/validation/wine-input.test.ts
import { describe, expect, it } from "vitest";
import { validateWineInput } from "./wine-input";

function validInput() {
  return {
    name: "Riesling",
    metaNl: "Wit · Pfalz, DE",
    metaEn: "White · Pfalz, DE",
    tagNl: "de klassieker",
    tagEn: "the classic",
    imageId: null,
    shopifyHandle: "riesling",
    isActive: true,
  };
}

describe("validateWineInput", () => {
  it("accepts a fully filled-in wine", () => {
    expect(validateWineInput(validInput())).toBeNull();
  });

  it("rejects a missing name", () => {
    expect(validateWineInput({ ...validInput(), name: "  " })).toBe("Naam is verplicht.");
  });

  it("rejects a missing Shopify handle", () => {
    expect(validateWineInput({ ...validInput(), shopifyHandle: "" })).toBe("Shopify handle is verplicht.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation/wine-input.test.ts`
Expected: FAIL — `Cannot find module './wine-input' or its corresponding type declarations`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/validation/wine-input.ts
export type WineFormInput = {
  name: string;
  metaNl: string;
  metaEn: string;
  tagNl: string;
  tagEn: string;
  imageId: string | null;
  shopifyHandle: string;
  isActive: boolean;
};

export function validateWineInput(input: WineFormInput): string | null {
  if (!input.name.trim()) {
    return "Naam is verplicht.";
  }
  if (!input.shopifyHandle.trim()) {
    return "Shopify handle is verplicht.";
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation/wine-input.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/validation/wine-input.ts lib/validation/wine-input.test.ts
git commit -m "feat: add wine input validation"
```

- [ ] **Step 6: Write the failing test for the reorder swap logic**

```ts
// lib/wines/reorder.test.ts
import { describe, expect, it } from "vitest";
import { computeReorderedIds } from "./reorder";

describe("computeReorderedIds", () => {
  it("swaps a wine with the previous one when moving up", () => {
    expect(computeReorderedIds(["a", "b", "c"], "b", "up")).toEqual(["b", "a", "c"]);
  });

  it("swaps a wine with the next one when moving down", () => {
    expect(computeReorderedIds(["a", "b", "c"], "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("returns null when moving the first item up", () => {
    expect(computeReorderedIds(["a", "b", "c"], "a", "up")).toBeNull();
  });

  it("returns null when moving the last item down", () => {
    expect(computeReorderedIds(["a", "b", "c"], "c", "down")).toBeNull();
  });

  it("returns null for an id not present in the list", () => {
    expect(computeReorderedIds(["a", "b", "c"], "z", "up")).toBeNull();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run lib/wines/reorder.test.ts`
Expected: FAIL — `Cannot find module './reorder' or its corresponding type declarations`.

- [ ] **Step 8: Write minimal implementation**

```ts
// lib/wines/reorder.ts
export function computeReorderedIds(
  orderedIds: string[],
  id: string,
  direction: "up" | "down"
): string[] | null {
  const index = orderedIds.indexOf(id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= orderedIds.length) {
    return null;
  }

  const next = [...orderedIds];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run lib/wines/reorder.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 10: Commit**

```bash
git add lib/wines/reorder.ts lib/wines/reorder.test.ts
git commit -m "feat: add wine reorder swap logic"
```

- [ ] **Step 11: Write the Server Actions**

```ts
// app/admin/wines/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createWine,
  deleteWine as deleteWineRow,
  reorderWines as reorderWinesRow,
  updateWine,
} from "@/lib/db/wines";
import { validateWineInput, type WineFormInput } from "@/lib/validation/wine-input";
import { computeReorderedIds } from "@/lib/wines/reorder";

function readWineForm(formData: FormData): WineFormInput {
  return {
    name: String(formData.get("name") ?? ""),
    metaNl: String(formData.get("metaNl") ?? ""),
    metaEn: String(formData.get("metaEn") ?? ""),
    tagNl: String(formData.get("tagNl") ?? ""),
    tagEn: String(formData.get("tagEn") ?? ""),
    imageId: (formData.get("imageId") as string) || null,
    shopifyHandle: String(formData.get("shopifyHandle") ?? ""),
    isActive: formData.get("isActive") === "on",
  };
}

export async function saveWine(formData: FormData): Promise<void> {
  const id = (formData.get("id") as string) || null;
  const input = readWineForm(formData);

  const validationError = validateWineInput(input);
  if (validationError) {
    const target = id ? `/admin/wines/${id}` : "/admin/wines/new";
    redirect(`${target}?error=${encodeURIComponent(validationError)}`);
  }

  if (id) {
    await updateWine(id, input);
  } else {
    await createWine(input);
  }

  revalidatePath("/admin/wines");
  revalidatePath("/");
  redirect("/admin/wines");
}

export async function deleteWine(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await deleteWineRow(id);
  revalidatePath("/admin/wines");
  revalidatePath("/");
}

export async function reorderWines(
  orderedIds: string[],
  id: string,
  direction: "up" | "down"
): Promise<void> {
  const next = computeReorderedIds(orderedIds, id, direction);
  if (!next) {
    return;
  }
  await reorderWinesRow(next);
  revalidatePath("/admin/wines");
  revalidatePath("/");
}
```

- [ ] **Step 12: Write the image field wrapper**

```tsx
// app/admin/wines/image-field.tsx
"use client";

import { useState } from "react";
import { ImagePicker, type PickerMediaItem } from "@/components/admin/image-picker";

export function ImageField({
  media,
  initialValue,
}: {
  media: PickerMediaItem[];
  initialValue: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(initialValue);

  return (
    <div>
      <input type="hidden" name="imageId" value={selected ?? ""} />
      <ImagePicker media={media} value={selected} onChange={setSelected} />
    </div>
  );
}
```

- [ ] **Step 13: Write the shared form**

```tsx
// app/admin/wines/wine-form.tsx
import { listMedia } from "@/lib/db/media";
import type { Wine } from "@/lib/db/wines";
import { getPublicUrl } from "@/lib/storage/s3";
import { saveWine } from "./actions";
import { ImageField } from "./image-field";

export async function WineForm({ wine, error }: { wine: Wine | null; error?: string }) {
  const mediaRows = await listMedia();
  const media = mediaRows.map((row) => ({
    id: row.id,
    url: getPublicUrl(row.storageKey),
    filename: row.filename,
    altText: row.altTextNl ?? row.filename,
  }));

  return (
    <form action={saveWine} className="max-w-2xl space-y-6">
      {wine ? <input type="hidden" name="id" value={wine.id} /> : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-neutral-700" htmlFor="name">
          Naam
        </label>
        <input
          required
          type="text"
          id="name"
          name="name"
          defaultValue={wine?.name}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="metaNl">
            Omschrijving — type/regio (NL)
          </label>
          <input
            type="text"
            id="metaNl"
            name="metaNl"
            defaultValue={wine?.metaNl}
            placeholder="Wit · Pfalz, DE"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="metaEn">
            Description — type/region (EN)
          </label>
          <input
            type="text"
            id="metaEn"
            name="metaEn"
            defaultValue={wine?.metaEn}
            placeholder="White · Pfalz, DE"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="tagNl">
            Tagline (NL)
          </label>
          <input
            type="text"
            id="tagNl"
            name="tagNl"
            defaultValue={wine?.tagNl}
            placeholder="de klassieker"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700" htmlFor="tagEn">
            Tagline (EN)
          </label>
          <input
            type="text"
            id="tagEn"
            name="tagEn"
            defaultValue={wine?.tagEn}
            placeholder="the classic"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-neutral-700">Afbeelding</span>
        <ImageField media={media} initialValue={wine?.imageId ?? null} />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700" htmlFor="shopifyHandle">
          Shopify handle
        </label>
        <input
          required
          type="text"
          id="shopifyHandle"
          name="shopifyHandle"
          defaultValue={wine?.shopifyHandle}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked={wine?.isActive ?? true}
          className="h-4 w-4"
        />
        <label className="text-sm text-neutral-700" htmlFor="isActive">
          Actief op de website
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Opslaan
      </button>
    </form>
  );
}
```

- [ ] **Step 14: Write the list page**

```tsx
// app/admin/wines/page.tsx
import Link from "next/link";
import { listWines } from "@/lib/db/wines";
import { deleteWine, reorderWines } from "./actions";

export default async function WinesListPage() {
  const wines = await listWines({});
  const orderedIds = wines.map((w) => w.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Wijnen</h1>
        <Link
          href="/admin/wines/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Nieuwe wijn
        </Link>
      </div>
      <table className="w-full divide-y divide-neutral-200 text-sm">
        <thead>
          <tr className="text-left text-neutral-500">
            <th className="py-2">Volgorde</th>
            <th className="py-2">Naam</th>
            <th className="py-2">Actief</th>
            <th className="py-2">Shopify</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {wines.map((wine, index) => (
            <tr key={wine.id}>
              <td className="py-2">
                <div className="flex gap-1">
                  <form action={reorderWines.bind(null, orderedIds, wine.id, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={reorderWines.bind(null, orderedIds, wine.id, "down")}>
                    <button
                      type="submit"
                      disabled={index === wines.length - 1}
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                </div>
              </td>
              <td className="py-2">{wine.name}</td>
              <td className="py-2">{wine.isActive ? "Ja" : "Nee"}</td>
              <td className="py-2">{wine.shopifyHandle}</td>
              <td className="py-2">
                <div className="flex gap-3">
                  <Link href={`/admin/wines/${wine.id}`} className="text-neutral-600 hover:underline">
                    Bewerken
                  </Link>
                  <form action={deleteWine}>
                    <input type="hidden" name="id" value={wine.id} />
                    <button type="submit" className="text-red-600 hover:underline">
                      Verwijderen
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 15: Write the new/edit route pages**

```tsx
// app/admin/wines/new/page.tsx
import { WineForm } from "../wine-form";

export default async function NewWinePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Nieuwe wijn</h1>
      <WineForm wine={null} error={error} />
    </div>
  );
}
```

```tsx
// app/admin/wines/[id]/page.tsx
import { notFound } from "next/navigation";
import { getWine } from "@/lib/db/wines";
import { WineForm } from "../wine-form";

export default async function EditWinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const wine = await getWine(id);
  if (!wine) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Wijn bewerken</h1>
      <WineForm wine={wine} error={error} />
    </div>
  );
}
```

- [ ] **Step 16: Manual verification**

Run: `npm run dev`, log in at `/admin/login`, navigate to `/admin/wines`.
- Add a new wine: fill in name, both description fields (NL/EN), both tagline fields (NL/EN), pick an image (upload one via `/admin/media` first if the library is empty), set a Shopify handle, leave "Actief" checked, save.
- Expected: redirected to `/admin/wines`, the new wine appears in the list.
- Edit that wine, change its name, save — expected: the change is reflected in the list.
- Click ↑/↓ on a couple of rows and confirm the order visibly changes and persists after a page reload.
- Uncheck "Actief" on one wine, save — expected: it still shows in this admin list (marked "Nee") but (once Task 24 wires the public homepage) disappears from `/`.
- Submit the new-wine form with the name field blank — expected: redirected back to the form with the "Naam is verplicht." error banner, no row created.
- Delete a test wine and confirm it's removed from the list.

- [ ] **Step 17: Commit**

```bash
git add app/admin/wines/actions.ts app/admin/wines/wine-form.tsx app/admin/wines/image-field.tsx app/admin/wines/page.tsx app/admin/wines/new/page.tsx "app/admin/wines/[id]/page.tsx"
git commit -m "feat: add wines admin UI (list, reorder, add/edit, delete)"
```

---

### Task 24: Wire public `WinesPreview` to Postgres

Replaces `components/wines-preview.tsx`'s hardcoded `WINES` array with data read live from Postgres in a Server Component parent (`app/(site)/page.tsx`), per the spec's "no caching layer — query per request" architecture. Price stays the static `"vanaf shop.chateau.amsterdam"` placeholder for every wine (not a DB field), per the spec's explicit no-Shopify-yet scope for this phase.

**Builds on Task 17, doesn't replace it:** Task 17 (content-editor chunk) already wired `WinesPreview`'s `label`/heading/CTA text to a `content: WinesContent` prop sourced from `content_blocks`, and already updated `app/(site)/page.tsx` to fetch `heroContent`/`marqueeContent`/`manifestContent`/`processContent`/`pathsContent`/`placeContent`/`winesContent` and render all 6 homepage components with their content props. This task adds a *second* prop, `wines: WineCardData[]`, alongside the existing `content` prop — it must not remove or revert Task 17's content wiring. The two full-file listings below are the correct end state after both Task 17 and Task 24 have landed, in that order.

Card field mapping: the wines table's `metaNl`/`metaEn` columns hold the card's short type/region line ("Wit · Pfalz, DE"), and `tagNl`/`tagEn` hold the card's short punchy tagline ("de klassieker" / "the classic") — this matches exactly what today's hardcoded card shows, per the schema as defined in Task 2.

**Files:**
- Modify: `lib/db/wines.ts` (add `getWinesForHomepage`, after the existing `reorderWines` export)
- Modify: `lib/db/wines.test.ts` (add a new `describe("getWinesForHomepage", ...)` block)
- Modify: `components/wines-preview.tsx` (add a `wines: WineCardData[]` prop alongside Task 17's existing `content: WinesContent` prop; replace the hardcoded `WINES` const and `WineCard`'s wine-shape usage with `WineCardData`)
- Modify: `app/(site)/page.tsx` (add a `getWinesForHomepage` fetch alongside Task 17's existing content fetches; pass both `content={winesContent}` and `wines={wines}` to `WinesPreview`)

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/wines.test.ts — add these imports and this describe block
import { createMedia } from "./media";
import { media } from "./schema";
// ...(existing imports and describe("wines repository", ...) block stay unchanged)...
import { getWinesForHomepage } from "./wines";

describe("getWinesForHomepage", () => {
  afterEach(async () => {
    await db.delete(wines);
    await db.delete(media);
  });

  it("joins the linked media row and excludes inactive wines", async () => {
    const image = await createMedia({
      storageKey: "media/riesling.jpg",
      filename: "riesling.jpg",
      altTextNl: "Riesling fles",
      altTextEn: "Riesling bottle",
      uploadedBy: null,
    });
    const active = await createWine(wineInput({ name: "Actief", imageId: image.id, isActive: true }));
    await createWine(wineInput({ name: "Inactief", isActive: false }));

    const rows = await getWinesForHomepage();

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(active.id);
    expect(rows[0].imageStorageKey).toBe("media/riesling.jpg");
    expect(rows[0].imageAltNl).toBe("Riesling fles");
  });

  it("returns an empty array when there are no active wines", async () => {
    await createWine(wineInput({ isActive: false }));
    expect(await getWinesForHomepage()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: FAIL — `getWinesForHomepage is not a function` (or a TypeScript "no exported member" error), since only `listWines`/`getWine`/`createWine`/`updateWine`/`deleteWine`/`reorderWines` exist so far.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/wines.ts — add after the existing reorderWines export
import { media } from "./schema"; // add to the existing `import { wines } from "./schema"` line instead: `import { media, wines } from "./schema"`

export type WineWithImage = Wine & {
  imageStorageKey: string | null;
  imageAltNl: string | null;
  imageAltEn: string | null;
};

export async function getWinesForHomepage(): Promise<WineWithImage[]> {
  return db
    .select({
      id: wines.id,
      name: wines.name,
      metaNl: wines.metaNl,
      metaEn: wines.metaEn,
      tagNl: wines.tagNl,
      tagEn: wines.tagEn,
      imageId: wines.imageId,
      shopifyHandle: wines.shopifyHandle,
      sortOrder: wines.sortOrder,
      isActive: wines.isActive,
      updatedAt: wines.updatedAt,
      imageStorageKey: media.storageKey,
      imageAltNl: media.altTextNl,
      imageAltEn: media.altTextEn,
    })
    .from(wines)
    .leftJoin(media, eq(wines.imageId, media.id))
    .where(eq(wines.isActive, true))
    .orderBy(asc(wines.sortOrder));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/wines.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit the repository change**

```bash
git add lib/db/wines.ts lib/db/wines.test.ts
git commit -m "feat: join media into getWinesForHomepage"
```

- [ ] **Step 6: Update `components/wines-preview.tsx`**

This keeps every piece Task 17 already wired (the `content: WinesContent` prop driving the label/heading/CTA) and adds the `wines: WineCardData[]` prop on top, replacing the hardcoded `WINES` array.

```tsx
// components/wines-preview.tsx (full file)
"use client";

import { useCallback } from "react";
import { useLanguage } from "@/lib/language";
import { useReveal } from "@/lib/use-reveal";
import { useMagnetic } from "@/lib/use-magnetic";
import type { WinesContent } from "@/lib/content/defaults";

export type WineCardData = {
  n: string;
  meta: string;
  name: string;
  nlTag: string;
  enTag: string;
  price: string;
  img: string;
  alt: string;
  delay: number;
};

function WineCard({ wine, lang }: { wine: WineCardData; lang: "nl" | "en" }) {
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

export function WinesPreview({ content, wines }: { content: WinesContent; wines: WineCardData[] }) {
  const { lang, t } = useLanguage();
  const heading1 = useReveal();
  const heading2 = useReveal(0.12);
  const cta = useReveal(0.2);
  const ctaMagnetic = useMagnetic();
  // The "Shop alle wijnen" link already carries the useReveal ref directly
  // (unlike the other magnetic targets, whose reveal refs sit on a
  // surrounding container). Compose both refs on the same node instead of
  // dropping either effect.
  const setCtaRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      cta.ref.current = node;
      ctaMagnetic.current = node;
    },
    [cta.ref, ctaMagnetic]
  );

  return (
    <section className="wines" id="wijnen">
      <div className="wines-head">
        <div>
          <div className="label rv in">
            {t(content.label.nl, content.label.en)} <span className="en">· made in Noord</span>
          </div>
          <h2>
            <span ref={heading1.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading1.isVisible ? " in" : ""}`}>
              <span>{t(content.heading_line1.nl, content.heading_line1.en)}</span>
            </span>
            <span ref={heading2.ref as React.RefObject<HTMLSpanElement>} className={`rv-line${heading2.isVisible ? " in" : ""}`}>
              <span>
                {t(content.heading_line2_lead.nl, content.heading_line2_lead.en)}
                <em>{t(content.heading_line2_em.nl, content.heading_line2_em.en)}</em>
              </span>
            </span>
          </h2>
        </div>
        <a ref={setCtaRef} className={`btn rv${cta.isVisible ? " in" : ""}`} href="#wijnen">
          {t(content.cta_label.nl, content.cta_label.en)} <span className="arr">→</span>
        </a>
      </div>
      <div className="wine-row">
        {wines.map((wine) => (
          <WineCard key={wine.n} wine={wine} lang={lang} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Update `app/(site)/page.tsx`**

This keeps every content fetch Task 17 already added (`heroContent` through `winesContent`) and adds the `getWinesForHomepage()` fetch on top, passing both `content` and `wines` to `WinesPreview`.

```tsx
// app/(site)/page.tsx (full file)
import { Hero } from "@/components/hero";
import { Manifest } from "@/components/manifest";
import { Process } from "@/components/process";
import { Paths } from "@/components/paths";
import { Place } from "@/components/place";
import { WinesPreview, type WineCardData } from "@/components/wines-preview";
import { getContent } from "@/lib/content/get-content";
import {
  HERO_DEFAULTS,
  MARQUEE_DEFAULTS,
  MANIFEST_DEFAULTS,
  PROCESS_DEFAULTS,
  PATHS_DEFAULTS,
  PLACE_DEFAULTS,
  WINES_DEFAULTS,
} from "@/lib/content/defaults";
import { getWinesForHomepage } from "@/lib/db/wines";
import { getPublicUrl } from "@/lib/storage/s3";

const WINE_PRICE_PLACEHOLDER = "vanaf shop.chateau.amsterdam";

export default async function HomePage() {
  const heroContent = await getContent("home", "hero", HERO_DEFAULTS);
  const marqueeContent = await getContent("home", "marquee", MARQUEE_DEFAULTS);
  const manifestContent = await getContent("home", "manifest", MANIFEST_DEFAULTS);
  const processContent = await getContent("home", "process", PROCESS_DEFAULTS);
  const pathsContent = await getContent("home", "paths", PATHS_DEFAULTS);
  const placeContent = await getContent("home", "place", PLACE_DEFAULTS);
  const winesContent = await getContent("home", "wines", WINES_DEFAULTS);

  const wineRows = await getWinesForHomepage();
  const wines: WineCardData[] = wineRows.map((wine, index) => ({
    n: `N°${String(index + 1).padStart(2, "0")}`,
    meta: wine.metaNl,
    name: wine.name,
    nlTag: wine.tagNl,
    enTag: wine.tagEn,
    price: WINE_PRICE_PLACEHOLDER,
    img: wine.imageStorageKey ? getPublicUrl(wine.imageStorageKey) : "/assets/wine-1.png",
    alt: wine.imageAltNl ?? wine.name,
    delay: index * 0.08,
  }));

  return (
    <>
      <Hero content={heroContent} marquee={marqueeContent} />
      <Manifest content={manifestContent} />
      <Process content={processContent} />
      <Paths content={pathsContent} />
      <WinesPreview content={winesContent} wines={wines} />
      <Place content={placeContent} />
    </>
  );
}
```

- [ ] **Step 8: Manual visual verification**

Before checking, use `/admin/wines` and `/admin/media` (Tasks 20/23) to recreate today's 5 wines with equivalent content — name, a `metaNl` value like "Wit · Pfalz, DE" (meta line), a `tagNl`/`tagEn` pair like "de klassieker" / "the classic" (tag line), the matching bottle photo from `public/assets/wine-1.png` through `wine-5.png` uploaded via the media library, a Shopify handle, active toggled on, and reorder them to match the original N°01–N°05 sequence.

Run `npm run dev`, open `/`, and compare against the pre-cutover rendering (`git stash` this task's changes, or check out the previous commit in a second worktree, to see the old hardcoded version side by side):
- Card count, order, and per-card meta/name/tag text match what was just entered in admin.
- Each card's image loads (bottle packshot, not broken).
- Price now reads "vanaf shop.chateau.amsterdam" on every card — this is the expected, spec-mandated behavior change from the old per-wine `€ xx,xx` prices, not a bug.
- Toggling language NL ↔ EN still correctly swaps the tag line only (mirrors today's exact behavior — `meta` stays as entered, not re-translated).
- Scroll-reveal animation and delay stagger across the row still fire per card (unaffected by the prop change).
- Untick "Actief" on one wine in `/admin/wines` and confirm it immediately disappears from `/` on next load (no caching), and the wine count in `/admin/wines` doesn't change (admin still sees it).
- The wines section's label, both heading lines, and the "Shop alle wijnen" CTA (wired in Task 17) still render correctly from `content_blocks` — this task's edits to the same file must not have regressed that wiring.

- [ ] **Step 9: Commit**

```bash
git add components/wines-preview.tsx app/(site)/page.tsx
git commit -m "feat: wire public WinesPreview to Postgres via getWinesForHomepage"
```

---

---

### Task 25: Reservations repository (`lib/db/reservations.ts`)

Strict TDD — this is branching status-transition logic, exactly what phase 1's testing philosophy flags as worth covering. Tests run against the real local Postgres (`DATABASE_URL`), not mocks; the relevant table is cleaned in `beforeEach`.

**Files:**
- Create: `lib/db/reservations.ts`
- Test: `lib/db/reservations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/reservations.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";
import {
  getReservation,
  isValidTransition,
  listReservations,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
  type ReservationTrack,
} from "./reservations";

describe("isValidTransition", () => {
  it.each([
    ["nieuw", "in_behandeling", true],
    ["nieuw", "afgewezen", true],
    ["nieuw", "bevestigd", false],
    ["nieuw", "nieuw", false],
    ["in_behandeling", "bevestigd", true],
    ["in_behandeling", "afgewezen", true],
    ["in_behandeling", "nieuw", false],
    ["in_behandeling", "in_behandeling", false],
    ["bevestigd", "nieuw", false],
    ["bevestigd", "in_behandeling", false],
    ["bevestigd", "afgewezen", false],
    ["afgewezen", "nieuw", false],
    ["afgewezen", "in_behandeling", false],
    ["afgewezen", "bevestigd", false],
  ] as [ReservationStatus, ReservationStatus, boolean][])(
    "%s -> %s is %s",
    (from, to, expected) => {
      expect(isValidTransition(from, to)).toBe(expected);
    }
  );
});

describe("reservations repository", () => {
  beforeEach(async () => {
    await db.delete(reservations);
  });

  async function insertReservation(
    overrides: Partial<{
      track: ReservationTrack;
      status: ReservationStatus;
      contactName: string;
      email: string;
      requestedDate: string;
    }> = {}
  ): Promise<Reservation> {
    const [row] = await db
      .insert(reservations)
      .values({
        track: "standaard",
        status: "nieuw",
        contactName: "Test Persoon",
        email: "test@example.com",
        requestedDate: "2026-08-01",
        ...overrides,
      })
      .returning();
    return row;
  }

  describe("listReservations", () => {
    it("returns reservations newest first", async () => {
      const first = await insertReservation({ contactName: "Eerst Ingevoerd" });
      const second = await insertReservation({ contactName: "Daarna Ingevoerd" });

      const result = await listReservations();

      expect(result.map((r) => r.id)).toEqual([second.id, first.id]);
    });

    it("filters by status", async () => {
      const nieuw = await insertReservation({ status: "nieuw" });
      await insertReservation({ status: "bevestigd" });

      const result = await listReservations({ status: "nieuw" });

      expect(result.map((r) => r.id)).toEqual([nieuw.id]);
    });

    it("filters by track", async () => {
      const zakelijk = await insertReservation({ track: "zakelijk" });
      await insertReservation({ track: "standaard" });

      const result = await listReservations({ track: "zakelijk" });

      expect(result.map((r) => r.id)).toEqual([zakelijk.id]);
    });

    it("filters by status and track combined", async () => {
      const match = await insertReservation({ track: "zakelijk", status: "in_behandeling" });
      await insertReservation({ track: "zakelijk", status: "nieuw" });
      await insertReservation({ track: "standaard", status: "in_behandeling" });

      const result = await listReservations({ track: "zakelijk", status: "in_behandeling" });

      expect(result.map((r) => r.id)).toEqual([match.id]);
    });
  });

  describe("getReservation", () => {
    it("returns the matching reservation", async () => {
      const created = await insertReservation({ contactName: "Vindbaar" });

      const result = await getReservation(created.id);

      expect(result?.contactName).toBe("Vindbaar");
    });

    it("returns null when no reservation matches", async () => {
      const result = await getReservation("00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("updateReservationStatus", () => {
    it("applies a valid transition", async () => {
      const created = await insertReservation({ status: "nieuw" });

      await updateReservationStatus(created.id, "in_behandeling");

      const updated = await getReservation(created.id);
      expect(updated?.status).toBe("in_behandeling");
    });

    it("throws on an invalid transition and leaves the status unchanged", async () => {
      const created = await insertReservation({ status: "bevestigd" });

      await expect(updateReservationStatus(created.id, "nieuw")).rejects.toThrow(
        /invalid status transition/i
      );

      const unchanged = await getReservation(created.id);
      expect(unchanged?.status).toBe("bevestigd");
    });

    it("throws when the reservation does not exist", async () => {
      await expect(
        updateReservationStatus("00000000-0000-0000-0000-000000000000", "in_behandeling")
      ).rejects.toThrow(/not found/i);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/reservations.test.ts`
Expected: FAIL — `Cannot find module './reservations'` (the implementation file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/reservations.ts
import { and, desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";

export type Reservation = InferSelectModel<typeof reservations>;
export type ReservationStatus = Reservation["status"];
export type ReservationTrack = Reservation["track"];

export const ALL_RESERVATION_STATUSES: ReservationStatus[] = [
  "nieuw",
  "in_behandeling",
  "bevestigd",
  "afgewezen",
];

// Forward transitions only. `bevestigd` and `afgewezen` are terminal — a
// request can be declined directly from `nieuw` (no need to pass through
// `in_behandeling` first), but nothing moves out of a confirmed or
// rejected reservation.
const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  nieuw: ["in_behandeling", "afgewezen"],
  in_behandeling: ["bevestigd", "afgewezen"],
  bevestigd: [],
  afgewezen: [],
};

export function isValidTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export async function listReservations(
  filters: { status?: ReservationStatus; track?: ReservationTrack } = {}
): Promise<Reservation[]> {
  const conditions = [];
  if (filters.status) conditions.push(eq(reservations.status, filters.status));
  if (filters.track) conditions.push(eq(reservations.track, filters.track));

  return db
    .select()
    .from(reservations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reservations.createdAt));
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const [row] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return row ?? null;
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const existing = await getReservation(id);
  if (!existing) {
    throw new Error(`Reservation not found: ${id}`);
  }
  if (!isValidTransition(existing.status, status)) {
    throw new Error(
      `Invalid status transition: cannot move reservation ${id} from "${existing.status}" to "${status}"`
    );
  }
  await db
    .update(reservations)
    .set({ status, updatedAt: new Date() })
    .where(eq(reservations.id, id));
}
```

Note: `updateReservationStatus` re-fetches the current row and re-checks `isValidTransition` itself rather than trusting a status passed in from the caller — this is the defense-in-depth the spec asks for. The Task 26 UI only ever offers buttons for statuses that already pass `isValidTransition`, but the repository doesn't rely on that; it enforces the rule again independently, so a stale page, a replayed form submission, or a future non-UI caller can't force an invalid transition.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/reservations.test.ts`
Expected: PASS, 23 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/reservations.ts lib/db/reservations.test.ts
git commit -m "feat: add reservations repository with status-transition rules"
```

---

### Task 26: Reservations inbox admin UI

**Files:**
- Create: `app/admin/reservations/actions.ts`
- Create: `app/admin/reservations/page.tsx`
- Create: `app/admin/reservations/[id]/page.tsx`

- [ ] **Step 1: Write `app/admin/reservations/actions.ts`**

```ts
// app/admin/reservations/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { updateReservationStatus, type ReservationStatus } from "@/lib/db/reservations";

export async function updateStatus(id: string, status: ReservationStatus): Promise<void> {
  await updateReservationStatus(id, status);
  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
}
```

- [ ] **Step 2: Write `app/admin/reservations/page.tsx`**

```tsx
// app/admin/reservations/page.tsx
import Link from "next/link";
import { listReservations, type ReservationStatus, type ReservationTrack } from "@/lib/db/reservations";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const STATUS_BADGE_CLASSES: Record<ReservationStatus, string> = {
  nieuw: "bg-blue-100 text-blue-800",
  in_behandeling: "bg-amber-100 text-amber-800",
  bevestigd: "bg-green-100 text-green-800",
  afgewezen: "bg-red-100 text-red-800",
};

const TRACK_LABELS: Record<ReservationTrack, string> = {
  standaard: "Standaard",
  zakelijk: "Zakelijk",
};

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];
const ALL_TRACKS: ReservationTrack[] = ["standaard", "zakelijk"];

function filterHref(
  current: { status?: string; track?: string },
  next: { status?: string; track?: string }
): string {
  const params = new URLSearchParams();
  const status = "status" in next ? next.status : current.status;
  const track = "track" in next ? next.track : current.track;
  if (status) params.set("status", status);
  if (track) params.set("track", track);
  const qs = params.toString();
  return qs ? `/admin/reservations?${qs}` : "/admin/reservations";
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; track?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as ReservationStatus | undefined;
  const track = params.track as ReservationTrack | undefined;

  const reservationList = await listReservations({ status, track });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Reserveringen</h1>

      <div className="flex flex-wrap gap-6 mb-6 text-sm">
        <div className="flex gap-2 items-center">
          <span className="text-neutral-500">Status:</span>
          <Link href={filterHref(params, { status: undefined })} className={!status ? "font-semibold underline" : "underline"}>
            Alle
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={filterHref(params, { status: s })}
              className={status === s ? "font-semibold underline" : "underline"}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-neutral-500">Track:</span>
          <Link href={filterHref(params, { track: undefined })} className={!track ? "font-semibold underline" : "underline"}>
            Alle
          </Link>
          {ALL_TRACKS.map((tr) => (
            <Link
              key={tr}
              href={filterHref(params, { track: tr })}
              className={track === tr ? "font-semibold underline" : "underline"}
            >
              {TRACK_LABELS[tr]}
            </Link>
          ))}
        </div>
      </div>

      {reservationList.length === 0 ? (
        <p className="text-neutral-500">Geen reserveringen gevonden.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-neutral-200">
              <th className="py-2 pr-4">Naam</th>
              <th className="py-2 pr-4">Track</th>
              <th className="py-2 pr-4">Gewenste datum</th>
              <th className="py-2 pr-4">Periode</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservationList.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 pr-4">
                  <Link href={`/admin/reservations/${r.id}`} className="underline">
                    {r.contactName}
                  </Link>
                </td>
                <td className="py-2 pr-4">{TRACK_LABELS[r.track]}</td>
                <td className="py-2 pr-4">{r.requestedDate}</td>
                <td className="py-2 pr-4">{r.preferredPeriod ?? "-"}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_BADGE_CLASSES[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `app/admin/reservations/[id]/page.tsx`**

```tsx
// app/admin/reservations/[id]/page.tsx
import { notFound } from "next/navigation";
import { getReservation, isValidTransition, type ReservationStatus } from "@/lib/db/reservations";
import { updateStatus } from "../actions";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  nieuw: "Nieuw",
  in_behandeling: "In behandeling",
  bevestigd: "Bevestigd",
  afgewezen: "Afgewezen",
};

const ALL_STATUSES: ReservationStatus[] = ["nieuw", "in_behandeling", "bevestigd", "afgewezen"];

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getReservation(id);
  if (!reservation) notFound();

  const nextStatuses = ALL_STATUSES.filter((s) => isValidTransition(reservation.status, s));

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">{reservation.contactName}</h1>
      <p className="text-neutral-500 mb-6">{reservation.email}</p>

      <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mb-8">
        <dt className="text-neutral-500">Track</dt>
        <dd>{reservation.track === "standaard" ? "Standaard" : "Zakelijk"}</dd>

        <dt className="text-neutral-500">Status</dt>
        <dd>{STATUS_LABELS[reservation.status]}</dd>

        <dt className="text-neutral-500">Telefoon</dt>
        <dd>{reservation.phone ?? "-"}</dd>

        <dt className="text-neutral-500">Gezelschapsgrootte</dt>
        <dd>{reservation.partySize ?? "-"}</dd>

        <dt className="text-neutral-500">Groepsgrootte</dt>
        <dd>{reservation.groupSize ?? "-"}</dd>

        <dt className="text-neutral-500">Bedrijf</dt>
        <dd>{reservation.companyName ?? "-"}</dd>

        <dt className="text-neutral-500">Gelegenheid</dt>
        <dd>{reservation.occasion ?? "-"}</dd>

        <dt className="text-neutral-500">Gewenste datum</dt>
        <dd>{reservation.requestedDate}</dd>

        <dt className="text-neutral-500">Gewenste periode</dt>
        <dd>{reservation.preferredPeriod ?? "-"}</dd>

        <dt className="text-neutral-500">Notities</dt>
        <dd>{reservation.notes ?? "-"}</dd>
      </dl>

      {nextStatuses.length > 0 ? (
        <div className="flex gap-3">
          {nextStatuses.map((s) => (
            <form key={s} action={updateStatus.bind(null, reservation.id, s)}>
              <button
                type="submit"
                className="border border-neutral-900 rounded-full px-4 py-2 text-sm hover:bg-neutral-900 hover:text-white"
              >
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">Deze reservering is afgehandeld — er zijn geen vervolgstappen.</p>
      )}
    </div>
  );
}
```

Note: `updateStatus.bind(null, reservation.id, s)` fully saturates the Server Action's two declared parameters (`id`, `status`) before it's ever used as a form `action`. React still invokes the bound function with the submitted `FormData` at click time, but since `updateStatus` only declares two parameters, that extra argument is simply ignored — there's no hidden-input wiring needed for this button-only flow. Only statuses that pass `isValidTransition(reservation.status, s)` ever get a button, so the repository's defense-in-depth check in `updateReservationStatus` (Task 25) should never actually fire from this UI — it's there for any other caller.

- [ ] **Step 4: Verify the project typechecks, then manually verify in the browser**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev`, then with a seeded database (Task 27) open `http://localhost:3000/admin/reservations` (logged in via the existing admin session):
- Confirm the list shows contact name, track, requested date/period, and a status badge for each row.
- Click the "Zakelijk" and "In behandeling" filter links and confirm the query string updates (`?track=zakelijk&status=in_behandeling`) and the list narrows accordingly.
- Click into a `nieuw` reservation's detail page and confirm it offers exactly two buttons: "In behandeling" and "Afgewezen".
- Click "In behandeling", confirm the page reloads showing status "In behandeling" and now offers "Bevestigd" and "Afgewezen".
- Open a `bevestigd` reservation's detail page and confirm no status buttons are shown at all (terminal state).

- [ ] **Step 5: Commit**

```bash
git add app/admin/reservations/actions.ts app/admin/reservations/page.tsx "app/admin/reservations/[id]/page.tsx"
git commit -m "feat: add reservations inbox admin UI"
```

---

### Task 27: Reservations seed script (`scripts/seed/reservations.ts`)

Exports a re-runnable `seedReservations()` — not standalone runnable yet; a later integration task wires all seed modules (users, content, wines, reservations) together behind one entry point. Written with a real test against Task 25's repository so the seed shape (both tracks, spread across statuses) is actually verified rather than assumed.

**Files:**
- Create: `scripts/seed/reservations.ts`
- Test: `scripts/seed/reservations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// scripts/seed/reservations.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";
import { listReservations } from "@/lib/db/reservations";
import { seedReservations } from "./reservations";

describe("seedReservations", () => {
  beforeEach(async () => {
    await db.delete(reservations);
  });

  it("seeds at least two standaard-track reservations, including one nieuw and one bevestigd", async () => {
    await seedReservations();

    const standaard = await listReservations({ track: "standaard" });

    expect(standaard.length).toBeGreaterThanOrEqual(2);
    expect(standaard.some((r) => r.status === "nieuw")).toBe(true);
    expect(standaard.some((r) => r.status === "bevestigd")).toBe(true);
  });

  it("seeds at least two zakelijk-track reservations, including one nieuw and one in_behandeling", async () => {
    await seedReservations();

    const zakelijk = await listReservations({ track: "zakelijk" });

    expect(zakelijk.length).toBeGreaterThanOrEqual(2);
    expect(zakelijk.some((r) => r.status === "nieuw")).toBe(true);
    expect(zakelijk.some((r) => r.status === "in_behandeling")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/seed/reservations.test.ts`
Expected: FAIL — `Cannot find module './reservations'` (the implementation file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// scripts/seed/reservations.ts
import { db } from "@/lib/db/client";
import { reservations } from "@/lib/db/schema";

export async function seedReservations(): Promise<void> {
  await db.insert(reservations).values([
    {
      track: "standaard",
      status: "nieuw",
      contactName: "Sanne de Vries",
      email: "sanne.devries@gmail.com",
      phone: "+31 6 12345678",
      partySize: 4,
      occasion: "30ste verjaardag",
      preferredPeriod: "Avond",
      requestedDate: "2026-08-14",
      notes: "Viert haar verjaardag met een groepje vriendinnen, graag een rustig hoekje.",
    },
    {
      track: "standaard",
      status: "bevestigd",
      contactName: "Mark Jansen",
      email: "mark.jansen@outlook.com",
      phone: "+31 6 23456789",
      partySize: 2,
      occasion: "5-jarig huwelijksjubileum",
      preferredPeriod: "Middag",
      requestedDate: "2026-07-25",
      notes: "Tafel bij het raam graag, als dat kan.",
    },
    {
      track: "zakelijk",
      status: "nieuw",
      contactName: "Willem Bakker",
      email: "willem.bakker@bakkerpartners.nl",
      phone: "+31 20 6543210",
      companyName: "Bakker & Partners Advocaten",
      groupSize: 12,
      occasion: "Kantooruitje",
      preferredPeriod: "Ochtend",
      requestedDate: "2026-09-02",
      notes: "Zoekt een proeverij gecombineerd met een korte rondleiding.",
    },
    {
      track: "zakelijk",
      status: "in_behandeling",
      contactName: "Fatima El Amrani",
      email: "fatima.elamrani@vandermeerconsultancy.nl",
      phone: "+31 6 34567890",
      companyName: "Van der Meer Consultancy",
      groupSize: 25,
      occasion: "Kwartaalborrel",
      preferredPeriod: "Avond",
      requestedDate: "2026-08-20",
      notes: "Wil een proeverij combineren met een borrel voor het hele team.",
    },
  ]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/seed/reservations.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/reservations.ts scripts/seed/reservations.test.ts
git commit -m "feat: add reservations seed data for admin inbox demonstration"
```

---

### Task 28: Availability repository (`lib/db/availability.ts`)

Strict TDD — `toggleBlock`'s toggle-by-existence-check is real logic worth testing directly, and `listBlocksForMonth`'s date-range boundary is exactly the kind of off-by-one that's cheap to catch here and expensive to catch later (it's also the same class of bug — an unflagged date — that motivated this feature in the first place). Tests run against the real local Postgres, with the table cleaned in `beforeEach`.

**Files:**
- Create: `lib/db/availability.ts`
- Test: `lib/db/availability.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/db/availability.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";
import { listBlocksForMonth, toggleBlock } from "./availability";

describe("availability repository", () => {
  beforeEach(async () => {
    await db.delete(availabilityBlocks);
  });

  describe("listBlocksForMonth", () => {
    it("returns only blocks within the given month", async () => {
      await db.insert(availabilityBlocks).values([
        { date: "2026-07-31", daypart: "avond", reason: "Voor de maand" },
        { date: "2026-08-01", daypart: "ochtend", reason: "Eerste dag" },
        { date: "2026-08-15", daypart: "middag", reason: "Midden" },
        { date: "2026-08-31", daypart: "hele_dag", reason: "Laatste dag" },
        { date: "2026-09-01", daypart: "ochtend", reason: "Na de maand" },
      ]);

      const blocks = await listBlocksForMonth(2026, 8);
      const dates = blocks.map((b) => b.date).sort();

      expect(dates).toEqual(["2026-08-01", "2026-08-15", "2026-08-31"]);
    });

    it("returns an empty array when there are no blocks in the month", async () => {
      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toEqual([]);
    });
  });

  describe("toggleBlock", () => {
    it("creates a block when none exists for that date and daypart", async () => {
      const result = await toggleBlock("2026-08-10", "avond", "Personeelsfeest");
      expect(result).toEqual({ blocked: true });

      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({ date: "2026-08-10", daypart: "avond" });
    });

    it("removes the block when toggled again for the same date and daypart", async () => {
      const first = await toggleBlock("2026-08-10", "avond");
      expect(first).toEqual({ blocked: true });

      const second = await toggleBlock("2026-08-10", "avond");
      expect(second).toEqual({ blocked: false });

      const blocks = await listBlocksForMonth(2026, 8);
      expect(blocks).toEqual([]);
    });

    it("keeps dayparts independent for the same date", async () => {
      await toggleBlock("2026-08-10", "ochtend");
      await toggleBlock("2026-08-10", "avond");

      const blocks = await listBlocksForMonth(2026, 8);
      const dayparts = blocks.map((b) => b.daypart).sort();

      expect(dayparts).toEqual(["avond", "ochtend"]);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/db/availability.test.ts`
Expected: FAIL — `Cannot find module './availability'` (the implementation file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/db/availability.ts
import { and, eq, gte, lt } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { availabilityBlocks } from "@/lib/db/schema";

export type AvailabilityBlock = InferSelectModel<typeof availabilityBlocks>;
export type Daypart = AvailabilityBlock["daypart"];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export async function listBlocksForMonth(year: number, month: number): Promise<AvailabilityBlock[]> {
  const start = `${year}-${pad(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${pad(nextMonth)}-01`;

  return db
    .select()
    .from(availabilityBlocks)
    .where(and(gte(availabilityBlocks.date, start), lt(availabilityBlocks.date, end)));
}

export async function toggleBlock(
  date: string,
  daypart: Daypart,
  reason?: string
): Promise<{ blocked: boolean }> {
  const [existing] = await db
    .select()
    .from(availabilityBlocks)
    .where(and(eq(availabilityBlocks.date, date), eq(availabilityBlocks.daypart, daypart)))
    .limit(1);

  if (existing) {
    await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, existing.id));
    return { blocked: false };
  }

  await db.insert(availabilityBlocks).values({ date, daypart, reason });
  return { blocked: true };
}
```

Note: `listBlocksForMonth` compares the `date` column against `YYYY-MM-DD` string boundaries with `gte`/`lt` (half-open range) rather than a `BETWEEN`-style inclusive-inclusive comparison — that's what the boundary test above actually exercises (a block on the last day of the target month must be included, one on the first day of the next month must not). `toggleBlock` relies on the `(date, daypart)` unique index already defined on `availability_blocks` only as a safety net; the existence check here is what makes the toggle behavior itself correct even without that constraint, and the constraint is what protects against a race between two concurrent toggles.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/db/availability.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/db/availability.ts lib/db/availability.test.ts
git commit -m "feat: add availability repository with month listing and toggle"
```

---

### Task 29: Availability calendar admin UI

**Files:**
- Create: `app/admin/availability/actions.ts`
- Create: `app/admin/availability/page.tsx`

- [ ] **Step 1: Write `app/admin/availability/actions.ts`**

```ts
// app/admin/availability/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { toggleBlock, type Daypart } from "@/lib/db/availability";

export async function toggleAvailability(date: string, daypart: Daypart, reason?: string): Promise<void> {
  await toggleBlock(date, daypart, reason);
  revalidatePath("/admin/availability");
}
```

- [ ] **Step 2: Write `app/admin/availability/page.tsx`**

```tsx
// app/admin/availability/page.tsx
import Link from "next/link";
import { listBlocksForMonth, type Daypart } from "@/lib/db/availability";
import { toggleAvailability } from "./actions";

const DAYPARTS: Daypart[] = ["ochtend", "middag", "avond", "hele_dag"];

const DAYPART_LABELS: Record<Daypart, string> = {
  ochtend: "Ochtend",
  middag: "Middag",
  avond: "Avond",
  hele_dag: "Hele dag",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseMonthParam(month?: string): { year: number; month: number } {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Date.getDay() is 0=Sunday..6=Saturday; convert to a Monday-first index
// (0=Monday..6=Sunday) to match the NL week-start convention used below.
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function adjacentMonth(year: number, month: number, delta: number): string {
  const total = year * 12 + (month - 1) + delta;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${pad(m)}`;
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);

  const blocks = await listBlocksForMonth(year, month);
  const blockedByDate = new Map<string, Set<Daypart>>();
  for (const block of blocks) {
    const set = blockedByDate.get(block.date) ?? new Set<Daypart>();
    set.add(block.daypart);
    blockedByDate.set(block.date, set);
  }

  const total = daysInMonth(year, month);
  const firstWeekday = mondayFirstWeekday(new Date(year, month - 1, 1));
  const leadingBlanks = Array.from({ length: firstWeekday });
  const days = Array.from({ length: total }, (_, i) => i + 1);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold capitalize">{monthLabel}</h1>
        <div className="flex gap-4 text-sm">
          <Link href={`/admin/availability?month=${adjacentMonth(year, month, -1)}`}>&larr; Vorige</Link>
          <Link href={`/admin/availability?month=${adjacentMonth(year, month, 1)}`}>Volgende &rarr;</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((label) => (
          <div key={label} className="text-xs font-semibold text-neutral-500 text-center pb-1">
            {label}
          </div>
        ))}

        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const blockedSet = blockedByDate.get(dateStr) ?? new Set<Daypart>();

          return (
            <div key={dateStr} className="border border-neutral-200 rounded p-2 min-h-[110px] text-xs">
              <div className="font-semibold mb-1">{day}</div>
              <div className="flex flex-col gap-1">
                {DAYPARTS.map((daypart) => {
                  const blocked = blockedSet.has(daypart);
                  return (
                    <form key={daypart} action={toggleAvailability.bind(null, dateStr, daypart, undefined)}>
                      <button
                        type="submit"
                        className={`w-full text-left px-1.5 py-0.5 rounded ${
                          blocked ? "bg-red-100 text-red-800" : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {DAYPART_LABELS[daypart]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Note: `toggleAvailability.bind(null, dateStr, daypart, undefined)` binds all three of the action's declared parameters up front, including an explicit `undefined` for the optional `reason` — this grid has no reason-input field, only toggle buttons. Binding all three matters: if `reason` were left unbound, React would pass the submitted `FormData` object into that slot at call time (since form actions always call the bound function with the FormData as the next positional argument), and `reason` would silently become a stringified `FormData` instead of `undefined`. Binding it explicitly means the FormData React passes at submit time lands in a fourth, undeclared argument that `toggleAvailability` simply ignores.

- [ ] **Step 3: Verify the project typechecks, then manually verify in the browser**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev`, then open `http://localhost:3000/admin/availability`:
- Confirm the current month renders as a 7-column grid starting on Monday, with the correct number of leading blank cells before day 1.
- Click a few daypart buttons on different dates (e.g. "Avond" on one date, "Ochtend" and "Middag" on another) and confirm each button's background switches from neutral to the blocked (red) state immediately.
- Reload the page (full browser refresh, not just client navigation) and confirm the same cells still show as blocked — this proves the grid is reading real state back from Postgres via `listBlocksForMonth`, not just retaining client-side state.
- Click a blocked button again and confirm it toggles back to unblocked, and that this also survives a reload.
- Use the "Volgende" / "Vorige" links to navigate to an adjacent month and confirm the URL updates to `?month=YYYY-MM` and the grid re-renders for that month with no blocks shown (a fresh month has none yet).

- [ ] **Step 4: Commit**

```bash
git add app/admin/availability/actions.ts app/admin/availability/page.tsx
git commit -m "feat: add availability calendar admin UI"
```

---

### Task 30: Rate limiting on `/admin/login`

The spec's Security section calls for "basic in-memory rate limiting on `/admin/login` attempts" — Task 8 built the login flow itself but didn't cover this. An in-memory limiter is appropriate here (matches the spec's own "basic" framing): the app runs as a single long-lived Node process per Railway replica (`next start`, not per-request edge functions), so a module-level `Map` persists across requests within a process. It resets on redeploy/restart and doesn't share state across multiple replicas — an acceptable tradeoff for a 4-person internal tool's login page, not something to over-engineer with a shared store like Redis.

**Files:**
- Create: `lib/auth/rate-limit.ts`
- Test: `lib/auth/rate-limit.test.ts`
- Modify: `app/admin/login/actions.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/auth/rate-limit.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, recordFailedAttempt, resetRateLimiter } from "./rate-limit";

beforeEach(() => {
  resetRateLimiter();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit / recordFailedAttempt", () => {
  it("allows the first attempt for a key with no prior failures", () => {
    expect(checkRateLimit("test@chateau.amsterdam")).toEqual({ allowed: true });
  });

  it("allows up to 5 failed attempts, then blocks the 6th", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test@chateau.amsterdam")).toEqual({ allowed: true });
      recordFailedAttempt("test@chateau.amsterdam");
    }
    const result = checkRateLimit("test@chateau.amsterdam");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks attempts independently per key", () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt("locked-out@chateau.amsterdam");
    }
    expect(checkRateLimit("locked-out@chateau.amsterdam").allowed).toBe(false);
    expect(checkRateLimit("someone-else@chateau.amsterdam").allowed).toBe(true);
  });

  it("resets the block after the lockout window passes", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt("windowed@chateau.amsterdam");
    }
    expect(checkRateLimit("windowed@chateau.amsterdam").allowed).toBe(false);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    expect(checkRateLimit("windowed@chateau.amsterdam").allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/rate-limit.test.ts`
Expected: FAIL — `Cannot find module './rate-limit'`.

- [ ] **Step 3: Write `lib/auth/rate-limit.ts`**

```ts
// lib/auth/rate-limit.ts
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { count: number; firstAttemptAt: number };

let attempts = new Map<string, Entry>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const entry = attempts.get(key);
  if (!entry) {
    return { allowed: true };
  }

  const elapsed = Date.now() - entry.firstAttemptAt;
  if (elapsed > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - elapsed };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function resetRateLimiter(): void {
  attempts = new Map();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/rate-limit.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Wire it into the login action**

```ts
// app/admin/login/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";
import { checkRateLimit, recordFailedAttempt } from "@/lib/auth/rate-limit";

export async function login(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Vul e-mailadres en wachtwoord in.";
  }

  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    return `Te veel mislukte inlogpogingen. Probeer het over ${minutes} minuten opnieuw.`;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    recordFailedAttempt(email);
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(email);
    return "Onjuiste combinatie van e-mailadres en wachtwoord.";
  }

  const { token } = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/admin/content");
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`. At `/admin/login`, submit the wrong password 5 times in a row for a seeded account, then try a 6th time (even with the correct password).
Expected: the 6th attempt shows "Te veel mislukte inlogpogingen. Probeer het over 15 minuten opnieuw." instead of logging in — confirms the lockout blocks correct credentials too, not just wrong ones, until the window passes.

- [ ] **Step 7: Commit**

```bash
git add lib/auth/rate-limit.ts lib/auth/rate-limit.test.ts app/admin/login/actions.ts
git commit -m "feat: add in-memory rate limiting on /admin/login"
```

---

### Task 31: Combined seed script, production migration, and deploy

Every earlier task built and tested one piece against the local docker-compose Postgres. This final task wires the seed modules together behind the `npm run db:seed` entry point Task 1 already pointed at `scripts/seed.ts`, then takes the whole CMS live: applies the same migrations to Railway's production Postgres, seeds it with real starting content, and verifies the deployed site end-to-end.

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Write `scripts/seed.ts`**

```ts
// scripts/seed.ts
import "dotenv/config";
import { seedUsers } from "./seed/users";
import { seedContent } from "./seed/content";
import { seedReservations } from "./seed/reservations";

async function main() {
  await seedUsers();
  await seedContent();
  await seedReservations();
  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the combined seed against local Postgres**

Run: `docker compose up -d postgres && npm run db:migrate && npm run db:seed`
Expected: prints `Migrations applied.`, 4 `[seed:users] ...` lines with temporary passwords, then `Seed complete.` with no errors. Re-running `npm run db:seed` a second time must also succeed with no errors (every seed module is upsert-based or safe to re-run per its own task).

- [ ] **Step 3: Full local regression pass**

Run: `npx vitest run`
Expected: every test file across the whole plan passes — the pre-existing phase-1 suite (19 tests) plus every test added in Tasks 3–29. No skipped or failing tests.

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: production build succeeds for both the `(site)` route group and `/admin`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: wire seed modules together behind npm run db:seed"
```

- [ ] **Step 5: Apply migrations to Railway's production Postgres**

Production `DATABASE_URL` (private, `postgres.railway.internal`) is only reachable from inside the Railway project's network, not from this machine — use `DATABASE_PUBLIC_URL` (the public proxy, already set on the `chateau-amsterdam-2.0` service and readable via `railway variable list --service chateau-amsterdam-2.0 --json`) for this one-time local run against production data.

Run:
```bash
DATABASE_URL="$(railway variable list --service chateau-amsterdam-2.0 --json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).DATABASE_PUBLIC_URL))')" npx tsx scripts/migrate.ts
```
Expected: prints `Migrations applied.` — this creates all 7 tables and 3 enum types on the real production database for the first time.

- [ ] **Step 6: Seed production**

Run the same combined seed against production, using the same `DATABASE_PUBLIC_URL` override:
```bash
DATABASE_URL="$(railway variable list --service chateau-amsterdam-2.0 --json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).DATABASE_PUBLIC_URL))')" npx tsx scripts/seed.ts
```
Expected: `Seed complete.` — production now has the 4 real admin accounts (placeholder emails/passwords, logged to this run's console — copy these somewhere safe immediately, then hand the real client accounts' credentials to the team before go-live and delete/rotate the placeholders), today's real homepage copy in `content_blocks`, and 4 sample reservations for the inbox demo. No wines are seeded (per Task 24, wines are entered manually through `/admin/wines` — do that now against production, recreating the 5 real wines with real bottle photos uploaded through `/admin/media`, so the live public site shows real wines rather than an empty collection).

- [ ] **Step 7: Push to main and verify Railway's auto-deploy**

```bash
git push origin main
```

Run: `railway logs --service chateau-amsterdam-2.0 --lines 50` (repeat every ~30s until a new deployment appears)
Expected: a new deployment builds and goes live, replacing the running phase-1-only version.

- [ ] **Step 8: End-to-end verification against the live production URL**

Open `https://chateau-amsterdam-homepage-production.up.railway.app/` in a browser:
- The homepage renders identically to the pre-CMS version (same text, same wines, same images) — confirms the seed matches what was live before.
- Toggle NL/EN and confirm every section's text still switches correctly.

Open `https://chateau-amsterdam-homepage-production.up.railway.app/admin/login`:
- Log in with one of the real seeded accounts.
- Edit one piece of homepage text in `/admin/content`, save, and confirm it's immediately live on `/` (open a second tab).
- Confirm `/admin/wines`, `/admin/reservations` (showing the 4 seeded sample requests), `/admin/availability`, and `/admin/media` all load without error.
- Log out and confirm `/admin/content` redirects back to `/admin/login`.

Expected: every check above passes with no console errors, on both desktop and a mobile-width viewport (per the original spec's mobile-first requirement).

- [ ] **Step 9: Record the rollout in the plan**

No commit needed for this step — it's a manual note for whoever reviews this plan afterward: confirm in your final report that the 4 placeholder admin passwords logged in Step 6 have been safely handed off or rotated, since they were printed to a terminal and must not be left as the permanent credentials.
