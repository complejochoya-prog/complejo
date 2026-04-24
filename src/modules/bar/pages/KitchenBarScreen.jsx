import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePedidos } from '../services/PedidosContext';
import { useConfig } from '../../../core/services/ConfigContext';
import KitchenOrderCard from '../components/KitchenOrderCard';
import { History, Package, Clock, Utensils, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Removed problematic eventBus import if not used correctly or causing build 404s
// import { on } from "@/core/events/eventBus";

export default function KitchenBarScreen() {
    const navigate = useNavigate();
    const { config, negocioId } = useConfig();
    const { orders, loading, updateOrderStatus } = usePedidos();
    const [activeTab, setActiveTab] = useState('Nuevos');

    // Categorización de pedidos en TIEMPO REAL
    const columns = useMemo(() => [
        { 
            title: 'Nuevos', 
            status: ['nuevo', 'pendiente'], 
            icon: Package, 
            color: 'text-blue-400',
            bg: 'bg-gradient-to-b from-blue-500/10 to-transparent',
            borderColor: 'border-blue-500/20'
        },
        { 
            title: 'Preparando', 
            status: ['preparando', 'en_cocina'], 
            icon: Clock, 
            color: 'text-orange-400',
            bg: 'bg-gradient-to-b from-orange-500/10 to-transparent',
            borderColor: 'border-orange-500/20'
        },
        { 
            title: 'Listos', 
            status: ['listo', 'listo_para_salir', 'para_entregar'], 
            icon: Utensils, 
            color: 'text-emerald-400',
            bg: 'bg-gradient-to-b from-emerald-500/10 to-transparent',
            borderColor: 'border-emerald-500/20'
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
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-150" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Sistema Live</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#020617] flex flex-col overflow-hidden relative text-white">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-150 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />

            {/* Header */}
            <header className="px-4 lg:px-8 py-4 lg:py-6 glass-premium border-b border-white/5 flex items-center justify-between shrink-0 shadow-2xl relative z-20">
                <div className="flex items-center gap-3 lg:gap-5">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
                        <Utensils size={24} className="lg:scale-125" />
                    </div>
                    <div>
                        <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none">Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Kitchen</span></h1>
                        <div className="flex items-center gap-2 mt-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                             <p className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{config?.nombre || 'Complejo'} • LIVE SYNC</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate(`/${negocioId}/pantalla/bar/historial`)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all border border-white/10 shadow-xl active:scale-95"
                >
                    <History size={16} />
                    <span className="hidden sm:inline">Historial</span>
                </button>
            </header>

            {/* Mobile Tabs */}
            <div className="lg:hidden flex px-4 py-3 bg-slate-900/50 backdrop-blur-md border-b border-white/5 gap-2 overflow-x-auto hide-scrollbar shrink-0 z-20 relative">
                {columns.map(col => (
                    <button
                        key={col.title}
                        onClick={() => setActiveTab(col.title)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                            activeTab === col.title 
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105' 
                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                        }`}
                    >
                        <col.icon size={14} />
                        {col.title}
                    </button>
                ))}
            </div>

            {/* Columns Container */}
            <main className="flex-1 overflow-hidden p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 relative z-10">
                {columns.map(col => {
                    const isVisibleOnMobile = activeTab === col.title;
                    const seenIds = new Set();
                    const filteredOrders = (orders || []).filter(o => {
                        if (!o || !o.id || seenIds.has(o.id)) return false;
                        const matchStatus = col.status.includes(o.status || o.estado);
                        if (matchStatus && o.status !== 'paid' && !o.paid && o.estado !== 'paid') {
                            seenIds.add(o.id);
                            return true;
                        }
                        return false;
                    });
                    
                    return (
                        <div 
                            key={col.title} 
                            className={`${isVisibleOnMobile ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col ${col.bg} rounded-[32px] lg:rounded-[40px] border ${col.borderColor} p-4 lg:p-6 transition-all duration-500 h-full overflow-hidden glass-premium relative group`}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 lg:mb-6 shrink-0 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${col.color} shadow-lg backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform`}>
                                        <col.icon size={18} />
                                    </div>
                                    <h2 className="text-sm lg:text-base font-black uppercase tracking-widest italic text-white">
                                        {col.title}
                                    </h2>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black bg-white/10 text-white shadow-lg border border-white/10 ${filteredOrders.length > 0 ? 'animate-pulse' : ''}`}>
                                    {filteredOrders.length}
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10 pb-20 lg:pb-0">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders
                                        .sort((a, b) => {
                                            const getMs = (val) => {
                                                if (!val) return 0;
                                                if (val instanceof Date) return val.getTime();
                                                if (val.toDate) return val.toDate().getTime();
                                                const d = new Date(val);
                                                return isNaN(d.getTime()) ? 0 : d.getTime();
                                            };
                                            return getMs(a.timestamp) - getMs(b.timestamp);
                                        })
                                        .map((order, idx) => (
                                            <div key={`order-${order.id}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                                                <KitchenOrderCard 
                                                    order={{...order, estado: order.status || order.estado}} 
                                                    onStatusChange={changeStatus} 
                                                />
                                            </div>
                                        ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50 relative z-10">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                            <col.icon size={32} className={col.color} />
                                        </div>
                                        <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-center">Zona <br/>Despejada</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
