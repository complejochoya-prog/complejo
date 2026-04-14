import React from 'react';
import { Trophy, Users, Layout, ChevronRight, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TournamentCard({ tournament, onClick, onDelete }) {
    const navigate = useNavigate();
    const statusColors = {
        en_curso: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        inscripcion: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        finalizado: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    };

    return (
        <div 
            onClick={() => onClick && onClick(tournament.id)}
            className="bg-slate-900 border border-white/5 p-6 rounded-[32px] group hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={80} />
            </div>

            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[tournament.estado]}`}>
                    {tournament.estado.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="text-indigo-400 flex items-center gap-1">
                        <Layout size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{tournament.formato}</span>
                    </div>
                    {onDelete && (
                        <button 
                            onClick={(e) => onDelete(tournament.id, e)}
                            className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                            title="Eliminar torneo"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-black italic tracking-tighter text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase leading-tight">
                {tournament.nombre}
            </h3>

            <div className="flex items-center gap-6 mt-6">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1">
                        <Users size={10} /> Equipos
                    </span>
                    <span className="text-sm font-black text-white">{tournament.equipos}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-6">
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500/70 mb-1">Premio</span>
                    <span className="text-sm font-black italic text-indigo-400 uppercase">{tournament.premio}</span>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                {onDelete ? (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${window.location.pathname}/${tournament.id}`);
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Settings size={12} /> Gestionar Resultados
                    </button>
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ver detalles</span>
                )}
                <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
}
