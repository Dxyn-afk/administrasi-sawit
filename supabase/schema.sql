-- ============================================
-- FinanKu — Database Schema
-- Jalankan di: Supabase > SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE: admin (hanya 1 baris)
CREATE TABLE IF NOT EXISTS admin (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama          text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- TABLE: sessions
CREATE TABLE IF NOT EXISTS sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text UNIQUE NOT NULL,
  user_role   text NOT NULL CHECK (user_role IN ('admin','petugas','melihat')),
  user_id     uuid,
  user_nama   text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- TABLE: petugas
CREATE TABLE IF NOT EXISTS petugas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama          text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  keterangan    text DEFAULT '',
  aktif         boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- TABLE: kategori
CREATE TABLE IF NOT EXISTS kategori (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text UNIQUE NOT NULL,
  aktif       boolean DEFAULT true,
  urutan      int DEFAULT 99,
  created_at  timestamptz DEFAULT now()
);

-- Data default kategori
INSERT INTO kategori (nama, urutan) VALUES
  ('Operasional', 1), ('Gaji', 2), ('Bahan Baku', 3),
  ('Transportasi', 4), ('Lain-lain', 5)
ON CONFLICT (nama) DO NOTHING;

-- TABLE: transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     date NOT NULL,
  keterangan  text NOT NULL,
  kategori    text NOT NULL,
  nominal     numeric(15,0) NOT NULL CHECK (nominal > 0),
  type        text NOT NULL CHECK (type IN ('pemasukan','pengeluaran')),
  petugas     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal   ON transaksi(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transaksi_type      ON transaksi(type);
CREATE INDEX IF NOT EXISTS idx_transaksi_created   ON transaksi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaksi_keterangan ON transaksi USING gin(to_tsvector('indonesian', keterangan));

-- TABLE: log_akses
CREATE TABLE IF NOT EXISTS log_akses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text NOT NULL,
  role        text NOT NULL,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_log_created ON log_akses(created_at DESC);

-- Disable RLS (API routes pakai service_role key — sudah aman di server)
ALTER TABLE admin     DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE petugas   DISABLE ROW LEVEL SECURITY;
ALTER TABLE kategori  DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi DISABLE ROW LEVEL SECURITY;
ALTER TABLE log_akses DISABLE ROW LEVEL SECURITY;

-- Cleanup expired sessions (jalankan manual atau via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < now();
END;
$$;
