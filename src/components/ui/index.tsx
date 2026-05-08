'use client';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Button ───────────────────────────────
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  full?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  loading?: boolean;
}
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, full, type = 'button', className, loading }: BtnProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl cursor-pointer select-none transition-all active:scale-[0.97]';
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs gap-1.5' : size === 'lg' ? 'px-6 py-3.5 text-base gap-2' : 'px-4 py-2.5 text-sm gap-2';
  const v = variant === 'primary' ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20' :
    variant === 'ghost' ? 'bg-transparent text-amber-400 border border-amber-500/30 hover:bg-amber-500/10' :
    variant === 'danger' ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25' :
    'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] border border-white/[0.06]';
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={cn(base, sz, v, full && 'w-full', (disabled || loading) && 'opacity-40 cursor-not-allowed', className)}>
      {loading ? <span className="animate-spin">⟳</span> : children}
    </button>
  );
}

// ─── Input ────────────────────────────────
interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  hint?: string;
}
export function Input({ label, type = 'text', value, onChange, placeholder, min, max, step, required, className, autoFocus, hint }: InputProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max} step={step} required={required} autoFocus={autoFocus}
        className="bg-white/[0.04] border border-white/[0.08] text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] placeholder-gray-600 w-full transition-colors"
      />
      {hint && <span className="text-xs text-gray-600">{hint}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────
interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}
export function Select({ label, value, onChange, options, className }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-[#1C1C1C] border border-white/[0.08] text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 w-full transition-colors appearance-none cursor-pointer">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Card ─────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#161616] border border-white/[0.06] rounded-2xl', className)}>
      {children}
    </div>
  );
}

// ─── Modal ────────────────────────────────
interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}
export function Modal({ show, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose} role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"/>
      <div className={cn(
        'relative bg-[#141414] border border-white/[0.08] shadow-2xl w-full animate-slide-up',
        'rounded-t-3xl sm:rounded-2xl sm:max-h-[90vh] overflow-y-auto',
        wide ? 'sm:max-w-2xl' : 'sm:max-w-md'
      )} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
          <h3 className="text-base font-bold text-gray-100 font-display">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────
export function Badge({ children, color = 'amber' }: { children: React.ReactNode; color?: 'amber'|'green'|'red'|'blue'|'gray' }) {
  const c = color === 'green' ? 'bg-green-500/15 text-green-400 border-green-500/25' :
    color === 'red' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
    color === 'blue' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
    color === 'gray' ? 'bg-white/[0.06] text-gray-400 border-white/[0.1]' :
    'bg-amber-500/15 text-amber-400 border-amber-500/25';
  return <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', c)}>{children}</span>;
}

// ─── Tabs ─────────────────────────────────
interface Tab { key: string; label: string; }
export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn('px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
            active === t.key ? 'bg-amber-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-300')}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="text-5xl opacity-20">{icon}</div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}

// ─── Toast ────────────────────────────────
export function Toast({ msg, type, onDone }: { msg: string; type?: string; onDone: () => void }) {
  useEffect(() => { if (msg) { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  const c = type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-green-500/20 border-green-500/40 text-green-300';
  return (
    <div className={cn('fixed top-4 right-4 z-[100] px-4 py-3 rounded-2xl border text-sm font-medium shadow-2xl max-w-xs animate-slide-up', c)}>
      {msg}
    </div>
  );
}

// ─── Spinner ──────────────────────────────
export function Spinner() {
  return <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"/>;
}

// ─── Section Header ───────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h2 className="text-xl font-bold text-gray-100 font-display">{title}</h2>
      {action}
    </div>
  );
}
