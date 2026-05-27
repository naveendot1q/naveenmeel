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
 * Connection pool tuned for both Replit dev and Vercel serverless:
 * - SSL required for Supabase (and most production Postgres providers)
 * - max:3 in production to stay within Supabase free-tier limits (max 10 conns)
 *   and avoid exhausting connections across warm serverless instances
 * - Supabase transaction-mode pooler (port 6543) disables prepared statements;
 *   add ?pgbouncer=true to DATABASE_URL when using that pooler
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
