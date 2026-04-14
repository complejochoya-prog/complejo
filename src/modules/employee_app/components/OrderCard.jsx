import React from 'react';
import { ChefHat, Coffee, Clock, CheckCircle2 } from 'lucide-react';

export default function OrderCard({ order, onChangeStatus }) {
    const isCocina = order.tipo === 'cocina';
    const bgHeader = isCocina ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
    const txHeader = isCocina ? 'text-orange-500' : 'text-emerald-500';

    return (
        <div className="bg-slate-900 border border-white/5 shadow-xl rounded-[24px] overflow-hidden flex flex-col group hover:border-slate-700 transition-colors h-full">
            <div className={`p-4 border-b ${bgHeader} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    {isCocina ? <ChefHat size={16} className={txHeader} /> : <Coffee size={16} className={txHeader} />}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${txHeader}`}>
                        Pedido #{order.id.split('_')[1]}
                    </span>
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                    {order.mesa}
                </span>
            </div>

            <div className="p-5 flex-1 space-y-3">
                <ul className="space-y-2">
                    {order.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm font-bold text-slate-300">
                            <span className="truncate">{it.nombre}</span>
                            <span className="bg-slate-800 text-white px-2 py-0.5 rounded-md font-black italic tracking-widest">
                                x{it.qty}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950/50">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onChangeStatus(order.id, 'preparando')}
                        disabled={order.estado === 'preparando'}
                        className={`flex items-center gap-1 justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                            order.estado === 'preparando' 
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                        }`}
                    >
                        <Clock size={14} /> En Proceso
                    </button>
                    
                    <button
                        onClick={() => onChangeStatus(order.id, 'listo')}
                        disabled={order.estado === 'listo'}
                        className={`flex items-center gap-1 justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                            order.estado === 'listo' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                        }`}
                    >
                        <CheckCircle2 size={14} /> Entregado
                    </button>
                </div>
            </div>
        </div>
    );
}
