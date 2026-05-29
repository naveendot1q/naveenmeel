import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });

console.log("[build] root:", root);

// ── 1. Install API deps ───────────────────────────────────
console.log("[build] npm install (api)...");
run("npm install", join(root, "api"));

// ── 2. Install frontend deps ──────────────────────────────
console.log("[build] npm install (frontend)...");
run("npm install", join(root, "frontend"));

// ── 3. Bundle API with esbuild (now installed) ────────────
console.log("[build] bundling API...");
run(
  `node_modules/.bin/esbuild src/vercel.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --format=esm \
    --outfile=dist/index.mjs \
    --external:pg-native \
    --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"`,
  join(root, "api")
);

// ── 4. Build frontend ─────────────────────────────────────
console.log("[build] building frontend...");
run("node_modules/.bin/vite build", join(root, "frontend"));

// ── 5. Copy frontend dist → root dist/ ───────────────────
const src = join(root, "frontend", "dist");
const dest = join(root, "dist");
if (existsSync(src)) {
  console.log("[build] copying frontend dist → root dist/...");
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}

console.log("[build] ✓ done");
