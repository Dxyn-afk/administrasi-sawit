import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const search = searchParams.get('search');

  let q = supabaseAdmin.from('transaksi').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false });
  if (from) q = q.gte('tanggal', from);
  if (to) q = q.lte('tanggal', to);
  if (search) q = q.or(`keterangan.ilike.%${search}%,kategori.ilike.%${search}%`);

  const { data, error } = await q.limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role === 'melihat')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { tanggal, keterangan, kategori, nominal, type } = body;
    if (!tanggal || !keterangan?.trim() || !kategori || !nominal || !type)
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    if (!['pemasukan','pengeluaran'].includes(type))
      return NextResponse.json({ error: 'Type tidak valid' }, { status: 400 });
    if (Number(nominal) <= 0)
      return NextResponse.json({ error: 'Nominal harus positif' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('transaksi').insert({
      tanggal, keterangan: keterangan.trim(), kategori, nominal: Number(nominal),
      type, petugas: user.nama
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
