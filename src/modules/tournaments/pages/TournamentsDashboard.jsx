import React, { useState } from 'react';
import { Trophy, Plus, Settings, Filter, Search, X, Trash2, Users, Calendar, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { useTournament } from '../hooks/useTournament';
import TournamentCard from '../components/TournamentCard';

export default function TournamentsDashboard() {
    const { negocioId: paramNegocioId } = useParams();
    const { negocioId: contextNegocioId } = useConfig();
    const negocioId = paramNegocioId || contextNegocioId || 'giovanni';

    const { tournaments, loading, save, remove } = useTournament(negocioId);
    const navigate = useNavigate();

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        nombre: '',
        formato: 'Liga',
        estado: 'en_curso',
        equiposCount: 8,
        premio: '',
        sede: 'Cancha Sintética Principal',
        reglamento: '',
        abierto: true
    });

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
            equiposCount: parseInt(formData.equiposCount) || 8,
            teams: isEditing ? (tournaments.find(t => t.id === editingId)?.teams || []) : [],
            matches: isEditing ? (tournaments.find(t => t.id === editingId)?.matches || []) : [],
            standings: isEditing ? (tournaments.find(t => t.id === editingId)?.standings || []) : [],
            scorers: isEditing ? (tournaments.find(t => t.id === editingId)?.scorers || []) : [],
            tarjetas: isEditing ? (tournaments.find(t => t.id === editingId)?.tarjetas || []) : []
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
            formato: tournament.formato || 'Liga',
            estado: tournament.estado || 'en_curso',
            equiposCount: tournament.teams?.length || tournament.equiposCount || tournament.equipos || 8,
            premio: tournament.premio || '',
            sede: tournament.sede || '',
            reglamento: tournament.reglamento || '',
            abierto: tournament.abierto ?? true
        });
        setEditingId(tournament.id);
        setIsEditing(true);
        setIsCreating(true);
    };

    const handleDelete = async (id, e) => {
        e?.stopPropagation();
        const t = tournaments.find(x => x.id === id);
        if (window.confirm(`¿Seguro que deseás eliminar el torneo "${t?.nombre || ''}"? Esta acción no se puede deshacer.`)) {
            await remove(id);
        }
    };

    const closeModal = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            nombre: '',
            formato: 'Liga',
            estado: 'en_curso',
            equiposCount: 8,
            premio: '',
            sede: 'Cancha Sintética Principal',
            reglamento: '',
            abierto: true
        });
    };

    const filtered = tournaments.filter(t => {
        const matchesQuery = !searchTerm || (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || t.estado === filterStatus;
        return matchesQuery && matchesStatus;
    });

    const totalTeams = tournaments.reduce((acc, t) => acc + (t.teams?.length || t.equipos || 0), 0);
    const totalMatches = tournaments.reduce((acc, t) => acc + (t.matches?.length || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
            {/* Header del Dashboard */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white flex items-center gap-4">
                        <Trophy size={48} className="text-amber-400 drop-shadow-lg" />
                        Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Torneos</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 pl-1">
                        Control total de fixture, equipos, resultados, tarjetas y estadísticas
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-7 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Crear Nuevo Torneo
                    </button>
                </div>
            </div>

            {/* Tarjetas de Estadísticas Globales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Torneos en Curso', val: tournaments.filter(t => t.estado === 'en_curso').length, color: 'text-emerald-400' },
                    { label: 'En Inscripción', val: tournaments.filter(t => t.estado === 'inscripcion').length, color: 'text-amber-400' },
                    { label: 'Equipos Participando', val: totalTeams, color: 'text-indigo-400' },
                    { label: 'Partidos en Sistema', val: totalMatches, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass-premium border border-white/5 p-5 rounded-3xl space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">{stat.label}</span>
                        <span className={`text-3xl font-black italic ${stat.color}`}>{stat.val}</span>
                    </div>
                ))}
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Buscar torneo por nombre..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">Filtrar:</span>
                    {['all', 'en_curso', 'inscripcion', 'finalizado'].map(st => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                filterStatus === st 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {st === 'all' ? 'Todos' : st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grilla de Torneos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(t => (
                    <TournamentCard 
                        key={t.id} 
                        tournament={t} 
                        negocioId={negocioId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 border border-dashed border-white/5 rounded-[40px] space-y-4">
                        <Trophy size={48} className="mx-auto text-slate-700 opacity-30" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No se encontraron torneos con los filtros seleccionados
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Crear Primer Torneo
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de Crear / Editar Torneo */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[36px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre del Torneo *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    placeholder="Ej: Liga de Verano Fútbol 5"
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
                                        <option value="Liga">Liga (Todos contra todos)</option>
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
                                        <option value="en_curso">En Curso</option>
                                        <option value="inscripcion">Inscripciones Abiertas</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sede / Cancha</label>
                                    <input 
                                        type="text" 
                                        value={formData.sede}
                                        onChange={e => setFormData({...formData, sede: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                        placeholder="Ej: Canchas 1 y 2"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Premio</label>
                                    <input 
                                        type="text" 
                                        value={formData.premio}
                                        onChange={e => setFormData({...formData, premio: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                        placeholder="Ej: $100.000 + Copa"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Reglamento / Observaciones</label>
                                <textarea 
                                    rows={2}
                                    value={formData.reglamento}
                                    onChange={e => setFormData({...formData, reglamento: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-indigo-500 transition-colors focus:outline-none"
                                    placeholder="Detalles de duración de partidos, faltas acumuladas, etc."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-6 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30"
                                >
                                    {isEditing ? 'Guardar Cambios' : 'Crear Torneo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
