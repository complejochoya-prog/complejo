import React, { useState } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { X, UserPlus, Trash2, CreditCard, ChevronRight, Plus, Users, Clock, Receipt, RefreshCw } from 'lucide-react';
import ProductSelector from '../components/ProductSelector';
import OrderList from '../components/OrderList';
import PaymentPanel from '../components/PaymentPanel';
import { processPayment } from '../services/barService';
import { addMovement } from '../../../core/services/cajaService'; // Import integration

export default function TableDetail({ table, onClose }) {
    const { orders, addOrder, updateOrder, barProducts, users, updateTable, negocioId } = useConfig();
    const [view, setView] = useState('detail'); // 'detail', 'add_product', 'payment'
    const [isProcessing, setIsProcessing] = useState(false);

    const tableOrders = orders.filter(o => o.table === table.tableNumber && o.status !== 'paid');
    const total = tableOrders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
    const mozos = users.filter(u => u.rol?.toLowerCase() === 'mozo' && (u.estado === 'activo' || u.activo === true));

    const handleAddProduct = (product) => {
        const existing = tableOrders.find(o => o.productId === product.id && o.status === 'active');
        
        if (existing) {
            updateOrder(existing.id, { quantity: existing.quantity + 1 });
        } else {
            addOrder({
                id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                table: table.tableNumber,
                productId: product.id,
                productName: product.nombre,
                price: product.precio,
                quantity: 1,
                mozoId: table.mozoId,
                mozoName: table.mozoName,
                origin: "bar",
                status: "active",
                createdAt: new Date().toISOString()
            });
        }

        // Si la mesa estaba disponible, pasarla a ocupada
        if (table.status === 'disponible') {
            updateTable(table.tableNumber, { 
                status: 'ocupada',
                openedAt: new Date().toISOString()
            });
        }
        
        setView('detail');
    };

    const handleUpdateQuantity = (orderId, delta) => {
        const order = tableOrders.find(o => o.id === orderId);
        if (order) {
            const newQty = order.quantity + delta;
            if (newQty <= 0) {
                // Remove logic could go here or deleteOrder function
                const nextOrders = orders.filter(o => o.id !== orderId);
                localStorage.setItem('giovanni_orders', JSON.stringify(nextOrders));
                window.dispatchEvent(new Event('storage'));
            } else {
                updateOrder(orderId, { quantity: newQty });
            }
        }
    };

    const handleRemoveOrder = (orderId) => {
        const nextOrders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('giovanni_orders', JSON.stringify(nextOrders));
        window.dispatchEvent(new Event('storage'));
    };

    const handleConfirmPayment = async (method) => {
        setIsProcessing(true);
        try {
            // 1. Process payment via Bar service
            await processPayment(negocioId, {
                table: table.tableNumber,
                total,
                paymentMethod: method,
                mozoName: table.mozoName || 'Sistema',
                items: tableOrders.map(o => ({ id: o.productId, nombre: o.productName, cantidad: o.quantity, precio: o.price }))
            });

            // 2. 🔥 INTEGACIÓN CAJA MÁGICA: Record Movement
            const itemSummary = tableOrders.map(o => `${o.productName} (x${o.quantity})`).join(', ');
            await addMovement(negocioId, {
                monto: total,
                tipo: 'entrada',
                categoria: 'Venta Bar',
                metodoPago: method,
                descripcion: `Mesa ${table.tableNumber}: ${itemSummary}`,
                origen: 'bar',
                usuario: table.mozoName || 'Sistema',
                metadata: {
                    mesa: table.tableNumber,
                    items: tableOrders.length
                }
            });

            // 3. Mark orders as paid
            tableOrders.forEach(o => updateOrder(o.id, { status: 'paid', paidAt: new Date().toISOString(), paymentMethod: method }));

            // 4. Reset table
            updateTable(table.tableNumber, {
                status: 'disponible',
                mozoId: null,
                mozoName: null,
                openedAt: null
            });

            onClose();
        } catch (e) {
            console.error("Error al procesar pago/caja:", e);
            alert("Error al procesar el pago");
        } finally {
            setIsProcessing(false);
        }
    };

    if (view === 'payment') {
        return (
            <div className="flex items-center justify-center h-full p-12 bg-slate-950">
                <div className="w-full max-w-lg">
                    <PaymentPanel 
                        total={total} 
                        onConfirm={handleConfirmPayment} 
                        onCancel={() => setView('detail')} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full animate-in slide-in-from-bottom duration-500">
            {/* Main Detail Section */}
            <div className={`flex-1 flex flex-col p-10 bg-slate-950 transition-all ${view === 'add_product' ? 'border-r border-white/5 opacity-40' : ''}`}>
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                            <span className="text-4xl font-black italic tracking-tighter">#{table.tableNumber}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Detalle de Mesa</h1>
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
                                    {table.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest">
                                    <Clock size={12} /> Aberta: {table.openedAt ? new Date(table.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                                    <Users size={12} /> Mozo: {table.mozoName || 'No asignado'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                            <Receipt size={16} /> Consumo Actual
                        </h2>
                        <div className="flex gap-2">
                             <select 
                                value={table.mozoId || ''} 
                                onChange={(e) => {
                                    const m = mozos.find(uz => uz.id === e.target.value);
                                    if (m) updateTable(table.tableNumber, { mozoId: m.id, mozoName: m.nombre });
                                }}
                                className="bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 focus:outline-none"
                            >
                                <option value="">Transferir Mozo</option>
                                {mozos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                            <button 
                                onClick={() => setView('add_product')}
                                className="px-5 py-2.5 rounded-xl bg-indigo-500 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <Plus size={14} /> Añadir Producto
                            </button>
                        </div>
                    </div>

                    <OrderList 
                        orders={tableOrders} 
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveOrder}
                    />
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total de la Cuenta</p>
                        <p className="text-5xl font-black text-white italic tracking-tighter font-mono">${total.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            disabled={tableOrders.length === 0}
                            onClick={() => updateTable(table.tableNumber, { status: 'cuenta solicitada' })}
                            className="px-8 py-5 rounded-[24px] bg-slate-900 border border-white/5 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all disabled:opacity-30 flex items-center gap-3"
                        >
                            <RefreshCw size={16} /> Pedir Cuenta
                        </button>
                        <button 
                            disabled={tableOrders.length === 0 || isProcessing}
                            onClick={() => setView('payment')}
                            className="px-10 py-5 rounded-[24px] bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-3 disabled:opacity-30"
                        >
                            <CreditCard size={18} /> Cobrar Mesa
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar for Adding Products */}
            {view === 'add_product' && (
                <div className="w-[450px] bg-slate-900 flex flex-col p-8 border-l border-white/10 animate-in slide-in-from-right duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-black italic tracking-tighter uppercase text-white">Catálogo del Bar</h2>
                        <button onClick={() => setView('detail')} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ProductSelector 
                            products={barProducts}
                            onSelect={handleAddProduct}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
