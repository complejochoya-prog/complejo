import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useEmpleados from '../hooks/useEmpleados';
import EmpleadoCard from '../components/EmpleadoCard';
import EmpleadoForm from '../components/EmpleadoForm';
import { ROLES, ESTADOS, HORARIOS } from '../services/empleadosService';
import {
    ArrowLeft, Search, Filter, X, UserPlus, Loader2, Users,
} from 'lucide-react';

export default function ListaEmpleados() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterRol, setFilterRol] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterHorario, setFilterHorario] = useState('');
    const [showForm, setShowForm] = useState(false);

    const filters = {};
    if (filterRol) filters.rol = filterRol;
    if (filterEstado) filters.estado = filterEstado;
    if (filterHorario) filters.horario = filterHorario;
    if (searchTerm) filters.buscar = searchTerm;

    const { empleados, loading, create } = useEmpleados(filters);
    const hasFilters = filterRol || filterEstado || filterHorario;

    const clearFilters = () => { setFilterRol(''); setFilterEstado(''); setFilterHorario(''); setSearchTerm(''); };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/${negocioId}/empleados`)}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Lista de Empleados
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Directorio completo del personal
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-xl ${
                            showFilters || hasFilters ? 'bg-indigo-500 text-slate-950 border-indigo-500/50' : 'bg-slate-900 text-white border-white/5'
                        }`}>
                        <Filter size={15} /> Filtros
                        {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                    </button>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                        <input type="text" placeholder="Buscar por nombre, DNI, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"><X size={14} /></button>}
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20">
                        <UserPlus size={16} /> Nuevo
                    </button>
                </div>
            </header>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-5 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Filtros Avanzados</h3>
                        {hasFilters && <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400">Limpiar</button>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">Rol</label>
                            <select value={filterRol} onChange={e => setFilterRol(e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                                <option value="">Todos</option>
                                {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">Estado</label>
                            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                                <option value="">Todos</option>
                                {ESTADOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">Horario</label>
                            <select value={filterHorario} onChange={e => setFilterHorario(e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                                <option value="">Todos</option>
                                {HORARIOS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results count */}
            <div className="bg-slate-900/50 border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Users size={16} className="text-white" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Resultados</p>
                    <p className="text-lg font-black text-white italic tracking-tighter">{empleados.length} empleados</p>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
            ) : empleados.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[32px] border border-dashed border-white/[0.06]">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700"><Search size={24} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No se encontraron empleados</p>
                    {hasFilters && <button onClick={clearFilters} className="text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400">Limpiar filtros</button>}
                </div>
            ) : (
                <div className="space-y-3">
                    {empleados.map(e => <EmpleadoCard key={e.id} empleado={e} />)}
                </div>
            )}

            <EmpleadoForm isOpen={showForm} onClose={() => setShowForm(false)} onSave={create} />
        </div>
    );
}
