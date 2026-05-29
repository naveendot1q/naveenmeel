import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Connection pool tuned for Vercel serverless + Supabase session-mode pooler:
 * - Use Supabase SESSION mode pooler URL (port 5432) — IPv4 compatible, works on Vercel
 * - Transaction mode (port 6543) uses IPv6 by default and fails on Vercel's IPv4-only network
 * - family:4 forces IPv4 resolution to avoid any IPv6 fallback
 * - SSL required for Supabase in production
 * - max:3 to stay within Supabase free-tier connection limits
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: isProduction ? 3 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  // Force IPv4 — Vercel serverless runs on IPv4-only infrastructure.
  // Supabase's pooler defaults to IPv6 which causes ECONNREFUSED on Vercel.
  family: 4,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
