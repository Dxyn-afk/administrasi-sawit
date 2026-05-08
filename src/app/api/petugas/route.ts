import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { data, error } = await supabaseAdmin.from('petugas').select('id,nama,keterangan,aktif,created_at').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  try {
    const { nama, password, keterangan } = await req.json();
    if (!nama?.trim() || !password || password.length < 4)
      return NextResponse.json({ error: 'Nama dan password (min 4 karakter) wajib diisi' }, { status: 400 });
    const hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabaseAdmin.from('petugas')
      .insert({ nama: nama.trim(), password_hash: hash, keterangan: keterangan?.trim() || '' })
      .select('id,nama,keterangan,aktif,created_at').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Nama sudah digunakan' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
