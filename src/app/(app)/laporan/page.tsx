'use client';
import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaksi } from '@/types';
import { fmt, fmtShort, fmtDate, fmtDateShort, todayISO, addDays, startOfWeek, startOfMonth, endOfMonth, dateRange, MONTH_NAMES } from '@/lib/utils';
import { Btn, Input, Card, Tabs, EmptyState, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

const KAT_COLORS = ['#F59E0B','#EF4444','#8B5CF6','#3B82F6','#06B6D4','#10B981','#EC4899'];

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1C] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }}/>
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function LaporanPage() {
  const [tab, setTab] = useState('bulanan');
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const today = todayISO();
  const [bulan, setBulan] = useState(today.slice(0, 7));
  const [customFrom, setCustomFrom] = useState(addDays(today, -29));
  const [customTo, setCustomTo] = useState(today);
  const [showBulanPicker, setShowBulanPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { from, to } = useMemo(() => {
    if (tab === 'mingguan') return { from: startOfWeek(today), to: today };
    if (tab === 'bulanan') return { from: bulan + '-01', to: endOfMonth(bulan + '-01') };
    return { from: customFrom, to: customTo };
  }, [tab, today, bulan, customFrom, customTo]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    Promise.all([
      fetch(`/api/transaksi?${params}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([txRes, meRes]) => {
      setTransaksi(txRes.data || []);
      setRole(meRes.user?.role || '');
      setLoading(false);
    });
  }, [from, to]);

  const masuk = transaksi.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0);
  const keluar = transaksi.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0);
  const saldo = masuk - keluar;
  const days = useMemo(() => dateRange(from, to), [from, to]);
  const hariKerja = days.filter(d => { const w = new Date(d + 'T00:00:00').getDay(); return w > 0 && w < 6; }).length;

  const chartData = useMemo(() => days.map(d => {
    const dayTx = transaksi.filter(t => t.tanggal === d);
    return {
      label: fmtDateShort(d),
      Pemasukan: dayTx.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0),
      Pengeluaran: dayTx.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0),
    };
  }), [transaksi, days]);

  const katBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transaksi.filter(t => t.type === 'pengeluaran').forEach(t => { map[t.kategori] = (map[t.kategori] || 0) + Number(t.nominal); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transaksi]);

  const dailyTable = useMemo(() => {
    return days.map(d => {
      const dayTx = transaksi.filter(t => t.tanggal === d);
      return { d, txs: dayTx, masuk: dayTx.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0), keluar: dayTx.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0) };
    }).filter(r => r.txs.length > 0);
  }, [transaksi, days]);

  const doExportCSV = () => {
    let csv = 'Tanggal,Keterangan,Kategori,Petugas,Type,Nominal\n';
    transaksi.forEach(t => { csv += `${t.tanggal},"${t.keterangan}",${t.kategori},${t.petugas},${t.type},${t.nominal}\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `finanku_laporan_${from}_${to}.csv`; a.click();
  };

  const navBulan = (n: number) => {
    const d = new Date(bulan + '-01');
    d.setMonth(d.getMonth() + n);
    setBulan(d.toISOString().slice(0, 7));
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Laporan & Analisis"
        action={role !== 'melihat' && (
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" onClick={doExportCSV}>📥 CSV</Btn>
          </div>
        )}/>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs tabs={[{ key: 'mingguan', label: 'Mingguan' }, { key: 'bulanan', label: 'Bulanan' }, { key: 'custom', label: 'Custom' }]}
          active={tab} onChange={setTab}/>
        {tab === 'bulanan' && (
          <div className="flex items-center gap-2">
            <button onClick={() => navBulan(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-amber-400 hover:bg-white/[0.06] transition-all text-sm font-bold">←</button>
            <div className="relative">
              <button onClick={() => setShowBulanPicker(v => !v)}
                className="text-sm font-bold text-gray-200 hover:text-amber-400 transition-colors bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl min-w-[140px] text-center">
                {MONTH_NAMES[parseInt(bulan.slice(5, 7)) - 1]} {bulan.slice(0, 4)}
              </button>
              {showBulanPicker && (
                <div className="absolute top-10 left-0 z-20 bg-[#1C1C1C] border border-white/10 rounded-2xl p-3 shadow-2xl w-[280px]">
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTH_NAMES.map((m, i) => (
                      <button key={m} onClick={() => { setBulan(`${bulan.slice(0, 4)}-${String(i + 1).padStart(2, '0')}`); setShowBulanPicker(false); }}
                        className={cn('py-1.5 text-xs rounded-lg transition-all font-medium',
                          parseInt(bulan.slice(5, 7)) - 1 === i ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/[0.06]')}>
                        {m.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[-1, 0, 1].map(y => {
                      const yr = String(new Date().getFullYear() + y);
                      return <button key={yr} onClick={() => { setBulan(`${yr}-${bulan.slice(5, 7)}`); setShowBulanPicker(false); }}
                        className={cn('flex-1 py-1 text-xs rounded-lg transition-all font-bold',
                          bulan.startsWith(yr) ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:bg-white/[0.04]')}>{yr}</button>;
                    })}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => navBulan(1)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-amber-400 hover:bg-white/[0.06] transition-all text-sm font-bold">→</button>
          </div>
        )}
        {tab === 'custom' && (
          <div className="flex gap-2 flex-wrap">
            <Input type="date" value={customFrom} onChange={setCustomFrom} className="min-w-[140px]"/>
            <span className="text-gray-600 self-center text-xs">s.d.</span>
            <Input type="date" value={customTo} onChange={setCustomTo} className="min-w-[140px]"/>
          </div>
        )}
        {tab === 'mingguan' && <p className="text-xs text-gray-600">Senin s.d. hari ini · {fmtDate(from)} — {fmtDate(to)}</p>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
        </div>
      ) : (
        <>
          {/* Hero card */}
          <Card className={cn('p-6 border', saldo >= 0 ? 'border-green-500/20' : 'border-red-500/20')}>
            <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-semibold">Keuntungan Bersih</div>
            <div className={cn('text-4xl font-black font-mono tracking-tight mb-4', saldo >= 0 ? 'text-green-400' : 'text-red-400')}>{fmt(saldo)}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'Pemasukan', v: fmt(masuk), c: 'text-green-400' },
                { l: 'Pengeluaran', v: fmt(keluar), c: 'text-red-400' },
                { l: 'Transaksi', v: transaksi.length, c: 'text-amber-400' },
                { l: 'Hari Kerja', v: hariKerja, c: 'text-blue-400' },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-xs text-gray-600 mb-0.5">{s.l}</div>
                  <div className={cn('font-bold font-mono text-sm', s.c)}>{s.v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Line chart */}
          {chartData.length > 1 && (
            <Card className="p-5">
              <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-4">Tren Pemasukan vs Pengeluaran</div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false}/>
                  <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false}
                    interval={Math.floor(chartData.length / 8)}/>
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtShort}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Line dataKey="Pemasukan" stroke="#10B981" strokeWidth={2} dot={false} name="Pemasukan"/>
                  <Line dataKey="Pengeluaran" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Pengeluaran"/>
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1">
                {[{ c: 'bg-green-500', l: 'Pemasukan', d: '' }, { c: 'bg-red-500', l: 'Pengeluaran', d: 'opacity-60' }].map(l => (
                  <div key={l.l} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className={cn('w-3 h-0.5 rounded', l.c, l.d)}/>{l.l}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Breakdown kategori */}
          {katBreakdown.length > 0 && (
            <Card className="p-5">
              <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-4">Breakdown Pengeluaran per Kategori</div>
              <div className="flex flex-col gap-4">
                {katBreakdown.map(([nama, val], i) => {
                  const pct = keluar > 0 ? Math.round(val / keluar * 100) : 0;
                  return (
                    <div key={nama}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: KAT_COLORS[i % KAT_COLORS.length] }}/>
                          <span className="text-sm text-gray-300 font-medium">{nama}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600">{pct}%</span>
                          <span className="text-xs font-mono font-bold text-gray-200">{fmt(val)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: KAT_COLORS[i % KAT_COLORS.length] }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Daily table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.04]">
              <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Detail Harian</span>
            </div>
            {dailyTable.length === 0 ? <EmptyState icon="📋" text="Tidak ada data pada periode ini"/> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-[10px] text-gray-600 uppercase tracking-wider border-b border-white/[0.04]">
                      {['Tanggal', 'Keterangan', 'Kategori', 'Petugas', 'Pemasukan', 'Pengeluaran'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {dailyTable.flatMap(row => row.txs.map((t, j) => (
                      <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">{j === 0 ? fmtDate(row.d) : ''}</td>
                        <td className="px-4 py-2.5 text-gray-200 max-w-[200px]"><div className="truncate">{t.keterangan}</div></td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">{t.kategori}</td>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap text-xs">{t.petugas}</td>
                        <td className="px-4 py-2.5 text-green-400 font-mono whitespace-nowrap text-xs">{t.type === 'pemasukan' ? fmt(Number(t.nominal)) : ''}</td>
                        <td className="px-4 py-2.5 text-red-400 font-mono whitespace-nowrap text-xs">{t.type === 'pengeluaran' ? fmt(Number(t.nominal)) : ''}</td>
                      </tr>
                    )))}
                    <tr className="bg-amber-500/[0.04] border-t-2 border-amber-500/20 font-bold">
                      <td className="px-4 py-3 text-amber-500 text-xs font-bold" colSpan={4}>TOTAL ({transaksi.length} transaksi)</td>
                      <td className="px-4 py-3 text-green-400 font-mono text-xs">{fmt(masuk)}</td>
                      <td className="px-4 py-3 text-red-400 font-mono text-xs">{fmt(keluar)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
