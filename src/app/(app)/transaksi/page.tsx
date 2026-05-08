'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaksi, Kategori } from '@/types';
import { fmt, fmtDate, todayISO } from '@/lib/utils';
import { Btn, Input, Select, Card, Modal, Toast, EmptyState, Badge, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Transaksi | null>(null);
  const [showDel, setShowDel] = useState<Transaksi | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const T = (msg: string, type = 'ok') => setToast({ msg, type });

  // Form state
  const [fTanggal, setFTanggal] = useState(todayISO());
  const [fKet, setFKet] = useState('');
  const [fKat, setFKat] = useState('');
  const [fNominal, setFNominal] = useState('');
  const [fType, setFType] = useState<'pemasukan'|'pengeluaran'>('pengeluaran');
  const [fErr, setFErr] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    if (search) params.set('search', search);
    const [txRes, katRes, meRes] = await Promise.all([
      fetch(`/api/transaksi?${params}`).then(r => r.json()),
      fetch('/api/kategori').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]);
    setTransaksi(txRes.data || []);
    setKategori(katRes.data || []);
    setRole(meRes.user?.role || '');
    if (!fKat && katRes.data?.length) setFKat(katRes.data[0].nama);
    setLoading(false);
  }, [filterFrom, filterTo, search]);

  useEffect(() => { fetchAll(); }, [filterFrom, filterTo]);

  const handleSearch = (v: string) => {
    setSearch(v);
  };

  const openAdd = () => { setFTanggal(todayISO()); setFKet(''); setFNominal(''); setFType('pengeluaran'); setFErr(''); setFKat(kategori[0]?.nama || ''); setShowAdd(true); };
  const openEdit = (t: Transaksi) => { setFTanggal(t.tanggal); setFKet(t.keterangan); setFKat(t.kategori); setFNominal(String(t.nominal)); setFType(t.type); setFErr(''); setShowEdit(t); };

  const doSave = async (isEdit: boolean) => {
    if (!fTanggal || !fKet.trim() || !fNominal) { setFErr('Semua field wajib diisi'); return; }
    if (isNaN(Number(fNominal)) || Number(fNominal) <= 0) { setFErr('Nominal harus angka positif'); return; }
    setSaving(true); setFErr('');
    const body = { tanggal: fTanggal, keterangan: fKet.trim(), kategori: fKat, nominal: Number(fNominal), type: fType };
    const url = isEdit ? `/api/transaksi/${showEdit!.id}` : '/api/transaksi';
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setFErr(d.error || 'Gagal menyimpan'); return; }
    isEdit ? setShowEdit(null) : setShowAdd(false);
    T(isEdit ? 'Transaksi diperbarui' : 'Transaksi ditambahkan');
    fetchAll();
  };

  const doDelete = async () => {
    if (!showDel) return;
    setDeleting(true);
    const res = await fetch(`/api/transaksi/${showDel.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (!res.ok) { T('Gagal menghapus', 'error'); return; }
    setShowDel(null); T('Transaksi dihapus');
    fetchAll();
  };

  const masuk = transaksi.filter(t => t.type === 'pemasukan').reduce((a, t) => a + Number(t.nominal), 0);
  const keluar = transaksi.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + Number(t.nominal), 0);

  const katOpts = kategori.filter(k => k.aktif).map(k => ({ value: k.nama, label: k.nama }));

  const FormContent = ({ isEdit }: { isEdit: boolean }) => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['pemasukan', 'pengeluaran'] as const).map(t => (
          <button key={t} onClick={() => setFType(t)}
            className={cn('flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all',
              fType === t ? (t === 'pemasukan' ? 'bg-green-500/15 border-green-500/50 text-green-400' : 'bg-red-500/15 border-red-500/50 text-red-400') :
                'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300')}>
            {t === 'pemasukan' ? '↑ Pemasukan' : '↓ Pengeluaran'}
          </button>
        ))}
      </div>
      <Input label="Tanggal" type="date" value={fTanggal} onChange={setFTanggal}/>
      <Input label="Keterangan" value={fKet} onChange={setFKet} placeholder="Deskripsi transaksi" autoFocus/>
      <Select label="Kategori" value={fKat} onChange={setFKat} options={katOpts}/>
      <div>
        <Input label="Nominal (Rp)" type="number" value={fNominal} onChange={setFNominal} placeholder="0" min="1" step="1000"/>
        {Number(fNominal) > 0 && <div className="text-xs text-amber-400 bg-amber-500/8 px-3 py-2 rounded-xl mt-1.5 font-mono">{fmt(Number(fNominal))}</div>}
      </div>
      {fErr && <p className="text-red-400 text-xs bg-red-500/8 px-3 py-2 rounded-xl">{fErr}</p>}
      <div className="flex gap-2 pt-1">
        <Btn variant="muted" onClick={() => isEdit ? setShowEdit(null) : setShowAdd(false)} full>Batal</Btn>
        <Btn onClick={() => doSave(isEdit)} full loading={saving}>Simpan</Btn>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '' })}/>
      <SectionHeader title="Transaksi"
        action={(role === 'admin' || role === 'petugas') && <Btn onClick={openAdd}>+ Tambah</Btn>}/>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2.5">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchAll()}
            placeholder="🔍 Cari keterangan / kategori..."
            className="bg-white/[0.04] border border-white/[0.08] text-gray-100 rounded-xl px-3.5 py-2.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:border-amber-500/50 placeholder-gray-600"/>
          <Input type="date" value={filterFrom} onChange={setFilterFrom} className="min-w-[140px] flex-shrink-0"/>
          <Input type="date" value={filterTo} onChange={setFilterTo} className="min-w-[140px] flex-shrink-0"/>
          {(search || filterFrom || filterTo) && (
            <Btn variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterFrom(''); setFilterTo(''); }}>Reset</Btn>
          )}
          <Btn variant="muted" size="sm" onClick={fetchAll}>Cari</Btn>
        </div>
      </Card>

      {/* Summary bar */}
      {transaksi.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500 flex-wrap gap-2">
          <span>{transaksi.length} transaksi ditampilkan</span>
          <div className="flex gap-3">
            <span className="text-green-400 font-mono font-semibold">↑ {fmt(masuk)}</span>
            <span className="text-red-400 font-mono font-semibold">↓ {fmt(keluar)}</span>
          </div>
        </div>
      )}

      {/* List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
          </div>
        ) : transaksi.length === 0 ? <EmptyState icon="🔍" text="Tidak ada transaksi ditemukan"/> : (
          <div className="divide-y divide-white/[0.04]">
            {transaksi.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] group transition-colors">
                <div className={cn('w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold',
                  t.type === 'pemasukan' ? 'bg-green-500/12 text-green-400' : 'bg-red-500/12 text-red-400')}>
                  {t.type === 'pemasukan' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-200 truncate">{t.keterangan}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-600">{t.kategori}</span>
                    <span className="text-[10px] text-gray-700">·</span>
                    <span className="text-[10px] text-gray-600">{fmtDate(t.tanggal)}</span>
                    <span className="text-[10px] text-gray-700">·</span>
                    <span className="text-[10px] text-gray-600">{t.petugas}</span>
                  </div>
                </div>
                <div className={cn('font-mono font-bold text-sm flex-shrink-0', t.type === 'pemasukan' ? 'text-green-400' : 'text-red-400')}>
                  {t.type === 'pemasukan' ? '+' : '-'}{fmt(Number(t.nominal))}
                </div>
                {role === 'admin' && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <Btn size="sm" variant="muted" onClick={() => openEdit(t)}>✏️</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setShowDel(t)}>🗑️</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Tambah Transaksi">
        <FormContent isEdit={false}/>
      </Modal>
      <Modal show={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Transaksi">
        <FormContent isEdit={true}/>
      </Modal>
      <Modal show={!!showDel} onClose={() => setShowDel(null)} title="Hapus Transaksi?">
        {showDel && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">Hapus <strong className="text-white">"{showDel.keterangan}"</strong>?</p>
            <p className="text-xs text-red-400">⚠️ Tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <Btn variant="muted" onClick={() => setShowDel(null)} full>Batal</Btn>
              <Btn variant="danger" onClick={doDelete} full loading={deleting}>Hapus</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
