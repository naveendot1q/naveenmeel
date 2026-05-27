export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
