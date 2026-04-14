import React, { useState } from 'react';
import {
    Trophy, Plus, MessageCircle, CheckCircle, Calendar, MapPin, Camera,
    ChevronRight, TrendingUp, Settings, ShieldAlert, Trash2, Edit3, X, Check,
    School, Users, Clock
} from 'lucide-react';
import { useTorneos } from '../services/TorneosContext';

export default function TournamentAdmin() {
    const {
        tournaments, addTournament, updateTournament, removeTournament,
        schoolClasses, addSchoolClass, updateSchoolClass, removeSchoolClass
    } = useTorneos();

    const [activeTab, setActiveTab] = useState('tournaments');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '', category: '', status: 'Activo', teams: 0, img: '', date: '', schedule: '', ageRange: '', icon: 'Trophy'
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'tournaments') {
                if (editingId) {
                    await updateTournament(editingId, formData);
                } else {
                    await addTournament(formData);
                }
            } else {
                if (editingId) {
                    await updateSchoolClass(editingId, formData);
                } else {
                    await addSchoolClass(formData);
                }
            }
            resetForm();
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', category: '', status: 'Activo', teams: 0, img: '', date: '', schedule: '', ageRange: '', icon: 'Trophy' });
        setShowForm(false);
        setEditingId(null);
    };

    const startEdit = (item) => {
        setFormData(item);
        setEditingId(item.id);
        setShowForm(true);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        GESTIÓN DE <span className="text-gold">{activeTab === 'tournaments' ? 'TORNEOS' : 'ESCUELA'}</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Administración de Contenido Master</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('tournaments')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tournaments' ? 'bg-gold text-slate-950' : 'text-slate-500'}`}
                        >
                            Torneos
                        </button>
                        <button
                            onClick={() => setActiveTab('school')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'school' ? 'bg-gold text-slate-950' : 'text-slate-500'}`}
                        >
                            Escuela
                        </button>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-8 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={16} />
                        {activeTab === 'tournaments' ? 'Nuevo Torneo' : 'Nueva Clase'}
                    </button>
                </div>
            </div>

            {/* Form Modal/Section */}
            {showForm && (
                <div className="bg-white/[0.03] border border-gold/30 rounded-[40px] p-8 space-y-8 animate-in slide-in-from-top duration-500">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-gold">
                            {editingId ? 'Editar' : 'Crear'} {activeTab === 'tournaments' ? 'Torneo' : 'Clase'}
                        </h2>
                        <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre</label>
                            <input
                                required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Categoría / Edad</label>
                            <input
                                value={activeTab === 'tournaments' ? formData.category : formData.ageRange}
                                onChange={e => setFormData(activeTab === 'tournaments' ? { ...formData, category: e.target.value } : { ...formData, ageRange: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold"
                            />
                        </div>
                        {activeTab === 'tournaments' ? (
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Estado</label>
                                <select
                                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold appearance-none uppercase"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="En Juego">En Juego</option>
                                    <option value="Inicia Pronto">Inicia Pronto</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Horarios</label>
                                <input
                                    value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold"
                                    placeholder="Ej: Lun - Mié 18:00 hs"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Imagen URL</label>
                            <input
                                value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white text-xs"
                                placeholder="https://..."
                            />
                        </div>
                        {activeTab === 'tournaments' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Fecha (Texto)</label>
                                    <input
                                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold"
                                        placeholder="Ej: Inicia Mar 15"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Equipos</label>
                                    <input
                                        type="number"
                                        value={formData.teams} onChange={e => setFormData({ ...formData, teams: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-gold/50 text-white font-bold"
                                    />
                                </div>
                            </>
                        )}
                        <div className="lg:col-span-3 flex justify-end gap-4 mt-4">
                            <button type="button" onClick={resetForm} className="px-8 py-4 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest italic border border-white/10">Cancelar</button>
                            <button type="submit" className="px-12 py-4 rounded-2xl bg-gold text-slate-950 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2">
                                <Check size={16} /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Items List */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-l-4 border-gold pl-5">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{activeTab === 'tournaments' ? 'Torneos' : 'Clases de Escuela'}</h2>
                        <span className="text-[8px] font-black text-gold border border-gold/30 px-3 py-1 rounded-full uppercase tracking-widest">
                            {activeTab === 'tournaments' ? tournaments.length : schoolClasses.length} Registros
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {(activeTab === 'tournaments' ? tournaments : schoolClasses).map(item => (
                            <div key={item.id} className="p-6 md:p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                    <div className="size-24 md:size-32 rounded-[24px] overflow-hidden border border-white/10 shrink-0">
                                        <img src={item.img || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=500&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em]">{activeTab === 'tournaments' ? item.status : item.schedule}</span>
                                                <span className="size-1 rounded-full bg-slate-700"></span>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{activeTab === 'tournaments' ? item.category : item.ageRange}</span>
                                            </div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{item.name}</h3>
                                            {activeTab === 'tournaments' && (
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{item.teams || 0} Equipos • {item.date}</p>
                                            )}
                                        </div>
                                        <div className="flex md:flex-col gap-2 justify-end">
                                            <button onClick={() => startEdit(item)} className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 transition-all">
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => (activeTab === 'tournaments' ? removeTournament(item.id) : removeSchoolClass(item.id))} className="p-3 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats & Info */}
                <div className="xl:col-span-4 space-y-10">
                    <section className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 space-y-8">
                        <h3 className="text-lg font-black italic uppercase tracking-widest text-white leading-none flex items-center gap-2">
                            <ShieldAlert className="text-gold" size={20} /> Información
                        </h3>
                        <div className="space-y-4 text-xs text-slate-400 font-medium leading-relaxed">
                            <p>Toda la información cargada aquí se reflejará instantáneamente en la aplicación pública.</p>
                            <p>Asegúrate de usar URLs de imágenes válidas para garantizar que los usuarios vean el contenido correctamente.</p>
                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <span className="text-[10px] font-black text-gold uppercase tracking-widest">Atajos:</span>
                                <ul className="space-y-1">
                                    <li>• Click en Editar para modificar</li>
                                    <li>• Click en Trash para borrar</li>
                                    <li>• Shift + Click para ver reporte (Próximamente)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gold/5 border border-gold/10 rounded-[32px] p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-gold">Estado Operativo</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between group">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors text-white">Torneos Activos</span>
                                <span className="text-xl font-black italic text-gold">{tournaments.filter(t => t.status === 'En Juego').length}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors text-white">Escuela Disciplinas</span>
                                <span className="text-xl font-black italic text-white">{schoolClasses.length}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
