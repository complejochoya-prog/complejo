import React from 'react';
import { Plus, Zap } from 'lucide-react';

export default function MenuProductCard({ product, onAdd }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-4 rounded-[32px] flex items-center gap-5 group active:scale-[0.98] transition-all shadow-xl overflow-hidden relative hover:border-amber-500/30">
            {/* Visual Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/0 group-hover:bg-amber-500 transition-all duration-500" />
            
            {product.img ? (
                <div className="w-24 h-24 rounded-[24px] overflow-hidden shrink-0 border border-white/5 bg-slate-950 shadow-inner">
                    <img src={product.img} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
            ) : (
                <div className="w-24 h-24 rounded-[24px] bg-slate-800 flex items-center justify-center text-slate-700 shrink-0">
                    <Zap size={32} />
                </div>
            )}

            <div className="flex-1 min-w-0 py-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-1 block">
                    {product.categoria}
                </span>
                <h4 className="text-[15px] font-black uppercase tracking-tight text-white truncate group-hover:text-amber-500 transition-colors uppercase leading-none mb-1">
                    {product.nombre}
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 mb-3">
                    {product.descripcion || 'Especialidad de la casa'}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-white font-black italic tracking-tighter text-xl">
                        ${product.precio.toLocaleString()}
                    </span>
                    {product.promo && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Oferta</span>}
                </div>
            </div>

            <button 
                onClick={() => onAdd(product)}
                className="bg-amber-500 text-black w-14 h-14 rounded-[22px] flex items-center justify-center hover:bg-white transition-all shadow-2xl shadow-amber-500/20 active:scale-90 shrink-0 transform group-hover:rotate-12"
            >
                <Plus size={24} className="stroke-[3px]" />
            </button>
        </div>
    );
}

