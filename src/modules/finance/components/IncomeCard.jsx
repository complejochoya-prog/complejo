import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function IncomeCard({ amount, area, trend }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] hover:border-indigo-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                    <TrendingUp size={24} />
                </div>
                {trend && (
                    <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        +{trend}%
                    </span>
                )}
            </div>
            
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{area}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black italic text-white">${amount.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <Calendar size={12} className="text-slate-600" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Este Mes</span>
            </div>
        </div>
    );
}
