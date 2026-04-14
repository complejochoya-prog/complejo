import React, { useState } from 'react';
import { Trophy, Plus, Settings, Filter, Search, X, Trash2 } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useTournament } from '../hooks/useTournament';
import TournamentCard from '../components/TournamentCard';
import { useNavigate } from 'react-router-dom';

export default function TournamentsDashboard() {
    const { negocioId } = useConfig();
    const { tournaments, loading, save, remove } = useTournament(negocioId);
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', formato: 'Liga', estado: 'inscripcion', equipos: 8, premio: '', abierto: true
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            equipos: parseInt(formData.equipos) || 8
        };
        if (isEditing) {
            await save({ ...data, id: editingId });
        } else {
            await save(data);
        }
        closeModal();
    };

    const handleEdit = (tournament) => {
        setFormData({
            nombre: tournament.nombre,
            formato: tournament.formato,
            estado: tournament.estado,
            equipos: tournament.equipos,
            premio: tournament.premio,
            abierto: tournament.abierto ?? true
        });
        setEditingId(tournament.id);
        setIsEditing(true);
        setIsCreating(true);
    };

    const closeModal = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ nombre: '', formato: 'Liga', estado: 'inscripcion', equipos: 8, premio: '', abierto: true });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white flex items-center gap-4">
                        <Trophy size={48} className="text-amber-400 drop-shadow-lg" />
                        Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Torneos</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 pl-1">
                        Control de ligas, equipos y resultados en tiempo real
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-900 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <Filter size={20} />
                    </button>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Nuevo Torneo
                    </button>
                </div>
            </div>

            {/* Smart Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'En Curso', val: tournaments.filter(t => t.estado === 'en_curso').length, color: 'emerald' },
                    { label: 'Inscripción', val: tournaments.filter(t => t.estado === 'inscripcion').length, color: 'amber' },
                    { label: 'Finalizados', val: tournaments.filter(t => t.estado === 'finalizado').length, color: 'slate' },
                    { label: 'Equipos Totales', val: tournaments.reduce((acc, t) => acc + t.equipos, 0), color: 'indigo' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">{stat.label}</span>
                        <span className={`text-2xl font-black italic text-${stat.color}-400`}>{stat.val}</span>
                    </div>
                ))}
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(t => (
                    <TournamentCard 
                        key={t.id} 
                        tournament={t} 
                        onClick={() => handleEdit(t)}
                        onDelete={(id, e) => {
                            e.stopPropagation();
                            setDeletingId(id);
                            setIsDeleting(true);
                        }}
                    />
                ))}
                {tournaments.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 border border-dashed border-white/5 rounded-[40px]">
                        <Trophy size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay torneos creados aún</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                    {isEditing ? 'Editar Torneo' : 'Nuevo Torneo'}
                                </h3>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                                    {isEditing ? 'Modificar datos de la competencia' : 'Crear nueva competición'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form id="tournament-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre del Torneo</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    placeholder="Ej: Liga de Verano Padel"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Formato</label>
                                    <select 
                                        value={formData.formato}
                                        onChange={e => setFormData({...formData, formato: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    >
                                        <option value="Liga">Liga</option>
                                        <option value="Grupos + Playoff">Grupos + Playoff</option>
                                        <option value="Eliminación directa">Eliminación directa</option>
                                        <option value="Relámpago">Relámpago</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
                                    <select 
                                        value={formData.estado}
                                        onChange={e => setFormData({...formData, estado: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    >
                                        <option value="inscripcion">Inscripción</option>
                                        <option value="en_curso">En curso</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cant. Equipos</label>
                                    <input 
                                        type="number" 
                                        required min="2" max="64"
                                        value={formData.equipos}
                                        onChange={e => setFormData({...formData, equipos: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Premio</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.premio}
                                        onChange={e => setFormData({...formData, premio: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                        placeholder="Ej: $50.000 + Trofeo"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Torneo Abierto</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1">Los equipos se pueden inscribir solos</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, abierto: !formData.abierto})}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.abierto ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.abierto ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </form>
                        <div className="p-6 border-t border-white/5 flex items-center justify-between">
                            {isEditing && (
                                <button 
                                    onClick={() => {
                                        setDeletingId(editingId);
                                        setIsDeleting(true);
                                    }}
                                    className="px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                                >
                                    Eliminar
                                </button>
                            )}
                            <button 
                                form="tournament-form"
                                type="submit"
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all ml-auto"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Crear Torneo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-sm p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">
                            ¿Eliminar Torneo?
                        </h3>
                        <p className="text-sm text-slate-400 mb-8 font-medium">
                            Esta acción no se puede deshacer. Se eliminarán todos los equipos y partidos asociados.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => {
                                    setIsDeleting(false);
                                    setDeletingId(null);
                                }}
                                className="px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={async () => {
                                    await remove(deletingId);
                                    setIsDeleting(false);
                                    setDeletingId(null);
                                    if (isEditing) closeModal();
                                }}
                                className="px-6 py-4 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
