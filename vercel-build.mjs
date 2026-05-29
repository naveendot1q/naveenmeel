import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const run = (cmd, cwd) => {
  console.log(`  $ ${cmd}  [cwd: ${cwd ?? root}]`);
  execSync(cmd, { stdio: "inherit", cwd });
};

console.log("[build] root:", root);

// 1. Install all workspace deps (esbuild platform binary included as dependency)
console.log("[build] npm install...");
run("npm install", root);

// 2. Bundle API using esbuild JS API
//    Import AFTER npm install so the platform binary is present
console.log("[build] bundling API...");
const apiBundleDir = join(root, "dist", "api");
mkdirSync(apiBundleDir, { recursive: true });

// Spawn a small node script to do the esbuild call — avoids ESM/CJS interop issues
const builderScript = join(root, "api-bundle.cjs");
writeFileSync(builderScript, `
const esbuild = require('esbuild');
const path = require('path');
const root = ${JSON.stringify(root)};
esbuild.build({
  entryPoints: [path.join(root, 'api', 'src', 'vercel.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: path.join(root, 'dist', 'api', 'index.mjs'),
  external: ['pg-native'],
  banner: { js: "import{createRequire as R}from'module';const require=R(import.meta.url);" },
}).then(() => {
  console.log('API bundle done');
}).catch(e => { console.error(e); process.exit(1); });
`);
run(`node ${builderScript}`, root);
rmSync(builderScript);

// 3. Build frontend
console.log("[build] building frontend...");
run("node_modules/.bin/vite build", join(root, "frontend"));

// 4. Copy frontend/dist → root dist/
console.log("[build] copying frontend → dist/...");
const frontendDist = join(root, "frontend", "dist");
if (existsSync(frontendDist)) {
  cpSync(frontendDist, join(root, "dist"), { recursive: true });
}

console.log("[build] ✓ done");
