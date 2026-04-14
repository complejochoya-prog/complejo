import React from 'react';
import { Users, UserCheck, UserX, Clock, DollarSign, AlertTriangle } from 'lucide-react';

const cards = [
    { key: 'total', label: 'Total Empleados', icon: Users, gradient: 'from-indigo-600 to-indigo-400', ring: 'ring-indigo-500/20' },
    { key: 'activos', label: 'Activos', icon: UserCheck, gradient: 'from-emerald-600 to-emerald-400', ring: 'ring-emerald-500/20' },
    { key: 'inactivos', label: 'Inactivos', icon: UserX, gradient: 'from-slate-600 to-slate-400', ring: 'ring-slate-500/20' },
    { key: 'licencia', label: 'En Licencia', icon: Clock, gradient: 'from-amber-600 to-amber-400', ring: 'ring-amber-500/20' },
];

export default function EmpleadoStats({ stats }) {
    if (!stats) return null;

    return (
        <div className="space-y-4">
            {/* Main Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.key} className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-5 group hover:border-white/10 transition-all duration-500 ring-1 ${card.ring}`}>
                            <div className={`absolute -top-14 -right-14 w-36 h-36 bg-gradient-to-br ${card.gradient} opacity-[0.06] rounded-full blur-3xl group-hover:opacity-[0.12] transition-opacity duration-700`} />
                            <div className="relative z-10">
                                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black italic tracking-tighter text-white">{stats[card.key]}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Salary + Suspended */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Salarios Mensuales</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">
                            ${(stats.totalSalarios || 0).toLocaleString('es-AR')}
                        </p>
                    </div>
                </div>
                {stats.suspendidos > 0 && (
                    <div className="bg-rose-500/[0.04] border border-rose-500/10 rounded-3xl p-5 flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-500/15 rounded-xl flex items-center justify-center text-rose-500">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Suspendidos</p>
                            <p className="text-2xl font-black text-rose-400 italic tracking-tighter">{stats.suspendidos}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
