import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Debug endpoint — shows raw DB connection error so we can diagnose
// Remove this once the DB connection is confirmed working
router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as now, current_database() as db");
    client.release();
    res.json({
      status: "ok",
      db: result.rows[0],
      database_url_set: !!process.env.DATABASE_URL,
      database_url_prefix: process.env.DATABASE_URL?.substring(0, 40) + "...",
      node_env: process.env.NODE_ENV,
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message,
      code: err.code,
      database_url_set: !!process.env.DATABASE_URL,
      database_url_prefix: process.env.DATABASE_URL?.substring(0, 40) + "...",
      node_env: process.env.NODE_ENV,
    });
  }
});

export default router;
