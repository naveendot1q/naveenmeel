export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { slugify, calcReadTime } from '@/lib/categories';

// GET /api/posts — public, fetches all published posts
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search   = searchParams.get('search');
    const limit    = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('posts')
      .select('id,title,slug,excerpt,category,tags,published,cover_emoji,created_at,updated_at,read_time,word_count')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ posts: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/posts — protected, creates new post
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, content, category, excerpt, tags, published, cover_emoji, custom_category } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const finalCategory = custom_category?.trim() || category;
    const wordCount = content.split(/\s+/).length;
    const readTime  = calcReadTime(content);
    const slug      = slugify(title) + '-' + Date.now().toString(36);
    const finalExcerpt = excerpt?.trim() || content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*?(.+?)\*\*?/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 160) + '...';

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        slug,
        content,
        excerpt: finalExcerpt,
        category: finalCategory,
        tags: tags || [],
        published: published ?? true,
        cover_emoji: cover_emoji || '📝',
        word_count: wordCount,
        read_time: readTime,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
