import { Router } from "express";
import { db, adminSessionsTable } from "../db.js";
import { eq } from "drizzle-orm";
import { verifyAdminToken, generateToken, hashPassword } from "../auth.js";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const validEmail = ADMIN_EMAIL && email === ADMIN_EMAIL;
  let validPassword = false;

  if (ADMIN_PASSWORD_HASH) {
    validPassword = hashPassword(password) === ADMIN_PASSWORD_HASH;
  } else if (ADMIN_PASSWORD) {
    validPassword = password === ADMIN_PASSWORD;
  }

  if (!validEmail || !validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(adminSessionsTable).values({
      token,
      email,
      expires_at: expiresAt,
    });

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.json({ success: true, user: { id: token.slice(0, 8), email } });
  } catch (err: any) {
    console.error("login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", async (req, res) => {
  const token = (req as any).cookies?.admin_token;
  if (token) {
    try {
      await db
        .delete(adminSessionsTable)
        .where(eq(adminSessionsTable.token, token));
    } catch {}
    res.clearCookie("admin_token", { path: "/" });
  }
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  const token = (req as any).cookies?.admin_token;
  const admin = await verifyAdminToken(token);
  if (!admin) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: { id: admin.id, email: admin.email } });
});

export default router;
