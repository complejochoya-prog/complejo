import React, { useState } from 'react';
import { Search, Plus, Beer, Coffee, Utensils, CakeSlice, AlertCircle } from 'lucide-react';

export default function ProductSelector({ products, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todas');

    const categories = ['Todas', ...new Set(products.map(p => p.categoria))];

    const filtered = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = category === 'Todas' || p.categoria === category;
        return matchesSearch && matchesCat;
    });

    const getIcon = (cat) => {
        const c = cat.toLowerCase();
        if (c.includes('bebida') || c.includes('cerveza')) return Beer;
        if (c.includes('cafetería') || c.includes('trago')) return Coffee;
        if (c.includes('postre') || c.includes('tarta')) return CakeSlice;
        return Utensils;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30 rounded-[32px] border border-white/5 overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${category === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
                {filtered.map(p => {
                    const Icon = getIcon(p.categoria);
                    const isLowStock = p.stock <= 5;

                    return (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                {p.img ? (
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-slate-900">
                                        <img src={p.img} alt={p.nombre} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all shrink-0">
                                        <Icon size={18} />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-xs font-black text-white uppercase italic tracking-tighter">{p.nombre}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.categoria}</p>
                                        {isLowStock && (
                                            <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase">
                                                <AlertCircle size={8} /> {p.stock}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-amber-500 italic font-mono">${p.price?.toLocaleString() || p.precio?.toLocaleString()}</p>
                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all ml-auto mt-1">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
