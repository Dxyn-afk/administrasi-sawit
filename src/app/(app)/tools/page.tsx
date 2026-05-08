'use client';
import { useState, useEffect, useRef } from 'react';
import { Kategori } from '@/types';
import { todayISO } from '@/lib/utils';
import { Btn, Input, Card, Modal, Toast, Badge, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ToolsPage() {
  const [role, setRole] = useState('');
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [newKat, setNewKat] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDanger, setShowDanger] = useState(false);
  const [dangerText, setDangerText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const T = (msg: string, type = 'ok') => setToast({ msg, type });
  const restoreRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/kategori').then(r => r.json()),
    ]).then(([me, kat]) => {
      setRole(me.user?.role || '');
      setKategori(kat.data || []);
      setLoading(false);
    });
  }, []);

  // ─── Export CSV
  const doExportCSV = async () => {
    const res = await fetch('/api/transaksi').then(r => r.json());
    const tx = res.data || [];
    let csv = 'Tanggal,Keterangan,Kategori,Petugas,Type,Nominal\n';
    tx.forEach((t: any) => { csv += `${t.tanggal},"${t.keterangan}",${t.kategori},${t.petugas},${t.type},${t.nominal}\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `finanku_export_${todayISO()}.csv`; a.click();
    T('Export CSV berhasil diunduh');
  };

  // ─── Backup JSON
  const doBackup = async () => {
    const res = await fetch('/api/backup');
    if (!res.ok) { T('Gagal backup', 'error'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `finanku_backup_${todayISO()}.json`; a.click();
    T('Backup berhasil diunduh');
  };

  // ─── Restore JSON
  const doRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch('/api/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      T(`Restore selesai: +${d.added} transaksi ditambahkan, ${d.skipped} dilewati`);
    } catch (err: any) { T(err.message || 'File tidak valid', 'error'); }
    if (restoreRef.current) restoreRef.current.value = '';
  };

  // ─── Import CSV
  const doImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1).filter(r => r.trim());
      let added = 0, skipped = 0, failed = 0;
      const existing = await fetch('/api/transaksi').then(r => r.json());
      const existKeys = new Set((existing.data || []).map((t: any) => `${t.tanggal}|${t.keterangan}|${t.nominal}`));
      const newTxs: any[] = [];
      rows.forEach(row => {
        const cols = row.split(',');
        if (cols.length < 6) return;
        const [tanggal, keterangan, kategori, petugas, type, nominal] = cols;
        const clean = (s: string) => s?.replace(/^"|"$/g, '').trim();
        const key = `${clean(tanggal)}|${clean(keterangan)}|${clean(nominal)}`;
        if (existKeys.has(key)) { skipped++; return; }
        if (!['pemasukan','pengeluaran'].includes(clean(type))) { failed++; return; }
        newTxs.push({ tanggal: clean(tanggal), keterangan: clean(keterangan), kategori: clean(kategori), petugas: clean(petugas), type: clean(type), nominal: Number(clean(nominal)) });
      });
      for (const tx of newTxs) {
        const res = await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) });
        res.ok ? added++ : failed++;
      }
      T(`Import selesai: ${added} ditambahkan, ${skipped} dilewati, ${failed} gagal`);
    } catch { T('Gagal membaca file', 'error'); }
    if (importRef.current) importRef.current.value = '';
  };

  // ─── Kategori
  const addKategori = async () => {
    if (!newKat.trim()) return;
    const res = await fetch('/api/kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: newKat.trim() }) });
    const d = await res.json();
    if (!res.ok) { T(d.error || 'Gagal menambah kategori', 'error'); return; }
    setKategori(k => [...k, d.data]); setNewKat(''); T('Kategori ditambahkan');
  };

  const toggleKategori = async (id: string, aktif: boolean) => {
    const res = await fetch(`/api/kategori/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktif: !aktif }) });
    if (!res.ok) { T('Gagal update kategori', 'error'); return; }
    setKategori(k => k.map(x => x.id === id ? { ...x, aktif: !aktif } : x));
  };

  // ─── Hapus semua
  const doHapusSemua = async () => {
    if (dangerText !== 'HAPUS SEMUA') { T('Konfirmasi salah', 'error'); return; }
    setDeleting(true);
    // Delete all transaksi via backup then restore empty
    const res = await fetch('/api/transaksi?from=2000-01-01&to=2099-12-31').then(r => r.json());
    const ids: string[] = (res.data || []).map((t: any) => t.id);
    // Delete one by one in batches (or call a special endpoint)
    let done = 0;
    for (const id of ids) {
      await fetch(`/api/transaksi/${id}`, { method: 'DELETE' });
      done++;
    }
    await fetch('/api/log', { method: 'DELETE' }).catch(() => {});
    setDeleting(false); setShowDanger(false); setDangerText('');
    T(`${done} transaksi berhasil dihapus`);
  };

  const Section = ({ icon, title, desc, children, danger }: { icon: string; title: string; desc: string; children: React.ReactNode; danger?: boolean }) => (
    <Card className={cn('p-5', danger && 'border-red-500/20')}>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl leading-none mt-0.5">{icon}</span>
        <div>
          <div className={cn('text-sm font-bold', danger ? 'text-red-400' : 'text-gray-200')}>{title}</div>
          <div className="text-xs text-gray-600 mt-0.5">{desc}</div>
        </div>
      </div>
      {children}
    </Card>
  );

  const FileBtn = ({ label, accept, inputRef, onChange }: { label: string; accept: string; inputRef: React.RefObject<HTMLInputElement>; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="block cursor-pointer">
      <input type="file" accept={accept} ref={inputRef} onChange={onChange} className="hidden"/>
      <div className="w-full text-center py-2.5 rounded-xl border border-dashed border-white/[0.1] text-xs text-gray-500 hover:border-amber-500/40 hover:text-amber-400 transition-all cursor-pointer">
        📂 {label}
      </div>
    </label>
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/></div>;

  return (
    <div className="flex flex-col gap-5">
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '' })}/>
      <SectionHeader title="Tools & Pengaturan"/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export CSV */}
        <Section icon="📊" title="Export Data" desc="Unduh semua transaksi dalam format CSV/Excel">
          <Btn onClick={doExportCSV} full variant="ghost">📥 Download CSV</Btn>
        </Section>

        {/* Backup */}
        {role === 'admin' && (
          <Section icon="💾" title="Backup Data" desc="Export seluruh database ke file JSON terstruktur">
            <Btn onClick={doBackup} full variant="ghost">💾 Download Backup JSON</Btn>
          </Section>
        )}

        {/* Restore */}
        {role === 'admin' && (
          <Section icon="🔄" title="Restore Backup" desc="Upload file .json untuk memulihkan data (merge, tidak menimpa)">
            <FileBtn label="Pilih file JSON backup" accept=".json" inputRef={restoreRef} onChange={doRestore}/>
          </Section>
        )}

        {/* Import CSV */}
        {role === 'admin' && (
          <Section icon="📤" title="Import dari CSV" desc="Upload file CSV untuk memindahkan data lama. Duplikat otomatis dilewati.">
            <FileBtn label="Pilih file CSV" accept=".csv" inputRef={importRef} onChange={doImport}/>
            <p className="text-xs text-gray-600 mt-2">Format: Tanggal, Keterangan, Kategori, Petugas, Type, Nominal</p>
          </Section>
        )}
      </div>

      {/* Kelola Kategori */}
      {role === 'admin' && (
        <Section icon="🏷️" title="Kelola Kategori" desc="Tambah atau nonaktifkan kategori pengeluaran">
          <div className="flex flex-col gap-2 mb-4">
            {kategori.map(k => (
              <div key={k.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-2 h-2 rounded-full', k.aktif ? 'bg-green-500' : 'bg-gray-600')}/>
                  <span className={cn('text-sm font-medium', k.aktif ? 'text-gray-200' : 'text-gray-600 line-through')}>{k.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={k.aktif ? 'green' : 'gray'}>{k.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                  <Btn size="sm" variant={k.aktif ? 'danger' : 'muted'} onClick={() => toggleKategori(k.id, k.aktif)}>
                    {k.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newKat} onChange={setNewKat} placeholder="Nama kategori baru" className="flex-1"
              hint=""/>
            <Btn onClick={addKategori} disabled={!newKat.trim()}>+ Tambah</Btn>
          </div>
        </Section>
      )}

      {/* Hapus semua */}
      {role === 'admin' && (
        <Section icon="⚠️" title="Zona Berbahaya" desc="Tindakan permanen yang tidak bisa dibatalkan" danger>
          <Btn variant="danger" onClick={() => { setShowDanger(true); setDangerText(''); }}>
            🗑️ Hapus Semua Data Transaksi
          </Btn>
        </Section>
      )}

      <Modal show={showDanger} onClose={() => setShowDanger(false)} title="⚠️ Konfirmasi Hapus Semua Data">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-300">Ini akan menghapus <strong className="text-red-400">seluruh data transaksi</strong> secara permanen dari database.</p>
          <p className="text-sm text-gray-400">Ketik <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono">HAPUS SEMUA</code> untuk konfirmasi:</p>
          <Input value={dangerText} onChange={setDangerText} placeholder="Ketik konfirmasi di sini" autoFocus/>
          <div className="flex gap-2 pt-1">
            <Btn variant="muted" onClick={() => setShowDanger(false)} full>Batal</Btn>
            <Btn variant="danger" onClick={doHapusSemua} full
              disabled={dangerText !== 'HAPUS SEMUA' || deleting}
              loading={deleting}>
              Hapus Permanen
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
