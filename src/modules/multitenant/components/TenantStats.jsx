import React from 'react';
import { TrendingUp, Users, DollarSign, Globe } from 'lucide-react';

export default function TenantStats({ stats }) {
    if (!stats) return null;

    const items = [
        { label: 'Complejos Activos', value: stats.totalTenants, icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { label: 'Suscripciones', value: stats.activeSubscriptions, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Ingresos Mensuales', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Reservas Totales', value: stats.totalReservations, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:border-white/10 transition-colors">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-inner`}>
                        <item.icon size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">
                            {item.label}
                        </span>
                        <span className="text-2xl font-black italic text-white leading-none">
                            {item.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
