---
name: Blog stack
description: Key technical facts about the Naveen blog/portfolio project
---

- Monorepo: `artifacts/naveen-blog` (React+Vite), `artifacts/api-server` (Express), `lib/db` (Drizzle+Postgres)
- Routing: wouter (not react-router). Base URL from `import.meta.env.BASE_URL`
- API proxy: Vite dev server proxies `/api` to API server
- Auth: cookie `admin_token`, 7-day sessions in `admin_sessions` DB table, `verifyAdminToken` middleware
- Markdown: `marked` — `marked.parse()` returns Promise in newer versions; always handle both Promise and string result
- Photo: `/naveen.jpg` in `artifacts/naveen-blog/public/`
- Categories: `src/lib/categories.ts` — `CATEGORIES` array + `getCategoryMeta(id)` helper
- Types: `src/lib/types.ts` — `Post` type
- EditorModal emoji picker: click-based state (`showEmojiPicker` useState), NOT hover-based (Tailwind group-hover was broken in v4)
