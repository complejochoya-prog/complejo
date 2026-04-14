import React, { useState } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import TableCard from '../components/TableCard';
import OrderCard from '../components/OrderCard';
import PaymentModal from '../components/PaymentModal';
import { 
    ChevronLeft, 
    Plus, 
    ShoppingCart, 
    X, 
    Search,
    Beer,
    Coffee,
    Utensils,
    CakeSlice,
    Send
} from 'lucide-react';
import { getMozoSession } from '../services/mozoService';

export default function MozoTables() {
    const { orders, barProducts, addOrder, updateOrder } = useConfig();
    const mozo = getMozoSession();
    const [selectedTable, setSelectedTable] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [category, setCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderToPay, setOrderToPay] = useState(null);

    // Initial category
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
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
        const newOrder = {
            id: `mozo_${Date.now()}`,
            table: selectedTable,
            mesa: selectedTable,
            products: cart,
            items: cart,
            total,
            status: "pendiente",
            estado: "nuevo",
            mozoId: mozo.id,
            mozoName: mozo.name,
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addOrder(newOrder);
        setCart([]);
        setIsMenuOpen(false);
    };

    const handleConfirmPayment = async (details) => {
        try {
            const { registerExternalMovement } = await import('../../caja/services/cajaService');
            await registerExternalMovement({
                tipo: 'entrada',
                categoria: 'Venta mozo',
                monto: orderToPay.total,
                descripcion: `Mesa ${orderToPay.table} - Pago Mozo ${mozo.name}`,
                metodo_pago: (details.method || 'efectivo').toLowerCase(),
                origen: 'bar',
                mozo: mozo.name
            });
            updateOrder(orderToPay.id, {
                status: "paid",
                estado: "entregado",
                paid: true,
                paymentMethod: details.method,
                paidBy: mozo.name,
                paidAt: new Date().toISOString()
            });
            setIsPaymentOpen(false);
            setOrderToPay(null);
        } catch (e) {
            console.error(e);
            alert("Error al procesar pago");
        }
    };

    const activeOrdersForTable = orders.filter(o => o.table === selectedTable && o.status !== 'paid');
    const filteredProducts = barProducts.filter(p => 
        (p.categoria === category || !category) &&
        (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!selectedTable ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 pb-20">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <TableCard 
                            key={n} 
                            number={n} 
                            activeOrders={orders.filter(o => o.table === n && o.status !== 'paid')}
                            onClick={setSelectedTable}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-6 pb-20">
                    <button 
                        onClick={() => setSelectedTable(null)}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-4"
                    >
                        <ChevronLeft size={16} /> Volver a Mesas
                    </button>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[32px] flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Mesa {selectedTable}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestionar pedidos y cuenta</p>
                        </div>
                        <button 
                            onClick={() => setIsMenuOpen(true)}
                            className="bg-indigo-500 text-slate-950 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Nuevo Pedido
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activeOrdersForTable.length > 0 ? (
                            activeOrdersForTable.map(order => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onPay={(o) => {
                                        setOrderToPay(o);
                                        setIsPaymentOpen(true);
                                    }} 
                                />
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4 opacity-30">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <ShoppingCart size={24} />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-widest">Sin pedidos activos</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Menu Modal - Same as before but embedded in the page for now or as full screen portal */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
                    <header className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Mesa {selectedTable}</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500"><X size={20} /></button>
                    </header>
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        <div className="md:w-64 bg-slate-900 border-r border-white/5 flex md:flex-col overflow-x-auto p-4 gap-2">
                             {dynamicCategories.map(cat => (
                                <button key={cat.id} onClick={() => setCategory(cat.id)} className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${category === cat.id ? 'bg-indigo-500 text-slate-950 font-black' : 'text-slate-500'}`}>
                                    <cat.icon size={18} /><span className="text-[9px] font-black uppercase">{cat.label}</span>
                                </button>
                             ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map(p => (
                                <button key={p.id} onClick={() => addToCart(p)} className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-left h-32 flex flex-col justify-between">
                                    <h4 className="text-xs font-bold">{p.nombre}</h4>
                                    <span className="text-lg font-black italic tracking-tighter">${p.precio}</span>
                                </button>
                            ))}
                        </div>
                        <div className="md:w-80 bg-slate-950 border-l border-white/5 p-4 flex flex-col">
                            <h3 className="text-sm font-black mb-4 uppercase">Pedido Actual</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                        <span className="text-xs font-bold">{item.quantity}x {item.nombre}</span>
                                        <button onClick={() => removeFromCart(item.id)}><X size={14} className="text-rose-500" /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handlePlaceOrder} disabled={cart.length === 0} className="w-full py-4 mt-4 bg-indigo-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest disabled:opacity-30">Enviar Pedido</button>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal 
                isOpen={isPaymentOpen}
                order={orderToPay}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handleConfirmPayment}
            />
        </div>
    );
}
