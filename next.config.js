import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Without this, Next.js/Turbopack infers the workspace root from the
  // nearest lockfile up the directory tree — which found an unrelated
  // pnpm-lock.yaml at /Users/idusty and treated the entire home directory
  // as the project root, making the dev server scan/watch everything
  // under it (every other project, iCloud-synced folders, etc.). Pinning
  // it here is what actually fixes the severe dev-server slowness, not
  // just the console warning.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
