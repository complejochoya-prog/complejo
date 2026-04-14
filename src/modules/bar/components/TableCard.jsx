import React from 'react';
import { getStatusConfig } from '../services/barService';
import MozoBadge from './MozoBadge';
import { ShoppingCart } from 'lucide-react';

export default function TableCard({ table, currentOrders, onClick }) {
    const config = getStatusConfig(table.status);
    const total = currentOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
    const productsCount = currentOrders.reduce((acc, o) => acc + o.quantity, 0);

    return (
        <button 
            onClick={() => onClick(table)}
            className={`w-full text-left p-5 rounded-[28px] border transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden ${config.bg} ${config.border}`}
        >
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${config.text.replace('text', 'bg')}`} />

            <div className="flex justify-between items-start mb-4">
                <span className="text-3xl font-black italic tracking-tighter text-white">#{table.tableNumber.toString().padStart(2, '0')}</span>
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.1em] ${config.bg} ${config.text} border ${config.border}`}>
                    {config.label}
                </span>
            </div>

            <div className="space-y-3">
                <MozoBadge name={table.mozoName} />
                
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Consumo</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">${total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                        <ShoppingCart size={12} />
                        <span className="text-[10px] font-bold font-mono">{productsCount}</span>
                    </div>
                </div>
            </div>
            
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
}
