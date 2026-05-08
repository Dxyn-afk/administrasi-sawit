import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('kategori').select('*').order('urutan').order('nama');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  try {
    const { nama } = await req.json();
    const { data, error } = await supabaseAdmin.from('kategori').insert({ nama: nama.trim() }).select().single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Kategori sudah ada' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
