import React from 'react';
import { Plus, Minus, Zap, ShoppingCart } from 'lucide-react';

export default function MenuProductCard({ product, onAdd, onRemove, quantity = 0 }) {
    return (
        <div className={`relative group transition-all duration-300 ${quantity > 0 ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}>
            
            {/* Quantity Badge */}
            {quantity > 0 && (
                <div className="absolute -top-2 -right-2 z-20 bg-amber-500 text-black text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.5)] border-2 border-slate-950 animate-in zoom-in-50 duration-300">
                    {quantity}
                </div>
            )}

            <div className={`bg-slate-900/40 backdrop-blur-xl border rounded-[32px] overflow-hidden flex items-center transition-all duration-500 ${
                quantity > 0 ? 'border-amber-500/50 shadow-[0_15px_30px_rgba(245,158,11,0.1)]' : 'border-white/5 hover:border-white/10'
            }`}>
                
                {/* Product Image section - Compact */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative overflow-hidden bg-slate-950">
                    {product.img ? (
                        <img 
                            src={product.img} 
                            alt={product.nombre} 
                            className={`w-full h-full object-cover transition-transform duration-1000 ${quantity > 0 ? 'scale-110' : 'group-hover:scale-110'}`} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                            <Zap size={32} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/40" />
                </div>

                {/* Content section */}
                <div className="flex-1 min-w-0 px-4 py-2 flex flex-col justify-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500/60">
                            {product.categoria || 'Menú'}
                        </span>
                        <h4 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tighter text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                            {product.nombre}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 opacity-70">
                            {product.descripcion || 'Especialidad Giovanni'}
                        </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-white font-black italic tracking-tighter text-lg sm:text-xl">
                            ${(product.precio || 0).toLocaleString()}
                        </span>
                        
                        <div className="flex items-center gap-1">
                            {quantity > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
                                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-90"
                                >
                                    <Minus size={16} className="stroke-[3px]" />
                                </button>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                                className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-all active:scale-95 shadow-xl ${
                                    quantity > 0 
                                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
                                    : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-slate-950'
                                }`}
                            >
                                <Plus size={20} className="stroke-[3px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subtle indicator of added item */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${quantity > 0 ? 'bg-amber-500' : 'bg-transparent'}`} />
            </div>
        </div>
    );
}

