# 💰 FinanKu — Panduan Deployment

Aplikasi manajemen keuangan perusahaan multi-user berbasis **Next.js + Supabase**.

---

## 🚀 Deploy dalam 15 Menit

### LANGKAH 1 — Setup Supabase (database)

1. Buka **https://app.supabase.com** → buat akun gratis
2. Klik **"New Project"** → isi nama project & password database
3. Tunggu ~2 menit sampai project ready
4. Buka **SQL Editor** (menu kiri) → klik **"New Query"**
5. Copy-paste isi file `supabase/schema.sql` → klik **"Run"**
6. Buka **Project Settings → API** → catat 3 nilai ini:
   - `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → untuk `SUPABASE_SERVICE_ROLE_KEY`

---

### LANGKAH 2 — Deploy ke Vercel (hosting gratis)

1. Upload folder ini ke **GitHub** (buat repo baru, push semua file)
2. Buka **https://vercel.com** → login dengan GitHub
3. Klik **"Add New Project"** → pilih repo FinanKu → klik **"Import"**
4. Di bagian **"Environment Variables"**, tambahkan 4 variabel:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key dari Supabase |
| `SESSION_SECRET` | String acak panjang (min 32 karakter), contoh: `finanku-rahasia-2024-xyz-abc-123-qwe` |

5. Klik **"Deploy"** → tunggu ~3 menit
6. Vercel akan memberi URL seperti `https://finanku-xyz.vercel.app`

---

### LANGKAH 3 — Buka Aplikasi

1. Buka URL dari Vercel di browser
2. Halaman **Setup Admin** muncul → isi nama & password Admin
3. Setelah setup, login sebagai Admin
4. Tambah petugas di menu **Pengguna**
5. Mulai input transaksi!

---

## 📱 Install di HP (PWA)

### Android (Chrome):
1. Buka URL aplikasi di Chrome
2. Tap ikon **⋮** (tiga titik) di pojok kanan atas
3. Pilih **"Tambahkan ke layar utama"** atau **"Install App"**

### iPhone (Safari):
1. Buka URL aplikasi di Safari
2. Tap ikon **Share** (kotak dengan panah ke atas)
3. Pilih **"Tambahkan ke Layar Utama"**

---

## 📁 Struktur Proyek

```
finanku/
├── src/
│   ├── app/
│   │   ├── api/           # Backend API routes
│   │   │   ├── auth/      # Login, logout, setup, me
│   │   │   ├── transaksi/ # CRUD transaksi
│   │   │   ├── petugas/   # Manajemen petugas
│   │   │   ├── kategori/  # Manajemen kategori
│   │   │   ├── backup/    # Backup JSON
│   │   │   ├── restore/   # Restore JSON
│   │   │   └── log/       # Log akses
│   │   ├── (app)/         # Halaman dengan layout
│   │   │   ├── dashboard/
│   │   │   ├── transaksi/
│   │   │   ├── laporan/
│   │   │   ├── tools/
│   │   │   └── pengguna/
│   │   ├── setup/         # Setup admin pertama kali
│   │   └── login/         # Halaman login
│   ├── components/
│   │   ├── ui/            # Button, Input, Modal, dll
│   │   └── layout/        # AppLayout (sidebar + topbar)
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client
│   │   ├── session.ts     # Session management
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript types
├── supabase/
│   └── schema.sql         # DDL database
├── .env.example           # Template environment variables
└── README.md              # Panduan ini
```

---

## 👥 Sistem Role

| Fitur | Admin | Petugas | Melihat |
|-------|:-----:|:-------:|:-------:|
| Lihat dashboard & grafik | ✅ | ✅ | ✅ |
| Lihat & cari transaksi | ✅ | ✅ | ❌ |
| Tambah transaksi | ✅ | ✅ | ❌ |
| Edit transaksi | ✅ | ❌ | ❌ |
| Hapus transaksi | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ❌ |
| Backup & Restore JSON | ✅ | ❌ | ❌ |
| Import dari CSV | ✅ | ❌ | ❌ |
| Kelola kategori | ✅ | ❌ | ❌ |
| Daftar & kelola petugas | ✅ | ❌ | ❌ |
| Log akses | ✅ | ❌ | ❌ |

---

## 🔧 Development Lokal

```bash
# 1. Install dependencies
npm install

# 2. Buat file .env.local (copy dari .env.example)
cp .env.example .env.local
# Edit .env.local dengan nilai dari Supabase

# 3. Jalankan dev server
npm run dev

# Buka http://localhost:3000
```

---

## 🆘 Troubleshooting

**"Error: Invalid API key"**
→ Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` sudah benar di Vercel

**"Relation 'admin' does not exist"**  
→ Pastikan SQL schema sudah dijalankan di Supabase SQL Editor

**Session langsung logout**  
→ Pastikan `SESSION_SECRET` sudah diset di environment variables Vercel

**Tombol "Install App" tidak muncul di HP**  
→ Aplikasi harus diakses via HTTPS (Vercel sudah otomatis HTTPS)

---

## 💡 Tips

- **Backup rutin**: Admin lakukan backup JSON tiap minggu via menu Tools
- **Petugas nonaktif**: Petugas yang keluar perusahaan bisa dinonaktifkan, data tetap tersimpan
- **Multi-device**: Satu akun bisa login dari HP dan laptop bersamaan
- **Offline**: Setelah install PWA, tampilan tetap muncul saat offline (data butuh koneksi)

---

*FinanKu v1.0 — Built with Next.js 14 + Supabase + Tailwind CSS*
