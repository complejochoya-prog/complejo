import React from 'react';
import { X, CheckCircle2, ShoppingCart, PartyPopper } from 'lucide-react';
import ProductImage from './ProductImage';

export default function PromoModal({ promo, onClose, onOrder }) {
    if (!promo) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#111] border-4 border-yellow-400 w-full max-w-5xl rounded-[60px] shadow-[0_0_100px_rgba(250,204,21,0.2)] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-500 max-h-[90vh]">
                
                {/* Imagen Lateral (Desktop) */}
                <div className="lg:w-1/2 h-64 lg:h-auto p-4">
                    <ProductImage promo={promo} />
                </div>

                {/* Contenido */}
                <div className="flex-1 p-8 lg:p-16 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <CheckCircle2 size={14} /> MÁXIMA CALIDAD GIOVANNI
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-display-mcd italic uppercase tracking-tighter text-white leading-none">
                                {promo.title}
                            </h2>
                        </div>
                        <button onClick={onClose} className="bg-white/5 p-4 rounded-3xl hover:bg-black/40 transition-all">
                            <X size={32} className="text-white" />
                        </button>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">¿Qué incluye este Pack?</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {promo.desc.split('\n').map((line, i) => (
                                    <div key={i} className="flex items-start gap-4 text-white">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)]" />
                                        <p className="text-sm font-display-mcd uppercase tracking-widest leading-relaxed">
                                            {line.replace('•', '').trim()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL A PAGAR</span>
                            <span className="text-5xl lg:text-7xl font-display-mcd italic text-yellow-400 tracking-tighter">
                                ${parseInt(promo.price).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button 
                            onClick={() => onOrder(promo)}
                            className="flex-1 bg-yellow-400 text-black py-8 rounded-[40px] text-lg font-display-mcd uppercase tracking-widest shadow-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                        >
                            <ShoppingCart size={24} /> RESERVAR PROMO AHORA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
