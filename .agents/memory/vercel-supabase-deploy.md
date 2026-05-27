---
name: Vercel+Supabase deployment
description: How this pnpm monorepo is configured for Vercel (frontend+API) and Supabase (DB)
---

## Structure

- `vercel.json` at repo root: `buildCommand` = `pnpm --filter @workspace/naveen-blog run build`, `outputDirectory` = `artifacts/naveen-blog/dist/public`
- `api/index.ts` at repo root: re-exports Express app from `../artifacts/api-server/src/app`
- Rewrites: `/api/:path*` → `/api/index`, `/ (.*)` → `/index.html` (SPA fallback)
- `@vercel/node` runtime compiles TypeScript and resolves pnpm workspace symlinks at deploy time

## Supabase

- Use **Transaction mode pooler** (port 6543): `postgresql://postgres.REF:PWD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `lib/db/src/index.ts` enables `ssl: { rejectUnauthorized: false }` when `NODE_ENV=production`
- Pool `max: 3` in production to stay within Supabase free-tier connection limit

## Key env vars for Vercel

- `DATABASE_URL` — Supabase transaction pooler URL
- `ADMIN_EMAIL` — admin login email
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` (sha256 hex) — admin password
- `NODE_ENV=production` — triggers SSL and pool cap

## Schema migration

`supabase-schema.sql` at repo root — paste into Supabase SQL Editor once.

**Why:** pnpm workspace packages export raw `.ts` source; Vercel's `@vercel/node` runtime compiles TypeScript and can follow workspace symlinks without a pre-build step.
