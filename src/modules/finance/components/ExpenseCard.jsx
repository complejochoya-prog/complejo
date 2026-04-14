import React from 'react';
import { TrendingDown, AlertCircle, Clock } from 'lucide-react';

export default function ExpenseCard({ expense }) {
    const isPending = expense.status === 'pendiente';

    return (
        <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            {isPending && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'
            }`}>
                {isPending ? <Clock size={22} /> : <TrendingDown size={22} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-black uppercase tracking-tight text-white truncate">{expense.title}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                        {expense.status}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black italic text-red-400">-${expense.amount.toLocaleString()}</span>
                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">
                        {expense.category} · {expense.date}
                    </span>
                </div>
            </div>
        </div>
    );
}
