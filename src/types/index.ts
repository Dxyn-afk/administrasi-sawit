export type Role = 'admin' | 'petugas' | 'melihat';

export interface SessionUser {
  id: string;
  nama: string;
  role: Role;
}

export interface Transaksi {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  nominal: number;
  type: 'pemasukan' | 'pengeluaran';
  petugas: string;
  created_at: string;
}

export interface TransaksiInput {
  tanggal: string;
  keterangan: string;
  kategori: string;
  nominal: number;
  type: 'pemasukan' | 'pengeluaran';
}

export interface Petugas {
  id: string;
  nama: string;
  keterangan: string;
  aktif: boolean;
  created_at: string;
}

export interface Kategori {
  id: string;
  nama: string;
  aktif: boolean;
  urutan: number;
}

export interface LogAkses {
  id: string;
  nama: string;
  role: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  jumlah: number;
}
