import ReactDOM from 'react-dom';
import React, { useState, useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useMesas } from '../../bar/services/MesasContext';
import TableCard from '../components/TableCard';
import OrderCard from '../components/OrderCard';
import PaymentModal from '../components/PaymentModal';
import { 
    ChevronLeft, 
    Plus, 
    Minus,
    ShoppingCart, 
    X, 
    Beer,
    Coffee,
    Utensils,
    CakeSlice,
    ChefHat,
    Receipt,
    Timer,
    CreditCard,
    MessageSquare,
    Users,
    Sparkles,
    Search,
    Trash2,
    Wine
} from 'lucide-react';
import { getMozoSession } from '../services/mozoService';

const QUICK_NOTES = ['Sin hielo', 'Sin cebolla', 'Bien frío', 'Sin sal', 'Bien cocido', 'Poco picante', 'Para llevar'];

export default function MozoTables() {
    const { negocioId, barProducts: configProducts, updateOrder: updateConfigOrder, tables: configTables } = useConfig();
    const { orders, addOrder, updateOrderStatus, barProducts: pedidosProducts } = usePedidos();
    const { mesas, marcarMesaOcupada, marcarMesaDisponible, marcarMesaLimpieza } = useMesas();

    const mozo = getMozoSession();
    const [selectedTable, setSelectedTable] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeNoteItemId, setActiveNoteItemId] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderToPay, setOrderToPay] = useState(null);

    // Normalize and consolidate products from both contexts
    const allProducts = useMemo(() => {
        const source = (pedidosProducts && pedidosProducts.length > 0) 
            ? pedidosProducts 
            : (configProducts || []);
            
        return source.map((p, idx) => {
            const id = String(p.id || `p-${idx}`);
            const nombre = String(p.nombre || p.name || 'Producto');
            const categoria = String(p.categoria || p.category || 'General').trim();
            const precio = Number(p.precio ?? p.price ?? 0) || 0;
            const img = (typeof p.img === 'string' && p.img) ? p.img 
                : ((typeof p.image === 'string' && p.image) ? p.image 
                : ((typeof p.imagen === 'string' && p.imagen) ? p.imagen : ''));

            return {
                ...p,
                id,
                nombre,
                categoria,
                precio,
                img,
                sector: p.sector || (['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].some(c => categoria.toLowerCase().includes(c.toLowerCase())) ? 'cocina' : 'barra')
            };
        });
    }, [pedidosProducts, configProducts]);

    // Categories list with counts and icons
    const dynamicCategories = useMemo(() => {
        const cats = Array.from(new Set(allProducts.map(p => p.categoria))).filter(Boolean);
        return [
            { id: 'todas', label: 'Todas', count: allProducts.length, icon: Sparkles },
            ...cats.map(cat => ({
                id: cat,
                label: cat,
                count: allProducts.filter(p => p.categoria === cat).length,
                icon: (cat.toLowerCase().includes('bebida') || cat.toLowerCase().includes('cerveza') || cat.toLowerCase().includes('trago')) ? Beer 
                    : (cat.toLowerCase().includes('caf') || cat.toLowerCase().includes('licuado')) ? Coffee
                    : (cat.toLowerCase().includes('vino')) ? Wine
                    : (cat.toLowerCase().includes('postre') || cat.toLowerCase().includes('torta') || cat.toLowerCase().includes('dulce')) ? CakeSlice
                    : Utensils
            }))
        ];
    }, [allProducts]);

    // Filter products by selected category and search term
    const filteredProducts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return allProducts.filter(p => {
            const matchCat = category === 'todas' || !category || p.categoria === category;
            const matchSearch = !term || p.nombre.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }, [allProducts, category, searchTerm]);

    // Cart operations
    const addToCart = (product) => {
        if ('vibrate' in navigator) navigator.vibrate(25);
        const pId = String(product.id);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (existing) {
                return prev.map(item => 
                    String(item.id) === pId 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prev, { ...product, id: pId, quantity: 1, comment: '' }];
        });
    };

    const decrementCart = (productId) => {
        if ('vibrate' in navigator) navigator.vibrate(20);
        const pId = String(productId);
        setCart(prev => {
            const existing = prev.find(item => String(item.id) === pId);
            if (!existing) return prev;
            if (existing.quantity <= 1) {
                return prev.filter(item => String(item.id) !== pId);
            }
            return prev.map(item => 
                String(item.id) === pId 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
            );
        });
    };

    const removeFromCart = (productId) => {
        if ('vibrate' in navigator) navigator.vibrate([20, 20]);
        const pId = String(productId);
        setCart(prev => prev.filter(item => String(item.id) !== pId));
    };

    const updateCartComment = (productId, comment) => {
        const pId = String(productId);
        setCart(prev => prev.map(item => String(item.id) === pId ? { ...item, comment } : item));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.quantity, 0);
    }, [cart]);

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 100]);
        
        const total = cartTotal;
        const formattedCartForKDS = cart.map(item => ({
             ...item,
             cantidad: item.quantity,
             price: item.precio,
             sector: item.sector,
             notes: item.comment || '',
             observaciones: item.comment || ''
        }));

        const newOrder = {
            id: `mozo_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            products: cart,
            items: cart,
            productos: formattedCartForKDS,
            total,
            status: "pendiente",
            estado: "nuevo",
            mozoId: mozo?.id || 'mozo_general',
            mozoName: mozo?.name || 'Mozo',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            origin: 'mozo'
        };
        
        if (addOrder) {
            addOrder(newOrder);
        }

        setCart([]);
        setIsMenuOpen(false);
        setIsCartDrawerOpen(false);
    };

    const handleStatusChange = (order, newStatus) => {
        if ('vibrate' in navigator) navigator.vibrate([30, 20, 50]);
        if (updateOrderStatus) {
            updateOrderStatus(String(order.id), newStatus);
        }
        if (updateConfigOrder) {
            updateConfigOrder(String(order.id), { status: newStatus, estado: newStatus });
        }
    };

    const activeOrdersForTable = orders?.filter(o => 
        (String(o.table) === String(selectedTable) || String(o.mesa) === String(selectedTable)) && 
        o.status !== 'paid' && 
        !o.paid
    ) || [];

    const totalDeudaMesa = activeOrdersForTable.reduce((acc, o) => {
        const val = Number(o.total ?? o.monto ?? o.precio ?? 0);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const handlePayTable = () => {
        if (activeOrdersForTable.length === 0) return;
        if ('vibrate' in navigator) navigator.vibrate(30);
        
        const mozoName = mozo?.name || localStorage.getItem('mozoName') || 'Mozo';
        const mozoId = mozo?.id || localStorage.getItem('mozoId') || 'mozo_default';

        const consolidatedOrder = {
            id: `mesa_${selectedTable}_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            total: totalDeudaMesa,
            products: activeOrdersForTable.flatMap(o => o.products || o.items || []),
            items: activeOrdersForTable.flatMap(o => o.products || o.items || []),
            mozoName: mozoName,
            mozoId: mozoId,
            _orderIds: activeOrdersForTable.map(o => o.id).filter(Boolean),
            isConsolidated: true
        };
        
        setOrderToPay(consolidatedOrder);
        setIsPaymentOpen(true);
    };

    const mesasLimpieza = useMemo(() => {
        return (mesas || []).filter(m => m.estado === 'limpieza' || m.estado === 'limpiando');
    }, [mesas]);

    const currentMesaData = selectedTable ? mesas?.find(m => String(m.numero) === String(selectedTable)) : null;
    const isCurrentMesaCleaning = currentMesaData?.estado === 'limpieza' || currentMesaData?.estado === 'limpiando';

    return (
        <div className="min-h-screen pb-32 pt-2">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!selectedTable ? (
                    <>
                        <div className="flex items-center justify-between ml-2 mr-2 mb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Mapa de Mesas
                            </h2>
                            {mesasLimpieza.length > 0 && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                                    🧹 {mesasLimpieza.length} para limpieza
                                </span>
                            )}
                        </div>

                        {mesasLimpieza.length > 0 && (
                            <div className="mx-1 mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between animate-in fade-in duration-300">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🧹</span>
                                    <div>
                                        <p className="text-xs font-black text-amber-300 uppercase tracking-wide">
                                            {mesasLimpieza.length === 1 ? 'Mesa para Limpieza:' : 'Mesas para Limpieza:'} {mesasLimpieza.map(m => `#${m.numero}`).join(', ')}
                                        </p>
                                        <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                                            Haz clic en la mesa para marcarla como limpia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 px-1">
                            {((configTables && configTables.length > 0) ? [...configTables].sort((a,b) => a.tableNumber - b.tableNumber) : []).map(t => {
                                const n = t.tableNumber;
                                const mesaData = mesas?.find(m => parseInt(m.numero) === n);
                                return (
                                    <TableCard 
                                        key={n} 
                                        number={n} 
                                        activeOrders={orders?.filter(o => (String(o.table) === String(n) || String(o.mesa) === String(n)) && o.status !== 'paid' && !o.paid) || []}
                                        mesaEstado={mesaData?.estado || t.status || 'disponible'}
                                        onClick={(num) => {
                                            if ('vibrate' in navigator) navigator.vibrate(30);
                                            setSelectedTable(num);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 px-1">
                        <button 
                            onClick={() => setSelectedTable(null)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-1 transition-colors active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <ChevronLeft size={16} />
                            </div>
                            Volver al Salón
                        </button>

                        {/* Table Command Center */}
                        <div className={`border p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden shadow-xl transition-all ${
                            isCurrentMesaCleaning 
                                ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-[#141210] border-amber-500/40 shadow-amber-500/10'
                                : 'bg-gradient-to-br from-emerald-500/10 to-[#141210] border-emerald-500/20'
                        }`}>
                            <div className="relative z-10 flex flex-col gap-1.5">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                                    Mesa {selectedTable}
                                    {isCurrentMesaCleaning ? (
                                        <span className="bg-amber-400 text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 animate-pulse">
                                            🧹 Limpieza
                                        </span>
                                    ) : currentMesaData?.estado === 'ocupada' ? (
                                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            Ocupada
                                        </span>
                                    ) : null}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <button 
                                        onClick={() => {
                                            if ('vibrate' in navigator) navigator.vibrate(20);
                                            marcarMesaOcupada(selectedTable);
                                        }}
                                        className="text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-300 active:scale-95"
                                    >
                                        Sentar Gente
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if ('vibrate' in navigator) navigator.vibrate(20);
                                            marcarMesaLimpieza(selectedTable);
                                        }}
                                        className="text-[9px] font-black uppercase bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg active:scale-95 flex items-center gap-1"
                                    >
                                        🧹 Limpieza
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if ('vibrate' in navigator) navigator.vibrate(20);
                                            marcarMesaDisponible(selectedTable);
                                        }}
                                        className="text-[9px] font-black uppercase bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg active:scale-95 flex items-center gap-1"
                                    >
                                        <Sparkles size={11} /> Liberar
                                    </button>
                                </div>
                                <p className="text-[11px] text-emerald-400/90 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                    <Receipt size={13} /> Cuenta Mesa: <span className="text-white font-black text-base">${totalDeudaMesa.toLocaleString()}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    if ('vibrate' in navigator) navigator.vibrate(30);
                                    setIsMenuOpen(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>Tomar Comanda</span>
                            </button>
                        </div>

                        {/* Cleaning reminder */}
                        {isCurrentMesaCleaning && (
                            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">🧹</span>
                                    <div>
                                        <p className="text-xs font-black text-amber-300 uppercase">Mesa para Limpieza</p>
                                        <p className="text-[9px] text-amber-400/80 font-bold uppercase">¿Lista para liberar?</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if ('vibrate' in navigator) navigator.vibrate(30);
                                        await marcarMesaDisponible(selectedTable);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg active:scale-95 flex items-center gap-1"
                                >
                                    <Sparkles size={12} /> Liberar
                                </button>
                            </div>
                        )}

                        {/* Active orders list */}
                        <div className="space-y-3 mt-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 flex items-center gap-2">
                                <Utensils size={12} /> Comandas Activas ({activeOrdersForTable.length})
                            </h4>
                            
                            {activeOrdersForTable.length > 0 ? (
                                <>
                                    {activeOrdersForTable.map(order => (
                                        <OrderCard 
                                            key={order.id} 
                                            order={order} 
                                            onStatusChange={handleStatusChange}
                                            isMozoMode={true}
                                        />
                                    ))}

                                    <button 
                                        onClick={handlePayTable}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/30"
                                    >
                                        <CreditCard size={18} strokeWidth={2.5} />
                                        Cobrar Mesa — ${totalDeudaMesa.toLocaleString()}
                                    </button>
                                </>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                    <div className="w-12 h-12 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-center mb-3">
                                        <Utensils size={20} className="text-slate-600" />
                                    </div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider">Mesa sin pedidos activos</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Toca "Tomar Comanda" para agregar productos</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FULLSCREEN MOBILE-FIRST ORDERING MODAL */}
            {isMenuOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[99999] flex flex-col bg-[#0c0a09] animate-in slide-in-from-bottom duration-200">
                    {/* FIXED STICKY TOP BAR: Header + Fixed Search Bar + Categories */}
                    <div className="sticky top-0 z-30 bg-[#0c0a09]/95 backdrop-blur-md border-b border-white/5 pt-safetop pb-2 px-3 space-y-2">
                        {/* Table header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                                    {selectedTable}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase text-white leading-tight">
                                        Mesa {selectedTable}
                                    </h2>
                                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                                        Tomar Comanda
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setIsMenuOpen(false); setIsCartDrawerOpen(false); }}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* FIXED SEARCH BAR */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar productos (ej: Coca, Pizza, Quilmes)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* CATEGORIES PILLS: Scrollable with emerald active style */}
                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
                            {dynamicCategories.map(cat => {
                                const isActive = (category === cat.id);
                                const CatIcon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            if ('vibrate' in navigator) navigator.vibrate(10);
                                            setCategory(cat.id);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                                            isActive 
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                                                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <CatIcon size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        <span>{cat.label}</span>
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-white/10 text-slate-400'}`}>
                                            {cat.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PRODUCT LIST — 100% Mobile screen with padding bottom for Floating Cart Bar */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 pb-28">
                        {filteredProducts.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <Search size={32} className="mx-auto mb-2 text-slate-500" />
                                <p className="text-xs font-bold uppercase text-slate-400">No se encontraron productos</p>
                                <p className="text-[10px] text-slate-600">Prueba con otra palabra o categoría</p>
                            </div>
                        ) : (
                            filteredProducts.map(p => {
                                const cartItem = cart.find(item => String(item.id) === String(p.id));
                                const hasNote = Boolean(cartItem?.comment);
                                const isNoteOpen = activeNoteItemId === p.id;

                                return (
                                    <div 
                                        key={p.id} 
                                        className={`bg-white/[0.03] border rounded-2xl p-3 transition-all ${
                                            cartItem ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-white/5'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Thumbnail with image error protection */}
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                                                {p.img ? (
                                                    <img 
                                                        src={p.img} 
                                                        alt={p.nombre} 
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : null}
                                                <Utensils size={18} className="text-slate-500 absolute pointer-events-none" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white leading-tight truncate">{p.nombre}</h4>
                                                <span className="text-[10px] text-slate-400 font-medium">{p.categoria}</span>
                                                <div className="text-sm font-black text-emerald-400 mt-0.5">
                                                    ${p.precio.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Action / Stepper */}
                                            <div className="shrink-0">
                                                {cartItem ? (
                                                    <div className="flex items-center gap-1 bg-emerald-600/20 border border-emerald-500/40 rounded-xl p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => decrementCart(p.id)}
                                                            className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center active:scale-90 font-black text-sm"
                                                        >
                                                            <Minus size={13} strokeWidth={2.5} />
                                                        </button>
                                                        <span className="text-xs font-black text-emerald-300 min-w-[20px] text-center">
                                                            {cartItem.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => addToCart(p)}
                                                            className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center active:scale-90 shadow font-black text-sm"
                                                        >
                                                            <Plus size={13} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => addToCart(p)}
                                                        className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 shadow-md shadow-emerald-600/20"
                                                    >
                                                        <Plus size={14} strokeWidth={3} />
                                                        <span>Sumar</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom row: Observation toggle button */}
                                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveNoteItemId(isNoteOpen ? null : p.id);
                                                }}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                                    hasNote 
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                                        : 'text-slate-400 bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <MessageSquare size={11} className={hasNote ? 'text-amber-400' : 'text-slate-400'} />
                                                <span>{hasNote ? `Obs: "${cartItem.comment}"` : '+ Agregar observación'}</span>
                                            </button>

                                            {cartItem && (
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    Subtotal: <span className="text-white font-black">${(p.precio * cartItem.quantity).toLocaleString()}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* EXPANDABLE OBSERVATIONS BOX WITH QUICK CHIPS */}
                                        {isNoteOpen && (
                                            <div className="mt-2 p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-2 animate-in fade-in duration-150">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Observación (ej: sin hielo, bien cocido, sin sal)..."
                                                        value={cartItem?.comment || ''}
                                                        onChange={(e) => {
                                                            if (!cartItem) addToCart(p);
                                                            updateCartComment(p.id, e.target.value);
                                                        }}
                                                        className="flex-1 bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 placeholder:text-slate-600 outline-none font-medium"
                                                    />
                                                    {cartItem?.comment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartComment(p.id, '')}
                                                            className="p-1.5 text-slate-500 hover:text-rose-400"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                {/* Quick Chips */}
                                                <div className="flex flex-wrap gap-1">
                                                    {QUICK_NOTES.map(chip => (
                                                        <button
                                                            key={chip}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!cartItem) addToCart(p);
                                                                const current = cartItem?.comment || '';
                                                                const updated = current ? `${current}, ${chip}` : chip;
                                                                updateCartComment(p.id, updated);
                                                            }}
                                                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 active:scale-95 hover:bg-amber-500/20"
                                                        >
                                                            +{chip}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* FLOATING ACTION BOTTOM BAR (Replaces the big screen-blocking comanda card) */}
                    {cart.length > 0 && (
                        <div className="fixed bottom-3 left-3 right-3 max-w-lg mx-auto z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-2.5 shadow-[0_10px_30px_rgba(16,185,129,0.5)] border border-emerald-400/30 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
                            <button 
                                onClick={() => setIsCartDrawerOpen(true)}
                                className="flex items-center gap-2.5 pl-2 text-left active:scale-95 transition-transform"
                            >
                                <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center font-black text-xs relative">
                                    <ShoppingCart size={18} />
                                    <span className="absolute -top-1 -right-1 bg-white text-emerald-900 rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center shadow">
                                        {cartCount}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Comanda ({cartCount})</p>
                                    <p className="text-sm font-black text-white leading-none">${cartTotal.toLocaleString()}</p>
                                </div>
                            </button>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setIsCartDrawerOpen(true)}
                                    className="px-3 py-2 rounded-xl bg-black/20 text-white text-[11px] font-black uppercase tracking-wider active:scale-95"
                                >
                                    Ver Detalle
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    className="px-3.5 py-2 rounded-xl bg-white text-emerald-950 text-[11px] font-black uppercase tracking-wider active:scale-95 flex items-center gap-1.5 shadow-md"
                                >
                                    <ChefHat size={16} />
                                    <span>Mandar</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SLIDE-UP CART REVIEW DRAWER */}
                    {isCartDrawerOpen && (
                        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
                            <div className="bg-[#141210] border-t border-white/10 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
                                {/* Drawer Header */}
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart size={18} className="text-emerald-400" />
                                        <h3 className="text-sm font-black uppercase text-white tracking-wide">
                                            Revisar Comanda — Mesa {selectedTable}
                                        </h3>
                                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {cartCount} items
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => setIsCartDrawerOpen(false)}
                                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Cart Items List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <p className="text-xs font-bold text-white truncate">{item.nombre}</p>
                                                    <p className="text-[10px] text-emerald-400 font-bold">${item.precio.toLocaleString()} c/u</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                                                        <button 
                                                            onClick={() => decrementCart(item.id)}
                                                            className="w-6 h-6 rounded bg-white/5 text-white flex items-center justify-center active:scale-90"
                                                        >
                                                            <Minus size={11} />
                                                        </button>
                                                        <span className="text-xs font-black text-white px-1.5">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => addToCart(item)}
                                                            className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center active:scale-90"
                                                        >
                                                            <Plus size={11} />
                                                        </button>
                                                    </div>
                                                    <span className="text-xs font-black text-white min-w-[50px] text-right">
                                                        ${(item.precio * item.quantity).toLocaleString()}
                                                    </span>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-6 h-6 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center active:scale-90 ml-1"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Note input in cart */}
                                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1.5 border border-white/5">
                                                <MessageSquare size={11} className="text-amber-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Observación (ej: sin sal, sin hielo...)"
                                                    value={item.comment || ''}
                                                    onChange={(e) => updateCartComment(item.id, e.target.value)}
                                                    className="flex-1 bg-transparent text-[11px] text-amber-300 placeholder:text-slate-600 font-medium outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Drawer Footer */}
                                <div className="p-4 border-t border-white/10 bg-black/40 space-y-3 pb-safe">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total a Comandar</span>
                                        <span className="text-xl font-black text-white">${cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsCartDrawerOpen(false)}
                                            className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase"
                                        >
                                            + Agregar más
                                        </button>
                                        <button 
                                            onClick={handlePlaceOrder}
                                            className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
                                        >
                                            <ChefHat size={16} />
                                            <span>Enviar a Cocina</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            , document.body)}

            {/* Payment Modal — Consolidated per-table billing */}
            {isPaymentOpen && (
                <PaymentModal 
                    isOpen={isPaymentOpen}
                    order={orderToPay}
                    orderTotal={orderToPay?.total || 0}
                    onClose={() => setIsPaymentOpen(false)}
                    onConfirm={async (details) => {
                        try {
                            const order = orderToPay;
                            if (!order) return;

                            const activeMozoName = mozo?.name || localStorage.getItem('mozoName') || 'Mozo';
                            const tableId = String(order.table || order.mesa || selectedTable || '');
                            const totalAmount = Number(order.total || totalDeudaMesa || 0);

                            // Register in Caja (non-blocking)
                            try {
                                const { registerExternalMovement } = await import('../../caja/services/cajaService');
                                await registerExternalMovement(negocioId, {
                                    tipo: 'entrada',
                                    categoria: 'Venta mozo',
                                    monto: totalAmount,
                                    descripcion: `Mesa ${tableId} - Cuenta completa - Mozo ${activeMozoName}`,
                                    metodo_pago: (details.method || 'efectivo').toLowerCase(),
                                    origen: 'bar',
                                    mozo: activeMozoName,
                                    receiptImage: details.receipt || null
                                });
                            } catch (cajaErr) {
                                console.warn('[Mozo] Caja registration failed (non-blocking):', cajaErr);
                            }
                            
                            // Mark ALL orders for this table as paid
                            const orderIds = order._orderIds || (order.id ? [order.id] : []);
                            for (const oid of orderIds) {
                                try {
                                    if (updateOrderStatus) await updateOrderStatus(String(oid), 'paid');
                                    if (updateConfigOrder) await updateConfigOrder(String(oid), {
                                        status: "paid",
                                        estado: "paid",
                                        paid: true,
                                        paymentMethod: details.method || 'Efectivo',
                                        paidBy: activeMozoName,
                                        paidAt: new Date().toISOString()
                                    });
                                } catch (orderErr) {
                                    console.warn('[Mozo] Error updating order:', oid, orderErr);
                                }
                            }
                            
                            // Liberar mesa
                            if (tableId && marcarMesaDisponible) {
                                try {
                                    await marcarMesaDisponible(tableId);
                                } catch (mesaErr) {
                                    console.warn('[Mozo] Error freeing table:', mesaErr);
                                }
                            }
                            
                            setIsPaymentOpen(false);
                            setOrderToPay(null);
                            setSelectedTable(null);
                        } catch (e) {
                            console.error('[Mozo] Error al procesar pago:', e);
                            alert("Ocurrió un error al procesar el pago");
                        }
                    }}
                />
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pt-safetop { padding-top: max(0.75rem, env(safe-area-inset-top)); }
                .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
            `}} />
        </div>
    );
}
