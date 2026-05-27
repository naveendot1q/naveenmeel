/**
 * Vercel serverless entry-point.
 * Vercel's @vercel/node runtime compiles this TypeScript and
 * routes all /api/* requests here (see vercel.json rewrites).
 * The Express app handles actual routing at /api/**.
 */
import app from '../artifacts/api-server/src/app';

export default app;
