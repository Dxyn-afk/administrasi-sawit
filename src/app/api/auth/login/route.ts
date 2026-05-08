import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSession, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { role, nama, password } = await req.json();
    let user = { id: '', nama: '', role: role as 'admin'|'petugas'|'melihat' };

    if (role === 'admin') {
      const { data } = await supabaseAdmin.from('admin').select('*').single();
      if (!data || data.nama !== nama.trim())
        return NextResponse.json({ error: 'Nama atau password salah' }, { status: 401 });
      const ok = await bcrypt.compare(password, data.password_hash);
      if (!ok) return NextResponse.json({ error: 'Nama atau password salah' }, { status: 401 });
      user = { id: data.id, nama: data.nama, role: 'admin' };
    } else if (role === 'petugas') {
      const { data } = await supabaseAdmin.from('petugas')
        .select('*').eq('nama', nama.trim()).eq('aktif', true).single();
      if (!data) return NextResponse.json({ error: 'Nama/password salah atau akun nonaktif' }, { status: 401 });
      const ok = await bcrypt.compare(password, data.password_hash);
      if (!ok) return NextResponse.json({ error: 'Nama/password salah atau akun nonaktif' }, { status: 401 });
      user = { id: data.id, nama: data.nama, role: 'petugas' };
    } else if (role === 'melihat') {
      if (!nama?.trim())
        return NextResponse.json({ error: 'Masukkan nama Anda' }, { status: 400 });
      user = { id: crypto.randomUUID(), nama: nama.trim(), role: 'melihat' };
    } else {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    await supabaseAdmin.from('log_akses').insert({ nama: user.nama, role: user.role, ip_address: ip });

    const token = await createSession(user);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.cookies.set('fk_role', user.role, { ...COOKIE_OPTIONS, httpOnly: false });
    res.cookies.set('fk_nama', user.nama, { ...COOKIE_OPTIONS, httpOnly: false });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
