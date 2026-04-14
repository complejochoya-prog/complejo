import React, { useState, useEffect } from 'react';
import {
    Puzzle, ToggleLeft, ToggleRight, Info, Shield,
    Search, CheckCircle2, XCircle, Plus, Edit2, Zap, Save
} from 'lucide-react';
import { usePlanes } from '../hooks/useSuperAdmin';

export default function ModulosPage() {
    const { planes } = usePlanes();
    const [modules, setModules] = useState([]);
    const [localPlans, setLocalPlans] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState(null);
    const [animate, setAnimate] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { ALL_MODULES, PLANS } = await import('../../../core/config/modulePlans');
            
            // Load overrides from localStorage if any
            const savedPlans = JSON.parse(localStorage.getItem('saas_dynamic_plans')) || PLANS;
            setLocalPlans(savedPlans);

            const modulesData = ALL_MODULES.map(m => ({
                ...m,
                nombre: m.name,
                descripcion: m.desc,
                activo: true, // Master status
                categoria: m.category
            }));
            setModules(modulesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (mod) => {
        if (mod.required) return;
        setModules(modules.map(m =>
            m.id === mod.id ? { ...m, activo: !m.activo } : m
        ));
    };

    const togglePlanAssignment = (moduleId, planKey) => {
        const updatedPlans = { ...localPlans };
        const plan = updatedPlans[planKey];
        if (plan.modules.includes(moduleId)) {
            plan.modules = plan.modules.filter(id => id !== moduleId);
        } else {
            plan.modules = [...plan.modules, moduleId];
        }
        setLocalPlans(updatedPlans);
    };

    const saveChanges = () => {
        setSaving(true);
        localStorage.setItem('saas_dynamic_plans', JSON.stringify(localPlans));
        setTimeout(() => {
            setSaving(false);
            window.dispatchEvent(new Event('storage')); // Sync other components
        }, 1000);
    };

    const filtered = modules.filter(m =>
        (m.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getModulePlanCount = (modId) => {
        return Object.values(localPlans).filter(p => p.modules.includes(modId)).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Marketplace de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Módulos</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Administrar los módulos SaaS y su disponibilidad por plan
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={saveChanges}
                        disabled={saving}
                        className="bg-violet-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        Guardar Configuración
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar módulo por nombre o ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-violet-500/50 outline-none transition-all placeholder-slate-700 text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((mod) => {
                    const planCount = getModulePlanCount(mod.id);
                    const isExpanded = selectedModule?.id === mod.id;

                    return (
                        <div
                            key={mod.id}
                            className={`relative group rounded-[32px] border p-8 transition-all duration-300 hover:border-violet-500/30 cursor-pointer
                                ${mod.activo ? 'bg-slate-900 border-white/5' : 'bg-red-500/[0.02] border-red-500/10 opacity-70'}
                                ${isExpanded ? 'ring-2 ring-violet-500/20 shadow-2xl' : ''}`}
                            onClick={() => setSelectedModule(isExpanded ? null : mod)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${mod.activo ? 'bg-slate-950 border border-white/5 shadow-inner' : 'bg-white/5'}`}>
                                        {mod.icon || '📦'}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                                            {mod.nombre}
                                            {mod.required && (
                                                <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[7px] font-bold uppercase tracking-widest">Core</span>
                                            )}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{mod.categoria}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleModule(mod); }}
                                    disabled={mod.required}
                                    className={`p-1 transition-all ${mod.required ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                                >
                                    {mod.activo ? (
                                        <ToggleRight size={32} className="text-violet-400" />
                                    ) : (
                                        <ToggleLeft size={32} className="text-red-400" />
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] font-bold text-slate-400 mt-6 leading-relaxed line-clamp-2">
                                {mod.descripcion}
                            </p>

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                <span className="text-[16px] font-black text-white italic">
                                    {mod.price > 0 ? `$${mod.price.toLocaleString()}` : 'Gratis'}
                                </span>
                                <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/10">
                                    En {planCount} {planCount === 1 ? 'plan' : 'planes'}
                                </span>
                            </div>

                            {isExpanded && (
                                <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                                            <Zap size={14} className="text-amber-400" /> Habilitación por Plan
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.keys(localPlans).map(planKey => {
                                                const plan = localPlans[planKey];
                                                const isAssigned = plan.modules.includes(mod.id);
                                                return (
                                                    <div 
                                                        key={planKey}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePlanAssignment(mod.id, planKey);
                                                        }}
                                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                                            isAssigned 
                                                            ? 'bg-violet-500/10 border-violet-500/20 text-white' 
                                                            : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10'
                                                        }`}
                                                    >
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{plan.name}</span>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            isAssigned ? 'bg-violet-500 border-violet-500' : 'border-slate-700'
                                                        }`}>
                                                            {isAssigned && <CheckCircle2 size={10} className="text-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">ID Técnico</p>
                                        <p className="text-[10px] font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 block w-fit lowercase">{mod.id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
