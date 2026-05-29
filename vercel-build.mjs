import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
console.log("[build] Root:", root);

// Install dependencies
console.log("[build] Installing API deps...");
execSync("cd api && npm install", { stdio: "inherit", cwd: root });

console.log("[build] Installing frontend deps...");
execSync("cd frontend && npm install", { stdio: "inherit", cwd: root });

// Build API bundle
console.log("[build] Building API...");
execSync("cd api && npm run build", { stdio: "inherit", cwd: root });

// Build frontend
console.log("[build] Building frontend...");
execSync("cd frontend && npm run build", { stdio: "inherit", cwd: root });

// Copy frontend dist to root dist/
const src = join(root, "frontend", "dist");
const dest = join(root, "dist");

if (src !== dest && existsSync(src)) {
  console.log("[build] Copying frontend dist...");
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}

console.log("[build] Done!");
