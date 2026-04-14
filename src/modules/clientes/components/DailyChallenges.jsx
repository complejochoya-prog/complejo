import React from 'react';
import { Trophy, Flag, MessageSquare, Star, ChevronRight, Activity, Users } from 'lucide-react';

export default function DailyChallenges() {
    const challenges = [
        { team: 'Los Galácticos FC', category: 'Fútbol 5', level: 'Intermedio+', time: 'Hoy - 21:00 hs', location: 'Cancha Premium 1' },
        { team: 'Dragones del Norte', category: 'Vóley Mixto', level: 'Avanzado', time: 'Hoy - 19:30 hs', location: 'Cancha Multideporte' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-40 font-inter">
            <header className="px-6 py-10 space-y-2 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">DESAFÍOS <span className="text-gold">DIARIOS</span></h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Módulo Social & Plantar Bandera</p>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-12">
                {/* Social Module Intro */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-action-green/20 border border-action-green/30 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-action-green italic mb-2">
                            <Activity size={10} /> 12 Equipos buscando rival
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">
                            ¿LISTOS PARA <br /> <span className="text-gold">EL RETO?</span>
                        </h2>
                    </div>
                    <button className="group relative flex items-center gap-3 bg-gold hover:bg-white text-slate-950 px-8 py-5 rounded-[24px] font-black transition-all transform hover:scale-105 shadow-xl shadow-gold/20">
                        <Flag size={20} className="fill-slate-950" />
                        <span className="uppercase italic tracking-tighter">Plantar Bandera</span>
                    </button>
                </section>

                {/* Challenges Feed */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Post New Challenge Placeholder */}
                    <div className="bg-white/[0.03] border-2 border-dashed border-gold/20 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-gold transition-colors min-h-[300px]">
                        <div className="size-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Flag size={32} className="text-gold" />
                        </div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Publicar Desafío</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px]">Encuentra rival y juega hoy mismo en Complejo Giovanni</p>
                    </div>

                    {challenges.map((c, i) => (
                        <div key={i} className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 space-y-6 hover:border-gold/30 hover:bg-white/[0.05] transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-gold/10 border border-gold/30 text-gold text-[8px] font-black uppercase tracking-widest rounded-full">{c.category}</span>
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">{c.level}</span>
                                </div>
                                <Trophy size={20} className="text-slate-800" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{c.team}</h3>
                                <p className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">{c.time}</p>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Users size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{c.location}</span>
                            </div>
                            <button className="w-full bg-white/5 hover:bg-gold hover:text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-2 border border-white/5">
                                <MessageSquare size={16} />
                                Desafiar
                            </button>
                        </div>
                    ))}
                </section>

                {/* Player Wall (Bolsa de Jugadores) Preview */}
                <section className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 md:p-12 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none text-white">Bolsa de Jugadores</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">¿Te falta uno? O búscate un equipo.</p>
                        </div>
                        <button className="p-3 bg-white/5 rounded-2xl hover:bg-gold hover:text-slate-950 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {['Fútbol 5', 'Padel', 'Vóley'].map((sport, i) => (
                            <div key={i} className="min-w-[140px] p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-2 hover:border-gold/40 transition-colors cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gold italic">{sport}</span>
                                <p className="text-xs font-bold">3 Buscando</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
