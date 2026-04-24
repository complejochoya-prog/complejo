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
    Users
} from 'lucide-react';
import { getMozoSession } from '../services/mozoService';

export default function MozoTables() {
    const { negocioId, barProducts, updateOrder: updateConfigOrder, tables: configTables } = useConfig();
    const { orders, addOrder, updateOrderStatus } = usePedidos();
    const { mesas, marcarMesaOcupada, marcarMesaDisponible } = useMesas();
    
    // 🔥 ELIMINADO EL MERGE CON LOCALSTORAGE: 
    // Ahora dependemos 100% de lo que viene de Firebase para que todos los mozos vean lo mismo.

    const mozo = getMozoSession();
    const [selectedTable, setSelectedTable] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderToPay, setOrderToPay] = useState(null);

    React.useEffect(() => {
        if (barProducts.length > 0 && !category) {
            setCategory(barProducts[0].categoria);
        }
    }, [barProducts, category]);

    const dynamicCategories = Array.from(new Set(barProducts.map(p => p.categoria)))
        .filter(Boolean)
        .map(cat => ({
            id: cat,
            label: cat,
            icon: (cat.toLowerCase().includes('bebida') || cat.toLowerCase().includes('cerveza')) ? Beer 
                : (cat.toLowerCase().includes('cafetería') || cat.toLowerCase().includes('licuado')) ? Coffee
                : (cat.toLowerCase().includes('postre') || cat.toLowerCase().includes('torta') || cat.toLowerCase().includes('tarta')) ? CakeSlice
                : Utensils
        }));

    const addToCart = (product) => {
        if ('vibrate' in navigator) navigator.vibrate(30);
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1, comment: '' }]);
        }
    };

    const removeFromCart = (id) => {
        if ('vibrate' in navigator) navigator.vibrate([20, 20]);
        setCart(cart.filter(item => item.id !== id));
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 100]);
        
        const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
        
        // Formato dual para Kitchen Display System
        const formattedCartForKDS = cart.map(item => ({
             ...item,
             cantidad: item.quantity,
             price: item.precio,
             sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].includes(item.categoria) ? 'cocina' : 'barra',
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
            mozoId: mozo.id,
            mozoName: mozo.name,
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            origin: 'mozo'
        };
        
        // Save via PedidosContext (Firebase Directly)
        if (addOrder) {
            addOrder(newOrder);
        }

        setCart([]);
        setIsMenuOpen(false);
    };

    // Handle mozo changing order status (retirado / entregado)
    const handleStatusChange = (order, newStatus) => {
        if ('vibrate' in navigator) navigator.vibrate([30, 20, 50]);
        if (updateOrderStatus) {
            updateOrderStatus(String(order.id), newStatus);
        }
        if (updateConfigOrder) {
            updateConfigOrder(String(order.id), { status: newStatus, estado: newStatus });
        }
    };

    // Update comment/observation on a cart item
    const updateCartComment = (id, comment) => {
        setCart(cart.map(item => item.id === id ? { ...item, comment } : item));
    };

    // All unpaid orders for selected table (active = not paid)
    const activeOrdersForTable = orders?.filter(o => 
        (String(o.table) === String(selectedTable) || String(o.mesa) === String(selectedTable)) && 
        o.status !== 'paid' && 
        !o.paid
    ) || [];

    const filteredProducts = barProducts.filter(p => 
        (p.categoria === category || !category) &&
        (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // CONSOLIDATED TOTAL for the entire table (all unpaid orders)
    const totalDeudaMesa = activeOrdersForTable.reduce((acc, o) => acc + (o.total || 0), 0);

    // Handle paying ALL orders for the table at once
    const handlePayTable = () => {
        if (activeOrdersForTable.length === 0) return;
        if ('vibrate' in navigator) navigator.vibrate(30);
        
        // Create a virtual consolidated order for the PaymentModal
        const consolidatedOrder = {
            id: `mesa_${selectedTable}_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            total: totalDeudaMesa,
            // Merge all products from all orders
            products: activeOrdersForTable.flatMap(o => o.products || o.items || []),
            items: activeOrdersForTable.flatMap(o => o.products || o.items || []),
            mozoName: mozo.name,
            mozoId: mozo.id,
            // Store the individual order IDs so we can mark them all as paid
            _orderIds: activeOrdersForTable.map(o => o.id),
            isConsolidated: true
        };
        
        setOrderToPay(consolidatedOrder);
        setIsPaymentOpen(true);
    };

    return (
        <div className="min-h-screen pb-32 pt-2">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!selectedTable ? (
                    <>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            Mapa de Mesas
                        </h2>
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
                    <div className="space-y-6 px-1">
                        <button 
                            onClick={() => setSelectedTable(null)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-2 transition-colors active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <ChevronLeft size={16} />
                            </div>
                            Volver al Salón
                        </button>

                        {/* Table Command Center */}
                        <div className="bg-gradient-to-br from-amber-500/10 to-[#141210] border border-amber-500/20 p-6 rounded-[32px] flex items-center justify-between relative overflow-hidden shadow-2xl">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col gap-2">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md mb-0 flex items-center gap-3">
                                    Mesa {selectedTable}
                                    {mesas?.find(m => String(m.numero) === String(selectedTable))?.estado === 'ocupada' && (
                                        <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-2 py-1 rounded-full border border-indigo-500/30">
                                            Ocupada
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <button 
                                        onClick={() => marcarMesaOcupada(selectedTable)}
                                        className="text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 transition-colors"
                                    >
                                        Sentar Gente
                                    </button>
                                    <button 
                                        onClick={() => marcarMesaDisponible(selectedTable)}
                                        className="text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 transition-colors"
                                    >
                                        Liberar Mesa
                                    </button>
                                </div>
                                <p className="text-[11px] text-amber-500/80 font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                                    <Receipt size={14} /> Cuenta Total: <span className="text-white font-black text-lg">${totalDeudaMesa.toLocaleString()}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    if ('vibrate' in navigator) navigator.vibrate(30);
                                    setIsMenuOpen(true);
                                }}
                                className="bg-amber-500 text-amber-950 p-4 lg:px-6 lg:py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 min-w-[100px] border border-amber-400"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span>Comandar</span>
                            </button>
                        </div>

                        <div className="space-y-3 mt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 mb-2 flex items-center gap-2">
                                <Utensils size={12} /> Órdenes Activas ({activeOrdersForTable.length})
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

                                    {/* COBRAR TODA LA MESA - Consolidated billing */}
                                    <button 
                                        onClick={handlePayTable}
                                        className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-[20px] text-[12px] font-black uppercase tracking-[0.15em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] mt-4 border border-emerald-400/30"
                                    >
                                        <CreditCard size={20} strokeWidth={2.5} />
                                        Cobrar Mesa — ${totalDeudaMesa.toLocaleString()}
                                    </button>
                                </>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[32px]">
                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-center mb-6 shadow-xl">
                                        <Utensils size={28} className="text-slate-600" />
                                    </div>
                                    <p className="text-[12px] font-black text-white uppercase tracking-widest">Mesa Limpia</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sin órdenes pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Modal Redesigned */}
            {isMenuOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[99999] flex flex-col bg-[#0c0a09] animate-in slide-in-from-bottom duration-300">
                    <header className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md pt-safetop">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                <Utensils size={18} className="text-amber-500" /> Mesa {selectedTable}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Nueva Comanda</p>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 active:scale-95 transition-all">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                        {/* Categories - horizontal scroll on mobile */}
                        <div className="lg:w-72 bg-[#141210] border-b lg:border-b-0 lg:border-r border-white/5 flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-3 gap-2 flex-shrink-0 hide-scrollbar pb-6 lg:pb-3">
                             {dynamicCategories.map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => {
                                        if ('vibrate' in navigator) navigator.vibrate(10);
                                        setCategory(cat.id);
                                    }} 
                                    className={`flex items-center gap-3 p-3 lg:p-4 rounded-xl transition-all whitespace-nowrap border ${
                                        category === cat.id 
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                                            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <cat.icon size={18} strokeWidth={category === cat.id ? 2.5 : 2} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                </button>
                             ))}
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1 overflow-y-auto p-4 content-start pb-24 lg:pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredProducts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => addToCart(p)} 
                                        className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/30 rounded-2xl text-left h-36 flex flex-col justify-between active:scale-[0.98] transition-all group"
                                    >
                                        <h4 className="text-[12px] font-bold text-white/90 leading-snug">{p.nombre}</h4>
                                        <div className="flex items-end justify-between mt-2">
                                            <span className="text-xl font-black text-amber-500 tracking-tighter">${p.precio}</span>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Order Cart Sidebar */}
                        <div className="h-64 lg:h-auto lg:w-96 bg-[#141210] border-t lg:border-t-0 lg:border-l border-white/5 p-4 flex flex-col relative shadow-[0_-20px_40px_rgba(0,0,0,0.5)] lg:shadow-none z-10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3">Comanda Actual</h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-2 pb-4 hide-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <ShoppingCart size={32} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Sin productos</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-amber-500/20 text-amber-500 font-black text-[12px] w-6 h-6 flex items-center justify-center rounded-md border border-amber-500/20">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-white max-w-[130px] truncate">{item.nombre}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-black text-slate-400">${item.precio * item.quantity}</span>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 active:scale-90"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Observation/Note field */}
                                            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-2.5 py-2 border border-white/5">
                                                <MessageSquare size={12} className="text-amber-500/50 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Observación (ej: sin sal, bien cocida...)"
                                                    value={item.comment || ''}
                                                    onChange={(e) => updateCartComment(item.id, e.target.value)}
                                                    className="flex-1 bg-transparent text-[10px] text-amber-500/90 placeholder:text-slate-600 font-bold outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 bg-[#141210] pb-24 lg:pb-4">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Comanda</span>
                                    <span className="text-2xl font-black text-white">${cart.reduce((a, b) => a + (b.precio * b.quantity), 0).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handlePlaceOrder} 
                                    disabled={cart.length === 0} 
                                    className="w-full flex items-center justify-center gap-3 py-4 lg:py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:grayscale shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all"
                                >
                                    <ChefHat size={20} strokeWidth={2.5} /> Enviar a Cocina
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Payment Modal — Consolidated per-table billing */}
            {isPaymentOpen && (
                <div className="fixed z-[300]">
                    <PaymentModal 
                        isOpen={isPaymentOpen}
                        order={orderToPay}
                        orderTotal={orderToPay?.total || 0}
                        onClose={() => setIsPaymentOpen(false)}
                        onConfirm={async (details) => {
                            try {
                                // Register in Caja (non-blocking)
                                try {
                                    const { registerExternalMovement } = await import('../../caja/services/cajaService');
                                    await registerExternalMovement(negocioId, {
                                        tipo: 'entrada',
                                        categoria: 'Venta mozo',
                                        monto: orderToPay.total,
                                        descripcion: `Mesa ${String(orderToPay.table || orderToPay.mesa)} - Cuenta completa - Mozo ${mozo.name}`,
                                        metodo_pago: (details.method || 'efectivo').toLowerCase(),
                                        origen: 'bar',
                                        mozo: mozo.name,
                                        receiptImage: details.receipt
                                    });
                                } catch (cajaErr) {
                                    console.warn('[Mozo] Caja registration failed (non-blocking):', cajaErr);
                                }
                                
                                // Mark ALL orders for this table as paid
                                const orderIds = orderToPay._orderIds || [orderToPay.id];
                                for (const oid of orderIds) {
                                    if (updateOrderStatus) updateOrderStatus(String(oid), 'paid');
                                    if (updateConfigOrder) updateConfigOrder(String(oid), {
                                        status: "paid",
                                        estado: "paid",
                                        paid: true,
                                        paymentMethod: details.method,
                                        paidBy: mozo.name,
                                        paidAt: new Date().toISOString()
                                    });
                                }
                                
                                // Liberar mesa!
                                marcarMesaDisponible(String(orderToPay.table || orderToPay.mesa));
                                
                                setIsPaymentOpen(false);
                                setOrderToPay(null);
                            } catch (e) {
                                console.error(e);
                                alert("Error al procesar pago");
                            }
                        }}
                    />
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pt-safetop { padding-top: max(1rem, env(safe-area-inset-top)); }
            `}} />
        </div>
    );
}
