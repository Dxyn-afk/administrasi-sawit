import { supabaseAdmin } from './supabase';
import { SessionUser } from '@/types';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'fk_session';
const SESSION_HOURS = 12;

export async function createSession(user: SessionUser): Promise<string> {
  const token = crypto.randomUUID() + '-' + Date.now();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();
  await supabaseAdmin.from('sessions').insert({
    token, user_role: user.role, user_id: user.id, user_nama: user.nama, expires_at: expiresAt
  });
  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { data } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (!data) return null;
    return { id: data.user_id || '', nama: data.user_nama, role: data.user_role };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string) {
  await supabaseAdmin.from('sessions').delete().eq('token', token);
}

export const COOKIE_NAME = SESSION_COOKIE;
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_HOURS * 3600,
  path: '/',
};
