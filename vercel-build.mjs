import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });

console.log("[build] root:", root);

// 1. Install deps
console.log("[build] npm install (api)...");
run("npm install", join(root, "api"));

console.log("[build] npm install (frontend)...");
run("npm install", join(root, "frontend"));

// 2. Bundle API using esbuild JS API (avoids all shell-quoting issues)
console.log("[build] bundling API...");
const apiBundleDir = join(root, "dist", "api");
mkdirSync(apiBundleDir, { recursive: true });

// Load esbuild from the api's own node_modules (just installed)
const require = createRequire(import.meta.url);
const esbuild = require(join(root, "api", "node_modules", "esbuild"));

await esbuild.build({
  entryPoints: [join(root, "api", "src", "vercel.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: join(apiBundleDir, "index.mjs"),
  external: ["pg-native"],
  banner: {
    js: `import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);`,
  },
});

console.log("[build] API bundled ✓");

// 3. Build frontend
console.log("[build] building frontend...");
run("node_modules/.bin/vite build", join(root, "frontend"));

// 4. Copy frontend dist → root dist/ (dist/api stays untouched)
console.log("[build] copying frontend → dist/...");
const frontendDist = join(root, "frontend", "dist");
if (existsSync(frontendDist)) {
  cpSync(frontendDist, join(root, "dist"), { recursive: true });
}

console.log("[build] ✓ done");
