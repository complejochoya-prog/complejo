/**
 * Monitor del Sistema — Real-time system monitoring
 * Route: /superadmin/sistema
 */
import React, { useState, useEffect } from 'react';
import {
    Activity, Users, Calendar, ShoppingBag, AlertTriangle,
    Wifi, Server, Database, Clock, RefreshCw, CheckCircle2,
    XCircle, BarChart, Cpu, HardDrive, Zap, Shield
} from 'lucide-react';

export default function SistemaPage() {
    const [animate, setAnimate] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => { setTimeout(() => setAnimate(true), 100); }, []);

    const refresh = () => setLastUpdate(new Date());

    // Simulated real-time data — in production connect to Firebase/backend
    const systemMetrics = [
        {
            label: 'Usuarios Activos',
            value: '12',
            subtitle: 'Conectados ahora',
            icon: Users,
            color: 'emerald',
            trend: '+3 última hora'
        },
        {
            label: 'Últimas Reservas',
            value: '28',
            subtitle: 'Hoy',
            icon: Calendar,
            color: 'violet',
            trend: '↑ 15% vs ayer'
        },
        {
            label: 'Pedidos del Bar',
            value: '45',
            subtitle: 'Últimas 24h',
            icon: ShoppingBag,
            color: 'amber',
            trend: '↑ 8% vs ayer'
        },
        {
            label: 'Errores Detectados',
            value: '0',
            subtitle: 'Últimas 24h',
            icon: AlertTriangle,
            color: 'red',
            trend: 'Sin errores'
        },
    ];

    const services = [
        { name: 'Firebase Firestore', status: 'online', latency: '23ms', icon: Database },
        { name: 'Firebase Auth', status: 'online', latency: '15ms', icon: Shield },
        { name: 'API Server', status: 'online', latency: '45ms', icon: Server },
        { name: 'WebSocket', status: 'online', latency: '8ms', icon: Wifi },
        { name: 'Cloud Functions', status: 'online', latency: '120ms', icon: Cpu },
        { name: 'Storage', status: 'online', latency: '35ms', icon: HardDrive },
    ];

    const recentLogs = [
        { time: '06:38', type: 'info', message: 'Reserva #1247 confirmada - Complejo Giovanni', icon: '📅' },
        { time: '06:35', type: 'success', message: 'Pedido #892 completado - Bar Central', icon: '✅' },
        { time: '06:32', type: 'info', message: 'Nuevo empleado registrado - Juan Pérez', icon: '👤' },
        { time: '06:30', type: 'success', message: 'Backup automático completado', icon: '💾' },
        { time: '06:25', type: 'info', message: 'Sincronización de inventario exitosa', icon: '📦' },
        { time: '06:20', type: 'info', message: 'Reporte diario generado', icon: '📊' },
        { time: '06:15', type: 'warning', message: 'Stock bajo: Coca-Cola 500ml (3 unidades)', icon: '⚠️' },
        { time: '06:10', type: 'success', message: 'Negocio "Arena Sports" activado', icon: '🏢' },
    ];

    const colorMap = {
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
        violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', gradient: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/20' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
        red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
    };

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Monitor del <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Sistema</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Estado en tiempo real de toda la plataforma
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            Todo Operativo
                        </span>
                    </div>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-400 transition-all"
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {systemMetrics.map((metric, i) => {
                    const Icon = metric.icon;
                    const c = colorMap[metric.color];
                    return (
                        <div key={i} className={`relative overflow-hidden rounded-3xl border ${c.border} ${c.bg} p-6 group`}>
                            <div className="relative z-10 space-y-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg ${c.shadow}`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{metric.label}</p>
                                    <p className="text-3xl font-black italic tracking-tighter leading-none">{metric.value}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2">{metric.trend}</p>
                                </div>
                            </div>
                            <Icon size={100} className="absolute -bottom-4 -right-4 opacity-[0.04]" />
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services Status */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Server size={18} className="text-violet-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">Estado de Servicios</h3>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Infraestructura de la plataforma</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {services.map((svc, i) => {
                            const SvcIcon = svc.icon;
                            return (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <SvcIcon size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{svc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-slate-600">{svc.latency}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Online</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Logs */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Activity size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">Registro de Actividad</h3>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Últimos eventos del sistema</p>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {recentLogs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all">
                                <span className="text-sm mt-0.5">{log.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed">{log.message}</p>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">
                                        <Clock size={8} className="inline mr-1" />
                                        {log.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Performance */}
            <div className="bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Zap size={18} className="text-violet-400" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Rendimiento del Sistema</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'CPU Usage', value: '12%', max: 100, current: 12, color: 'bg-emerald-400' },
                        { label: 'Memoria', value: '45%', max: 100, current: 45, color: 'bg-violet-400' },
                        { label: 'Disco', value: '23%', max: 100, current: 23, color: 'bg-amber-400' },
                        { label: 'Ancho de Banda', value: '8%', max: 100, current: 8, color: 'bg-fuchsia-400' },
                    ].map((perf, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{perf.label}</span>
                                <span className="text-sm font-black italic tracking-tighter">{perf.value}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${perf.color} rounded-full transition-all duration-1000`} style={{ width: `${perf.current}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Last Update */}
            <div className="text-center">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
