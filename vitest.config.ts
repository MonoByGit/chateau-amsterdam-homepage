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
    // .worktrees/** holds full checkouts of other branches nested inside this
    // repo's own directory (gitignored, local-only) — without this exclude,
    // vitest's default glob picks up their test files too and loads a second
    // copy of React from their node_modules alongside this one.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/.worktrees/**",
    ],
    // Several test files exercise the same real Postgres tables (users, sessions) with
    // table-wide beforeEach/afterEach cleanup. Running test files in parallel lets one
    // file's cleanup race another file's assertions (e.g. sessions cascade-deleted when
    // another file's users cleanup fires mid-test). Force serial file execution so the
    // shared local DB behaves deterministically.
    fileParallelism: false,
  },
});
