/**
 * Vercel build script.
 * Runs `vite build` for the naveen-blog package and copies the output
 * to `dist/` at the repository root so Vercel can find it.
 */
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const root = process.cwd();
console.log("[vercel-build] CWD:", root);
console.log("[vercel-build] Root contents:", readdirSync(root).join(", "));

// Step 1: build the frontend
console.log("[vercel-build] Running vite build...");
execSync("pnpm --filter @workspace/naveen-blog run build", {
  stdio: "inherit",
  cwd: root,
});

// Step 2: locate the build output (works whether Vercel runs from root or subdir)
const candidates = [
  join(root, "artifacts", "naveen-blog", "dist"),
  join(root, "dist"),
];

const src = candidates.find((p) => existsSync(p) && p !== join(root, "dist"));
if (!src) {
  console.error("[vercel-build] Build output not found. Checked:", candidates);
  process.exit(1);
}
console.log("[vercel-build] Build output found at:", src);
console.log("[vercel-build] Contents:", readdirSync(src).join(", "));

// Step 3: copy to repo-root dist/ (what vercel.json#outputDirectory points to)
const dest = join(root, "dist");
if (src !== dest) {
  console.log("[vercel-build] Copying to:", dest);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
  console.log("[vercel-build] dist/ contents:", readdirSync(dest).join(", "));
} else {
  console.log("[vercel-build] Source is already at dest, nothing to copy.");
}

console.log("[vercel-build] Done.");
