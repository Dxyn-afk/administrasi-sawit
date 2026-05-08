import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanKu — Manajemen Keuangan Perusahaan',
  description: 'Aplikasi manajemen keuangan perusahaan multi-user',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FinanKu' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
