import React, { useEffect, useState } from 'react';
import { Coffee, Search, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchBarMenu } from '../services/clientService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import MenuProductCard from '../components/MenuProductCard';

export default function BarMenu() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { config } = useConfig();
    const { addToCart, cartTotal, cartCount } = useCart();
    
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('Todos');

    useEffect(() => {
        const load = async () => {
            const data = await fetchBarMenu(negocioId);
            setMenu(data);
            setLoading(false);
        };
        load();
    }, [negocioId]);

    const categories = ['Todos', ...new Set(menu.map(p => p.categoria))];

    const filteredMenu = menu.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'Todos' || p.categoria === category;
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
    );

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300 min-h-screen bg-slate-950 pb-32">
            
            {/* Header Sticky */}
            <header className="px-5 pt-8 pb-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/${negocioId}/app`)} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 active:scale-95 text-slate-300">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-emerald-400 leading-none">Menú Giovanni</h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Alquiler de canchas y servicios</p>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Coffee size={24} />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="¿Qué te gustaría pedir?" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white" 
                    />
                </div>

                {/* Categories Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                category === cat 
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                                : 'bg-slate-900 text-slate-500 border border-white/5'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Product List */}
            <div className="p-5 space-y-4">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map(p => (
                        <MenuProductCard key={p.id} product={p} onAdd={addToCart} />
                    ))
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No encontramos productos</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-5 z-40 animate-in slide-in-from-bottom-8">
                    <button 
                        onClick={() => navigate(`/${negocioId}/app/carrito`)}
                        className="w-full bg-emerald-500 text-slate-950 py-4.5 rounded-[22px] text-[12px] font-black uppercase tracking-widest flex items-center justify-between px-6 shadow-[0_15px_40px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-95 transition-all outline outline-4 outline-slate-950/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-950 text-white w-7 h-7 rounded-lg flex items-center justify-center text-[11px]">
                                {cartCount}
                            </div>
                            <span>Ver mi Carrito</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] opacity-60">Total:</span>
                            <span className="text-lg font-black italic tracking-tighter">
                                ${cartTotal.toLocaleString()}
                            </span>
                        </div>
                    </button>
                </div>
            )}
            
        </div>
    );
}
