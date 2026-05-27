export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { calcReadTime } from '@/lib/categories';

// GET /api/posts/[slug]
export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('published', true)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/posts/[slug] — protected
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, content, category, excerpt, tags, published, cover_emoji, custom_category } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title)          updates.title    = title.trim();
    if (content) {
      updates.content    = content;
      updates.word_count = content.split(/\s+/).length;
      updates.read_time  = calcReadTime(content);
    }
    if (category || custom_category) updates.category = custom_category?.trim() || category;
    if (excerpt)        updates.excerpt  = excerpt;
    if (tags)           updates.tags     = tags;
    if (cover_emoji)    updates.cover_emoji = cover_emoji;
    if (published !== undefined) updates.published = published;

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('slug', params.slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/posts/[slug] — protected
export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('posts').delete().eq('slug', params.slug);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
