import React from 'react';
import { Check, ShieldCheck, Zap, Crown } from 'lucide-react';

export default function PlanCard({ plan, currentPlan, onSelect }) {
    const isCurrent = plan.id === currentPlan;
    
    const icons = {
        Free: Zap,
        Basic: ShieldCheck,
        Pro: Crown,
        Premium: Crown
    };
    
    const Icon = icons[plan.id] || ShieldCheck;

    return (
        <div className={`p-6 rounded-[32px] border transition-all ${
            isCurrent 
            ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20' 
            : 'bg-slate-900 border-white/5 hover:border-white/10'
        }`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                    <Icon size={24} />
                </div>
                {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white text-indigo-600 px-3 py-1 rounded-full">
                        Actual
                    </span>
                )}
            </div>

            <h3 className={`text-xl font-black uppercase tracking-tighter italic mb-1 ${
                isCurrent ? 'text-white' : 'text-slate-200'
            }`}>
                {plan.nombre}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-3xl font-black italic ${isCurrent ? 'text-white' : 'text-indigo-400'}`}>
                    ${plan.precio}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-white/50' : 'text-slate-500'}`}>
                    /mes
                </span>
            </div>

            <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                            <Check size={10} strokeWidth={4} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            isCurrent ? 'text-white/80' : 'text-slate-400'
                        }`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={() => onSelect(plan.id)}
                disabled={isCurrent}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    isCurrent 
                    ? 'bg-white/10 text-white cursor-default' 
                    : 'bg-slate-950 text-white border border-white/10 hover:bg-slate-800'
                }`}
            >
                {isCurrent ? 'Plan Activo' : 'Seleccionar'}
            </button>
        </div>
    );
}
