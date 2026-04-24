import React from 'react';
import { Trash2, Minus, Plus, Clock } from 'lucide-react';
import OrderTimer from './OrderTimer';

const getStatusConfig = (status) => {
    const s = String(status).toLowerCase();
    const config = {
        nuevo: { text: 'NUEVO', color: 'bg-blue-500 text-white' },
        pendiente: { text: 'PENDIENTE', color: 'bg-slate-500 text-white' },
        preparando: { text: 'EN COCINA', color: 'bg-orange-500 text-white' },
        en_cocina: { text: 'EN COCINA', color: 'bg-orange-500 text-white' },
        listo: { text: 'LISTO', color: 'bg-emerald-500 text-white' },
        listo_para_salir: { text: 'LISTO', color: 'bg-emerald-500 text-white' },
        entregado: { text: 'ENTREGADO', color: 'bg-indigo-500 text-white' },
        paid: { text: 'PAGADO', color: 'bg-green-500 text-white' },
    };
    return config[s] || { text: s.toUpperCase(), color: 'bg-slate-700 text-white' };
};

export default function OrderList({ orders, onUpdateQuantity, onRemove }) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                    <Clock size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Sin consumos activos</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5 animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs">
                            {item.quantity}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-black text-white uppercase italic tracking-tighter">{item.productName}</p>
                                {item.status && (
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusConfig(item.status).color}`}>
                                        {getStatusConfig(item.status).text}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">${item.price.toLocaleString()}</p>
                                {item.timestamp && !['entregado', 'paid', 'pagado'].includes(item.status) && (
                                    <div className="scale-75 origin-left">
                                        <OrderTimer startTime={item.timestamp} label="" active={true} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all"
                            >
                                <Minus size={14} />
                            </button>
                            <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                            <p className="text-sm font-black text-white italic font-mono">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>

                        <button 
                            onClick={() => onRemove(item.id)}
                            className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ml-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
