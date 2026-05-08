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
    const { tanggal, keterangan, kategori, nominal, type } = body;
    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .update({ tanggal, keterangan: keterangan?.trim(), kategori, nominal: Number(nominal), type })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { id } = await params;
  const { error } = await supabaseAdmin.from('transaksi').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
