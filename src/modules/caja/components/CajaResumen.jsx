import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const cards = [
    {
        key: 'totalBalance',
        label: 'Saldo Actual',
        icon: Wallet,
        gradient: 'from-indigo-600 to-indigo-400',
        glow: 'shadow-indigo-500/25',
        ring: 'ring-indigo-500/20',
        textAccent: 'text-indigo-400',
    },
    {
        key: 'ingresosHoy',
        label: 'Ingresos Hoy',
        icon: TrendingUp,
        gradient: 'from-emerald-600 to-emerald-400',
        glow: 'shadow-emerald-500/25',
        ring: 'ring-emerald-500/20',
        textAccent: 'text-emerald-400',
    },
    {
        key: 'egresosHoy',
        label: 'Egresos Hoy',
        icon: TrendingDown,
        gradient: 'from-rose-600 to-rose-400',
        glow: 'shadow-rose-500/25',
        ring: 'ring-rose-500/20',
        textAccent: 'text-rose-400',
    },
    {
        key: 'gananciaHoy',
        label: 'Ganancia Neta',
        icon: DollarSign,
        gradient: 'from-amber-600 to-amber-400',
        glow: 'shadow-amber-500/25',
        ring: 'ring-amber-500/20',
        textAccent: 'text-amber-400',
    },
];

export default function CajaResumen({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                const value = stats?.[card.key] ?? 0;
                const isNeg = value < 0;

                return (
                    <div
                        key={card.key}
                        className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 group hover:border-white/10 transition-all duration-500 ring-1 ${card.ring}`}
                    >
                        {/* Ambient glow */}
                        <div
                            className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${card.gradient} opacity-[0.07] rounded-full blur-3xl group-hover:opacity-[0.14] transition-opacity duration-700`}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <div
                                    className={`w-11 h-11 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg ${card.glow} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon size={20} className="text-white" />
                                </div>
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">
                                {card.label}
                            </p>
                            <h3 className={`text-3xl font-black italic tracking-tighter ${isNeg ? 'text-rose-400' : 'text-white'}`}>
                                {isNeg ? '-' : ''}${Math.abs(value).toLocaleString('es-AR')}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
