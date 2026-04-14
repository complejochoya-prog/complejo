import React from 'react';
import { ShoppingCart, PartyPopper, Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';

export default function PromoCard({ promo, onClick, onOrder }) {
    const isPremium = promo.title.toLowerCase().includes('premium');
    
    return (
        <div 
            onClick={onClick}
            className="group relative bg-[#1a1a1a] rounded-[48px] p-6 flex flex-col gap-6 border-4 border-transparent hover:border-yellow-400 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-yellow-400/20"
        >
            {/* Contenedor de Imagen */}
            <div className="h-64 lg:h-72">
                <ProductImage promo={promo} />
            </div>

            {/* Contenido */}
            <div className="flex flex-col flex-1 px-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    {promo.type === 'evento' ? <PartyPopper className="text-yellow-400" size={20} /> : <Sparkles className="text-amber-500" size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        {promo.type === 'evento' ? 'EVENTO EXCLUSIVO' : 'PROMOCIÓN DEL DÍA'}
                    </span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-display-mcd italic uppercase tracking-tighter text-white leading-[0.85] mb-4">
                    {promo.title.split(' ').map((word, i) => (
                        <span key={i} className={word.toLowerCase() === 'premium' ? 'text-yellow-400' : ''}>
                            {word}{' '}
                        </span>
                    ))}
                </h3>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest line-clamp-3 mb-8">
                    {promo.desc}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">A SOLO</span>
                        <span className="text-4xl lg:text-5xl font-display-mcd italic tracking-tighter text-white">
                            ${parseInt(promo.price).toLocaleString()}
                        </span>
                    </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onOrder(promo);
                        }}
                        className="bg-yellow-400 text-black p-4 lg:p-6 rounded-[32px] hover:scale-110 active:scale-90 transition-all shadow-xl shadow-yellow-400/20 group-hover:bg-white"
                    >
                        <ShoppingCart size={28} />
                    </button>
                </div>
            </div>

            {/* Brillo estilo McDonalds */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
