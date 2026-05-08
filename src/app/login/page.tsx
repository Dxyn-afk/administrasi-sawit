'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Input, Card } from '@/components/ui';

type Mode = null | 'admin' | 'petugas' | 'melihat';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [nama, setNama] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/check-setup').then(r => r.json()).then(d => {
      if (!d.setup) router.replace('/setup');
      else setChecking(false);
    });
  }, []);

  const submit = async () => {
    setErr(''); setLoading(true);
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: mode, nama, password: pass })
    });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || 'Terjadi kesalahan'); setLoading(false); return; }
    router.push('/dashboard');
  };

  const roles = [
    { key: 'admin' as Mode, icon: '🔴', label: 'Admin', desc: 'Akses penuh' },
    { key: 'petugas' as Mode, icon: '🔵', label: 'Petugas', desc: 'Input & laporan' },
    { key: 'melihat' as Mode, icon: '🟢', label: 'Melihat', desc: 'Statistik saja' },
  ];

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909]">
      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090909]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">💰</div>
          <h1 className="text-3xl font-black text-amber-500 font-display mb-1">FinanKu</h1>
          <p className="text-gray-600 text-sm">Manajemen Keuangan Perusahaan</p>
        </div>

        {!mode ? (
          <div className="flex flex-col gap-2.5">
            {roles.map(r => (
              <button key={r.key} onClick={() => { setMode(r.key); setNama(''); setPass(''); setErr(''); }}
                className="flex items-center gap-4 p-4 bg-[#141414] border border-white/[0.06] rounded-2xl hover:border-amber-500/30 transition-all group text-left">
                <span className="text-2xl">{r.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-200 group-hover:text-amber-400 transition-colors">{r.label}</div>
                  <div className="text-xs text-gray-600">{r.desc}</div>
                </div>
                <span className="text-gray-700 group-hover:text-amber-500 transition-colors text-lg">→</span>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-6 flex flex-col gap-4">
            <button onClick={() => setMode(null)} className="text-xs text-gray-600 hover:text-amber-400 transition-colors text-left flex items-center gap-1">
              ← Pilih role lain
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{roles.find(r => r.key === mode)?.icon}</span>
              <h3 className="text-sm font-bold text-gray-200">
                {mode === 'admin' ? 'Login Admin' : mode === 'petugas' ? 'Login Petugas' : 'Masuk sebagai Melihat'}
              </h3>
            </div>
            <Input label="Nama" value={nama} onChange={setNama}
              placeholder={mode === 'melihat' ? 'Nama Anda' : 'Nama login'} autoFocus/>
            {mode !== 'melihat' && (
              <Input label="Password" type="password" value={pass} onChange={setPass} placeholder="Password"/>
            )}
            {err && <p className="text-red-400 text-xs bg-red-500/8 px-3 py-2 rounded-xl">{err}</p>}
            <Btn onClick={submit} full loading={loading}>Masuk →</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}
