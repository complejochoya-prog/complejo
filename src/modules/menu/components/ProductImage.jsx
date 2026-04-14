import React from 'react';

/**
 * ProductImage Component
 * Muestra un collage de productos o una imagen destacada con estilo McDonald's
 */
export default function ProductImage({ promo }) {
    // Si no hay imagen, usamos placeholders de alta calidad basados en el nombre
    const defaultImages = {
        'Festejo de Cumple (Pack Premium)': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800', // Pizza
        'Festejo de Cumple (Pack Clásico)': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800'  // Papas/Pizza
    };

    const mainImg = promo.img || defaultImages[promo.title] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800';

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[32px] bg-slate-800 group">
            {/* Imagen principal con efecto zoom */}
            <img 
                src={mainImg} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s] ease-out opacity-80"
                alt={promo.title}
            />
            
            {/* Gradiente estilo Board */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            {/* Badge de "SÚPER PACK" o similar si es evento */}
            {promo.type === 'evento' && (
                <div className="absolute top-6 left-6 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl animate-bounce">
                    SÚPER PACK
                </div>
            )}
        </div>
    );
}
