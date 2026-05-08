export const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(n);

export const fmtShort = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}Jt`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
};

export const todayISO = () => new Date().toISOString().split('T')[0];

export const addDays = (d: string, n: number) => {
  const dt = new Date(d + 'T00:00:00');
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
};

export const startOfWeek = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  const day = dt.getDay();
  dt.setDate(dt.getDate() + (day === 0 ? -6 : 1 - day));
  return dt.toISOString().split('T')[0];
};

export const startOfMonth = (d: string) => d.slice(0, 7) + '-01';

export const endOfMonth = (d: string) => {
  const dt = new Date(d.slice(0, 7) + '-01');
  dt.setMonth(dt.getMonth() + 1); dt.setDate(0);
  return dt.toISOString().split('T')[0];
};

export const dateRange = (from: string, to: string) => {
  const days: string[] = [];
  let cur = from;
  while (cur <= to) { days.push(cur); cur = addDays(cur, 1); }
  return days;
};

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

export const fmtDateShort = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short'
  });

export const dayNameShort = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' });

export const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

export const cn = (...c: (string | boolean | undefined | null)[]) =>
  c.filter(Boolean).join(' ');
