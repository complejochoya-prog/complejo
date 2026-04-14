import React from 'react';
import { CheckCircle2, XCircle, Info, Lock, Unlock } from 'lucide-react';

export default function AccessStatus({ status, data, error }) {
    if (status === 'idle') return null;

    if (status === 'error') {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <XCircle size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Acceso Denegado</h3>
                    <p className="text-xs text-red-400 font-bold uppercase tracking-widest mt-1">{error || 'Código no válido'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px] space-y-6 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500">
                <Unlock size={120} />
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 mb-2">
                    <CheckCircle2 size={48} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Ingreso Autorizado</h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">Portón Desbloqueado</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Cliente</span>
                    <span className="text-sm font-black text-white italic uppercase truncate block">{data.cliente}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Cancha</span>
                    <span className="text-sm font-black text-white italic uppercase truncate block">{data.cancha}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Horario Reserva</span>
                    <span className="text-sm font-black text-white italic uppercase block text-center">{data.horario}</span>
                </div>
            </div>
        </div>
    );
}
