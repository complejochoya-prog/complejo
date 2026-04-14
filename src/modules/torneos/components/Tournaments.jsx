import React from 'react';
import { Trophy, Calendar, Users, ChevronRight, Activity, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { useTorneos } from '../services/TorneosContext';

export default function Tournaments() {
    const { businessInfo } = useConfig();
    const { tournaments } = useTorneos();

    const activeTournaments = tournaments.filter(t => t.status === 'En Juego' || t.status === 'Activo');
    const upcomingTournaments = tournaments.filter(t => t.status === 'Inicia Pronto' || t.status === 'Proximamente');

    const handleWhatsAppOrganize = () => {
        const message = encodeURIComponent("Hola! Quiero organizar un torneo en Complejo Giovanni.");
        window.open(`https://wa.me/${businessInfo.whatsappContact}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-40 font-inter">
            <header className="px-6 py-10 space-y-2 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">TODOS LOS <span className="text-gold">TORNEOS</span></h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Competición de Alto Nivel</p>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-12">
                {/* Active Tournaments */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter border-l-4 border-gold pl-4 leading-none">Torneos Activos</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{activeTournaments.length} Competencias</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {activeTournaments.map((t, i) => (
                            <Link key={t.id || i} to="/tournament-standings" className="group relative bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-500">
                                <div className="relative w-full md:w-48 aspect-video md:aspect-square overflow-hidden shrink-0">
                                    <img src={t.img || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=500&auto=format&fit=crop'} alt={t.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-slate-950/20"></div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                                    <div className="space-y-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-action-green/20 border border-action-green/30 text-action-green text-[8px] font-black uppercase tracking-widest rounded-full">{t.status}</span>
                                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">{t.category}</span>
                                        </div>
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{t.name}</h4>
                                        <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-slate-500">
                                            <Users size={14} />
                                            <span className="text-xs font-bold uppercase tracking-widest">{t.teams || 0} Equipos Participando</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-end">
                                        <div className="size-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:bg-gold transition-all duration-300">
                                            <ChevronRight size={24} className="text-gold group-hover:text-slate-950 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {activeTournaments.length === 0 && (
                            <p className="text-center py-10 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic border border-white/5 rounded-[32px]">No hay torneos activos en este momento</p>
                        )}
                    </div>
                </section>

                {/* Organize CTA */}
                <section className="bg-gold/90 border border-gold rounded-[32px] p-8 md:p-12 text-slate-950 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left space-y-4">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-[0.9]">ORGANIZÁ TU <br /> PROPIO TORNEO</h3>
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest italic max-w-sm opacity-80">
                                Ponemos la infraestructura, el arbitraje y la gestión. Vos solo traé la pasión.
                            </p>
                        </div>
                        <button
                            onClick={handleWhatsAppOrganize}
                            className="bg-slate-950 text-gold px-10 py-5 rounded-2xl font-black uppercase tracking-widest italic transition-all hover:bg-white hover:text-slate-950 shadow-2xl shadow-black/20"
                        >
                            Quiero Organizar
                        </button>
                    </div>
                    <Activity className="absolute -right-10 -top-10 size-64 text-slate-950/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
                </section>

                {/* Upcoming */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter border-l-4 border-gold pl-4 leading-none">Próximos Torneos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingTournaments.map((t, i) => (
                            <div key={t.id || i} className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden flex items-center p-4 gap-4">
                                <img src={t.img || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500&auto=format&fit=crop'} alt={t.name} className="size-20 rounded-2xl object-cover shrink-0" />
                                <div className="space-y-1">
                                    <h5 className="text-sm font-black italic uppercase tracking-tighter leading-tight">{t.name}</h5>
                                    <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{t.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
