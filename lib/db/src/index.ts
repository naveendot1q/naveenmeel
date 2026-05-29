import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dns from "node:dns";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Force Node.js to prefer IPv4 over IPv6 when resolving hostnames.
// Vercel serverless runs on IPv4-only infrastructure; Supabase's pooler
// defaults to IPv6 which causes ECONNREFUSED. This is the correct way to
// enforce IPv4 without using the non-existent pg PoolConfig `family` option.
dns.setDefaultResultOrder("ipv4first");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Connection pool tuned for Vercel serverless + Supabase session-mode pooler:
 * - Use Supabase SESSION mode pooler URL (port 5432) — IPv4 compatible, works on Vercel
 * - Transaction mode (port 6543) uses IPv6 by default and fails on Vercel's IPv4-only network
 * - SSL required for Supabase in production
 * - max:3 to stay within Supabase free-tier connection limits
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: isProduction ? 3 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
