import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const cards = [
    {
        key: 'totalBalance',
        label: 'Saldo Actual',
        icon: Wallet,
        color: 'indigo',
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
        glow: 'shadow-indigo-500/30',
    },
    {
        key: 'ingresosHoy',
        label: 'Ingresos Hoy',
        icon: TrendingUp,
        color: 'emerald',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        glow: 'shadow-emerald-500/30',
    },
    {
        key: 'egresosHoy',
        label: 'Egresos Hoy',
        icon: TrendingDown,
        color: 'rose',
        gradient: 'from-rose-500 via-red-500 to-orange-500',
        glow: 'shadow-rose-500/30',
    },
    {
        key: 'gananciaHoy',
        label: 'Ganancia Neta',
        icon: DollarSign,
        color: 'amber',
        gradient: 'from-amber-500 via-yellow-500 to-orange-400',
        glow: 'shadow-amber-500/30',
    },
];

export default function CajaResumen({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                const value = stats?.[card.key] ?? 0;
                const isNeg = value < 0;

                return (
                    <div
                        key={card.key}
                        className="group relative overflow-hidden bg-slate-900/40 p-1 rounded-[32px] transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl"
                    >
                        {/* Gradient Border Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
                        
                        <div className="relative bg-slate-950/80 backdrop-blur-3xl rounded-[31px] p-6 h-full border border-white/5">
                            {/* Animated ambient glow */}
                            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${card.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-all duration-1000 group-hover:scale-150`} />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-2xl ${card.glow} group-hover:rotate-12 transition-all duration-500`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 tracking-widest uppercase">
                                            Tiempo Real <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                                    {card.label}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={`text-4xl font-black italic tracking-tighter ${isNeg ? 'text-rose-400' : 'text-white'}`}>
                                        {isNeg ? '-' : ''}${Math.abs(value).toLocaleString('es-AR')}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
