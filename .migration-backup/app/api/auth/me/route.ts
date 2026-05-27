export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ authenticated: false });
    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
