# Deployment Guide — Naveen Blog

## Required Environment Variables (Vercel Dashboard)

Go to **Vercel → Project → Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://khjzttvwbpxfegtwkxuv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(from Supabase dashboard → Settings → API → anon public)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Supabase dashboard → Settings → API → service_role secret)* |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL e.g. `https://naveen-blog.vercel.app` |

## Fixes applied in this version

1. **`app/offline/page.tsx`** — Added `'use client'` so `window.location.reload()` doesn't crash during static generation
2. **`next.config.js`** — Removed deprecated `swcMinify` option (Next 14 has it built-in), added graceful PWA fallback
3. **`public/icons/`** — Created all PWA icon sizes referenced in `manifest.json` (were missing, causing build failures)
4. **`vercel.json`** — Added explicit framework/output config so Vercel detects the project correctly

## Local dev

```bash
cp .env.example .env.local
# Fill in your Supabase keys
npm install
npm run dev
```
