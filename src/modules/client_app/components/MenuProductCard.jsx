import React from 'react';
import { Plus } from 'lucide-react';

export default function MenuProductCard({ product, onAdd }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex items-center gap-4 group active:scale-[0.98] transition-all shadow-lg overflow-hidden relative">
            {product.img && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/5 bg-slate-950">
                    <img src={product.img} alt={product.nombre} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1 block">
                    {product.categoria}
                </span>
                <h4 className="text-sm font-black uppercase tracking-tight text-white truncate">{product.nombre}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 mb-2">
                    {product.descripcion}
                </p>
                <span className="text-white font-black italic tracking-tighter text-lg">
                    ${product.precio.toLocaleString()}
                </span>
            </div>
            <button 
                onClick={() => onAdd(product)}
                className="bg-emerald-500 text-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-90 shrink-0"
            >
                <Plus size={20} className="stroke-[3px]" />
            </button>
        </div>
    );
}
