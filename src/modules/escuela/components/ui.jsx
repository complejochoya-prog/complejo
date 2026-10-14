import React from 'react';
import { X } from 'lucide-react';

export const inputCls =
    'w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600';

export const btnPrimary =
    'flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60';

export const btnIcon =
    'p-2 bg-slate-900 border border-white/5 rounded-lg transition-colors';

export const PAYMENT_META = {
    paid: { label: 'Al día', text: 'text-emerald-500', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
    pending: { label: 'Pendiente', text: 'text-amber-500', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
    overdue: { label: 'Deuda', text: 'text-rose-500', dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' },
};

export function Modal({ title, subtitle, onClose, children, wide = false }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-slate-900 rounded-[32px] border border-white/10 p-6 sm:p-8 space-y-6 my-8`}>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                        {subtitle && <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{subtitle}</span>}
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-full">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function Field({ label, hint, children, className = '' }) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
            {children}
            {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
        </div>
    );
}

export function StatusBadge({ active }) {
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
            active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
        }`}>
            {active ? 'Activo' : 'Inactivo'}
        </span>
    );
}

export function EmptyState({ children }) {
    return (
        <div className="px-6 py-12 text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
            {children}
        </div>
    );
}
