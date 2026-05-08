'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/transaksi', icon: '💳', label: 'Transaksi' },
  { href: '/laporan', icon: '📈', label: 'Laporan' },
  { href: '/tools', icon: '🛠', label: 'Tools' },
  { href: '/pengguna', icon: '👥', label: 'Pengguna', adminOnly: true },
];

export default function AppLayout({ children, role, nama }: {
  children: React.ReactNode; role: string; nama: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  const nav = NAV.filter(n => !n.adminOnly || role === 'admin');

  const logout = async () => {
    setLogging(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F0EDE8] font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 border-b border-white/[0.05] bg-[#090909]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-amber-400 hover:bg-white/[0.06] transition-all"
            onClick={() => setMenuOpen(v => !v)}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span className="text-lg font-black text-amber-500 font-display tracking-tight">FinanKu</span>
          <span className="hidden md:block h-4 w-px bg-white/10"/>
          <span className="hidden md:block text-gray-500 text-xs">
            {nav.find(n => pathname.startsWith(n.href))?.label}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400">
              {nama[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-200 leading-tight">{nama}</div>
              <div className="text-[10px] text-gray-600 leading-tight capitalize">{role}</div>
            </div>
          </div>
          <button onClick={logout} disabled={logging}
            className="px-3 py-1.5 text-xs font-semibold text-gray-400 border border-white/[0.08] rounded-xl hover:border-red-500/30 hover:text-red-400 transition-all">
            {logging ? '...' : 'Keluar'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-52 flex-col border-r border-white/[0.05] bg-[#0D0D0D] pt-4 pb-6 gap-0.5 px-2 flex-shrink-0">
          {nav.map(n => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20' : 'text-gray-600 hover:text-gray-200 hover:bg-white/[0.04]')}>
                <span className="text-base w-5 text-center">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
            <aside className="absolute left-0 top-14 h-[calc(100vh-3.5rem)] w-52 bg-[#0D0D0D] border-r border-white/[0.05] pt-3 pb-6 flex flex-col gap-0.5 px-2 animate-slide-up">
              {nav.map(n => {
                const active = pathname.startsWith(n.href);
                return (
                  <Link key={n.href} href={n.href}
                    className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                      active ? 'bg-amber-500/12 text-amber-400 border border-amber-500/20' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]')}>
                    <span className="text-base w-5 text-center">{n.icon}</span>
                    <span>{n.label}</span>
                  </Link>
                );
              })}
              {/* Mobile user info */}
              <div className="mt-auto pt-4 border-t border-white/[0.05] px-3">
                <div className="text-xs font-semibold text-gray-300">{nama}</div>
                <div className="text-[10px] text-gray-600 capitalize mt-0.5">{role}</div>
              </div>
            </aside>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 border-t border-white/[0.05] bg-[#0D0D0D]/95 backdrop-blur flex">
        {nav.map(n => {
          const active = pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href}
              className={cn('flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold transition-colors',
                active ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400')}>
              <span className="text-lg leading-none">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
