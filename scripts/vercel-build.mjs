/**
 * Vercel build script.
 * 1. Builds the Express API into api/index.mjs (pre-compiled, no TS needed at runtime).
 * 2. Builds the React frontend and copies it to dist/ for static serving.
 */
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
console.log("[vercel-build] CWD:", root);
console.log("[vercel-build] Root contents:", readdirSync(root).join(", "));

// Step 1: build the API bundle (outputs api/index.mjs + pino helpers)
console.log("[vercel-build] Building API bundle...");
execSync("pnpm --filter @workspace/api-server run build:vercel", {
  stdio: "inherit",
  cwd: root,
});
console.log("[vercel-build] api/ contents:", readdirSync(join(root, "api")).join(", "));

// Step 2: build the frontend
console.log("[vercel-build] Building frontend...");
execSync("pnpm --filter @workspace/naveen-blog run build", {
  stdio: "inherit",
  cwd: root,
});

// Step 3: copy frontend output to repo-root dist/ (vercel.json#outputDirectory)
const candidates = [
  join(root, "artifacts", "naveen-blog", "dist"),
  join(root, "dist"),
];
const src = candidates.find((p) => existsSync(p) && p !== join(root, "dist"));
if (!src) {
  console.error("[vercel-build] Frontend output not found. Checked:", candidates);
  process.exit(1);
}
console.log("[vercel-build] Frontend output at:", src);
console.log("[vercel-build] Contents:", readdirSync(src).join(", "));

const dest = join(root, "dist");
if (src !== dest) {
  console.log("[vercel-build] Copying to:", dest);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  console.log("[vercel-build] dist/ contents:", readdirSync(dest).join(", "));
} else {
  console.log("[vercel-build] Already at dest, nothing to copy.");
}

console.log("[vercel-build] Done.");
