import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useConfig } from "../hooks/useConfig";
import { usePedidos } from "../../bar/services/PedidosContext";
import { useReservas } from "../../reservas/services/ReservasContext";
import {
    TrendingUp,
    Users,
    AlertTriangle,
    Calendar,
    Plus,
    ChevronRight,
    DollarSign,
    MessageCircle,
    MoreVertical,
    Activity,
    Flame,
    Loader2,
    Utensils,
    Settings,
    BarChart3
} from 'lucide-react';

export default function Dashboard() {
    const { loading, negocioId } = useConfig();
    const { orders = [], barProducts = [] } = usePedidos() || {};
    const { bookings = [] } = useReservas() || {};
    const now = new Date();

    const stats = useMemo(() => {
        // Today's orders
        const todayOrders = orders.filter(o => {
            const date = o.timestamp?.toDate ? o.timestamp.toDate() : new Date(o.timestamp);
            return date.toDateString() === now.toDateString();
        });
        const orderRevenue = todayOrders.reduce((acc, o) => acc + (o.total || 0), 0);

        // Today's bookings
        const todayBookings = bookings.filter(b => {
             const date = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return date.toDateString() === now.toDateString();
        });
        const bookingRevenue = todayBookings.reduce((acc, b) => acc + (b.price || 0), 0);

        const totalRevenue = orderRevenue + bookingRevenue;

        // Occupancy (rough estimate based on resources)
        const occupation = todayBookings.length > 0 ? '75%' : '0%';

        // Stock alerts
        const lowStock = barProducts.filter(p => p.activar_control_stock && p.stock_actual <= p.stock_minimo).length;

        return [
            { label: 'Ingresos Totales (Hoy)', value: `$${totalRevenue.toLocaleString()}`, trend: 'Real', icon: DollarSign, color: 'text-gold', sub: `${todayOrders.length} pedidos + ${todayBookings.length} reservas` },
            { label: 'Actividad de Canchas', value: occupation, trend: 'Hoy', icon: Activity, color: 'text-action-green', sub: `${todayBookings.length} turnos registrados` },
            { label: 'Alertas de Stock', value: lowStock.toString(), trend: lowStock > 0 ? 'Crítico' : 'OK', icon: AlertTriangle, color: lowStock > 0 ? 'text-red-500' : 'text-slate-400', sub: 'Productos bajos en stock' },
        ];
    }, [orders, bookings, barProducts]);

    const recentBookings = useMemo(() => {
        return (bookings || []).slice(0, 5).map(b => {
            const date = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return {
                time: b.time || '00:00',
                resource: b.resource?.name || 'Recurso',
                user: b.clientName || 'Cliente Anónimo',
                status: b.status || 'Confirmado',
                price: b.price || 0,
                date: date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase()
            };
        });
    }, [bookings]);

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-gold size-12" />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gold italic">
                        <Flame size={10} fill="currentColor" /> Live Dashboard
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">PANEL <span className="text-gold">MASTER</span></h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reorganización Modular — <span className="text-white">{now.toLocaleDateString('es-AR', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
                </div>
                <div className="flex gap-3">
                    <Link to={`/${negocioId}/admin/reservas`} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest italic hover:bg-white/10 transition-all flex items-center gap-2">
                        <Calendar size={16} className="text-gold" />
                        Agenda Completa
                    </Link>
                    <Link to={`/${negocioId}/reservar`} className="px-6 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform">
                        <Plus size={16} />
                        Nueva Reserva
                    </Link>
                </div>
            </div>

            {/* Modular Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'MÓDULO BAR', desc: 'Ventas, Cocina, Stock e Inventario', icon: Utensils, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', link: `/${negocioId}/bar-management` },
                    { title: 'MÓDULO RESERVAS', desc: 'Canchas, Espacios, Turnos y Precios', icon: Calendar, color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5', link: `/${negocioId}/admin/reservas` },
                    { title: 'MÓDULO EMPLEADOS', desc: 'Personal, Roles, Permisos e Historial', icon: Users, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', link: `/${negocioId}/employees` },
                    { title: 'CONFIGURACIÓN', desc: 'Local, WhatsApp y Edición de Home', icon: Settings, color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/5', link: `/${negocioId}/settings` },
                ].map((mod, idx) => (
                    <Link
                        key={idx}
                        to={mod.link}
                        className={`p-8 rounded-[32px] border ${mod.border} ${mod.bg} backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] active:scale-95 transition-all`}
                    >
                        <div className="relative z-10 space-y-4">
                            <div className={`size-14 rounded-2xl bg-white/5 flex items-center justify-center ${mod.color} group-hover:scale-110 transition-transform`}>
                                <mod.icon size={28} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-black italic uppercase tracking-tighter ${mod.color}`}>{mod.title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{mod.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 group-hover:text-gold transition-colors pt-2">
                                INGRESAR AL MÓDULO <ChevronRight size={14} />
                            </div>
                        </div>
                        <mod.icon size={120} className={`absolute -bottom-8 -right-8 ${mod.color} opacity-[0.03] -rotate-12 transition-transform group-hover:scale-110`} />
                    </Link>
                ))}
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                        <div key={idx} className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01] flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{s.label}</p>
                                    <p className="text-xl font-black italic uppercase tracking-tighter text-white">{s.value}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${s.trend === 'Crítico' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-action-green/10 border-action-green/50 text-action-green'}`}>
                                {s.trend}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Reservation List */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter border-l-4 border-gold pl-5 leading-none">Próximos Turnos</h2>
                        <Link to={`/${negocioId}/admin/reservas`} className="text-gold text-[10px] font-black hover:underline uppercase tracking-widest italic">Ver Reporte Expandido</Link>
                    </div>
                    <div className="space-y-4">
                        {recentBookings.map((b, idx) => (
                            <div key={idx} className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 flex flex-wrap items-center justify-between gap-6 hover:border-gold/30 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[20px] bg-slate-900 border border-white/5 flex flex-col items-center justify-center text-gold shrink-0">
                                        <span className="text-lg font-black italic leading-none">{b.time}</span>
                                        <span className="text-[8px] uppercase font-bold text-slate-500 tracking-tighter">{b.date}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none">{b.resource}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cliente: <span className="text-white">{b.user}</span> • ${b.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${b.status === 'Confirmado' ? 'bg-action-green/10 border-action-green/30 text-action-green' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                                        {b.status}
                                    </div>
                                    <button className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-green-500/20">
                                        <MessageCircle size={14} />
                                        WhatsApp
                                    </button>
                                    <button className="p-2 text-slate-600 hover:text-gold transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-10">
                    {/* Bar Monitor */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none text-red-500">Alertas de Stock</h3>
                        <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/20 relative overflow-hidden group">
                            <ul className="space-y-5 relative z-10">
                                {barProducts.filter(p => p.activar_control_stock && p.stock_actual <= p.stock_minimo).slice(0, 5).map(p => (
                                    <li key={p.id} className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.name}</span>
                                        <span className="text-[10px] font-black text-red-500 uppercase italic">{p.stock_actual <= 0 ? 'Sin Stock' : `Bajo: ${p.stock_actual}`}</span>
                                    </li>
                                ))}
                                {barProducts.filter(p => p.activar_control_stock && p.stock_actual <= p.stock_minimo).length === 0 && (
                                    <li className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">No hay alertas activas</li>
                                )}
                            </ul>
                            <Link to={`/${negocioId}/bar-management`} className="mt-8 block w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-center hover:bg-white hover:text-red-500 transition-all">Gestionar Inventario</Link>
                            <AlertTriangle size={80} className="absolute -bottom-4 -right-4 text-red-500 opacity-10 -rotate-12 transition-transform group-hover:scale-110" />
                        </div>
                    </section>

                    {/* Manual Blocking Quick Section */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Control Maestro</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link to={`/${negocioId}/health-check`} className="flex items-center justify-between p-6 rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-red-500/50 transition-all group w-full">
                                <div className="flex items-center gap-4">
                                    <Activity size={20} className="text-gold" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Estado del Sistema</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to={`/${negocioId}/reportes-pro`} className="flex items-center justify-between p-6 rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-gold transition-all group w-full">
                                <div className="flex items-center gap-4">
                                    <BarChart3 size={20} className="text-gold" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Análisis de Datos</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
