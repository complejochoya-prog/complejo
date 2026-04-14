import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

export default function FinanceSummary({ summary }) {
    if (!summary) return null;

    const cards = [
        { label: 'Bruto Total', value: summary.totalIncome, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Gastos Totales', value: summary.totalExpenses, icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Utilidad Neta', value: summary.netProfit, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] flex items-center gap-6 group hover:border-white/10 transition-all">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${card.bg} ${card.color} shadow-inner`}>
                        <card.icon size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">
                            {card.label}
                        </span>
                        <span className="text-3xl font-black italic text-white leading-none">
                            ${card.value.toLocaleString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
