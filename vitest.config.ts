import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    // Several test files exercise the same real Postgres tables (users, sessions) with
    // table-wide beforeEach/afterEach cleanup. Running test files in parallel lets one
    // file's cleanup race another file's assertions (e.g. sessions cascade-deleted when
    // another file's users cleanup fires mid-test). Force serial file execution so the
    // shared local DB behaves deterministically.
    fileParallelism: false,
  },
});
