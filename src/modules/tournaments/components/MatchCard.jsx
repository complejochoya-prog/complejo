import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function MatchCard({ match, onSetResult }) {
    const isFinished = match.estado === 'finalizado';

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-xl hover:border-white/10 transition-all">
            <div className="bg-slate-950/50 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Calendar size={12} /> {match.fecha}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-l border-white/10 pl-4">
                        <Clock size={12} /> {match.hora}
                    </span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isFinished ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {isFinished ? 'Finalizado' : 'Próximamente'}
                </span>
            </div>

            <div className="p-8 flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 mx-auto mb-3 flex items-center justify-center text-slate-500 font-black text-xl italic uppercase">
                        {match.local.charAt(0)}
                    </div>
                    <div className="text-sm font-black uppercase italic tracking-tight text-white mb-1 truncate">{match.local}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Local</div>
                </div>

                <div className="flex flex-col items-center gap-2 px-4 min-w-[120px]">
                    {isFinished ? (
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black italic text-white">{match.goles_local}</span>
                            <span className="text-slate-700 font-black">VS</span>
                            <span className="text-4xl font-black italic text-white">{match.goles_visitante}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-2xl font-black italic text-slate-700 mb-2">VS</div>
                            {onSetResult && (
                                <button 
                                    onClick={() => onSetResult(match)}
                                    className="text-[9px] font-black uppercase tracking-widest bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Cargar Resultado
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 mx-auto mb-3 flex items-center justify-center text-slate-500 font-black text-xl italic uppercase">
                        {match.visitante.charAt(0)}
                    </div>
                    <div className="text-sm font-black uppercase italic tracking-tight text-white mb-1 truncate">{match.visitante}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Visitante</div>
                </div>
            </div>
        </div>
    );
}
