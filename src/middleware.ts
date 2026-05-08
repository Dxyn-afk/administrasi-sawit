import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/setup', '/api/auth/'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewati file static dan path publik
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/favicon.ico' ||
    PUBLIC_PATHS.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('fk_session')?.value;
  const role  = req.cookies.get('fk_role')?.value;

  // Belum login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role "melihat" hanya boleh akses dashboard & laporan
  if (role === 'melihat') {
    const allowed = ['/dashboard', '/laporan', '/api/auth/logout'];
    const ok = allowed.some(p => pathname.startsWith(p));
    if (!ok) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)'],
};
