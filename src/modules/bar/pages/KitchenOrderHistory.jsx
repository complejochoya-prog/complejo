import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchOrderHistory } from '../services/kitchenService';
import { ArrowLeft, Clock, Calendar, ChevronRight, BarChart3, Receipt, Loader2 } from 'lucide-react';

export default function KitchenOrderHistory() {
    const navigate = useNavigate();
    const { config, negocioId } = useConfig();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = () => {
            try {
                // 1. CARGA DE AMBAS FUENTES
                const tenantKey = `${negocioId}_orders`;
                const tenantData = JSON.parse(localStorage.getItem(tenantKey)) || [];
                const globalData = JSON.parse(localStorage.getItem("giovanni_orders")) || [];

                // 2. MERGE CON MAP (EVITAR DUPLICADOS)
                const map = new Map();
                [...tenantData, ...globalData].forEach(order => {
                    if (order && order.id) {
                        map.set(String(order.id), order);
                    }
                });

                const allOrders = Array.from(map.values());
                
                // 3. FILTRAR POR ENTREGADOS / COMPLETADOS
                const entregados = allOrders.filter(o => {
                    const status = (o.status || o.estado || '').toLowerCase();
                    return status === 'entregado' || status === 'terminado' || status === 'cobrado';
                });

                // Ordenar por más recientes primero
                entregados.sort((a, b) => (b.timestamp || b.id) - (a.timestamp || a.id));

                setHistory(entregados);
                setLoading(false);
            } catch (err) {
                console.error("Error cargando historial:", err);
                setLoading(false);
            }
        };
        load();
    }, [negocioId]);

    const calculateStats = () => {
        if (history.length === 0) return { avg: '0:00', totalOrders: 0 };
        const totalSecs = history.reduce((acc, order) => {
            const start = order.id; // It's Date.now()
            const end = new Date(order.readyAt || order.deliveredAt || Date.now()).getTime();
            return acc + Math.floor((end - start) / 1000);
        }, 0);
        const avgSecs = Math.floor(totalSecs / history.length);
        const mins = Math.floor(avgSecs / 60);
        const secs = avgSecs % 60;
        return { 
            avg: `${mins}:${secs.toString().padStart(2, '0')}`,
            totalOrders: history.length
        };
    };

    const stats = calculateStats();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="px-6 py-8 bg-slate-900 border-b border-white/5 flex items-center gap-6 shrink-0">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 active:scale-95 text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">Historial de Pedidos</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Reportes y Estadísticas del Bar</p>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-8 max-w-5xl mx-auto w-full">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-500 p-6 rounded-[32px] text-slate-950 shadow-xl flex flex-col justify-between h-40">
                        <BarChart3 size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Tiempo Promedio</p>
                            <h3 className="text-4xl font-black italic tracking-tighter">{stats.avg} min</h3>
                        </div>
                    </div>
                    <div className="bg-emerald-500 p-6 rounded-[32px] text-slate-950 shadow-xl flex flex-col justify-between h-40">
                        <Receipt size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Pedidos Completados</p>
                            <h3 className="text-4xl font-black italic tracking-tighter">{stats.totalOrders}</h3>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-[32px] text-white shadow-xl flex flex-col justify-between h-40">
                        <Clock size={24} className="text-blue-400" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado General</p>
                            <h3 className="text-xl font-black italic tracking-tighter text-emerald-400 uppercase">Eficiencia Alta</h3>
                        </div>
                    </div>
                </div>

                {/* History Table/List */}
                <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Pedidos Recientes</h2>
                        <Calendar size={18} className="text-slate-500" />
                    </div>
                    
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
                        ) : history.length > 0 ? (
                            history.map(order => (
                                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white font-black italic text-xs">
                                            #{String(order.id).slice(-4)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{order.tipo === 'Para llevar' ? 'Delivery/Takeaway' : `Mesa ${order.mesa}`}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {(order.items || order.productos || []).length} {(order.items || order.productos || []).length === 1 ? 'Producto' : 'Productos'} • ${(order.items || order.productos || []).reduce((sum, i) => sum + (i.precio * (i.cantidad || i.quantity || 1)), 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-12">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tiempo Preparación</p>
                                            <p className="text-sm font-black text-emerald-400 italic">
                                                {Math.floor((new Date(order.readyAt || order.deliveredAt || Date.now()).getTime() - order.id) / 60000)} min
                                            </p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-700 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">
                                No hay pedidos completados hoy
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
