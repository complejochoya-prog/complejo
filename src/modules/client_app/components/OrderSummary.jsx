import React from 'react';
import { ShoppingCart, Receipt } from 'lucide-react';

export default function OrderSummary({ total, count }) {
    return (
        <div className="bg-emerald-500 p-6 rounded-[32px] text-slate-950 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-950/10 rounded-xl flex items-center justify-center">
                    <ShoppingCart size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950/10 px-3 py-1 rounded-full">
                    Resumen del Pedido
                </span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">Total a pagar</span>
                    <span className="text-3xl font-black italic tracking-tighter leading-none">
                        ${total.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                    <span>{count} {count === 1 ? 'Producto' : 'Productos'}</span>
                    <span>IVA Incluido</span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-950/10 flex items-center gap-2">
                <Receipt size={14} className="opacity-50" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-60">
                    El pedido se enviará directo a cocina
                </span>
            </div>
        </div>
    );
}
