import React from 'react';
import { Shield, User, Trophy } from 'lucide-react';

export default function TeamCard({ team }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-5 rounded-[28px] hover:border-indigo-500/20 transition-all shadow-lg flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Shield size={28} />
            </div>
            <div className="flex-1">
                <h4 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none mb-1">
                    {team.nombre}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <User size={10} /> {team.jugadores || 0} Jugadores
                    </span>
                    {team.capitan && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            Cap: {team.capitan}
                        </span>
                    )}
                </div>
            </div>
            {team.puntos !== undefined && (
                <div className="text-right px-4 py-2 bg-slate-950 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">PTS</span>
                    <span className="text-xl font-black italic text-white leading-none">{team.puntos}</span>
                </div>
            )}
        </div>
    );
}
