import React from 'react';

export default function StandingsTable({ standings = [] }) {
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-16">Pos</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Equipo</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">PJ</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">PG</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">PE</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">PP</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">GF</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">GC</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {standings.map((team, idx) => (
                            <tr key={team.equipo} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic ${idx < 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {team.pos}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-400 font-black">
                                            {team.equipo.charAt(0)}
                                        </div>
                                        <span className="text-sm font-black uppercase italic tracking-tight text-white">{team.equipo}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.pj}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.pg}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.pe}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.pp}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.gf}</td>
                                <td className="px-4 py-5 text-sm font-bold text-slate-400 text-center">{team.gc}</td>
                                <td className="px-6 py-5 text-lg font-black italic text-indigo-400 text-center">{team.pts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {standings.length === 0 && (
                <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No hay datos de posiciones disponibles.
                </div>
            )}
        </div>
    );
}
