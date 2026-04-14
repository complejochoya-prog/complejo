import React, { useState, useEffect } from 'react';
import { useAuth } from '../../empleados/services/AuthContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { ShoppingCart, Check, Clock, AlertTriangle } from 'lucide-react';

export default function Mozo() {
    const { users } = useAuth();
    const { orders, addOrder, updateOrder } = usePedidos();
    const [mozoId] = useState(() => localStorage.getItem('userId'));
    const [mozoName] = useState(() => localStorage.getItem('userName') || 'Mozo');

    const myOrders = orders.filter(o => o.mozoId === mozoId);
    const pendingOrders = myOrders.filter(o => (o.estado || o.status) === 'pendiente');
    const activeOrders = myOrders.filter(o => ['confirmado', 'preparando', 'en_preparacion'].includes(o.estado || o.status));

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Panel Mozo</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{mozoName}</p>
                    </div>
                    <div className="bg-gold/10 border border-gold/30 px-4 py-2 rounded-2xl">
                        <p className="text-gold text-[10px] font-black uppercase tracking-widest">{myOrders.length} pedidos</p>
                    </div>
                </div>

                {pendingOrders.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-black uppercase tracking-widest text-yellow-500 mb-3 flex items-center gap-2">
                            <Clock size={14} /> Pendientes ({pendingOrders.length})
                        </h2>
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 mb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-sm">Mesa {order.mesa || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{(order.productos || []).length} items</p>
                                    </div>
                                    <p className="text-gold font-black">${order.total || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeOrders.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-3 flex items-center gap-2">
                            <ShoppingCart size={14} /> En Preparación ({activeOrders.length})
                        </h2>
                        {activeOrders.map(order => (
                            <div key={order.id} className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 mb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-sm">Mesa {order.mesa || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{order.estado || order.status}</p>
                                    </div>
                                    <p className="text-blue-400 font-black">${order.total || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {myOrders.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
                        <ShoppingCart size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-600 text-sm font-black uppercase tracking-widest">Sin pedidos activos</p>
                    </div>
                )}
            </div>
        </div>
    );
}
