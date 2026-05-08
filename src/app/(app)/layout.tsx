import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import AppLayout from '@/components/layout/AppLayout';

export default async function AppLayoutPage({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');
  return <AppLayout role={user.role} nama={user.nama}>{children}</AppLayout>;
}
