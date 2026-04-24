import React, { useState } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { X, UserPlus, Trash2, CreditCard, ChevronRight, Plus, Users, Clock, Receipt, RefreshCw } from 'lucide-react';
import ProductSelector from '../components/ProductSelector';
import OrderList from '../components/OrderList';
import PaymentPanel from '../components/PaymentPanel';
import { processPayment } from '../services/barService';
import { addMovement } from '../../../core/services/cajaService'; // Import integration
import { usePedidos } from '../services/PedidosContext';
import { useMesas } from '../services/MesasContext';

export default function TableDetail({ table, onClose }) {
    const { barProducts, users, negocioId } = useConfig();
    const { orders, addOrder, updateOrder } = usePedidos();
    const { marcarMesaOcupada, marcarMesaDisponible } = useMesas();
    const [view, setView] = useState('detail'); // 'detail', 'add_product', 'payment'
    const [isProcessing, setIsProcessing] = useState(false);

    const tableOrders = (orders || []).filter(o => (String(o.table) === String(table.tableNumber) || String(o.mesa) === String(table.tableNumber)) && o.status !== 'paid');
    
    // Normalize items for OrderList (handling both single-product orders and multi-product carts)
    const normalizedItems = [];
    tableOrders.forEach(o => {
        const lineItems = o.products || o.items;
        if (lineItems && lineItems.length > 0) {
            lineItems.forEach((p, idx) => {
                normalizedItems.push({
                    id: `${o.id}_${p.id}_${idx}`,
                    _orderId: o.id,
                    _productId: p.id,
                    productName: p.nombre || p.productName || 'Producto',
                    price: p.precio || p.price || 0,
                    quantity: p.quantity || p.cantidad || 1,
                    isMulti: true,
                    status: o.status || o.estado || 'nuevo',
                    timestamp: o.timestamp || o.createdAt
                });
            });
        } else {
            normalizedItems.push({
                id: o.id,
                _orderId: o.id,
                productName: o.productName || 'Orden General',
                price: o.price || o.total || 0,
                quantity: o.quantity || 1,
                isMulti: false,
                status: o.status || o.estado || 'nuevo',
                timestamp: o.timestamp || o.createdAt
            });
        }
    });

    const total = tableOrders.reduce((acc, o) => acc + (o.total || (o.price * o.quantity) || 0), 0);
    const mozos = (users || []).filter(u => u.rol?.toLowerCase() === 'mozo' && (u.estado === 'activo' || u.activo === true));

    const handleAddProduct = (product) => {
        const existing = tableOrders.find(o => o.productId === product.id && (o.status === 'active' || o.status === 'nuevo' || o.estado === 'nuevo'));
        
        if (existing) {
            updateOrder(existing.id, { 
                quantity: existing.quantity + 1,
                total: (existing.quantity + 1) * existing.price,
                items: [{
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    cantidad: existing.quantity + 1
                }],
                productos: [{
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    cantidad: existing.quantity + 1
                }]
            });
        } else {
            addOrder({
                id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                table: table.tableNumber,
                mesa: table.tableNumber,
                productId: product.id,
                productName: product.nombre,
                price: product.precio,
                quantity: 1,
                total: product.precio,
                items: [{
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    cantidad: 1,
                    sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].includes(product.categoria) ? 'cocina' : 'barra',
                }],
                productos: [{
                    id: product.id,
                    nombre: product.nombre,
                    precio: product.precio,
                    cantidad: 1,
                    sector: ['Pizzas', 'Empanadas', 'Papas', 'Platos', 'Pastas', 'Burgers', 'Ensaladas', 'Lomos', 'Carnes', 'Tacos', 'Postres', 'Tortas'].includes(product.categoria) ? 'cocina' : 'barra',
                }],
                mozoId: table.mozoId || '',
                mozoName: table.mozoName || 'Barra',
                origin: "bar",
                status: "nuevo",
                estado: "nuevo",
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }

        // Si la mesa estaba disponible, pasarla a ocupada
        if (table.status === 'disponible') {
            if (marcarMesaOcupada) marcarMesaOcupada(table.tableNumber);
        }
        
        setView('detail');
    };

    const handleUpdateQuantity = (itemId, delta) => {
        const item = normalizedItems.find(i => i.id === itemId);
        if (!item) return;

        if (item.isMulti) {
             const order = orders.find(o => o.id === item._orderId);
             if (order) {
                 const lineItems = order.products || order.items || [];
                 const newProducts = [...lineItems];
                 const pIdx = newProducts.findIndex(p => p.id === item._productId);
                 if (pIdx >= 0) {
                     newProducts[pIdx].quantity = Math.max(0, (newProducts[pIdx].quantity || newProducts[pIdx].cantidad || 1) + delta);
                     newProducts[pIdx].cantidad = newProducts[pIdx].quantity;
                     if (newProducts[pIdx].quantity === 0) {
                         newProducts.splice(pIdx, 1);
                     }
                 }
                 const newTotal = newProducts.reduce((acc, p) => acc + (p.precio || p.price) * (p.quantity || p.cantidad || 1), 0);
                 
                 if (newProducts.length === 0) {
                     // Si no quedan productos, borrar toda la orden
                     handleRemoveOrder(order.id);
                 } else {
                     updateOrder(order.id, { products: newProducts, items: newProducts, total: newTotal });
                 }
             }
        } else {
             const order = orders.find(o => o.id === item._orderId);
             if (order) {
                 const newQty = order.quantity + delta;
                 if (newQty <= 0) {
                     handleRemoveOrder(order.id);
                 } else {
                     updateOrder(order.id, { quantity: newQty });
                 }
             }
        }
    };

    const handleRemoveOrder = (orderId) => {
        // Find order in Context and mark as cancelled or just use updateOrder if possible. 
        // For now, we will update its status to 'cancelled' so it hides.
        updateOrder(orderId, { status: 'cancelled', estado: 'cancelado' });
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
                items: normalizedItems.map(o => ({ id: o._productId || o.id, nombre: o.productName, cantidad: o.quantity, precio: o.price }))
            });

            // 2. 🔥 INTEGACIÓN CAJA MÁGICA: Record Movement
            const itemSummary = normalizedItems.map(o => `${o.productName} (x${o.quantity})`).join(', ');
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
                    items: normalizedItems.length
                }
            });

            // 3. Mark orders as paid
            tableOrders.forEach(o => updateOrder(o.id, { status: 'paid', paidAt: new Date().toISOString(), paymentMethod: method }));

            // 4. Reset table
            if (marcarMesaDisponible) marcarMesaDisponible(table.tableNumber);

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
                            orders={normalizedItems} 
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={(itemId) => {
                                const item = normalizedItems.find(i => i.id === itemId);
                                if (item && item.isMulti) {
                                    // Hack to remove specific item: just pass delta to make it 0
                                    handleUpdateQuantity(itemId, -item.quantity);
                                } else if (item) {
                                    handleRemoveOrder(item._orderId);
                                }
                            }}
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
