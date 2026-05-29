import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const run = (cmd, cwd) => {
  console.log(`  $ ${cmd}  [cwd: ${cwd ?? root}]`);
  execSync(cmd, { stdio: "inherit", cwd });
};

console.log("[build] root:", root);

// 1. Single npm install at root installs all workspaces (frontend + api)
console.log("[build] npm install (all workspaces)...");
run("npm install", root);

// Debug: confirm vite exists
const viteBin = join(root, "node_modules", ".bin", "vite");
const frontendVite = join(root, "frontend", "node_modules", ".bin", "vite");
console.log("[build] checking bins...");
console.log("  root vite:", existsSync(viteBin) ? "✓" : "✗");
console.log("  frontend vite:", existsSync(frontendVite) ? "✓" : "✗");
try {
  const bins = readdirSync(join(root, "node_modules", ".bin")).filter(f => f.startsWith("vite"));
  console.log("  root .bin vite*:", bins);
} catch {}

// 2. Bundle API
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

// 3. Build frontend — vite hoisted to root node_modules with workspaces
console.log("[build] building frontend...");
run(`"${viteBin}" build`, join(root, "frontend"));

// 4. Copy frontend/dist → root dist/
console.log("[build] copying frontend → dist/...");
const frontendDist = join(root, "frontend", "dist");
if (existsSync(frontendDist)) {
  cpSync(frontendDist, join(root, "dist"), { recursive: true });
}

console.log("[build] ✓ done");
