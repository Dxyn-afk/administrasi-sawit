import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
export async function POST(req: NextRequest) {
  try {
    const { nama, password } = await req.json();
    if (!nama?.trim() || !password || password.length < 4)
      return NextResponse.json({ error: 'Input tidak valid' }, { status: 400 });
    const { data: ex } = await supabaseAdmin.from('admin').select('id').limit(1);
    if ((ex?.length ?? 0) > 0)
      return NextResponse.json({ error: 'Admin sudah ada' }, { status: 409 });
    const hash = await bcrypt.hash(password, 12);
    const { error } = await supabaseAdmin.from('admin').insert({ nama: nama.trim(), password_hash: hash });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
