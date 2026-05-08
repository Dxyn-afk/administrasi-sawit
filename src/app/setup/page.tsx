'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Btn, Input, Card } from '@/components/ui';

export default function SetupPage() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/check-setup').then(r => r.json()).then(d => {
      if (d.setup) router.replace('/login');
      else setChecking(false);
    });
  }, []);

  const submit = async () => {
    setErr('');
    if (!nama.trim() || !pass || !pass2) { setErr('Semua field wajib diisi'); return; }
    if (pass !== pass2) { setErr('Konfirmasi password tidak cocok'); return; }
    if (pass.length < 4) { setErr('Password minimal 4 karakter'); return; }
    setLoading(true);
    const r = await fetch('/api/auth/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama, password: pass }) });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || 'Terjadi kesalahan'); setLoading(false); return; }
    router.push('/login');
  };

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
          <p className="text-gray-600 text-sm">Setup pertama — buat akun Admin</p>
        </div>
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-2.5 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3.5 py-2.5 leading-relaxed">
            <span>⚡</span>
            <span>Halaman ini hanya muncul sekali. Simpan kredensial dengan aman.</span>
          </div>
          <Input label="Nama Admin" value={nama} onChange={setNama} placeholder="Nama lengkap" autoFocus/>
          <Input label="Password" type="password" value={pass} onChange={setPass} placeholder="Minimal 4 karakter"/>
          <Input label="Konfirmasi Password" type="password" value={pass2} onChange={setPass2} placeholder="Ulangi password"/>
          {err && <p className="text-red-400 text-xs bg-red-500/8 px-3 py-2 rounded-xl">{err}</p>}
          <Btn onClick={submit} full size="lg" loading={loading}>Buat Akun Admin</Btn>
        </Card>
      </div>
    </div>
  );
}
