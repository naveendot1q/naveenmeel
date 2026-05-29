# Naveen Meel — Blog

A full-stack personal blog built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. Deployable on Vercel. Installable as a PWA.

---

## Stack

| Layer        | Tech |
|---|---|
| Frontend     | Next.js 14 (App Router) + TypeScript |
| Styling      | Tailwind CSS + custom CSS |
| Database     | Supabase (PostgreSQL) |
| Auth         | Supabase Auth (bcrypt-encrypted passwords) |
| Deployment   | Vercel |
| Mobile       | PWA (installable, offline support) |

---

## Quick Setup (15 minutes)

### 1. Supabase — Create the database

1. Go to [supabase.com](https://supabase.com) → your project `khjzttvwbpxfegtwkxuv`
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-migration.sql` and click **Run**
4. You'll see the `posts` table created with RLS policies

### 2. Supabase — Create your admin user

1. Go to **Authentication** → **Users** → **Add User**
2. Email: `naveenmeel10@gmail.com`
3. Password: choose a strong password (stored as bcrypt hash by Supabase — fully encrypted)
4. Click **Create User**

> ⚠️ Only this email can publish posts — enforced server-side in `/api/auth/login`

### 3. Get your Supabase API keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://khjzttvwbpxfegtwkxuv.supabase.co`
   - **anon public key** (safe to expose in frontend)

### 4. Local development

```bash
# Clone / download this folder
cd naveen-blog

# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# Edit .env.local and add your Supabase anon key

# Generate PWA icons
npm install sharp
node generate-icons.js

# Run dev server
npm run dev
# → http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel --prod

# Option B: GitHub → Vercel dashboard
# 1. Push this folder to a GitHub repo
# 2. Go to vercel.com → New Project → import repo
# 3. Add environment variables (see below)
# 4. Deploy
```

**Vercel Environment Variables** (Settings → Environment Variables):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://khjzttvwbpxfegtwkxuv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key from Supabase |
| `ADMIN_EMAIL` | `naveenmeel10@gmail.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

---

## How It Works

### Authentication Flow
```
Login page → POST /api/auth/login → Supabase signInWithPassword
→ bcrypt verification (handled by Supabase) → session cookie set
→ Admin-only email check → redirect to blog
```

### Creating a Post
```
Click "Write Post" → Editor modal opens → Write in Markdown
→ Live preview tab → Set category (or add custom) → Add tags
→ Click Publish → POST /api/posts → Saved to Supabase
→ Appears on blog instantly (no localStorage, real database!)
→ Heatmap updates automatically
```

### Post Visibility
- **Published posts** → visible to everyone (public RLS policy)
- **Draft posts** → only visible when logged in as admin
- **All devices** see the same data — it's in Supabase, not localStorage

---

## Features

- ✅ **Real database** — Supabase PostgreSQL, visible on all devices
- ✅ **Encrypted auth** — Supabase Auth (bcrypt), session cookies
- ✅ **Markdown editor** — with live preview, toolbar, syntax highlighting
- ✅ **GitHub-style heatmap** — tracks posting days, shows streaks
- ✅ **14 categories** — Networking, Cloud, DevOps, DevSecOps, Linux, CI/CD, K8s, Terraform, Monitoring, Scripting, Python, Tech, Basketball, Life
- ✅ **Custom categories** — add any category not in the list
- ✅ **Tags system** — add comma/enter separated tags per post
- ✅ **Reading progress bar** — on individual post pages
- ✅ **Syntax highlighting** — via highlight.js (github-dark theme)
- ✅ **PWA** — installable on iOS/Android, offline fallback page
- ✅ **Responsive** — mobile-first, works on all screen sizes
- ✅ **Draft mode** — save posts without publishing
- ✅ **Admin actions** — edit, delete, toggle publish (hover on card)
- ✅ **Readable fonts** — Syne (headings) + DM Sans (body) + JetBrains Mono (code)
- ✅ **SEO** — dynamic metadata, OG tags per post

---

## File Structure

```
naveen-blog/
├── app/
│   ├── layout.tsx              # Root layout, fonts, PWA meta
│   ├── page.tsx                # Main blog feed page
│   ├── blog/[slug]/page.tsx    # Individual post page
│   ├── login/page.tsx          # Admin login
│   ├── offline/page.tsx        # PWA offline fallback
│   └── api/
│       ├── auth/login/         # POST — Supabase sign in
│       ├── auth/logout/        # POST — sign out
│       ├── auth/me/            # GET  — session check
│       ├── posts/              # GET (public) / POST (admin)
│       └── posts/[slug]/       # GET / PATCH / DELETE
├── components/
│   ├── layout/Navbar.tsx
│   ├── blog/
│   │   ├── HeatmapChart.tsx    # GitHub-style contribution grid
│   │   ├── PostCard.tsx        # Feed card component
│   │   ├── BlogSidebar.tsx     # Stats, tags, recent posts
│   │   ├── EditorModal.tsx     # Markdown editor + preview
│   │   └── PostReader.tsx      # Full article reader
│   └── ui/PwaInstallBanner.tsx
├── lib/
│   ├── supabase.ts             # Client
│   ├── supabase-server.ts      # Server (API routes)
│   ├── categories.ts           # All categories + helpers
│   └── markdown.ts             # marked configuration
├── styles/globals.css          # Design system + prose styles
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Generated by generate-icons.js
├── supabase-migration.sql      # Run once in Supabase SQL editor
└── generate-icons.js           # Generates PWA icon PNGs
```

---

## Adding Posts (Admin Workflow)

1. Go to your deployed URL (e.g. `naveen-blog.vercel.app`)
2. Click **Admin** in the navbar → login with your Supabase credentials
3. Click **✍️ Write Post**
4. Write in Markdown, set category, add tags, choose emoji cover
5. Toggle **Published** (on = live, off = draft)
6. Click **🚀 Publish**
7. Post appears immediately on all devices

---

## Markdown Cheatsheet

```markdown
# H1  ## H2  ### H3

**bold**  *italic*  ~~strikethrough~~

`inline code`

```bash
kubectl get pods
```

> Blockquote

- bullet list
1. numbered list

[link text](https://url.com)

| Col 1 | Col 2 |
|---|---|
| A | B |
```

---

## Troubleshooting

**Posts not showing?**
- Check Supabase RLS policies — public SELECT policy must exist
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel env vars
- Check browser console for API errors

**Can't log in?**
- Make sure admin user exists in Supabase Auth dashboard
- Verify `ADMIN_EMAIL` env var matches exactly
- Check `/api/auth/login` response in Network tab

**Heatmap not updating?**
- Heatmap reads from the same API as the feed — if posts load, heatmap works
- Previously it used localStorage (broken across devices) — now fixed with Supabase

**PWA not installing?**
- Must be served over HTTPS (Vercel handles this)
- Chrome: look for install icon in address bar
- iOS Safari: Share → Add to Home Screen
