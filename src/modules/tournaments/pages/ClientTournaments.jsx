import React from 'react';
import { Trophy, ChevronRight, Table, Calendar, Target, MessageCircle, Phone } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { useTournament } from '../hooks/useTournament';
import ClientNavbar from '../../client_app/components/ClientNavbar';
import { useClientAuth } from '../../client_app/hooks/useClientAuth';

export default function ClientTournaments() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { clientUser } = useClientAuth();
    const { tournaments, loading } = useTournament(negocioId);
    const navigate = useNavigate();

    const wspUrl = `https://wa.me/${config?.telefono || '5491100000000'}?text=Hola,%20quisiera%20averiguar%20para%20organizar%20un%20nuevo%20torneo`;

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando torneos...</div>;

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300 min-h-screen bg-slate-950 pb-32">
            <ClientNavbar config={config} user={clientUser} />
            
            <div className="px-5 py-8 space-y-8 max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-amber-500 leading-none mb-2">Torneos</h1>
                        <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Seguí tu liga favorita y los últimos resultados</p>
                    </div>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10">
                        <Trophy size={24} className="lg:w-8 lg:h-8" />
                    </div>
                </header>

                {/* Banner de Organización - Desktop Optimized */}
                <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform duration-[2s]">
                        <Trophy size={240} />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-tight">
                                ¿Querés organizar<br className="hidden lg:block"/> tu propio torneo?
                            </h3>
                            <p className="text-[10px] lg:text-xs text-indigo-200 font-bold uppercase tracking-[0.2em] mt-3">
                                Ligas empresariales, torneos amateur o encuentros entre amigos
                            </p>
                        </div>
                        <a 
                            href={wspUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-white text-indigo-700 px-8 py-5 rounded-2xl flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all w-full lg:w-auto justify-center"
                        >
                            <MessageCircle size={20} />
                            Contactar Coordinación
                        </a>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Target size={16} className="text-amber-500" /> Torneos Disponibles
                        </h2>
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] text-slate-500 font-black italic">{tournaments.length} ACTIVOS</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map(t => (
                            <div 
                                key={t.id}
                                className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group transition-all hover:bg-slate-900 hover:border-amber-500/30 flex flex-col"
                            >
                                <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700`}>
                                    <Trophy size={80} />
                                </div>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                        t.estado === 'en_curso' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {t.estado.replace('_', ' ')}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                        {t.formato}
                                    </span>
                                </div>

                                <h3 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none group-hover:text-amber-500 transition-colors">
                                    {t.nombre}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Inscripción</span>
                                        <span className={`text-xs font-black uppercase italic ${t.estado === 'inscripcion' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                            {t.estado === 'inscripcion' ? 'Habilitada' : 'Cerrada'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Equipos</span>
                                        <span className="text-xs font-black text-white">{t.equipos} registrados</span>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => navigate(`${t.id}?tab=standings`)}
                                        className="bg-slate-950/50 border border-white/5 py-4 px-1 rounded-2xl flex flex-col items-center gap-2 hover:bg-amber-500 hover:text-black transition-all text-slate-500 hover:border-amber-500 shadow-lg"
                                    >
                                        <Table size={18} />
                                        <span className="text-[7px] font-black uppercase tracking-widest">Tablas</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate(`${t.id}?tab=matches`)}
                                        className="bg-slate-950/50 border border-white/5 py-4 px-1 rounded-2xl flex flex-col items-center gap-2 hover:bg-amber-500 hover:text-black transition-all text-slate-500 hover:border-amber-500 shadow-lg"
                                    >
                                        <Calendar size={18} />
                                        <span className="text-[7px] font-black uppercase tracking-widest">Fixture</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate(t.id)}
                                        className="bg-slate-950/50 border border-white/5 py-4 px-1 rounded-2xl flex flex-col items-center gap-2 hover:bg-amber-500 hover:text-black transition-all text-slate-500 hover:border-amber-500 shadow-lg"
                                    >
                                        <Trophy size={18} />
                                        <span className="text-[7px] font-black uppercase tracking-widest">Detalles</span>
                                    </button>
                                </div>

                                {/* Public Registration Section */}
                                {t.abierto && t.estado === 'inscripcion' && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`https://wa.me/${config?.telefono || '5491100000000'}?text=Hola,%20nos%20queremos%20inscribir%20al%20torneo:%20${t.nombre}`, '_blank');
                                            }}
                                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <MessageCircle size={16} />
                                            Inscribite Ya
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {tournaments.length === 0 && (
                        <div className="py-24 bg-slate-900/50 border border-white/5 rounded-[48px] text-center space-y-4">
                            <Trophy size={48} className="mx-auto text-slate-800 opacity-20 mb-3" />
                            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">No hay torneos activos en este momento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
