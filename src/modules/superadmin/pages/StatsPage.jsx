/**
 * Estadísticas Globales — Charts and analytics
 * Route: /superadmin/stats
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3, TrendingUp, Calendar, DollarSign,
    Building2, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { useGlobalStats } from '../hooks/useSuperAdmin';

export default function StatsPage() {
    const { stats, loading, reload } = useGlobalStats();
    const [animate, setAnimate] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('6m');

    useEffect(() => { setTimeout(() => setAnimate(true), 100); }, []);

    // Simulated chart data — in production, aggregate from Firebase
    const monthLabels = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
    const reservasData = [120, 185, 210, 195, 240, 280];
    const ingresosData = [45000, 72000, 85000, 78000, 95000, 112000];
    const negociosData = [3, 5, 7, 8, 10, 12];

    const maxReservas = Math.max(...reservasData);
    const maxIngresos = Math.max(...ingresosData);
    const maxNegocios = Math.max(...negociosData);

    const kpiCards = [
        {
            label: 'Reservas Totales',
            value: reservasData.reduce((a, b) => a + b, 0).toLocaleString(),
            change: '+17%',
            positive: true,
            icon: Calendar,
            color: 'violet'
        },
        {
            label: 'Ingresos Estimados',
            value: '$' + (ingresosData.reduce((a, b) => a + b, 0) / 1000).toFixed(0) + 'K',
            change: '+24%',
            positive: true,
            icon: DollarSign,
            color: 'emerald'
        },
        {
            label: 'Crecimiento Negocios',
            value: stats?.totalNegocios || negociosData[negociosData.length - 1],
            change: '+' + (negociosData[negociosData.length - 1] - negociosData[0]),
            positive: true,
            icon: Building2,
            color: 'amber'
        },
        {
            label: 'Tasa Retención',
            value: '94%',
            change: '+2%',
            positive: true,
            icon: TrendingUp,
            color: 'fuchsia'
        },
    ];

    const colorMap = {
        violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', gradient: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/20', bar: 'bg-violet-500' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', bar: 'bg-emerald-500' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', bar: 'bg-amber-500' },
        fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', gradient: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/20', bar: 'bg-fuchsia-500' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Estadísticas <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Globales</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Análisis e insights de toda la plataforma
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {['1m', '3m', '6m', '1a'].map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                ${selectedPeriod === period
                                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                    <button onClick={reload} className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-violet-400 transition-all">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map((kpi, i) => {
                    const Icon = kpi.icon;
                    const c = colorMap[kpi.color];
                    return (
                        <div key={i} className={`relative overflow-hidden rounded-3xl border ${c.border} ${c.bg} p-6 group`}>
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg ${c.shadow}`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${kpi.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} text-[9px] font-black`}>
                                        {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {kpi.change}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                                    <p className="text-3xl font-black italic tracking-tighter leading-none">{kpi.value}</p>
                                </div>
                            </div>
                            <Icon size={100} className="absolute -bottom-4 -right-4 opacity-[0.04]" />
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reservas por Mes - Bar Chart */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Calendar size={18} className="text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Reservas por Mes</h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Últimos 6 meses</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                        {monthLabels.map((month, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[9px] font-black text-violet-400 opacity-0 group-hover:opacity-100 transition-all">
                                    {reservasData[i]}
                                </span>
                                <div className="w-full relative" style={{ height: `${(reservasData[i] / maxReservas) * 100}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all" />
                                </div>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ingresos Estimados - Bar Chart */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <DollarSign size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Ingresos Estimados</h3>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Últimos 6 meses (ARS)</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                        {monthLabels.map((month, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <span className="text-[9px] font-black text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">
                                    ${(ingresosData[i] / 1000).toFixed(0)}K
                                </span>
                                <div className="w-full relative" style={{ height: `${(ingresosData[i] / maxIngresos) * 100}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all" />
                                </div>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Business Growth - Line-style Chart */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <TrendingUp size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">Crecimiento de Negocios</h3>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Evolución de complejos registrados</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black italic tracking-tighter text-amber-400">{negociosData[negociosData.length - 1]}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Actual</p>
                    </div>
                </div>

                {/* Custom SVG-like line visualization */}
                <div className="relative h-48 flex items-end">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="border-b border-dashed border-white/5 h-0" />
                        ))}
                    </div>

                    {/* Bars with line effect */}
                    <div className="relative z-10 flex items-end gap-6 w-full px-4">
                        {monthLabels.map((month, i) => {
                            const height = (negociosData[i] / maxNegocios) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <span className="text-xs font-black text-amber-400 opacity-0 group-hover:opacity-100 transition-all">
                                        {negociosData[i]}
                                    </span>
                                    <div className="w-full flex flex-col items-center">
                                        <div
                                            className="w-4 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full relative group-hover:w-5 transition-all"
                                            style={{ height: `${height * 1.8}px` }}
                                        >
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-950 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { plan: 'Básico', count: stats?.negocios?.filter(n => n.plan === 'basico').length || 4, total: stats?.totalNegocios || 12, color: 'from-slate-500 to-slate-600', text: 'text-slate-400' },
                    { plan: 'Pro', count: stats?.negocios?.filter(n => n.plan === 'pro').length || 5, total: stats?.totalNegocios || 12, color: 'from-amber-500 to-orange-600', text: 'text-amber-400' },
                    { plan: 'Premium', count: stats?.negocios?.filter(n => n.plan === 'premium').length || 3, total: stats?.totalNegocios || 12, color: 'from-violet-500 to-fuchsia-600', text: 'text-violet-400' },
                ].map((p, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center space-y-4">
                        <h4 className={`text-lg font-black uppercase tracking-tight ${p.text}`}>{p.plan}</h4>
                        <div className="relative mx-auto w-32 h-32">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="15.915"
                                    fill="none"
                                    stroke="url(#grad)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(p.count / Math.max(p.total, 1)) * 100} ${100 - (p.count / Math.max(p.total, 1)) * 100}`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="grad">
                                        <stop offset="0%" className={i === 0 ? 'stop-slate-500' : i === 1 ? 'stop-amber-500' : 'stop-violet-500'} stopColor={i === 0 ? '#64748b' : i === 1 ? '#f59e0b' : '#8b5cf6'} />
                                        <stop offset="100%" className={i === 0 ? 'stop-slate-600' : i === 1 ? 'stop-orange-600' : 'stop-fuchsia-600'} stopColor={i === 0 ? '#475569' : i === 1 ? '#ea580c' : '#d946ef'} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black italic tracking-tighter">{p.count}</span>
                            </div>
                        </div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {Math.round((p.count / Math.max(p.total, 1)) * 100)}% del total
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
