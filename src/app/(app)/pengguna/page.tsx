'use client';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Petugas, LogAkses } from '@/types';
import { Btn, Input, Card, Modal, Toast, Badge, EmptyState, SectionHeader, Tabs } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function PenggunaPage() {
  const [role, setRole] = useState('');
  const [petugas, setPetugas] = useState<Petugas[]>([]);
  const [logAkses, setLogAkses] = useState<LogAkses[]>([]);
  const [tab, setTab] = useState('petugas');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const T = (msg: string, type = 'ok') => setToast({ msg, type });

  // Form
  const [fNama, setFNama] = useState('');
  const [fPass, setFPass] = useState('');
  const [fKet, setFKet] = useState('');
  const [fErr, setFErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      const r = d.user?.role || '';
      setRole(r);
      if (r !== 'admin') { window.location.href = '/dashboard'; return; }
      Promise.all([
        fetch('/api/petugas').then(r => r.json()),
        fetch('/api/log').then(r => r.json()),
      ]).then(([p, l]) => {
        setPetugas(p.data || []);
        setLogAkses(l.data || []);
        setLoading(false);
      });
    });
  }, []);

  const openAdd = () => { setFNama(''); setFPass(''); setFKet(''); setFErr(''); setShowAdd(true); };

  const doAdd = async () => {
    if (!fNama.trim() || !fPass) { setFErr('Nama dan password wajib diisi'); return; }
    if (fPass.length < 4) { setFErr('Password minimal 4 karakter'); return; }
    setSaving(true); setFErr('');
    const res = await fetch('/api/petugas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: fNama.trim(), password: fPass, keterangan: fKet.trim() })
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { setFErr(d.error || 'Gagal menambah petugas'); return; }
    setPetugas(p => [...p, d.data]); setShowAdd(false); T('Petugas berhasil ditambahkan');
  };

  const toggleAktif = async (id: string, aktif: boolean) => {
    const res = await fetch(`/api/petugas/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktif: !aktif })
    });
    if (!res.ok) { T('Gagal update', 'error'); return; }
    setPetugas(p => p.map(x => x.id === id ? { ...x, aktif: !aktif } : x));
    T(aktif ? 'Petugas dinonaktifkan' : 'Petugas diaktifkan');
  };

  const fmtLog = (ts: string) => new Date(ts).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/></div>;

  return (
    <div className="flex flex-col gap-5">
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: '' })}/>
      <SectionHeader title="Manajemen Pengguna"
        action={tab === 'petugas' && <Btn onClick={openAdd}>+ Tambah Petugas</Btn>}/>

      <Tabs tabs={[{ key: 'petugas', label: 'Daftar Petugas' }, { key: 'log', label: 'Log Akses' }]}
        active={tab} onChange={setTab}/>

      {tab === 'petugas' && (
        <>
          {/* Summary */}
          <div className="flex gap-3">
            {[
              { label: 'Total Petugas', val: petugas.length, color: 'text-amber-400' },
              { label: 'Aktif', val: petugas.filter(p => p.aktif).length, color: 'text-green-400' },
              { label: 'Nonaktif', val: petugas.filter(p => !p.aktif).length, color: 'text-red-400' },
            ].map(s => (
              <Card key={s.label} className="flex-1 p-4">
                <div className="text-[10px] text-gray-600 mb-1">{s.label}</div>
                <div className={cn('text-2xl font-black font-mono', s.color)}>{s.val}</div>
              </Card>
            ))}
          </div>

          {/* Petugas list */}
          {petugas.length === 0 ? (
            <EmptyState icon="👥" text="Belum ada petugas. Tambah petugas pertama."/>
          ) : (
            <div className="flex flex-col gap-2.5">
              {petugas.map(p => (
                <Card key={p.id} className="p-4 flex items-center gap-4">
                  <div className={cn('w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-base font-black',
                    p.aktif ? 'bg-blue-500/15 border border-blue-500/25 text-blue-400' : 'bg-white/[0.04] border border-white/[0.06] text-gray-600')}>
                    {p.nama[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm font-bold', p.aktif ? 'text-gray-100' : 'text-gray-500')}>{p.nama}</span>
                      <Badge color={p.aktif ? 'blue' : 'gray'}>{p.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{p.keterangan || '—'}</div>
                    <div className="text-[10px] text-gray-700 mt-0.5">
                      Terdaftar: {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <Btn size="sm" variant={p.aktif ? 'danger' : 'muted'} onClick={() => toggleAktif(p.id, p.aktif)}>
                    {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </Btn>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'log' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Log Akses</span>
            <span className="text-xs text-gray-600">{logAkses.length} entri</span>
          </div>
          {logAkses.length === 0 ? <EmptyState icon="📋" text="Belum ada log akses"/> : (
            <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
              {logAkses.map(l => (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                    l.role === 'admin' ? 'bg-red-500' : l.role === 'petugas' ? 'bg-blue-500' : 'bg-green-500')}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-200">{l.nama}</span>
                      <Badge color={l.role === 'admin' ? 'red' : l.role === 'petugas' ? 'blue' : 'green'}>
                        {l.role}
                      </Badge>
                    </div>
                    {l.ip_address && <div className="text-[10px] text-gray-700 mt-0.5">IP: {l.ip_address}</div>}
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap flex-shrink-0">{fmtLog(l.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Add Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Tambah Petugas Baru">
        <div className="flex flex-col gap-4">
          <Input label="Nama Login" value={fNama} onChange={setFNama} placeholder="Nama petugas" autoFocus/>
          <Input label="Password" type="password" value={fPass} onChange={setFPass} placeholder="Minimal 4 karakter"/>
          <Input label="Keterangan (opsional)" value={fKet} onChange={setFKet} placeholder="Jabatan, divisi, dll" hint="Untuk identifikasi saja, tidak digunakan untuk login"/>
          {fErr && <p className="text-red-400 text-xs bg-red-500/8 px-3 py-2 rounded-xl">{fErr}</p>}
          <div className="flex gap-2 pt-1">
            <Btn variant="muted" onClick={() => setShowAdd(false)} full>Batal</Btn>
            <Btn onClick={doAdd} full loading={saving}>Simpan Petugas</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
