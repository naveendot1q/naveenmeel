/**
 * Vercel serverless entry point.
 * Wraps the Express app as a Vercel-compatible handler.
 * Vercel requires: export default function(req, res)
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "./app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
