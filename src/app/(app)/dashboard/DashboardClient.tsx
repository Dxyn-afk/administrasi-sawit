'use client';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaksi, SessionUser } from '@/types';
import { fmt, fmtShort, fmtDate, addDays, startOfWeek, dayNameShort, dateRange } from '@/lib/utils';
import { Card, Tabs, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1C] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardClient({ user, transaksi, recent, today, from7, monthFrom, monthTo }: {
  user: SessionUser; transaksi: Transaksi[]; recent: Transaksi[]; today: string; from7: string; monthFrom: string; monthTo: string;
}) {
  const [tab, setTab] = useState('bulan');

  const filtered = useMemo(() => {
    if (tab === 'hari') return transaksi.filter(t => t.tanggal === today);
    if (tab === 'minggu') { const s = startOfWeek(today); return transaksi.filter(t => t.tanggal >= s && t.tanggal <= today); }
    return transaksi.filter(t => t.tanggal >= monthFrom && t.tanggal <= monthTo);
  }, [transaksi, tab, today, monthFrom, monthTo]);

  const masuk = filtered.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0);
  const keluar = filtered.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0);
  const saldo = masuk - keluar;

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, -6 + i);
      const dayTx = recent.filter(t => t.tanggal === d);
      return {
        label: dayNameShort(d),
        Pemasukan: dayTx.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0),
        Pengeluaran: dayTx.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0),
      };
    });
  }, [recent, today]);

  const recentFive = recent.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-black text-gray-100 font-display">Dashboard</h1>
        <Tabs tabs={[{ key: 'hari', label: 'Hari Ini' }, { key: 'minggu', label: 'Minggu Ini' }, { key: 'bulan', label: 'Bulan Ini' }]}
          active={tab} onChange={setTab}/>
      </div>

      {/* Hero saldo */}
      <Card className={cn('p-6 border', saldo >= 0 ? 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent' : 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent')}>
        <div className="text-xs text-gray-600 uppercase tracking-widest mb-1 font-semibold">Saldo Bersih</div>
        <div className={cn('text-4xl font-black font-mono tracking-tight', saldo >= 0 ? 'text-green-400' : 'text-red-400')}>{fmt(saldo)}</div>
        <div className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
          <span>{saldo >= 0 ? '💚' : '❤️'}</span>
          <span>{saldo >= 0 ? 'Periode ini untung' : 'Periode ini rugi'}</span>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pemasukan', val: fmt(masuk), sub: `${filtered.filter(t => t.type === 'pemasukan').length} tx`, color: 'text-green-400', bg: 'bg-green-500/8', dot: 'bg-green-500' },
          { label: 'Pengeluaran', val: fmt(keluar), sub: `${filtered.filter(t => t.type === 'pengeluaran').length} tx`, color: 'text-red-400', bg: 'bg-red-500/8', dot: 'bg-red-500' },
          { label: 'Total Transaksi', val: filtered.length.toString(), sub: 'entri', color: 'text-amber-400', bg: 'bg-amber-500/8', dot: 'bg-amber-500' },
        ].map(s => (
          <Card key={s.label} className={cn('p-4', s.bg)}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={cn('w-1.5 h-1.5 rounded-full', s.dot)}/>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{s.label}</span>
            </div>
            <div className={cn('font-black font-mono tracking-tight text-lg leading-tight', s.color)}>{s.val}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="p-5">
        <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-4">Aktivitas 7 Hari Terakhir</div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={chartData} barGap={3} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false}/>
            <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtShort}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          {[{ c: 'bg-green-500', l: 'Pemasukan' }, { c: 'bg-red-500', l: 'Pengeluaran' }].map(l => (
            <div key={l.l} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={cn('w-2.5 h-2.5 rounded-sm', l.c)}/>{l.l}
            </div>
          ))}
        </div>
      </Card>

      {/* Recent */}
      <Card>
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.04]">
          <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Aktivitas Terbaru</span>
        </div>
        {recentFive.length === 0 ? <EmptyState icon="📭" text="Belum ada transaksi"/> : (
          <div className="divide-y divide-white/[0.04]">
            {recentFive.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={cn('w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold',
                  t.type === 'pemasukan' ? 'bg-green-500/12 text-green-400' : 'bg-red-500/12 text-red-400')}>
                  {t.type === 'pemasukan' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">{t.keterangan}</div>
                  <div className="text-xs text-gray-600">{t.kategori} · {fmtDate(t.tanggal)}</div>
                </div>
                <div className={cn('font-mono font-bold text-sm flex-shrink-0', t.type === 'pemasukan' ? 'text-green-400' : 'text-red-400')}>
                  {t.type === 'pemasukan' ? '+' : '-'}{fmt(Number(t.nominal))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
