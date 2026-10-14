import React from 'react';
import { Trophy, Users, Layout, ChevronRight, Trash2, Settings, Edit3, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TournamentCard({ tournament, negocioId = 'giovanni', onEdit, onDelete }) {
    const navigate = useNavigate();
    const statusColors = {
        en_curso: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        inscripcion: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        finalizado: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    };

    const teamsCount = tournament.teams?.length || tournament.equipos || 0;
    const matchesCount = tournament.matches?.length || 0;
    const matchesPlayed = tournament.matches?.filter(m => m.estado === 'finalizado')?.length || 0;

    const handleEnter = (e) => {
        e?.stopPropagation();
        navigate(`/${negocioId}/admin/torneos/${tournament.id}`);
    };

    return (
        <div 
            onClick={handleEnter}
            className="bg-slate-900 border border-white/5 hover:border-indigo-500/40 p-6 sm:p-7 rounded-[32px] group transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
                <Trophy size={100} />
            </div>

            <div className="space-y-4">
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[tournament.estado] || statusColors.en_curso}`}>
                        {(tournament.estado || 'en_curso').replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1">
                            <Layout size={12} /> {tournament.formato || 'Liga'}
                        </span>
                        {onEdit && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(tournament);
                                }}
                                className="w-8 h-8 rounded-full bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                                title="Editar datos del torneo"
                            >
                                <Edit3 size={14} />
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(tournament.id, e);
                                }}
                                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                title="Eliminar torneo"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Título del Torneo */}
                <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-indigo-400 transition-colors uppercase leading-tight">
                        {tournament.nombre}
                    </h3>
                    {tournament.sede && (
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {tournament.sede}
                        </p>
                    )}
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                            <Users size={10} /> Equipos
                        </span>
                        <span className="text-base font-black text-white">{teamsCount}</span>
                    </div>

                    <div className="flex flex-col border-l border-white/5 pl-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                            <Calendar size={10} /> Partidos
                        </span>
                        <span className="text-base font-black text-indigo-400">
                            {matchesPlayed}/{matchesCount}
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-white/5 pl-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Premio</span>
                        <span className="text-xs font-black text-amber-400 truncate uppercase">
                            {tournament.premio || 'A definir'}
                        </span>
                    </div>
                </div>

                {tournament.campeon && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase flex items-center gap-2">
                        <Trophy size={14} />
                        <span>Campeón: <strong>{tournament.campeon}</strong></span>
                    </div>
                )}
            </div>

            {/* Botón Principal para Entrar a la Administración del Torneo */}
            <div className="pt-2">
                <button
                    onClick={handleEnter}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all group-hover:scale-[1.02]"
                >
                    <span>Ingresar a Administrar Torneo</span>
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
}
