import React from 'react';
import { Calendar, Clock, MapPin, Award, Shield, Target, Edit3 } from 'lucide-react';

export default function MatchCard({ match, onEditMatch, isAdmin = true }) {
    const isFinished = match.estado === 'finalizado';
    const isLive = match.estado === 'en_curso';

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[32px] overflow-hidden shadow-xl hover:border-white/10 transition-all space-y-0">
            {/* Cabecera del partido con fecha, hora, cancha y estado */}
            <div className="bg-slate-950/60 px-6 py-3 border-b border-white/5 flex flex-wrap gap-2 justify-between items-center text-[10px]">
                <div className="flex flex-wrap items-center gap-3 font-black uppercase tracking-wider text-slate-400">
                    {match.jornada && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {match.jornada}
                        </span>
                    )}
                    {match.fecha && (
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={12} className="text-indigo-400" /> {match.fecha}
                        </span>
                    )}
                    {match.hora && (
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={12} className="text-indigo-400" /> {match.hora}
                        </span>
                    )}
                    {match.cancha && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <MapPin size={12} className="text-emerald-400" /> {match.cancha}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        isFinished 
                            ? 'bg-slate-800 text-slate-400 border border-white/5' 
                            : isLive 
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {isFinished ? 'Finalizado' : isLive ? '● En Vivo' : 'Programado'}
                    </span>
                    {isAdmin && onEditMatch && (
                        <button
                            onClick={() => onEditMatch(match)}
                            className="p-1.5 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Editar resultado / Planilla del partido"
                        >
                            <Edit3 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Marcador Principal */}
            <div className="p-6 sm:p-8 flex items-center justify-between gap-4">
                {/* Equipo Local */}
                <div className="flex-1 text-center">
                    {match.localLogo ? (
                        <img 
                            src={match.localLogo} 
                            alt={match.local} 
                            className="w-14 h-14 rounded-2xl object-cover border border-white/10 mx-auto mb-2 bg-slate-950" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 mx-auto mb-2 flex items-center justify-center text-indigo-400 font-black text-xl italic uppercase">
                            {(match.local || 'L').charAt(0)}
                        </div>
                    )}
                    <div className="text-sm sm:text-base font-black uppercase italic tracking-tight text-white mb-0.5 truncate">
                        {match.local || 'Local'}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Local</div>
                </div>

                {/* Resultado Central */}
                <div className="flex flex-col items-center gap-2 px-3 min-w-[110px]">
                    {isFinished || isLive ? (
                        <div className="flex items-center gap-3">
                            <span className="text-3xl sm:text-4xl font-black italic text-white tracking-tighter">
                                {match.goles_local ?? 0}
                            </span>
                            <span className="text-slate-700 font-black text-sm">VS</span>
                            <span className="text-3xl sm:text-4xl font-black italic text-white tracking-tighter">
                                {match.goles_visitante ?? 0}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-xl font-black italic text-slate-700 mb-1">VS</div>
                            <span className="text-[10px] font-black uppercase text-slate-500">Por Jugar</span>
                        </div>
                    )}

                    {isAdmin && onEditMatch && (
                        <button 
                            onClick={() => onEditMatch(match)}
                            className="text-[9px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 mt-1"
                        >
                            {isFinished ? 'Planilla' : 'Cargar Resultado'}
                        </button>
                    )}
                </div>

                {/* Equipo Visitante */}
                <div className="flex-1 text-center">
                    {match.visitanteLogo ? (
                        <img 
                            src={match.visitanteLogo} 
                            alt={match.visitante} 
                            className="w-14 h-14 rounded-2xl object-cover border border-white/10 mx-auto mb-2 bg-slate-950" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 mx-auto mb-2 flex items-center justify-center text-indigo-400 font-black text-xl italic uppercase">
                            {(match.visitante || 'V').charAt(0)}
                        </div>
                    )}
                    <div className="text-sm sm:text-base font-black uppercase italic tracking-tight text-white mb-0.5 truncate">
                        {match.visitante || 'Visitante'}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Visitante</div>
                </div>
            </div>

            {/* Ficha adicional: Goleadores, Tarjetas, MVP y Mejor Arquero */}
            {(match.goleadores?.length > 0 || match.amarillas?.length > 0 || match.rojas?.length > 0 || match.mvp || match.mejorArquero) && (
                <div className="bg-slate-950/40 p-4 border-t border-white/5 space-y-2.5 text-xs">
                    {/* Goleadores */}
                    {match.goleadores?.length > 0 && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-300">
                            <Target size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {match.goleadores.map((g, i) => (
                                    <span key={i}>
                                        <strong className="text-white">{g.jugador}</strong> ({g.equipo || ''}) {g.goles ? `x${g.goles}` : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tarjetas */}
                    {(match.amarillas?.length > 0 || match.rojas?.length > 0) && (
                        <div className="flex flex-wrap items-center gap-3 text-[10px]">
                            {match.amarillas?.map((a, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 text-slate-300">
                                    <span className="w-2.5 h-3.5 bg-amber-400 rounded-xs inline-block shadow-sm" />
                                    <span>{a.jugador} ({a.equipo || ''})</span>
                                </span>
                            ))}
                            {match.rojas?.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 text-slate-300">
                                    <span className="w-2.5 h-3.5 bg-rose-500 rounded-xs inline-block shadow-sm" />
                                    <span>{r.jugador} ({r.equipo || ''})</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Destacados del Partido: MVP y Mejor Arquero */}
                    {(match.mvp || match.mejorArquero) && (
                        <div className="flex flex-wrap gap-4 pt-1 border-t border-white/5 text-[10px] font-bold">
                            {match.mvp && (
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <Award size={13} />
                                    <span>Figura (MVP): <strong className="text-white">{match.mvp}</strong></span>
                                </div>
                            )}
                            {match.mejorArquero && (
                                <div className="flex items-center gap-1.5 text-indigo-400">
                                    <Shield size={13} />
                                    <span>Mejor Arquero: <strong className="text-white">{match.mejorArquero}</strong></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
