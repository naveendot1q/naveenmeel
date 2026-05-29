/**
 * Vercel Build Output API v3 build script.
 *
 * Produces the following structure that Vercel understands natively:
 *
 *   .vercel/output/
 *     config.json                          ← routing config
 *     static/                              ← served as-is (the React SPA)
 *     functions/
 *       api/index.func/
 *         index.mjs                        ← the Express handler bundle
 *         .vc-config.json                  ← marks this as a Node.js function
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  rmSync,
  existsSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
console.log("[vercel-build] CWD:", root);

// ── 1. Build the API bundle ────────────────────────────────────────────────
console.log("[vercel-build] Building API bundle...");
execSync("pnpm --filter @workspace/api-server run build:vercel", {
  stdio: "inherit",
  cwd: root,
});
console.log("[vercel-build] api/ contents:", readdirSync(join(root, "api")).join(", "));

// ── 2. Build the React frontend ────────────────────────────────────────────
console.log("[vercel-build] Building frontend...");
execSync("pnpm --filter @workspace/naveen-blog run build", {
  stdio: "inherit",
  cwd: root,
});

// ── 3. Assemble Vercel Build Output API v3 structure ──────────────────────
const outRoot = join(root, ".vercel", "output");
rmSync(outRoot, { recursive: true, force: true });

// 3a. Static files
const staticDir = join(outRoot, "static");
mkdirSync(staticDir, { recursive: true });

const frontendDist =
  existsSync(join(root, "artifacts", "naveen-blog", "dist"))
    ? join(root, "artifacts", "naveen-blog", "dist")
    : join(root, "dist");

if (!existsSync(frontendDist)) {
  console.error("[vercel-build] Frontend dist not found:", frontendDist);
  process.exit(1);
}
cpSync(frontendDist, staticDir, { recursive: true });
console.log("[vercel-build] Copied frontend to .vercel/output/static/");

// 3b. Function bundle
const funcDir = join(outRoot, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });

const apiDir = join(root, "api");
for (const file of readdirSync(apiDir)) {
  cpSync(join(apiDir, file), join(funcDir, file), { recursive: true });
}
console.log("[vercel-build] Copied API bundle to .vercel/output/functions/api/index.func/");

// 3c. .vc-config.json
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
    supportsResponseStreaming: false,
  }, null, 2),
);
console.log("[vercel-build] Wrote .vc-config.json");

// 3d. Routing config — order matters, Vercel matches top to bottom.
// Use the "handle" filesystem pass so static assets are served first,
// then API routes hit the function, then everything else falls back to SPA.
const config = {
  version: 3,
  routes: [
    // Pass 1: serve existing static files (JS/CSS/images) directly
    { handle: "filesystem" },
    // Pass 2: anything under /api goes to the serverless function
    {
      src: "^/api(/.*)?$",
      dest: "/api/index",
    },
    // Pass 3: everything else → SPA index.html for client-side routing
    {
      src: ".*",
      dest: "/index.html",
    },
  ],
};
writeFileSync(join(outRoot, "config.json"), JSON.stringify(config, null, 2));
console.log("[vercel-build] Wrote .vercel/output/config.json");

console.log("[vercel-build] Done. Output structure:");
console.log("  .vercel/output/static/ →", readdirSync(staticDir).slice(0, 5).join(", "), "...");
console.log("  .vercel/output/functions/api/index.func/ →", readdirSync(funcDir).join(", "));
