// Side-effect module: loads .env.local before any sibling import in the
// importing file is evaluated. ESM hoists module evaluation ahead of an
// importing script's own top-level statements, so a plain
// `config({ path: ".env.local" })` call written *after* other imports in
// the same file runs too late if any of those imports read
// process.env.DATABASE_URL at their own module-load time (as
// lib/db/client.ts does). Importing this module first — as a bare
// `import "./load-env"` — makes the .env.local load happen during this
// module's own evaluation, which per ESM's declaration-order evaluation
// always completes before later-declared sibling imports are evaluated.
import { config } from "dotenv";

config({ path: ".env.local" });
