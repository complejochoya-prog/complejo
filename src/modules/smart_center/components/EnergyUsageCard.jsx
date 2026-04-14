import React from 'react';
import { Zap, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function EnergyUsageCard({ stats }) {
    if (!stats) return null;

    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[48px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={120} />
            </div>

            <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-white leading-none">
                        Eficiencia <span className="text-indigo-400">Energética</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Consumo en tiempo real del complejo</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                    <Zap size={24} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-2">Carga Actual</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic text-white leading-none">{stats.currentLoad}</span>
                        <span className="text-xs font-black uppercase italic text-indigo-400">kW</span>
                    </div>
                </div>
                <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-2">Demanda Pico</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic text-white leading-none">{stats.peakDemand}</span>
                        <span className="text-xs font-black uppercase italic text-indigo-400">kW</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Historial 7 días (kWh)</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                        <TrendingDown size={12} /> -12% vs ayer
                    </span>
                </div>
                <div className="flex items-end gap-2 h-20">
                    {stats.history.map((val, i) => (
                        <div 
                            key={i} 
                            style={{ height: `${(val / 25) * 100}%` }}
                            className="flex-1 bg-indigo-500/20 rounded-t-lg group-hover:bg-indigo-500/40 transition-all relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {val} kWh
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full mt-10 py-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center gap-3 group/btn hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover/btn:text-white">Ver Reporte Detallado</span>
                <ArrowUpRight size={16} className="text-indigo-400 group-hover/btn:text-white" />
            </button>
        </div>
    );
}
