import { Router } from "express";
import { db, postsTable } from "@workspace/db";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import cookieParser from "cookie-parser";
import { verifyAdminToken } from "../lib/auth";

const router = Router();
router.use(cookieParser());

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function calcReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function autoExcerpt(content: string): string {
  return (
    content
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*?(.+?)\*\*?/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .substring(0, 160) + "..."
  );
}

// GET /api/posts
router.get("/posts", async (req, res) => {
  try {
    const { category, search, limit } = req.query as Record<string, string>;
    const lim = parseInt(limit || "50");

    // Admins see all posts (including drafts); public sees only published
    const token =
      req.cookies?.admin_token ||
      (req.headers["x-admin-token"] as string);
    const isAdmin = !!(await verifyAdminToken(token));

    const posts = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        slug: postsTable.slug,
        excerpt: postsTable.excerpt,
        content: sql<string>`''`.as("content"),
        category: postsTable.category,
        tags: postsTable.tags,
        published: postsTable.published,
        cover_emoji: postsTable.cover_emoji,
        word_count: postsTable.word_count,
        read_time: postsTable.read_time,
        created_at: postsTable.created_at,
        updated_at: postsTable.updated_at,
      })
      .from(postsTable)
      .where(
        and(
          isAdmin ? undefined : eq(postsTable.published, true),
          category && category !== "all"
            ? eq(postsTable.category, category)
            : undefined,
          search
            ? or(
                ilike(postsTable.title, `%${search}%`),
                ilike(postsTable.excerpt, `%${search}%`)
              )
            : undefined
        )
      )
      .orderBy(desc(postsTable.created_at))
      .limit(lim);

    res.json({ posts });
  } catch (err: any) {
    req.log.error({ err }, "getPosts error");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts
router.post("/posts", async (req, res) => {
  const token =
    req.cookies?.admin_token ||
    req.headers["x-admin-token"] as string;
  const admin = await verifyAdminToken(token);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { title, content, category, custom_category, excerpt, tags, published, cover_emoji } =
      req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Title and content required" });
    }

    const finalCategory = custom_category?.trim() || category;
    const wordCount = content.split(/\s+/).length;
    const readTime = calcReadTime(content);
    const slug = slugify(title) + "-" + Date.now().toString(36);
    const finalExcerpt = excerpt?.trim() || autoExcerpt(content);

    const [post] = await db
      .insert(postsTable)
      .values({
        title: title.trim(),
        slug,
        content,
        excerpt: finalExcerpt,
        category: finalCategory,
        tags: tags || [],
        published: published ?? true,
        cover_emoji: cover_emoji || "📝",
        word_count: wordCount,
        read_time: readTime,
      })
      .returning();

    res.status(201).json({ post });
  } catch (err: any) {
    req.log.error({ err }, "createPost error");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:slug
router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Admins can preview drafts by slug; public can only see published posts
    const token =
      req.cookies?.admin_token ||
      (req.headers["x-admin-token"] as string);
    const isAdmin = !!(await verifyAdminToken(token));

    const [post] = await db
      .select()
      .from(postsTable)
      .where(
        and(
          eq(postsTable.slug, slug),
          isAdmin ? undefined : eq(postsTable.published, true)
        )
      )
      .limit(1);

    if (!post) return res.status(404).json({ error: "Not found" });
    res.json({ post });
  } catch (err: any) {
    req.log.error({ err }, "getPost error");
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/posts/:slug
router.patch("/posts/:slug", async (req, res) => {
  const token =
    req.cookies?.admin_token ||
    req.headers["x-admin-token"] as string;
  const admin = await verifyAdminToken(token);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { slug } = req.params;
    const { title, content, category, custom_category, excerpt, tags, published, cover_emoji } =
      req.body;

    const updates: Record<string, unknown> = {
      updated_at: new Date(),
    };
    if (title) updates.title = title.trim();
    if (content) {
      updates.content = content;
      updates.word_count = content.split(/\s+/).length;
      updates.read_time = calcReadTime(content);
    }
    if (category || custom_category)
      updates.category = custom_category?.trim() || category;
    if (excerpt) updates.excerpt = excerpt;
    if (tags) updates.tags = tags;
    if (cover_emoji) updates.cover_emoji = cover_emoji;
    if (published !== undefined) updates.published = published;

    const [post] = await db
      .update(postsTable)
      .set(updates as any)
      .where(eq(postsTable.slug, slug))
      .returning();

    if (!post) return res.status(404).json({ error: "Not found" });
    res.json({ post });
  } catch (err: any) {
    req.log.error({ err }, "updatePost error");
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:slug
router.delete("/posts/:slug", async (req, res) => {
  const token =
    req.cookies?.admin_token ||
    req.headers["x-admin-token"] as string;
  const admin = await verifyAdminToken(token);
  if (!admin) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { slug } = req.params;
    await db.delete(postsTable).where(eq(postsTable.slug, slug));
    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "deletePost error");
    res.status(500).json({ error: err.message });
  }
});

export default router;
