import React from 'react';
import { Trophy, Shield } from 'lucide-react';

export default function StandingsTable({ standings = [] }) {
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-amber-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white italic">
                        Tabla General de Posiciones
                    </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    3 pts Victoria · 1 pt Empate
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950/70 border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-16 text-center">Pos</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Equipo</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Partidos Jugados">PJ</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Partidos Ganados">PG</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Partidos Empatados">PE</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Partidos Perdidos">PP</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Goles a Favor">GF</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Goles en Contra">GC</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center" title="Diferencia de Gol">DG</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-indigo-400 text-center">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {standings.map((team, idx) => {
                            const dg = (team.dg !== undefined && team.dg !== null) 
                                ? team.dg 
                                : ((team.gf || 0) - (team.gc || 0));

                            let posBadgeColor = 'bg-slate-800 text-slate-400';
                            if (idx === 0) posBadgeColor = 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black';
                            else if (idx === 1) posBadgeColor = 'bg-slate-300 text-slate-950 font-black';
                            else if (idx === 2) posBadgeColor = 'bg-amber-700/80 text-white font-black';

                            return (
                                <tr key={team.equipo || idx} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-5 text-center">
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic mx-auto ${posBadgeColor}`}>
                                            {team.pos || idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            {team.logo ? (
                                                <img 
                                                    src={team.logo} 
                                                    alt={team.equipo} 
                                                    className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 bg-slate-950" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-400 font-black shrink-0">
                                                    {(team.equipo || 'E').charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-sm font-black uppercase italic tracking-tight text-white">
                                                {team.equipo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.pj || 0}</td>
                                    <td className="px-4 py-5 text-sm font-bold text-emerald-400 text-center">{team.pg || 0}</td>
                                    <td className="px-4 py-5 text-sm font-bold text-amber-400 text-center">{team.pe || 0}</td>
                                    <td className="px-4 py-5 text-sm font-bold text-rose-400 text-center">{team.pp || 0}</td>
                                    <td className="px-4 py-5 text-sm font-bold text-slate-300 text-center">{team.gf || 0}</td>
                                    <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.gc || 0}</td>
                                    <td className={`px-4 py-5 text-sm font-black text-center ${dg > 0 ? 'text-emerald-400' : dg < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                        {dg > 0 ? `+${dg}` : dg}
                                    </td>
                                    <td className="px-6 py-5 text-xl font-black italic text-indigo-400 text-center">
                                        {team.pts || 0}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {standings.length === 0 && (
                <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No hay equipos en la tabla de posiciones todavía.
                </div>
            )}
        </div>
    );
}
