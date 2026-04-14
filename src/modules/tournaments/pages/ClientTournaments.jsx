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
            
            <div className="p-5 space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-amber-500 leading-none mb-1">Torneos</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seguí tu liga favorita</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                        <Trophy size={24} />
                    </div>
                </header>

                {/* Banner de Organización */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <Trophy size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col items-start gap-4">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight text-white leading-tight">¿Querés organizar<br/>tu propio torneo?</h3>
                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1">Ligas empresariales, amateur o entre amigos</p>
                        </div>
                        <a 
                            href={wspUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-white text-indigo-900 px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-transform"
                        >
                            <MessageCircle size={16} />
                            Contactar a Administración
                        </a>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Target size={14} className="text-amber-500" /> Torneos Disponibles
                    </h2>
                    
                    {tournaments.map(t => (
                        <div 
                            key={t.id}
                            className="bg-slate-900 border border-white/5 p-6 rounded-[32px] shadow-lg relative overflow-hidden group active:scale-[0.98] transition-all"
                        >
                            <div className={`absolute top-0 right-0 p-6 opacity-10 group-active:opacity-20 transition-opacity`}>
                                <Trophy size={48} />
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                    t.estado === 'en_curso' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {t.estado.replace('_', ' ')}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                                    {t.formato}
                                </span>
                            </div>

                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4 leading-none">
                                {t.nombre}
                            </h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Inscripción</span>
                                    <span className={`text-xs font-black uppercase italic ${t.estado === 'inscripcion' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                        {t.estado === 'inscripcion' ? 'Habilitada' : 'Cerrada'}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l border-white/5 pl-4">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Equipos</span>
                                    <span className="text-xs font-black text-white">{t.equipos} registrados</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => navigate(`${t.id}?tab=standings`)}
                                    className="bg-slate-950 border border-white/5 py-2 px-1 rounded-xl flex flex-col items-center gap-1 hover:bg-white/5 transition-all text-slate-500 hover:text-indigo-400"
                                >
                                    <Table size={14} />
                                    <span className="text-[7px] font-black uppercase">Posiciones</span>
                                </button>
                                <button 
                                    onClick={() => navigate(`${t.id}?tab=matches`)}
                                    className="bg-slate-950 border border-white/5 py-2 px-1 rounded-xl flex flex-col items-center gap-1 hover:bg-white/5 transition-all text-slate-500 hover:text-indigo-400"
                                >
                                    <Calendar size={14} />
                                    <span className="text-[7px] font-black uppercase">Fixture</span>
                                </button>
                                <button 
                                    onClick={() => navigate(t.id)}
                                    className="bg-slate-950 border border-white/5 py-2 px-1 rounded-xl flex flex-col items-center gap-1 hover:bg-white/5 transition-all text-slate-500 hover:text-indigo-400"
                                >
                                    <Trophy size={14} />
                                    <span className="text-[7px] font-black uppercase">Detalles</span>
                                </button>
                            </div>

                            {/* Public Registration Section (ONLY if it's an OPEN tournament and in INSCRIPCION) */}
                            {t.abierto && t.estado === 'inscripcion' && (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`https://wa.me/${config?.telefono || '5491100000000'}?text=Hola,%20nos%20queremos%20inscribir%20al%20torneo:%20${t.nombre}`, '_blank');
                                        }}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <MessageCircle size={14} />
                                        Inscribir mi Equipo
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {tournaments.length === 0 && (
                        <div className="py-12 bg-slate-900 border border-white/5 rounded-[32px] text-center">
                            <Trophy size={32} className="mx-auto text-slate-700 opacity-20 mb-3" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay torneos activos en este momento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
