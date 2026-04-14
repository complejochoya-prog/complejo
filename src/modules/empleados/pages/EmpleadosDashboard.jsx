import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useEmpleados from '../hooks/useEmpleados';
import EmpleadoStats from '../components/EmpleadoStats';
import EmpleadoCard from '../components/EmpleadoCard';
import EmpleadoForm from '../components/EmpleadoForm';
import { ROLES } from '../services/empleadosService';
import {
    Users, UserPlus, List, RefreshCcw, Loader2, Search, Briefcase,
} from 'lucide-react';

export default function EmpleadosDashboard() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { empleados, stats, loading, create, refresh } = useEmpleados({ estado: 'activo' });
    const [showForm, setShowForm] = useState(false);

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
                <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Cargando empleados...</p>
        </div>
    );

    // Distribución por rol
    const roleDistribution = ROLES.map(r => ({
        ...r,
        count: stats?.porRol?.[r.id] || 0,
    })).filter(r => r.count > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Gestión de Empleados
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Administración de personal del complejo
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={refresh}
                        className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/5 shadow-xl transition-all active:rotate-180 duration-500">
                        <RefreshCcw size={18} />
                    </button>
                    <button onClick={() => navigate(`/${negocioId}/empleados/lista`)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl">
                        <List size={16} /> Ver Todos
                    </button>
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20">
                        <UserPlus size={16} /> Nuevo Empleado
                    </button>
                </div>
            </header>

            {/* Stats */}
            <EmpleadoStats stats={stats} />

            {/* Role Distribution */}
            {roleDistribution.length > 0 && (
                <div className="bg-slate-900/50 border border-white/[0.04] rounded-3xl p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 px-1 flex items-center gap-2">
                        <Briefcase size={12} /> Distribución por Rol
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {roleDistribution.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-slate-950/50 rounded-2xl p-3.5 border border-white/[0.03]">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black italic bg-${r.color}-500/15 text-${r.color}-500`}>
                                    {r.count}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Employees */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">
                        Empleados Activos ({empleados.length})
                    </h2>
                </div>
                <div className="space-y-3">
                    {empleados.length > 0 ? (
                        empleados.slice(0, 5).map(e => (
                            <EmpleadoCard key={e.id} empleado={e} />
                        ))
                    ) : (
                        <div className="py-16 text-center space-y-4 bg-slate-900/30 rounded-[32px] border border-dashed border-white/[0.06]">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                <Search size={24} />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No hay empleados registrados</p>
                            <button onClick={() => setShowForm(true)} className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:text-amber-400">
                                + Crear el primero
                            </button>
                        </div>
                    )}
                    {empleados.length > 5 && (
                        <button onClick={() => navigate(`/${negocioId}/empleados/lista`)}
                            className="w-full py-3 rounded-2xl bg-slate-900/50 border border-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/10 transition-all">
                            Ver los {empleados.length} empleados →
                        </button>
                    )}
                </div>
            </div>

            <EmpleadoForm isOpen={showForm} onClose={() => setShowForm(false)} onSave={create} />
        </div>
    );
}
