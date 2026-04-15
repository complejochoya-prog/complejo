import React, { useEffect, useState } from 'react';
import { Coffee, Search, ShoppingBag, ArrowLeft, Loader2, Star, Clock, MapPin, ChevronRight, Flame, Heart } from 'lucide-react';
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

    const popularItems = menu.slice(0, 4);

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <Loader2 className="animate-spin text-emerald-500 relative z-10" size={40} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 font-inter pb-40">
            
            {/* Delivery Header */}
            <header className="px-6 pt-8 pb-4 sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/${negocioId}/app`)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <MapPin size={12} className="text-emerald-500 animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Enviar a</span>
                            </div>
                            <h1 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1">
                                Mi Ubicación Actual <ChevronRight size={14} className="text-slate-600" />
                            </h1>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 relative z-10">
                            <Coffee size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Modern Search */}
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Burgers, Pizzas, Bebidas..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all shadow-2xl" 
                    />
                </div>
            </header>

            <main className="animate-in fade-in duration-700">
                {/* Promo Banners Horizontal */}
                <section className="px-6 py-8 overflow-x-auto flex gap-4 no-scrollbar">
                    <div className="min-w-[85vw] h-44 bg-gradient-to-br from-emerald-600 to-teal-900 rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-end shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
                            <Flame size={120} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full mb-2">Oferta Relámpago</span>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">20% OFF en <br/><span className="text-emerald-300">Hamburguesas</span></h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Solo por hoy en Complejo Giovanni</p>
                    </div>
                    <div className="min-w-[85vw] h-44 bg-gradient-to-br from-violet-600 to-indigo-900 rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-end shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <ShoppingBag size={100} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full mb-2">Combo Amigos</span>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Free Delivery <br/><span className="text-violet-300">en Pizzas</span></h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Pedidos superiores a $10.000</p>
                    </div>
                </section>

                {/* Categories Discovery */}
                <section className="px-6 py-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Categorías</h3>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ver Todas</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className="flex flex-col items-center gap-3 group shrink-0"
                            >
                                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-300 border ${
                                    category === cat 
                                    ? 'bg-emerald-500 border-emerald-400 shadow-xl shadow-emerald-500/30 -translate-y-1' 
                                    : 'bg-white/5 border-white/5 group-hover:bg-white/10'
                                }`}>
                                    <Coffee size={24} className={category === cat ? 'text-slate-950' : 'text-slate-400'} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${category === cat ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {cat}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Popular / Best Sellers */}
                {category === 'Todos' && !search && (
                    <section className="px-6 py-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Flame size={16} className="text-orange-500 animate-pulse" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Lo más pedido</h3>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                           {popularItems.map((p, i) => (
                               <div key={`pop-${p.id}`} className="min-w-[200px] bg-white/5 rounded-[32px] p-4 relative group cursor-pointer border border-white/5">
                                   <div className="w-full aspect-square rounded-[24px] overflow-hidden mb-4 relative">
                                       <img src={p.img} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                       <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-950/50 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-rose-500 transition-colors">
                                           <Heart size={14} />
                                       </button>
                                   </div>
                                   <h4 className="text-[12px] font-black uppercase tracking-tight text-white mb-1 truncate">{p.nombre}</h4>
                                   <div className="flex items-center justify-between">
                                       <span className="text-emerald-400 font-black italic tracking-tighter">${p.precio.toLocaleString()}</span>
                                       <button 
                                            onClick={() => addToCart(p)}
                                            className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                                       >
                                           <Plus size={16} strokeWidth={3} />
                                       </button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </section>
                )}

                {/* Full List */}
                <section className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                            {search ? `Resultados para "${search}"` : (category === 'Todos' ? 'Descubre el Menú' : category)}
                        </h3>
                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={10} /> 25-40 min</span>
                            <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" /> 4.8</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredMenu.length > 0 ? (
                            filteredMenu.map((p, idx) => (
                                <div key={p.id} className="animate-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <MenuProductCard product={p} onAdd={addToCart} />
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-slate-800 border border-white/5 border-dashed">
                                    <Search size={40} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white">No encontramos platos</h4>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mt-2">Prueba con otra búsqueda o categoría</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Premium Floating Cart */}
            {cartCount > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-6 z-50 animate-in slide-in-from-bottom-12">
                    <div className="relative group">
                        <div className="absolute inset-[-4px] bg-gradient-to-r from-emerald-600 to-indigo-600 rounded-[30px] blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                        <button 
                            onClick={() => navigate(`/${negocioId}/app/carrito`)}
                            className="relative w-full bg-slate-900 border border-white/10 py-5 rounded-[28px] text-[12px] font-black uppercase tracking-widest flex items-center justify-between px-8 shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <ShoppingBag size={20} className="text-emerald-400" />
                                    <span className="absolute -top-2 -right-2 bg-white text-slate-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                                        {cartCount}
                                    </span>
                                </div>
                                <span className="text-white">Ver mi Carrito</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Total</span>
                                <span className="text-xl font-black italic tracking-tighter text-emerald-400">
                                    ${cartTotal.toLocaleString()}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}

function Plus({ size, strokeWidth = 2 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}
