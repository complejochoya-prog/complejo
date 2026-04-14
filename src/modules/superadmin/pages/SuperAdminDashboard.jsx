/**
 * SuperAdmin Dashboard — SaaS Master Overview
 * Route: /superadmin
 */
import React, { useEffect, useState } from 'react';
import {
    Building2, CheckCircle2, AlertTriangle, Puzzle, Calendar,
    TrendingUp, Activity, ArrowRight, RefreshCw, Zap,
    Star, Globe, Shield, Users, BarChart3, ShoppingBag,
    CreditCard
} from 'lucide-react';
import { useGlobalStats, useRecentActivity } from '../hooks/useSuperAdmin';
import { SYSTEM_MODULES } from '../services/superadminService';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
    const { stats, loading, reload } = useGlobalStats();
    const { activity } = useRecentActivity();
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setAnimate(true), 100);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Cargando Dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Negocios',
            value: stats?.totalNegocios || 0,
            icon: Building2,
            color: 'from-violet-500 to-fuchsia-600',
            textColor: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
            borderColor: 'border-violet-500/20',
            shadow: 'shadow-violet-500/20',
            link: '/superadmin/complejos'
        },
        {
            label: 'Reservas Totales',
            value: 1247, // Simulated total system reservations
            icon: Calendar,
            color: 'from-blue-500 to-indigo-600',
            textColor: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            shadow: 'shadow-blue-500/20',
            link: '/superadmin/stats'
        },
        {
            label: 'Negocios Activos',
            value: stats?.activos || 0,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-teal-600',
            textColor: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            shadow: 'shadow-emerald-500/20',
            link: '/superadmin/complejos'
        },
        {
            label: 'En Prueba',
            value: stats?.enPrueba || 0,
            icon: Zap,
            color: 'from-amber-500 to-orange-600',
            textColor: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
            shadow: 'shadow-amber-500/20',
            link: '/superadmin/complejos'
        }
    ];

    // Module usage top 6
    const moduleUsage = Object.entries(stats?.moduleUsage || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, count]) => {
            const mod = SYSTEM_MODULES.find(m => m.id === id);
            return { id, name: mod?.name || id, icon: mod?.icon || '📦', count };
        });

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full">
                        <Globe size={12} className="text-violet-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                            Vista Global de la Plataforma
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">SaaS</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-md">
                        Resumen general de toda la plataforma Giovanni
                    </p>
                </div>
                <button
                    onClick={reload}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all group"
                >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    Actualizar
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            onClick={() => card.link ? navigate(card.link) : null}
                            className={`relative overflow-hidden rounded-3xl border ${card.borderColor} ${card.bgColor} p-6 transition-all duration-500 hover:scale-[1.02] group ${card.link ? 'cursor-pointer hover:shadow-lg' : ''}`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="relative z-10 space-y-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                                    <Icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                                    <p className="text-4xl font-black italic tracking-tighter leading-none">{card.value}</p>
                                </div>
                            </div>
                            <Icon size={120} className="absolute -bottom-6 -right-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500" />
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Module Usage */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Puzzle size={18} className="text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Módulos más usados</h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Uso por negocios activos</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {moduleUsage.length > 0 ? moduleUsage.map((mod, i) => (
                            <div key={mod.id} className="flex items-center gap-4 group">
                                <span className="text-lg w-8">{mod.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{mod.name}</span>
                                        <span className="text-[10px] font-black text-violet-400">{mod.count} negocios</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (mod.count / (stats?.totalNegocios || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-xs text-center py-8 font-bold uppercase tracking-widest">
                                No hay datos de uso de módulos aún
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Activity size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">Actividad</h3>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Eventos recientes</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {activity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                                <span className="text-lg mt-0.5">{item.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-wider">{item.message}</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hace pocos minutos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Nuevo Negocio', desc: 'Registrar complejo', to: '/superadmin/crear-complejo', icon: Building2, color: 'violet' },
                    { label: 'Gestionar Planes', desc: 'Configurar precios', to: '/superadmin/planes', icon: CreditCard, color: 'emerald' },
                    { label: 'Ver Estadísticas', desc: 'Análisis global', to: '/superadmin/stats', icon: BarChart3, color: 'amber' },
                ].map((action, i) => {
                    const Icon = action.icon;
                    const colorMap = {
                        violet: 'from-violet-500/10 to-fuchsia-500/5 border-violet-500/20 hover:border-violet-500/40 text-violet-400',
                        emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400',
                        amber: 'from-amber-500/10 to-orange-500/5 border-amber-500/20 hover:border-amber-500/40 text-amber-400',
                    };
                    return (
                        <a
                            key={i}
                            href={action.to}
                            className={`bg-gradient-to-br ${colorMap[action.color]} border rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.02] flex items-center gap-4`}
                        >
                            <Icon size={24} />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight">{action.label}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{action.desc}</p>
                            </div>
                            <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </a>
                    );
                })}
            </div>

            {/* Businesses Quick Preview */}
            {stats?.negocios?.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
                                <Building2 size={18} className="text-fuchsia-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Negocios Registrados</h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Últimos complejos</p>
                            </div>
                        </div>
                        <a href="/superadmin/complejos" className="text-[10px] font-black text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors flex items-center gap-1">
                            Ver todos <ArrowRight size={12} />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.negocios.slice(0, 6).map((n) => (
                            <div key={n.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 transition-all group">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${n.estado === 'activo' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                    🏢
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-tight truncate">{n.nombre || n.id}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${n.estado === 'activo' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{n.estado || 'activo'} • {n.plan || 'basico'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
