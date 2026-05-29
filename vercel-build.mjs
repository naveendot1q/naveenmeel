import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });

console.log("[build] root:", root);

// 1. Install deps
console.log("[build] npm install (api)...");
run("npm install", join(root, "api"));

console.log("[build] npm install (frontend)...");
run("npm install", join(root, "frontend"));

// 2. Bundle API → dist/api/index.mjs  (Vercel serves files from outputDirectory)
console.log("[build] bundling API...");
const apiBundleDir = join(root, "dist", "api");
mkdirSync(apiBundleDir, { recursive: true });

run(
  [
    "node_modules/.bin/esbuild", "src/vercel.ts",
    "--bundle",
    "--platform=node",
    "--target=node20",
    "--format=esm",
    `--outfile=${apiBundleDir}/index.mjs`,
    "--external:pg-native",
    `--banner:js=import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  ].join(" "),
  join(root, "api")
);

// 3. Build frontend → frontend/dist
console.log("[build] building frontend...");
run("node_modules/.bin/vite build", join(root, "frontend"));

// 4. Copy frontend dist files → root dist/  (don't overwrite dist/api)
console.log("[build] copying frontend → dist/...");
const frontendDist = join(root, "frontend", "dist");
if (existsSync(frontendDist)) {
  cpSync(frontendDist, join(root, "dist"), { recursive: true });
}

console.log("[build] ✓ done");
