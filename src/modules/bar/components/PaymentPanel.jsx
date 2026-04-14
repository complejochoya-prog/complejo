import React, { useState } from 'react';
import { CreditCard, Banknote, Landmark, CheckCircle2, Ticket } from 'lucide-react';

export default function PaymentPanel({ total, onConfirm, onCancel }) {
    const [method, setMethod] = useState('efectivo');

    const methods = [
        { id: 'efectivo', icon: Banknote, label: 'Efectivo', color: 'bg-emerald-500' },
        { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta', color: 'bg-indigo-500' },
        { id: 'transferencia', icon: Landmark, label: 'Transferencia', color: 'bg-sky-500' }
    ];

    return (
        <div className="bg-slate-900 rounded-[40px] border border-white/5 p-8 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
                <Ticket className="mx-auto text-amber-500 mb-4" size={40} />
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Total a Cobrar</h3>
                <p className="text-5xl font-black text-white italic tracking-tighter font-mono mt-2">${total.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
                {methods.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all ${method === m.id ? `ring-2 ring-offset-4 ring-offset-slate-900 ring-${m.color.replace('bg-', '')} ${m.color} border-transparent` : 'bg-slate-950 border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === m.id ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                            <m.icon size={24} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${method === m.id ? 'text-white' : 'text-slate-500'}`}>{m.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => onConfirm(method)}
                    className="flex-[2] py-5 rounded-3xl bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
                >
                    <CheckCircle2 size={18} /> Confirmar Pago
                </button>
            </div>
        </div>
    );
}
