import React from 'react';
import { Minus, Plus, Trash2, MessageCircle } from 'lucide-react';

export default function CartItem({ item, onUpdateQty, onUpdateObs, onRemove }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-3.5 sm:p-5 rounded-2xl sm:rounded-[28px] space-y-3 sm:space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="text-white font-black uppercase tracking-tight italic text-xs sm:text-sm">{item.nombre}</h4>
                    <p className="text-emerald-400 font-bold text-xs sm:text-sm leading-none mt-1">
                        ${(Number(item.precio || 0) * Number(item.quantity || 0)).toLocaleString()}
                    </p>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-red-400 p-1">
                    <Trash2 size={15} />
                </button>
            </div>

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-950 p-1 rounded-lg sm:rounded-xl border border-white/5">
                    <button 
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-xs sm:text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <div className="text-right">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                    <p className="text-[11px] sm:text-xs font-black text-white">${Number(item.precio || 0).toLocaleString()} c/u</p>
                </div>
            </div>

            <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <MessageCircle size={13} />
                </div>
                <input 
                    type="text"
                    placeholder="Observaciones (Ej: sin cebolla...)"
                    value={item.observaciones || ''}
                    onChange={(e) => onUpdateObs(item.id, e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-lg sm:rounded-xl py-2 sm:py-2.5 pl-8 sm:pl-10 pr-3 sm:pr-4 text-[10px] sm:text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-medium"
                />
            </div>
        </div>
    );
}
