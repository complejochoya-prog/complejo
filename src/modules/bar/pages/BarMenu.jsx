import React, { useEffect, useState } from 'react';
import { Coffee, Search, ShoppingBag, ArrowLeft, Loader2, Zap, Star, X, Filter, ChevronRight, LayoutGrid } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchBarMenu } from '../services/barService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
import MenuProductCard from '../components/MenuProductCard';

export default function BarMenu() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { config } = useConfig();
    const { cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
    
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
        const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || 
                              (p.descripcion || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'Todos' || p.categoria === category;
        return matchesSearch && matchesCategory;
    });

    const getProductQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const handleRemoveOne = (productId) => {
        const item = cart.find(i => i.id === productId);
        if (item && item.quantity > 1) {
            updateQuantity(productId, -1);
        } else {
            removeFromCart(productId);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px]" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 rounded-[32px] border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <Loader2 className="animate-spin text-amber-500 opacity-60" size={32} />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 animate-pulse">Sincronizando Menú</p>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-slate-950 pb-44 overflow-x-hidden">
            
            {/* ── Background Magic ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-slate-600/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-150 contrast-150" />
            </div>

            <div className="relative z-10">
                {/* ── Sticky Header ── */}
                <header className="px-6 pt-10 pb-4 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/${negocioId}`)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 text-white transition-all">
                                <ArrowLeft size={18} />
                            </button>
                            <div className="space-y-0.5">
                                <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none">
                                    MENÚ <span className="text-amber-500">PRO</span>
                                </h1>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em]">Cancha & Gastronomía</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-amber-500 text-black rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 transform -rotate-3">
                                <Coffee size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Compact Search & Category Row */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="BUSCAR..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-10 py-3 text-[11px] font-black text-white focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-slate-700" 
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Category Pills - More Compact & Glassy */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${
                                        category === cat 
                                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105' 
                                        : 'bg-white/5 text-slate-500 border border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {cat === 'Todos' && <LayoutGrid size={12} />}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* ── Product List ── */}
                <div className="p-4 sm:p-6 space-y-3 max-w-[800px] mx-auto">
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map((p, idx) => (
                            <div key={p.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                                <MenuProductCard 
                                    product={p} 
                                    onAdd={addToCart} 
                                    onRemove={handleRemoveOne}
                                    quantity={getProductQuantity(p.id)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="py-32 flex flex-col items-center gap-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10 mx-2">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 border border-white/5">
                                <Search size={28} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sin resultados</p>
                                <button onClick={() => {setSearch(''); setCategory('Todos');}} className="text-amber-500 text-[9px] font-black uppercase tracking-widest hover:underline">Ver todo el catálogo</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Floating Magical Cart Bar ── */}
            {cartCount > 0 && (
                <div className="fixed bottom-10 left-4 right-4 z-[100] flex justify-center pointer-events-none">
                    <button 
                        onClick={() => navigate(`/${negocioId}/carrito`)}
                        className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all pointer-events-auto group relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-4 pl-4 py-2">
                             <div className="relative">
                                <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 animate-pulse" />
                                <div className="relative w-14 h-14 bg-amber-500 text-slate-950 rounded-[22px] flex items-center justify-center shadow-xl">
                                    <ShoppingBag size={24} className="stroke-[2.5px]" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-950 text-white text-[10px] font-black rounded-full border-2 border-amber-500 flex items-center justify-center">
                                        {cartCount}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Resumen</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{cartCount === 1 ? '1 ítem' : `${cartCount} ítems`} seleccionado</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pr-4">
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">TOTAL</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter leading-none">${cartTotal.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-2xl group-hover:bg-amber-400 transition-colors">
                                <ChevronRight size={24} className="stroke-[3px]" />
                            </div>
                        </div>
                    </button>
                </div>
            )}
            
        </div>
    );
}

