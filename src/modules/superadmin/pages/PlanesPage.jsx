/**
 * Planes SaaS — Manage subscription plans
 * Route: /superadmin/planes
 */
import React, { useState, useEffect } from 'react';
import {
    CreditCard, Plus, Edit3, Trash2, X, Check, Crown,
    Users, Puzzle, Star, Zap, Shield
} from 'lucide-react';
import { usePlanes, SYSTEM_MODULES } from '../hooks/useSuperAdmin';

export default function PlanesPage() {
    const { planes, loading, create, update, remove } = usePlanes();
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [form, setForm] = useState({
        nombre: '', precio: '', limiteEmpleados: '', modulosHabilitados: [], color: '#a855f7', popular: false
    });
    const [animate, setAnimate] = useState(false);

    useEffect(() => { setTimeout(() => setAnimate(true), 100); }, []);

    const openCreate = () => {
        setEditingPlan(null);
        setForm({ nombre: '', precio: '', limiteEmpleados: '', modulosHabilitados: ['core', 'admin'], color: '#a855f7', popular: false });
        setShowModal(true);
    };

    const openEdit = (plan) => {
        setEditingPlan(plan);
        setForm({
            nombre: plan.nombre || '',
            precio: plan.precio || '',
            limiteEmpleados: plan.limiteEmpleados || '',
            modulosHabilitados: plan.modulosHabilitados || [],
            color: plan.color || '#a855f7',
            popular: plan.popular || false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...form,
            precio: Number(form.precio),
            limiteEmpleados: Number(form.limiteEmpleados)
        };
        if (editingPlan) {
            await update(editingPlan.id, data);
        } else {
            await create(data);
        }
        setShowModal(false);
    };

    const toggleModule = (modId) => {
        const current = form.modulosHabilitados;
        if (['core', 'admin'].includes(modId)) return; // Can't remove required modules
        setForm({
            ...form,
            modulosHabilitados: current.includes(modId)
                ? current.filter(id => id !== modId)
                : [...current, modId]
        });
    };

    const getPlanIcon = (index) => {
        const icons = [Zap, Crown, Shield];
        return icons[index % icons.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Cargando planes...</p>
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
                        Planes <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">SaaS</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Configurar planes de suscripción para los negocios
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-all shadow-lg shadow-violet-500/30"
                >
                    <Plus size={16} strokeWidth={3} />
                    Nuevo Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {planes.map((plan, index) => {
                    const PlanIcon = getPlanIcon(index);
                    const gradients = [
                        'from-slate-500/20 to-slate-600/10',
                        'from-amber-500/20 to-orange-600/10',
                        'from-violet-500/20 to-fuchsia-600/10'
                    ];
                    const borders = [
                        'border-slate-500/20 hover:border-slate-400/40',
                        'border-amber-500/20 hover:border-amber-400/40',
                        'border-violet-500/20 hover:border-violet-400/40'
                    ];
                    const iconColors = ['text-slate-400', 'text-amber-400', 'text-violet-400'];

                    return (
                        <div
                            key={plan.id}
                            className={`relative group rounded-[36px] border bg-gradient-to-br ${gradients[index % 3]} ${borders[index % 3]} p-8 transition-all duration-500 hover:scale-[1.02] overflow-hidden`}
                        >
                            {plan.popular && (
                                <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> Popular
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Plan Icon & Name */}
                                <div className="space-y-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${iconColors[index % 3]}`}>
                                        <PlanIcon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">{plan.nombre}</h3>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-3xl font-black italic tracking-tighter">
                                                ${(plan.precio || 0).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/mes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Users size={14} className="text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {plan.limiteEmpleados === -1 ? 'Empleados ilimitados' : `Hasta ${plan.limiteEmpleados} empleados`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Puzzle size={14} className="text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {(plan.modulosHabilitados || []).length} módulos incluidos
                                        </span>
                                    </div>
                                </div>

                                {/* Modules */}
                                <div className="space-y-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Módulos incluidos</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(plan.modulosHabilitados || []).map(modId => {
                                            const mod = SYSTEM_MODULES.find(m => m.id === modId);
                                            return (
                                                <span key={modId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                                    {mod?.icon} {mod?.name || modId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => openEdit(plan)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-violet-500/20 text-slate-500 hover:text-violet-400 transition-all text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <Edit3 size={12} /> Editar
                                    </button>
                                    {!plan.id?.startsWith('default_') && (
                                        <button
                                            onClick={() => remove(plan.id)}
                                            className="flex items-center justify-center px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <PlanIcon size={180} className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-500" />
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[40px] p-10 relative overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10">
                            <X size={18} />
                        </button>

                        <div className="space-y-2 mb-8">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                {editingPlan ? 'Editar' : 'Nuevo'}{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Plan</span>
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Plan</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                    placeholder="Ej: Plan Pro"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio Mensual (ARS)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="35000"
                                        value={form.precio}
                                        onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Límite Empleados (-1 = ilimitado)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 outline-none transition-all"
                                        placeholder="15"
                                        value={form.limiteEmpleados}
                                        onChange={(e) => setForm({ ...form, limiteEmpleados: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Module Selector */}
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Módulos Habilitados</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SYSTEM_MODULES.map(mod => {
                                        const isSelected = form.modulosHabilitados.includes(mod.id);
                                        const isRequired = mod.required;
                                        return (
                                            <button
                                                key={mod.id}
                                                type="button"
                                                onClick={() => toggleModule(mod.id)}
                                                disabled={isRequired}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-[10px] font-bold uppercase tracking-wider
                                                    ${isSelected
                                                        ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                                                        : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/20'
                                                    }
                                                    ${isRequired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                            >
                                                <span className="text-sm">{mod.icon}</span>
                                                <span className="flex-1">{mod.name}</span>
                                                {isSelected && <Check size={14} className="text-violet-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, popular: !form.popular })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                        ${form.popular ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                >
                                    <Star size={12} fill={form.popular ? 'currentColor' : 'none'} />
                                    Popular
                                </button>
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
                                    className="flex-[2] bg-gradient-to-r from-violet-500 to-fuchsia-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/30"
                                >
                                    {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
