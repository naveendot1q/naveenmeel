-- ============================================================
-- Naveen Meel Blog — Supabase Schema
-- Run this once in the Supabase SQL Editor to set up the database.
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Posts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "posts" (
  "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"       text        NOT NULL,
  "slug"        text        NOT NULL UNIQUE,
  "excerpt"     text,
  "content"     text        NOT NULL DEFAULT '',
  "category"    text        NOT NULL DEFAULT 'tech',
  "tags"        text[]               DEFAULT '{}',
  "published"   boolean     NOT NULL DEFAULT true,
  "cover_emoji" text                 DEFAULT '📝',
  "word_count"  integer              DEFAULT 0,
  "read_time"   integer              DEFAULT 1,
  "created_at"  timestamptz NOT NULL DEFAULT now(),
  "updated_at"  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug       ON "posts" ("slug");
CREATE INDEX IF NOT EXISTS idx_posts_published  ON "posts" ("published");
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON "posts" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category   ON "posts" ("category");

-- ── Admin sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "id"         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  "token"      text        NOT NULL UNIQUE,
  "email"      text        NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token      ON "admin_sessions" ("token");
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON "admin_sessions" ("expires_at");

-- Disable RLS (API uses service-role / direct Postgres credentials)
ALTER TABLE "posts"          DISABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_sessions" DISABLE ROW LEVEL SECURITY;

-- Verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
