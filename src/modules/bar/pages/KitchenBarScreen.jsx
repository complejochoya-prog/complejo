import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePedidos } from '../services/PedidosContext';
import { useConfig } from '../../../core/services/ConfigContext';
import KitchenOrderCard from '../components/KitchenOrderCard';
import { History, Package, Clock, Utensils, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { on } from "@/core/events/eventBus";

export default function KitchenBarScreen() {
    const navigate = useNavigate();
    const { config, negocioId } = useConfig();
    const { orders: pedidosOrders, loading, updateOrderStatus, setOrders } = usePedidos();
    const { orders: configOrders } = useConfig();

    // 🔥 MERGE: Combine PedidosContext + ConfigContext orders (de-duplicated)
    const orders = useMemo(() => {
        const map = new Map();
        // PedidosContext orders take priority
        (pedidosOrders || []).forEach(o => map.set(o.id, o));
        // Add any ConfigContext orders not already present
        (configOrders || []).forEach(o => {
            if (!map.has(o.id)) map.set(o.id, o);
        });
        return Array.from(map.values());
    }, [pedidosOrders, configOrders]);

    // 🔥 AUTO-REFRESH: Poll localStorage every 2 seconds so kitchen never misses an order
    useEffect(() => {
        if (!negocioId) return;
        
        const pollInterval = setInterval(() => {
            try {
                const localKey = `${negocioId}_orders`;
                const localData = JSON.parse(localStorage.getItem(localKey)) || [];
                const globalData = JSON.parse(localStorage.getItem("giovanni_orders")) || [];
                
                // Merge both sources
                const mergedMap = new Map();
                [...localData, ...globalData].forEach(o => {
                    if (o && o.id) mergedMap.set(o.id, {
                        ...o,
                        timestamp: new Date(o.timestamp || o.createdAt || Date.now()),
                        status: o.status || o.estado || 'nuevo',
                        estado: o.estado || o.status || 'nuevo'
                    });
                });

                if (setOrders) {
                    setOrders(prev => {
                        const currentMap = new Map();
                        prev.forEach(o => currentMap.set(o.id, o));
                        
                        let changed = false;
                        mergedMap.forEach((newOrder, id) => {
                            const current = currentMap.get(id);
                            if (!current) {
                                currentMap.set(id, newOrder);
                                changed = true;
                            } else if (current.status !== newOrder.status || current.estado !== newOrder.estado) {
                                currentMap.set(id, newOrder);
                                changed = true;
                            }
                        });
                        
                        if (!changed) return prev;
                        return Array.from(currentMap.values()).sort((a, b) => 
                            new Date(b.timestamp) - new Date(a.timestamp)
                        );
                    });
                }
            } catch (e) {
                // Silent fail on poll
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [negocioId, setOrders]);

    // 🔥 ESCUCHA GLOBAL (LOG)
    useEffect(() => {
        const handler = (pedido) => {
            console.log('[Cocina] Pedido recibido:', pedido?.id);
        };

        on('pedido_creado', handler);
        // El estado real lo maneja el PedidosContext
    }, []);

    // Categorización de pedidos en TIEMPO REAL
    const columns = useMemo(() => [
        { 
            title: 'Nuevos', 
            status: ['nuevo', 'pendiente'], 
            icon: Package, 
            color: 'text-blue-400',
            bg: 'bg-blue-500/5'
        },
        { 
            title: 'Preparando', 
            status: ['preparando', 'en_cocina'], 
            icon: Clock, 
            color: 'text-orange-400',
            bg: 'bg-orange-500/5'
        },
        { 
            title: 'Listos', 
            status: ['listo', 'listo_para_salir', 'para_entregar'], 
            icon: Utensils, 
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/5'
        }
    ], []);

    const changeStatus = async (orderId, nextStatus) => {
        try {
            await updateOrderStatus(orderId, nextStatus);
        } catch (e) {
            console.error("No se pudo actualizar el estado:", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sincronizando Cocina en Tiempo Real...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <header className="px-6 py-5 bg-slate-900 border-b border-white/5 flex items-center justify-between shrink-0 shadow-2xl relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl">
                        <Utensils size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Pantalla de Cocina / Bar</h1>
                        <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{config?.nombre || 'Complejo Giovanni'} • LIVE</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate(`/${negocioId}/pantalla/bar/historial`)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl active:scale-95"
                >
                    <History size={16} />
                    Ver Historial
                </button>
            </header>

            {/* Columns Grid */}
            <main className="flex-1 overflow-x-auto p-6 flex gap-6 custom-scrollbar">
                {columns.map(col => {
                    const filteredOrders = orders.filter(o => 
                        col.status.includes(o.status || o.estado) && 
                        o.status !== 'paid' && 
                        !o.paid &&
                        o.estado !== 'paid'
                    );
                    
                    return (
                        <div key={col.title} className={`flex-1 min-w-[360px] flex flex-col ${col.bg} rounded-[32px] border border-white/5 p-4 transition-all duration-300`}>
                            <div className="flex items-center justify-between px-4 py-4 mb-4">
                                <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${col.color}`}>
                                    <col.icon size={18} />
                                    {col.title}
                                </h2>
                                <span className="bg-white/5 text-[11px] font-black w-8 h-8 rounded-full flex items-center justify-center text-slate-400 border border-white/10">
                                    {filteredOrders.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {filteredOrders
                                    .sort((a, b) => a.timestamp - b.timestamp) // Sort by oldest first in kitchen
                                    .map(order => (
                                        <div key={order.id} className="animate-in slide-in-from-top-2 duration-300">
                                            <KitchenOrderCard 
                                                order={{...order, estado: order.status || order.estado}} 
                                                onStatusChange={changeStatus} 
                                            />
                                        </div>
                                    ))
                                }
                                {filteredOrders.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-3 opacity-20 mt-20">
                                        <col.icon size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Sin pedidos<br/>en esta sección</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Modern Status Footer */}
            <footer className="px-6 py-3 bg-slate-900 border-t border-white/5 flex justify-between items-center shrink-0">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    Sincronización en tiempo real activa • Giovanni v3.0
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                    Conectado como {localStorage.getItem('userName') || 'Sistema'}
                </p>
            </footer>
        </div>
    );
}
