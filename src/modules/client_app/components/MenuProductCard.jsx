import React from 'react';
import { Plus, Star } from 'lucide-react';

export default function MenuProductCard({ product, onAdd }) {
    return (
        <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] flex items-center gap-5 group active:scale-[0.98] transition-all relative overflow-hidden">
            {/* Background Glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.03] to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {product.img && (
                <div className="w-24 h-24 rounded-[28px] overflow-hidden shrink-0 border border-white/10 bg-slate-900 shadow-2xl relative z-10">
                    <img 
                        src={product.img} 
                        alt={product.nombre} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                </div>
            )}
            <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80 px-2 py-0.5 rounded-full bg-emerald-500/10">
                        {product.categoria}
                    </span>
                    <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                        <Star size={8} fill="currentColor" /> 4.9
                    </div>
                </div>
                <h4 className="text-[15px] font-black uppercase tracking-tight text-white mb-1 leading-tight group-hover:text-emerald-400 transition-colors">
                    {product.nombre}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest line-clamp-2 mb-3 leading-relaxed">
                    {product.descripcion}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-white font-black italic tracking-tighter text-xl group-hover:scale-105 transition-transform origin-left">
                        ${product.precio.toLocaleString()}
                    </span>
                </div>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(product);
                }}
                className="bg-emerald-500 text-slate-950 w-14 h-14 rounded-[24px] flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 shrink-0 group/btn relative z-20"
            >
                <Plus size={24} className="stroke-[3.5px] group-hover/btn:rotate-90 transition-transform" />
            </button>
        </div>
    );
}
