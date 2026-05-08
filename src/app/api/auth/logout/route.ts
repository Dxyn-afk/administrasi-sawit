import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/session';
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) await supabaseAdmin.from('sessions').delete().eq('token', token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set('fk_role', '', { maxAge: 0, path: '/' });
  res.cookies.set('fk_nama', '', { maxAge: 0, path: '/' });
  return res;
}
