import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import DashboardClient from './DashboardClient';
import { startOfMonth, endOfMonth, addDays, todayISO } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const today = todayISO();
  const from7 = addDays(today, -6);
  const monthFrom = startOfMonth(today);
  const monthTo = endOfMonth(today);

  const { data: transaksi } = await supabaseAdmin
    .from('transaksi').select('*')
    .gte('tanggal', monthFrom).lte('tanggal', monthTo)
    .order('tanggal', { ascending: false }).order('created_at', { ascending: false });

  const { data: recent } = await supabaseAdmin
    .from('transaksi').select('*')
    .order('tanggal', { ascending: false }).order('created_at', { ascending: false }).limit(8);

  return <DashboardClient user={user} transaksi={transaksi || []} recent={recent || []} today={today} from7={from7} monthFrom={monthFrom} monthTo={monthTo}/>;
}
