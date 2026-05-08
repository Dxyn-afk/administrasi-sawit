import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('kategori')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
