import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

const root = process.cwd();

function run(cmd, cwd) {
  console.log(`  $ ${cmd}  [cwd: ${cwd}]`);
  execSync(cmd, { stdio: "inherit", cwd });
}

console.log("[build] root:", root);

// 1. Install deps
console.log("[build] installing api deps...");
run("npm install --prefer-offline", join(root, "api"));

console.log("[build] installing frontend deps...");
run("npm install --prefer-offline", join(root, "frontend"));

// 2. Bundle API with esbuild (from root node_modules)
console.log("[build] bundling API...");
const apiBundleDir = join(root, "dist", "api");
mkdirSync(apiBundleDir, { recursive: true });

await build({
  entryPoints: [join(root, "api", "src", "vercel.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: join(apiBundleDir, "index.mjs"),
  external: ["pg-native"],
  banner: {
    js: "import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);",
  },
});
console.log("[build] API bundled ✓");

// 3. Build frontend using npx so it resolves vite regardless of bin location
console.log("[build] building frontend...");
run("npx --no-install vite build", join(root, "frontend"));

// 4. Copy frontend/dist → root dist/
console.log("[build] copying frontend → dist/...");
const frontendDist = join(root, "frontend", "dist");
if (existsSync(frontendDist)) {
  cpSync(frontendDist, join(root, "dist"), { recursive: true });
}

console.log("[build] ✓ done");
