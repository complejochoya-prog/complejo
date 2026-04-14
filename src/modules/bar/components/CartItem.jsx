import React from 'react';
import { Minus, Plus, Trash2, MessageCircle } from 'lucide-react';

export default function CartItem({ item, onUpdateQty, onUpdateObs, onRemove }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-5 rounded-[28px] space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="text-white font-black uppercase tracking-tight italic">{item.nombre}</h4>
                    <p className="text-emerald-400 font-bold text-sm leading-none mt-1">
                        ${(item.precio * item.quantity).toLocaleString()}
                    </p>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 bg-slate-950 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                    <p className="text-xs font-black text-white">${item.precio.toLocaleString()} c/u</p>
                </div>
            </div>

            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <MessageCircle size={14} />
                </div>
                <input 
                    type="text"
                    placeholder="Observaciones (Ej: sin cebolla...)"
                    value={item.observaciones || ''}
                    onChange={(e) => onUpdateObs(item.id, e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                />
            </div>
        </div>
    );
}
