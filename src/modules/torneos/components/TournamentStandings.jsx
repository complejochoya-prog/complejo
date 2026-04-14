import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy,
    ChevronRight,
    History,
    Star,
    Flame,
    TrendingUp,
    Search,
    Users,
    Calendar,
    ChevronDown
} from 'lucide-react';

export default function TournamentStandings() {
    const [view, setView] = useState('posiciones');

    const standings = [
        { pos: 1, name: 'Los Rayos FC', pj: 10, g: 8, e: 1, p: 1, pts: 25, img: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=200&auto=format&fit=crop' },
        { pos: 2, name: 'Atlético Norte', pj: 10, g: 7, e: 2, p: 1, pts: 23, img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=200&auto=format&fit=crop' },
        { pos: 3, name: 'Real Madrid G', pj: 10, g: 6, e: 2, p: 2, pts: 20, img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop' },
        { pos: 4, name: 'Dep. Central', pj: 10, g: 5, e: 3, p: 2, pts: 18, img: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=200&auto=format&fit=crop' },
        { pos: 5, name: 'Sportivo Sur', pj: 10, g: 4, e: 4, p: 2, pts: 16, img: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&auto=format&fit=crop' },
    ];

    const results = [
        { date: 'OCT 31', team1: 'Los Rayos', score1: 3, team2: 'Atlético', score2: 2, status: 'Finalizado' },
        { date: 'OCT 30', team1: 'Real M. G', score1: 1, team2: 'Central', score2: 1, status: 'Finalizado' },
        { date: 'OCT 29', team1: 'Sportivo', score1: 0, team2: 'Fenix FC', score2: 2, status: 'Finalizado' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-28">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-gold pl-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-gold italic">
                        Temporada Apertura 2024
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                        TABLA DE <span className="text-gold">POSICIONES</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Seguimiento en tiempo real de la Liga Giovanni</p>
                </div>

                {/* Tab Selector */}
                <div className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                    <button
                        onClick={() => setView('posiciones')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'posiciones' ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        Posiciones
                    </button>
                    <button
                        onClick={() => setView('resultados')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'resultados' ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        Resultados
                    </button>
                </div>
            </div>

            {view === 'posiciones' ? (
                /* Rankings Table Style */
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-transparent to-gold/10 rounded-[40px] blur-2xl opacity-40"></div>
                    <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-8 py-6 text-left text-gold text-[10px] font-black uppercase tracking-widest italic">#</th>
                                        <th className="px-8 py-6 text-left text-gold text-[10px] font-black uppercase tracking-widest italic">Equipo</th>
                                        <th className="px-8 py-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">PJ</th>
                                        <th className="px-8 py-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">G</th>
                                        <th className="px-8 py-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">E</th>
                                        <th className="px-8 py-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic">P</th>
                                        <th className="px-8 py-6 text-center text-gold text-[12px] font-black uppercase tracking-widest italic">PTS</th>
                                        <th className="px-8 py-6 text-right w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {standings.map((team) => (
                                        <tr key={team.pos} className="hover:bg-white/[0.03] transition-all group/row cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className={`flex items-center justify-center size-8 rounded-xl font-black italic text-lg ${team.pos === 1 ? 'bg-gold text-slate-950 shadow-lg' : 'bg-white/5 text-slate-400'}`}>
                                                    {team.pos}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`size-14 rounded-2xl overflow-hidden border-2 transition-transform group-hover/row:scale-105 ${team.pos === 1 ? 'border-gold shadow-lg shadow-gold/10' : 'border-white/10'}`}>
                                                        <img src={team.img} alt={team.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-white font-black text-2xl italic tracking-tighter uppercase group-hover/row:text-gold transition-colors">{team.name}</span>
                                                        {team.pos === 1 && <p className="text-[8px] font-black text-gold uppercase tracking-[0.2em] animate-pulse flex items-center gap-1"><Flame size={10} fill="currentColor" /> Líder Absoluto</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center text-slate-300 font-black text-xl italic">{team.pj}</td>
                                            <td className="px-8 py-6 text-center text-slate-400 font-bold">{team.g}</td>
                                            <td className="px-8 py-6 text-center text-slate-400 font-bold">{team.e}</td>
                                            <td className="px-8 py-6 text-center text-slate-400 font-bold">{team.p}</td>
                                            <td className="px-8 py-6 text-center text-gold font-black text-3xl italic tracking-tighter">{team.pts}</td>
                                            <td className="px-8 py-6 text-right">
                                                <ChevronRight className="text-slate-600 group-hover/row:text-gold group-hover/row:translate-x-1 transition-all" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Results Cards Style */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {results.map((res, idx) => (
                        <div key={idx} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all flex flex-col gap-10 group overflow-hidden relative shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                                <History size={120} className="text-gold" />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic border-b border-white/5 pb-4 relative z-10">
                                <span>{res.date} • JORNADA 12</span>
                                <span className="text-gold flex items-center gap-2"><Star size={10} fill="currentColor" /> {res.status}</span>
                            </div>
                            <div className="flex justify-between items-center relative z-10 gap-4">
                                <div className="flex-1 text-center space-y-3">
                                    <div className="size-16 rounded-full bg-slate-800 border-2 border-white/5 mx-auto group-hover:border-gold transition-colors shadow-2xl"></div>
                                    <span className="text-sm font-black italic uppercase tracking-tighter text-white block">{res.team1}</span>
                                </div>
                                <div className="bg-slate-950 border border-white/5 rounded-[24px] px-8 py-4 shadow-inner">
                                    <span className="text-4xl font-black text-white italic tracking-[0.2em] leading-none drop-shadow-lg">{res.score1}-{res.score2}</span>
                                </div>
                                <div className="flex-1 text-center space-y-3">
                                    <div className="size-16 rounded-full bg-slate-800 border-2 border-white/5 mx-auto group-hover:border-gold transition-colors shadow-2xl"></div>
                                    <span className="text-sm font-black italic uppercase tracking-tighter text-white block">{res.team2}</span>
                                </div>
                            </div>
                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest italic hover:bg-gold hover:text-slate-950 transition-all">Ver Crónica del Encuentro</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Action */}
            <div className="bg-gradient-to-r from-gold/10 to-transparent p-10 rounded-[40px] border-l-8 border-gold space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">¿Quieres sumarte a la Liga?</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Aun quedan 2 cupos para el Torneo Clausura</p>
                    </div>
                    <button className="px-10 py-5 bg-gold text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:scale-105 transition-all shadow-xl shadow-gold/20">Registrar Equipo</button>
                </div>
            </div>
        </div>
    );
}
