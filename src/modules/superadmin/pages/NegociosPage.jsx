/**
 * Gestión de Negocios — CRUD for all businesses
 * Route: /superadmin/negocios
 */
import React, { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, Edit3, Trash2, PauseCircle,
    PlayCircle, ArrowRight, X, CheckCircle2, AlertTriangle,
    Mail, Phone, User, Store, Crown, Filter, MoreVertical, ExternalLink, Shield
} from 'lucide-react';
import { useNegocios } from '../hooks/useSuperAdmin';

export default function NegociosPage() {
    const { negocios, loading, create, update, remove, suspend, activate, reload } = useNegocios();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingNegocio, setEditingNegocio] = useState(null);
    const [form, setForm] = useState({
        nombre: '', negocioId: '', dueno: '', email: '', telefono: '', plan: 'basico', estado: 'activo'
    });
    const [animate, setAnimate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { setTimeout(() => setAnimate(true), 100); }, []);

    const filteredNegocios = negocios
        .filter(n => {
            const matchSearch =
                (n.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (n.dueno || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (n.id || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchEstado = filterEstado === 'todos' || n.estado === filterEstado;
            return matchSearch && matchEstado;
        });

    const openCreate = () => {
        setEditingNegocio(null);
        setForm({ nombre: '', negocioId: '', dueno: '', email: '', telefono: '', plan: 'basico', estado: 'activo' });
        setShowModal(true);
    };

    const openEdit = (n) => {
        setEditingNegocio(n);
        setForm({
            nombre: n.nombre || '',
            negocioId: n.negocioId || n.id || '',
            dueno: n.dueno || '',
            email: n.email || '',
            telefono: n.telefono || '',
            plan: n.plan || 'basico',
            estado: n.estado || 'activo'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingNegocio) {
                await update(editingNegocio.id, form);
            } else {
                await create(form);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
            await remove(id);
        }
    };

    const getEstadoStyle = (estado) => {
        const styles = {
            activo: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
            suspendido: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
            prueba: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
        };
        return styles[estado] || styles.activo;
    };

    const getPlanLabel = (plan) => {
        const labels = { basico: 'Básico', pro: 'Pro', premium: 'Premium' };
        return labels[plan] || plan;
    };

    const getPlanColor = (plan) => {
        const colors = { basico: 'text-slate-400', pro: 'text-amber-400', premium: 'text-violet-400' };
        return colors[plan] || 'text-slate-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Cargando negocios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Negocios</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Administrar todos los complejos deportivos de la plataforma
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-all shadow-lg shadow-violet-500/30"
                >
                    <Plus size={16} strokeWidth={3} />
                    Nuevo Negocio
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, dueño o ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold focus:border-violet-500/50 outline-none transition-all placeholder-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['todos', 'activo', 'suspendido', 'prueba'].map(estado => (
                        <button
                            key={estado}
                            onClick={() => setFilterEstado(estado)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                ${filterEstado === estado
                                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                }`}
                        >
                            {estado}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black italic tracking-tighter">{negocios.length}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black italic tracking-tighter text-emerald-400">{negocios.filter(n => n.estado === 'activo').length}</p>
                    <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">Activos</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black italic tracking-tighter text-red-400">{negocios.filter(n => n.estado === 'suspendido').length}</p>
                    <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest mt-1">Suspendidos</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black italic tracking-tighter text-amber-400">{negocios.filter(n => n.estado === 'prueba').length}</p>
                    <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mt-1">En Prueba</p>
                </div>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredNegocios.map((n) => {
                    const estiloEstado = getEstadoStyle(n.estado);
                    return (
                        <div key={n.id} className="group relative rounded-[32px] p-px bg-gradient-to-br from-white/10 via-transparent to-transparent hover:from-violet-500/30 transition-all duration-500">
                            <div className="bg-slate-950 rounded-[31px] p-7 h-full flex flex-col space-y-5 relative overflow-hidden">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl ${estiloEstado.bg} flex items-center justify-center`}>
                                            <Building2 size={22} className={estiloEstado.text} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-violet-400 transition-colors truncate max-w-[180px]">
                                                {n.nombre || n.id}
                                            </h3>
                                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                                                ID: {n.negocioId || n.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${estiloEstado.bg} ${estiloEstado.border} ${estiloEstado.text}`}>
                                        {n.estado || 'activo'}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-2.5 flex-1">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <User size={12} />
                                        <span className="text-[10px] font-bold">{n.dueno || 'Sin dueño asignado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Mail size={12} />
                                        <span className="text-[10px] font-bold">{n.email || 'Sin email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Phone size={12} />
                                        <span className="text-[10px] font-bold">{n.telefono || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Crown size={12} className={getPlanColor(n.plan)} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getPlanColor(n.plan)}`}>
                                            Plan {getPlanLabel(n.plan)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => openEdit(n)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-violet-500/20 text-slate-500 hover:text-violet-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <Edit3 size={12} /> Editar
                                    </button>
                                    {n.estado === 'activo' ? (
                                        <button
                                            onClick={() => suspend(n.id)}
                                            className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                            title="Suspender"
                                        >
                                            <PauseCircle size={12} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => activate(n.id)}
                                            className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                            title="Activar"
                                        >
                                            <PlayCircle size={12} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(n.id, n.nombre)}
                                        className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => window.open(`/${n.negocioId || n.id}`, '_blank')}
                                        className="p-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all"
                                        title="Ver Sitio Cliente"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                    <button
                                        onClick={() => window.open(`/${n.negocioId || n.id}/admin`, '_blank')}
                                        className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-all"
                                        title="Panel Administrativo"
                                    >
                                        <Shield size={14} />
                                    </button>
                                </div>
                                {n.createdAt && (
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-4 text-center">
                                        Registrado: {new Date(n.createdAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                )}

                                <Building2 size={160} className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-500" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredNegocios.length === 0 && (
                <div className="text-center py-20 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10 space-y-4">
                    <Building2 size={48} className="mx-auto text-slate-700" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        {searchTerm || filterEstado !== 'todos' ? 'No se encontraron negocios con esos filtros' : 'No hay negocios registrados'}
                    </p>
                    <button onClick={openCreate} className="text-violet-400 text-[10px] font-black uppercase tracking-widest hover:text-violet-300 transition-colors">
                        + Crear primer negocio
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                            <X size={18} />
                        </button>

                        <div className="space-y-2 mb-8">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                {editingNegocio ? 'Editar' : 'Nuevo'}{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Negocio</span>
                            </h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {editingNegocio ? 'Modificar datos del complejo' : 'Registrar nuevo complejo deportivo'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Negocio</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="Ej: Complejo Giovanni"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">ID del Negocio</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="ej: giovanni"
                                        value={form.negocioId}
                                        onChange={(e) => setForm({ ...form, negocioId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black uppercase italic text-violet-400 outline-none focus:border-violet-500/50 cursor-pointer"
                                        value={form.plan}
                                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                    >
                                        <option value="basico">Plan Básico</option>
                                        <option value="pro">Plan Pro</option>
                                        <option value="premium">Plan Premium</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 text-center sm:text-left">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado Inicial</label>
                                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                                        <button 
                                            type="button"
                                            onClick={() => setForm({...form, estado: 'activo'})}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.estado === 'activo' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Activo
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setForm({...form, estado: 'prueba'})}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.estado === 'prueba' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Prueba (14d)
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Dueño</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="Nombre del propietario"
                                        value={form.dueno}
                                        onChange={(e) => setForm({ ...form, dueno: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="email@empresa.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="+54 11 1234-5678"
                                        value={form.telefono}
                                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] bg-gradient-to-r from-violet-500 to-fuchsia-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50"
                                >
                                    {submitting ? 'Guardando...' : editingNegocio ? 'Guardar Cambios' : 'Crear Negocio'}
                                </button>
                            </div>
                        </form>

                        <Store size={200} className="absolute -bottom-12 -right-12 opacity-[0.02]" />
                    </div>
                </div>
            )}
        </div>
    );
}
