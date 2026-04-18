import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Users, Calendar, Beer, TrendingUp, Package,
    ChevronRight, Zap, Target, ArrowUpRight, Clock,
    CreditCard, ShoppingBag, Activity, Star, Flame
} from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function Dashboard() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    const businessName = config?.nombre || negocioId?.toUpperCase() || 'NEGOCIO';
    const basePath = `/${negocioId}`;

    const [reservasHoyCount, setReservasHoyCount] = useState(0);
    const [recentReservas, setRecentReservas] = useState([]);
    
    const loadStats = async () => {
        if (!negocioId) return;
        
        // Fetch bookings for today
        const { fetchReservas } = await import('../../reservas/services/reservasService');
        const allRes = await fetchReservas(negocioId);
        const dateStr = new Date().toISOString().split('T')[0];
        const hoy = allRes.filter(r => r.fecha === dateStr);
        setReservasHoyCount(hoy.length);
        setRecentReservas([...allRes].reverse().slice(0, 4));
    };

    useEffect(() => {
        loadStats();
    }, [negocioId]);

    const stats = [
        { label: 'Ingresos Hoy', value: '$45,200', change: '+12%', icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
        { label: 'Reservas Hoy', value: `${reservasHoyCount}`, change: '80%', icon: Calendar, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
        { label: 'Clientes Nuevos', value: '12', change: '+4', icon: Users, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
        { label: 'Stock Bajo', value: '5', change: 'Crítico', icon: Package, color: 'text-red-400', bg: 'from-red-500/20 to-red-500/5', border: 'border-red-500/20' },
    ];

    const quickActions = [
        { label: 'Reservas', icon: Calendar, path: `${basePath}/admin/reservas`, color: 'bg-amber-500' },
        { label: 'Bar', icon: Beer, path: `${basePath}/bar`, color: 'bg-emerald-500' },
        { label: 'Caja', icon: CreditCard, path: `${basePath}/caja`, color: 'bg-blue-500' },
        { label: 'Empleados', icon: Users, path: `${basePath}/empleados`, color: 'bg-purple-500' },
    ];

    return (
        <div className={`space-y-6 lg:space-y-10 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* Header - Mobile First */}
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-[2px] w-6 bg-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60">Panel de Administración</span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.85]">
                        CENTRAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">CONTROL</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {businessName} • {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center gap-3">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400">Sistema Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={`relative bg-gradient-to-br ${stat.bg} border ${stat.border} p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] group hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 lg:mb-4">
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center`}>
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                                <span className={`text-[8px] lg:text-[10px] font-black ${stat.color} px-2 py-1 rounded-lg bg-white/5`}>{stat.change}</span>
                            </div>
                            <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl lg:text-3xl font-black italic tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions - Mobile Grid */}
            <div className="lg:hidden">
                <h3 className="text-sm font-black uppercase tracking-tight italic mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> Acciones Rápidas
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            to={action.path}
                            className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl active:scale-90 transition-transform"
                        >
                            <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center text-black shadow-lg`}>
                                <action.icon size={20} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    <div className="glass-premium rounded-[28px] lg:rounded-[40px] p-5 lg:p-8">
                        <div className="flex items-center justify-between mb-5 lg:mb-8">
                            <h3 className="text-sm lg:text-lg font-black uppercase tracking-tight italic flex items-center gap-2">
                                <Activity size={16} className="text-amber-500" />
                                Actividad <span className="text-amber-500">Reciente</span>
                            </h3>
                            <Link to={`${basePath}/admin/reservas`} className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-amber-500 transition-colors flex items-center gap-1">
                                Ver todo <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="space-y-2 lg:space-y-4">
                            {recentReservas.map((res, i) => (
                                <div key={i} className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl lg:rounded-2xl hover:bg-white/5 transition-all group cursor-pointer">
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-slate-800 flex items-center justify-center text-xs group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0">
                                        <Zap size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider truncate">
                                            {res.cliente?.nombre} {res.cliente?.apellido} - {res.hora}hs
                                        </p>
                                        <p className="text-[8px] lg:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                            {res.fecha} • {res.pago}
                                        </p>
                                    </div>
                                    <ArrowUpRight size={14} className="text-slate-700 group-hover:text-amber-500 transition-colors shrink-0" />
                                </div>
                            ))}
                            {recentReservas.length === 0 && (
                                <div className="py-10 lg:py-16 text-center space-y-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                        <Calendar size={24} />
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">No hay actividad reciente</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revenue Chart Placeholder */}
                    <div className="glass-premium rounded-[28px] lg:rounded-[40px] p-5 lg:p-8 hidden lg:block">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-400" />
                                Revenue <span className="text-emerald-400">Trend</span>
                            </h3>
                        </div>
                        <div className="flex items-end gap-2 h-32">
                            {[40, 65, 45, 80, 55, 95, 70, 85, 60, 90, 75, 100].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-gradient-to-t from-amber-500/40 to-amber-500/10 rounded-lg transition-all duration-1000 hover:from-amber-500 hover:to-amber-400"
                                        style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3">
                            <span className="text-[8px] font-bold text-slate-600 uppercase">Ene</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">Dic</span>
                        </div>
                    </div>
                </div>

                {/* Side Panels */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Alert Panel */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[28px] lg:rounded-[40px] p-6 lg:p-8 text-black space-y-4 lg:space-y-6 relative overflow-hidden group shadow-2xl shadow-amber-500/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        <Zap size={120} className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Star size={12} fill="currentColor" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sistema</span>
                            </div>
                            <h3 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter leading-[0.85]">PANEL DE <br />ALERTAS</h3>
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest opacity-60 mt-3">No hay emergencias pendientes.</p>
                            <button className="w-full mt-4 lg:mt-6 py-3.5 lg:py-4 bg-black text-white rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-black transition-all active:scale-95">
                                Realizar Backup
                            </button>
                        </div>
                    </div>

                    {/* Goal Panel */}
                    <div className="glass-premium rounded-[28px] lg:rounded-[40px] p-6 lg:p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Target size={18} className="text-blue-400" />
                            </div>
                            <h3 className="text-xs lg:text-sm font-black uppercase tracking-tight italic">Objetivo Mensual</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">Ventas</span>
                                <span className="text-sm font-black italic text-white">75%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 w-[75%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-[2s]" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">Reservas</span>
                                <span className="text-sm font-black italic text-white">62%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[62%] rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-[2s]" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Access (Desktop Only) */}
                    <div className="hidden lg:block glass-premium rounded-[40px] p-8 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-tight italic flex items-center gap-2">
                            <Flame size={14} className="text-amber-500" /> Accesos Rápidos
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.path}
                                    className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-white/10 transition-all group"
                                >
                                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-black shadow-lg group-hover:rotate-6 transition-transform`}>
                                        <action.icon size={18} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
