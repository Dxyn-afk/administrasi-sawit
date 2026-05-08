import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const [{ data: transaksi }, { data: kategori }, { data: log_akses }] = await Promise.all([
    supabaseAdmin.from('transaksi').select('*').order('tanggal'),
    supabaseAdmin.from('kategori').select('*').order('urutan'),
    supabaseAdmin.from('log_akses').select('*').order('created_at', { ascending: false }).limit(5000),
  ]);

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    app: 'FinanKu',
    transaksi: transaksi || [],
    kategori: kategori || [],
    log_akses: log_akses || [],
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="finanku_backup_${new Date().toISOString().slice(0,10)}.json"`,
    },
  });
}
