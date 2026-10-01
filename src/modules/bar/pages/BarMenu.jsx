import React, { useEffect, useState } from 'react';
import { Coffee, Search, ShoppingBag, ArrowLeft, Loader2, Zap, Star, X, Filter, ChevronRight, LayoutGrid, Flame, MapPin, MessageCircle } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchBarMenu } from '../services/barService';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.jsx';
import MenuProductCard from '../components/MenuProductCard';
import { notificacionesService, DEFAULT_NOTIFICACIONES, getActivePromoItems } from '../../../core/services/notificacionesService';

export default function BarMenu() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { config } = useConfig();
    const { cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
    
    const [menu, setMenu] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('Todos');
    const [promoItems, setPromoItems] = useState([]);

    useEffect(() => {
        const loadMenu = async () => {
            const { collection, onSnapshot, query, where } = await import('firebase/firestore');
            const { db } = await import('../../../firebase/config');
            const q = query(collection(db, 'negocios', negocioId, 'inventario'), where('sector', '==', 'BAR'));
            
            const unsub = onSnapshot(q, (snap) => {
                const list = snap.docs.map((d, index) => {
                    const item = d.data();
                    const priceNum = Number(item.precio ?? item.price ?? item.precioOriginal ?? 0) || 0;
                    const rawId = d.id;
                    const validId = (rawId && String(rawId) !== 'undefined' && String(rawId) !== 'null' && String(rawId).trim() !== '') 
                        ? String(rawId) 
                        : `prod-${index}-${(item.nombre || 'item').toLowerCase().replace(/\s+/g, '_')}`;

                    return {
                        id: validId,
                        nombre: item.nombre || item.name || 'Producto',
                        descripcion: item.descripcion || item.desc || `${item.categoria || 'Bar'} // Stock: ${item.stock ?? 0}`,
                        precio: priceNum,
                        price: priceNum,
                        categoria: item.categoria || 'Varios',
                        stock: item.stock,
                        stock_actual: item.stock_actual,
                        activar_control_stock: item.activar_control_stock,
                        disponible: item.disponible,
                        img: item.img || item.image || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=400'
                    };
                });
                setMenu(list);
                setLoading(false);
            }, (error) => {
                console.error("Error listening to Bar Menu:", error);
                setLoading(false);
            });

            return unsub;
        };

        const unsubPromise = loadMenu();
        return () => {
            unsubPromise.then(unsub => {
                if (typeof unsub === 'function') unsub();
            });
        };
    }, [negocioId]);

    // Suscribirse a promos activas y extraer ítems de menú
    useEffect(() => {
        const unsub = notificacionesService.subscribeNotificaciones(
            negocioId,
            (data) => {
                const items = getActivePromoItems(data || DEFAULT_NOTIFICACIONES, 'bar');
                setPromoItems(items);
            },
            () => setPromoItems([])
        );
        // Re-chequear vigencia cada minuto (auto-expiración)
        const vigenciaInterval = setInterval(() => {
            setPromoItems(prev => {
                // Force re-evaluation will happen on next subscription update,
                // but we trigger a state update to re-render
                return [...prev];
            });
        }, 60000);
        return () => { unsub(); clearInterval(vigenciaInterval); };
    }, [negocioId]);

    // Combinar promos + menú regular
    const allItems = [...promoItems, ...menu];
    const categories = ['Todos', '🔥 Promo', ...new Set(menu.map(p => p.categoria))].filter((v, i, a) => a.indexOf(v) === i);

    const filteredMenu = allItems.filter(p => {
        const isDisponible = p.disponible !== false && p.disponible !== 'false' && String(p.disponible).toLowerCase() !== 'false';
        const hasStock = !p.activar_control_stock || p.activar_control_stock === 'false' || Number(p.stock_actual ?? p.stock ?? 0) > 0;
        if (!isDisponible || !hasStock) return false;

        const matchesSearch = (p.nombre || '').toLowerCase().includes(search.toLowerCase()) || 
                              (p.descripcion || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'Todos' || p.categoria === category;
        return matchesSearch && matchesCategory;
    });

    const resolveProductId = (p) => {
        if (!p) return '';
        if (typeof p === 'object') {
            const rawId = p.id;
            if (rawId && String(rawId) !== 'undefined' && String(rawId) !== 'null' && String(rawId).trim() !== '') return String(rawId);
            return p.nombre ? `prod-${p.nombre.toLowerCase().replace(/\s+/g, '_')}` : '';
        }
        return String(p);
    };

    const getProductQuantity = (product) => {
        if (!product) return 0;
        const targetId = resolveProductId(product);
        const prodName = typeof product === 'object' ? product.nombre : null;
        const item = cart.find(i => 
            (targetId && String(i.id) === targetId) || 
            (prodName && i.nombre && i.nombre.toLowerCase() === prodName.toLowerCase())
        );
        return item ? Number(item.quantity || 0) : 0;
    };

    const handleRemoveOne = (product) => {
        if (!product) return;
        const targetId = resolveProductId(product);
        const prodName = typeof product === 'object' ? product.nombre : null;
        const item = cart.find(i => 
            (targetId && String(i.id) === targetId) || 
            (prodName && i.nombre && i.nombre.toLowerCase() === prodName.toLowerCase())
        );
        if (item) {
            if (item.quantity > 1) {
                updateQuantity(item.id, -1);
            } else {
                removeFromCart(item.id);
            }
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
        <div className="relative min-h-screen bg-[#111] pb-44 font-sans">
            
            <div className="relative z-10">
                {/* ── Header ── */}
                <header className="px-6 pt-10 pb-4 bg-[#111] sticky top-0 z-50 border-b border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(`/${negocioId}`)} className="text-white hover:text-amber-500 transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                                    COMPLEJO GIO <span className="text-slate-500 text-lg font-bold tracking-widest ml-1">BURGER & BEER</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                             <MapPin size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">NUEVA CÓRDOBA</span>
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

                    {/* Category Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 items-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border ${
                                    category === cat 
                                    ? 'bg-[#eab308] text-black border-[#eab308]' 
                                    : 'bg-transparent text-slate-400 border-white/20 hover:border-white/50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    </div>
                </header>
                {/* ── Product List ── */}
                <div className="px-6 py-8 max-w-[1200px] mx-auto">
                    {/* Section Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{category.replace('🔥 ', '')}</h2>
                        <p className="text-slate-400 text-sm mt-1">Para arrancar y compartir - {filteredMenu.length} opciones</p>
                    </div>

                    {filteredMenu.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMenu.map((p, idx) => (
                                <div key={p.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <MenuProductCard 
                                        product={p} 
                                        onAdd={addToCart} 
                                        onRemove={() => handleRemoveOne(p)}
                                        quantity={getProductQuantity(p)}
                                    />
                                </div>
                            ))}
                        </div>
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
            
            {/* ── Floating WhatsApp Button ── */}
            <a 
                href={`https://wa.me/5493510000000`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="fixed bottom-10 right-6 z-[90] w-14 h-14 bg-[#eab308] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                <MessageCircle size={28} className="fill-current" />
            </a>
            
        </div>
    );
}

