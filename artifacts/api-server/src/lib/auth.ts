import { db, adminSessionsTable } from "@workspace/db";
import { eq, gt } from "drizzle-orm";
import crypto from "crypto";

export async function verifyAdminToken(
  token: string | undefined
): Promise<{ id: string; email: string } | null> {
  if (!token) return null;
  try {
    const [session] = await db
      .select()
      .from(adminSessionsTable)
      .where(
        eq(adminSessionsTable.token, token)
      )
      .limit(1);

    if (!session) return null;
    if (session.expires_at < new Date()) return null;
    return { id: session.id, email: session.email };
  } catch {
    return null;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
