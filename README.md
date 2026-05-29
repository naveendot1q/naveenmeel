# Naveen Meel — Portfolio & Blog

A personal portfolio + blog website built with:
- **Frontend**: React + Vite + Tailwind CSS v4 + Wouter (routing)
- **Backend**: Express.js API (deployed as Vercel Serverless Function)
- **Database**: Supabase (PostgreSQL via Drizzle ORM)
- **Auth**: Cookie-based admin sessions (no external auth service)

---

## Project Structure

```
naveen-blog/
├── api/                    # Express.js API server
│   ├── src/
│   │   ├── app.ts          # Express app setup
│   │   ├── auth.ts         # Token verification helpers
│   │   ├── db.ts           # Drizzle ORM + schema
│   │   ├── index.ts        # Dev server entry
│   │   ├── vercel.ts       # Vercel serverless export
│   │   └── routes/
│   │       ├── auth.ts     # Login / logout / me
│   │       └── posts.ts    # CRUD for blog posts
│   ├── build.mjs           # esbuild bundle script
│   └── package.json
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── App.tsx         # Router setup
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Global styles + CSS variables
│   │   ├── lib/
│   │   │   ├── categories.ts
│   │   │   ├── theme.tsx   # Dark/light theme context
│   │   │   └── types.ts
│   │   ├── pages/
│   │   │   ├── HomePage.tsx    # Portfolio landing page
│   │   │   ├── BlogPage.tsx    # Blog listing with search/filter
│   │   │   ├── BlogPostPage.tsx
│   │   │   └── LoginPage.tsx   # Admin login
│   │   └── components/
│   │       ├── layout/Navbar.tsx
│   │       └── blog/
│   │           ├── PostCard.tsx
│   │           ├── PostReader.tsx
│   │           ├── EditorModal.tsx   # Markdown editor
│   │           ├── BlogSidebar.tsx
│   │           └── HeatmapChart.tsx
│   ├── public/
│   │   ├── naveen.jpg          # Your photo — REQUIRED
│   │   ├── Naveen_Resume.pdf   # Your resume — REQUIRED
│   │   ├── favicon.svg
│   │   ├── opengraph.jpg
│   │   └── robots.txt
│   └── package.json
│
├── supabase-schema.sql     # Run once in Supabase SQL editor
├── vercel.json             # Vercel deployment config
├── vercel-build.mjs        # Build script
└── .env.example            # Copy to .env and fill in values
```

---

## 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project.
2. Once created, go to **SQL Editor → New Query**.
3. Paste the contents of `supabase-schema.sql` and click **Run**.
4. Go to **Settings → Database → Connection string → Transaction** (port 6543).
5. Copy the connection string — you'll need it as `DATABASE_URL`.

---

## 2 — Add Your Images

Place the following files in `frontend/public/`:

| File | Description |
|------|-------------|
| `naveen.jpg` | Your profile photo (used in hero, sidebar, post byline) |
| `Naveen_Resume.pdf` | Your resume PDF |
| `favicon.svg` | Site favicon |
| `opengraph.jpg` | Social share image (1200×630 recommended) |
| `robots.txt` | SEO robots file |

---

## 3 — Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Set **Framework Preset** to **Other**.
4. Set **Build Command** to `node vercel-build.mjs`.
5. Set **Output Directory** to `dist`.
6. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase transaction pooler URL |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password (plain text) |
| `NODE_ENV` | `production` |

7. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

When prompted, set the environment variables above.

---

## 4 — Local Development

```bash
# Install dependencies
cd api && npm install && cd ..
cd frontend && npm install && cd ..

# Copy and fill in env vars
cp .env.example api/.env
# Edit api/.env with your DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD

# Run API (terminal 1)
cd api
npm run dev

# Run frontend (terminal 2)
cd frontend
npm run dev
# → opens at http://localhost:3000
# → API proxied from http://localhost:8080
```

---

## 5 — Using the Blog CMS

1. Go to `yoursite.com/login`
2. Sign in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. You'll see **✍️ New Post** button in the navbar on `/blog`
4. Write posts in Markdown with the built-in editor (write + preview tabs)
5. Use the ✏️ / ⏸ / 🗑 buttons to edit, unpublish, or delete posts

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/healthz` | — | Health check |
| GET | `/api/posts` | — | List posts (public: published only) |
| POST | `/api/posts` | Admin | Create post |
| GET | `/api/posts/:slug` | — | Get single post |
| PATCH | `/api/posts/:slug` | Admin | Update post |
| DELETE | `/api/posts/:slug` | Admin | Delete post |
| POST | `/api/auth/login` | — | Admin login |
| POST | `/api/auth/logout` | — | Admin logout |
| GET | `/api/auth/me` | — | Check auth status |

---

## Generating a Password Hash (optional, more secure)

Instead of storing a plain-text password, generate a SHA-256 hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('yourpassword').digest('hex'))"
```

Set `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD` in your env vars.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Routing | Wouter |
| Markdown | marked + highlight.js |
| Backend | Express.js 4 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend + serverless API) |
| PWA | vite-plugin-pwa |
