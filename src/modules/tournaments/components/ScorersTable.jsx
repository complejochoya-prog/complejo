import React from 'react';
import { Target } from 'lucide-react';

export default function ScorersTable({ scorers = [] }) {
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/5 bg-slate-950/30 flex items-center gap-2">
                <Target size={16} className="text-orange-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Goleadores</h3>
            </div>
            <div className="divide-y divide-white/5">
                {scorers.map((s, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-600 w-4">{idx + 1}</span>
                            <div>
                                <div className="text-sm font-black uppercase tracking-tight text-white">{s.jugador}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.equipo}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-black italic text-orange-500">{s.goles}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Goles</span>
                        </div>
                    </div>
                ))}
                {scorers.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        Sin datos
                    </div>
                )}
            </div>
        </div>
    );
}
