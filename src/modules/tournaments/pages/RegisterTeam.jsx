import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Users, Save, ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function RegisterTeam() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState(['']);

    const handleAddPlayer = () => setPlayers([...players, '']);
    const handleRemovePlayer = (idx) => setPlayers(players.filter((_, i) => i !== idx));
    const handlePlayerChange = (idx, val) => {
        const newPlayers = [...players];
        newPlayers[idx] = val;
        setPlayers(newPlayers);
    };

    const handleSave = (e) => {
        e.preventDefault();
        alert(`Equipo "${teamName}" registrado con éxito con ${players.filter(p => p).length} jugadores.`);
        navigate(-1);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest w-fit"
            >
                <ChevronLeft size={16} /> Volver
            </button>

            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                    Registrar <span className="text-indigo-400">Equipo</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inscripción manual de escuadras para torneos</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Shield size={14} className="text-indigo-400" /> Nombre del Equipo
                        </label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ej: Los Galácticos FC"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-white/5 pb-4">
                            <Users size={14} className="text-indigo-400" /> Lista de Jugadores
                        </label>
                        
                        <div className="space-y-3">
                            {players.map((p, idx) => (
                                <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 italic">#{idx + 1}</span>
                                        <input 
                                            type="text" 
                                            placeholder="Nombre completo"
                                            value={p}
                                            onChange={(e) => handlePlayerChange(idx, e.target.value)}
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white font-bold focus:border-indigo-500/50 focus:outline-none transition-all"
                                        />
                                    </div>
                                    {players.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => handleRemovePlayer(idx)}
                                            className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors border border-red-500/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button 
                            type="button" 
                            onClick={handleAddPlayer}
                            className="w-full py-3 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/[0.02] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <Plus size={14} strokeWidth={3} /> Agregar Jugador
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                    >
                        <Save size={18} /> Guardar Equipo
                    </button>
                </div>
            </form>
        </div>
    );
}
