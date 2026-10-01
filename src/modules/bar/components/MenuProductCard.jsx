import React from 'react';
import { Plus, Minus, Zap, Flame, Clock } from 'lucide-react';

export default function MenuProductCard({ product, onAdd, onRemove, quantity = 0 }) {
    const isPromo = product.isPromo;

    return (
        <div 
            onClick={() => onAdd(product)}
            className={`relative group flex flex-col bg-[#1c1c1c] border border-transparent rounded-[16px] overflow-hidden cursor-pointer transition-all duration-300 ${
                quantity > 0 ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.01]' : 'hover:border-white/10 hover:shadow-2xl'
            }`}
        >
            {/* Image Section */}
            <div className="relative w-full h-48 sm:h-56 bg-[#111] shrink-0 overflow-hidden">
                {product.img ? (
                    <img 
                        src={product.img} 
                        alt={product.nombre} 
                        className={`w-full h-full object-cover transition-transform duration-700 ${quantity > 0 ? 'scale-105' : 'group-hover:scale-105'}`} 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800">
                        <Zap size={32} />
                    </div>
                )}
                
                {/* Gradient overlay for text legibility if needed, or just standard shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent opacity-50" />

                {/* Badge MÁS PEDIDO or PROMO */}
                {(isPromo || product.destacado) && (
                    <div className="absolute top-3 left-3 bg-[#eab308] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        {isPromo && <Flame size={12} />}
                        {product.promoBadge || 'MÁS PEDIDO'}
                    </div>
                )}

                {/* Quantity Floating Indicator */}
                {quantity > 0 && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-black text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                        {quantity}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-2">
                    <h4 className="text-white font-black text-lg sm:text-xl uppercase tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                        {product.nombre}
                    </h4>
                    <p className="text-slate-400 text-sm font-medium leading-snug line-clamp-2">
                        {product.descripcion || 'Especialidad de la casa.'}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        {isPromo && product.precioOriginal > 0 && (
                            <span className="text-slate-500 font-bold italic text-xs line-through">
                                ${(product.precioOriginal || 0).toLocaleString()}
                            </span>
                        )}
                        <span className={`font-black text-2xl tracking-tighter ${isPromo ? 'text-emerald-400' : 'text-[#eab308]'}`}>
                            ${(product.precio || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Control buttons when quantity > 0 */}
                        {quantity > 0 ? (
                            <div className="flex items-center gap-2 bg-[#111] rounded-full p-1 border border-white/5" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => onRemove(product.id)}
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                                >
                                    <Minus size={14} className="stroke-[3px]" />
                                </button>
                                <span className="text-white font-bold text-sm w-4 text-center">{quantity}</span>
                                <button 
                                    onClick={() => onAdd(product)}
                                    className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors"
                                >
                                    <Plus size={14} className="stroke-[3px]" />
                                </button>
                            </div>
                        ) : (
                            <div className="border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full group-hover:border-amber-500/30 group-hover:text-amber-400 transition-colors">
                                Agregar
                            </div>
                        )}
                    </div>
                </div>

                {/* Promo timer */}
                {isPromo && product.horaDesde && product.horaHasta && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400/80 uppercase tracking-widest mt-1">
                        <Clock size={10} />
                        <span>Vigente {product.horaDesde} a {product.horaHasta} hs</span>
                    </div>
                )}
            </div>
        </div>
    );
}
