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
  try {
    const { id } = await params;
    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from('petugas')
      .update(body)
      .eq('id', id)
      .select('id,nama,keterangan,aktif,created_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
