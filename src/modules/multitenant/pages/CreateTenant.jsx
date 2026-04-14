import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';
import PlanCard from '../components/PlanCard';
import { ChevronLeft, Rocket, Shield, Mail, Database, Loader2 } from 'lucide-react';

const PLANS = [
    { id: 'Basic', nombre: 'Plan Inicial', precio: 15000, features: ['2 Canchas', 'Bar Básico', 'Reportes 7 días'] },
    { id: 'Pro', nombre: 'Plan Profesional', precio: 35000, features: ['Canchas Ilimitadas', 'Gestión de Torneos', 'IA Analytics'] },
    { id: 'Premium', nombre: 'Plan Elite', precio: 55000, features: ['Soporte 24/7', 'App Móvil PWA', 'Integración IoT'] }
];

export default function CreateTenant() {
    const navigate = useNavigate();
    const { addTenant, loading } = useTenant();
    
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        adminEmail: '',
        plan: 'Basic'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await addTenant(formData);
        if (res.success) {
            navigate('/superadmin/complejos');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Cancelar y Volver
            </button>

            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-950 shadow-2xl shadow-white/10">
                    <Rocket size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                        Onboarding <span className="text-indigo-400">Complejo</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Registrar nuevo tenant en el ecosistema Giovanni</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Basic Info Container */}
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[48px] grid grid-cols-1 md:grid-cols-2 gap-10 shadow-2xl shadow-black/50">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                                <Shield size={12} className="text-indigo-500" /> Nombre del Complejo
                            </label>
                            <input 
                                required
                                type="text" 
                                placeholder="Ej: Giovanni Fútbol Club"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                                <Database size={12} className="text-indigo-500" /> Identificador (ID / Slug)
                            </label>
                            <input 
                                required
                                type="text" 
                                placeholder="ej-giovanni-fc"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-700 font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                                <Mail size={12} className="text-indigo-500" /> Email del Administrador
                            </label>
                            <input 
                                required
                                type="email" 
                                placeholder="admin@complejo.com"
                                value={formData.adminEmail}
                                onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-700"
                            />
                        </div>

                        <div className="bg-slate-950/50 p-6 rounded-3xl border border-indigo-500/10 flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                                <Shield size={20} />
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                                El sistema aislará automáticamente todas las bases de datos de este complejo bajo el ID especificado para garantizar seguridad y privacidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase italic tracking-wider text-white px-2">Selección del Plan SaaS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANS.map(plan => (
                            <PlanCard 
                                key={plan.id}
                                plan={plan}
                                currentPlan={formData.plan}
                                onSelect={id => setFormData({ ...formData, plan: id })}
                            />
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-12 py-6 rounded-[24px] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={20} />}
                        Lanzar Complejo en la Nube
                    </button>
                </div>
            </form>
        </div>
    );
}
