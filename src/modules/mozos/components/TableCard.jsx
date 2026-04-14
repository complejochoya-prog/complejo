import React from 'react';
import { Users, Timer, ArrowRight } from 'lucide-react';

export default function TableCard({ number, status, activeOrders, onClick }) {
    const isBusy = activeOrders && activeOrders.length > 0;
    
    return (
        <button 
            onClick={() => onClick(number)}
            className={`relative p-6 rounded-[32px] border-2 transition-all active:scale-95 text-left group ${
                isBusy 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-white/10 bg-slate-900 hover:border-white/20'
            }`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                isBusy ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-500'
            }`}>
                <span className="text-xl font-black italic">#{number}</span>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
                    Mesa {number}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                    isBusy ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                    {isBusy ? 'Mesa Ocupada' : 'Mesa Libre'}
                </p>
            </div>

            {isBusy && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Timer size={12} /> {activeOrders.length} pedidos
                    </div>
                </div>
            )}

            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-white/20" />
            </div>
        </button>
    );
}
