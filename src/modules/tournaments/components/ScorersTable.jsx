import React from 'react';
import { Target, Award, Shield, AlertTriangle } from 'lucide-react';

export default function ScorersTable({ scorers = [], tarjetas = [], mejorJugador = '', mejorArquero = '' }) {
    return (
        <div className="space-y-6">
            {/* Destacados / Cuadro de Honor */}
            {(mejorJugador || mejorArquero) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mejorJugador && (
                        <div className="glass-premium p-5 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                                <Award size={16} /> Mejor Jugador / MVP
                            </div>
                            <div className="text-xl font-black italic uppercase text-white tracking-tight">
                                {mejorJugador}
                            </div>
                        </div>
                    )}
                    {mejorArquero && (
                        <div className="glass-premium p-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent space-y-2">
                            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest">
                                <Shield size={16} /> Mejor Arquero / Valla Invicta
                            </div>
                            <div className="text-xl font-black italic uppercase text-white tracking-tight">
                                {mejorArquero}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tabla de Goleadores */}
            <div className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-amber-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Tabla de Goleadores</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goles convertidos</span>
                </div>
                <div className="divide-y divide-white/5">
                    {scorers.map((s, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black italic ${
                                    idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-tight text-white">{s.jugador}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.equipo}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black italic text-amber-400">{s.goles}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Goles</span>
                            </div>
                        </div>
                    ))}
                    {scorers.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                            No hay goles registrados todavía
                        </div>
                    )}
                </div>
            </div>

            {/* Tabla de Tarjetas / Disciplina */}
            {tarjetas && tarjetas.length > 0 && (
                <div className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-rose-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Control de Disciplina</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amarillas y Rojas</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {tarjetas.map((t, idx) => (
                            <div key={idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-600 w-4">{idx + 1}</span>
                                    <div>
                                        <div className="text-sm font-bold uppercase text-white">{t.jugador}</div>
                                        <div className="text-[10px] text-slate-400">{t.equipo}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {t.amarillas > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-4 bg-amber-400 rounded-xs shadow-sm inline-block" />
                                            <span className="text-xs font-black text-white">{t.amarillas}</span>
                                        </div>
                                    )}
                                    {t.rojas > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-4 bg-rose-500 rounded-xs shadow-sm inline-block" />
                                            <span className="text-xs font-black text-white">{t.rojas}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
