import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { data, error } = await supabaseAdmin.from('log_akses')
    .select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
