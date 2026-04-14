import React, { useEffect, useState } from 'react';
import { Coffee, Search, ShoppingBag, ArrowLeft, Loader2, Zap, Star } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchBarMenu } from '../services/barService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 animate-mesh opacity-20" />
            <div className="flex flex-col items-center gap-4 relative z-10">
                <Loader2 className="animate-spin text-amber-500" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Cargando Menú...</p>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-slate-950 pb-40 overflow-hidden">
            
            {/* Animated Background Layers */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 animate-mesh opacity-20" />
                <div className="absolute inset-0 bg-grid-white opacity-10" />
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-500/10 to-transparent" />
            </div>

            <div className="relative z-10">
                {/* Header Sticky */}
                <header className="px-6 pt-10 pb-6 bg-slate-950/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/${negocioId}`)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 text-white transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                                    MENÚ <span className="text-amber-500 text-glow">GIOVANNI</span>
                                </h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Sabores que ganan partidos</p>
                            </div>
                        </div>
                        <div className="w-14 h-14 bg-amber-500 text-black rounded-[20px] flex items-center justify-center shadow-2xl shadow-amber-500/20 transform rotate-3">
                            <Coffee size={28} />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Buscar hamburguesas, pizzas..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-[20px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all text-white backdrop-blur-sm" 
                        />
                    </div>

                    {/* Categories Scrollable */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    category === cat 
                                    ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/20 scale-105' 
                                    : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Product List */}
                <div className="p-6 space-y-6 max-w-2xl mx-auto">
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map((p, idx) => (
                            <div key={p.id} className="animate-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                <MenuProductCard product={p} onAdd={addToCart} />
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center space-y-4">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700 border border-white/5">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">No hay coincidencias</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-32 left-0 right-0 px-6 z-40">
                    <button 
                        onClick={() => navigate(`/${negocioId}/carrito`)}
                        className="w-full max-w-md mx-auto bg-amber-500 text-black h-20 rounded-[28px] text-[13px] font-black uppercase tracking-wider flex items-center justify-between px-8 shadow-[0_25px_50px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all outline outline-8 outline-slate-950/50 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-black text-amber-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                                <ShoppingBag size={20} />
                            </div>
                            <div className="text-left">
                                <p className="leading-none">{cartCount} {cartCount === 1 ? 'Producto' : 'Productos'}</p>
                                <p className="text-[9px] opacity-60 mt-1 uppercase tracking-widest">Ir al Carrito</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black italic tracking-tighter">
                                ${cartTotal.toLocaleString()}
                            </span>
                        </div>
                    </button>
                </div>
            )}
            
        </div>
    );
}

