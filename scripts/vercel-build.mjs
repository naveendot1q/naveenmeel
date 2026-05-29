/**
 * Vercel Build Output API v3 build script.
 *
 * Output structure:
 *   .vercel/output/
 *     config.json
 *     static/          ← React SPA
 *     functions/
 *       api/index.func/
 *         index.mjs    ← Express handler
 *         .vc-config.json
 */
import { execSync } from "node:child_process";
import {
  cpSync, rmSync, existsSync, readdirSync, mkdirSync, writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
console.log("[vercel-build] CWD:", root);

// 1. Build API bundle → api/index.mjs
console.log("[vercel-build] Building API bundle...");
execSync("pnpm --filter @workspace/api-server run build:vercel", { stdio: "inherit", cwd: root });
console.log("[vercel-build] api/ contents:", readdirSync(join(root, "api")).join(", "));

// 2. Build React frontend
console.log("[vercel-build] Building frontend...");
execSync("pnpm --filter @workspace/naveen-blog run build", { stdio: "inherit", cwd: root });

// 3. Assemble .vercel/output
const outRoot = join(root, ".vercel", "output");
rmSync(outRoot, { recursive: true, force: true });

// 3a. Static files
const staticDir = join(outRoot, "static");
mkdirSync(staticDir, { recursive: true });
const frontendDist = existsSync(join(root, "artifacts", "naveen-blog", "dist"))
  ? join(root, "artifacts", "naveen-blog", "dist")
  : join(root, "dist");
if (!existsSync(frontendDist)) { console.error("Frontend dist not found"); process.exit(1); }
cpSync(frontendDist, staticDir, { recursive: true });
console.log("[vercel-build] Copied frontend to .vercel/output/static/");

// 3b. Function
const funcDir = join(outRoot, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });
for (const file of readdirSync(join(root, "api"))) {
  cpSync(join(root, "api", file), join(funcDir, file), { recursive: true });
}
writeFileSync(join(funcDir, ".vc-config.json"), JSON.stringify({
  runtime: "nodejs20.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  shouldAddHelpers: true,
}, null, 2));
console.log("[vercel-build] Wrote function to .vercel/output/functions/api/index.func/");

// 3c. Routing — API first (before filesystem), then static, then SPA fallback
writeFileSync(join(outRoot, "config.json"), JSON.stringify({
  version: 3,
  routes: [
    // 1. API routes → function (MUST be before filesystem check)
    { src: "^/api(/.*)?$", dest: "/api/index" },
    // 2. Check filesystem for static assets (JS, CSS, images)
    { handle: "filesystem" },
    // 3. SPA fallback for client-side routes
    { src: ".*", dest: "/index.html" },
  ],
}, null, 2));
console.log("[vercel-build] Wrote .vercel/output/config.json");
console.log("[vercel-build] Done.");
console.log("  static/:", readdirSync(staticDir).slice(0, 5).join(", "), "...");
console.log("  functions/api/index.func/:", readdirSync(funcDir).join(", "));
