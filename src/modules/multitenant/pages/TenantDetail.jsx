import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';
import { 
    ChevronLeft, Shield, Clock, Users, 
    CreditCard, Activity, Settings, ExternalLink,
    Lock, Mail, User, Phone, Save, CheckCircle2,
    Zap, Trash2
} from 'lucide-react';

export default function TenantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tenants, loading, updateComplex, changePlan, toggleStatus } = useTenant();
    
    const tenant = tenants.find(t => t.id === id);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [allModules, setAllModules] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (tenant && !editData) {
            setEditData({
                nombre: tenant.nombre || '',
                dueno: tenant.dueno || '',
                email: tenant.email || '',
                telefono: tenant.telefono || '',
                password: tenant.password || 'admin123',
                activeModules: tenant.activeModules || []
            });
            
            // Load module definitions
            import('../../../core/config/modulePlans').then(m => {
                setAllModules(m.ALL_MODULES);
            });
        }
    }, [tenant, editData]);

    if (loading && !tenant) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!tenant) return <div className="p-20 text-center font-black uppercase text-slate-500 tracking-widest">Negocio no encontrado</div>;

    const handleSave = async () => {
        setSaving(true);
        const res = await updateComplex(tenant.id, editData);
        if (res.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
        setSaving(false);
    };

    const toggleModule = (modId) => {
        const current = [...editData.activeModules];
        if (current.includes(modId)) {
            setEditData({ ...editData, activeModules: current.filter(id => id !== modId) });
        } else {
            setEditData({ ...editData, activeModules: [...current, modId] });
        }
    };

    const adminPanelUrl = `${window.location.origin}/${tenant.id}/admin`;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest group"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                        <ChevronLeft size={14} />
                    </div>
                    Volver a Complejos
                </button>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        tenant.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        Estado: {tenant.estado}
                    </span>
                    <div className="flex flex-col items-end">
                        {showSuccess && (
                            <div className="flex items-center gap-2 text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-2 animate-in fade-in slide-in-from-right-2">
                                <CheckCircle2 size={12} />
                                ¡Guardado con éxito!
                            </div>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header Card */}
            <div className="relative p-10 lg:p-14 bg-slate-950 border border-white/5 rounded-[48px] overflow-hidden">
                <div className="absolute top-0 right-0 p-14 opacity-5 text-indigo-500">
                    <Activity size={180} />
                </div>
                
                <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                            <span className="text-5xl font-black italic relative z-10">{tenant.nombre.charAt(0)}</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Gestión de Complejo</p>
                            <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-white leading-none">
                                {tenant.nombre}
                            </h1>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <Shield size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-300">{tenant.plan}</span>
                                </div>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ID: {tenant.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex-1 min-w-[280px]">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">URL del Panel Administrativo</p>
                            <div className="flex items-center justify-between gap-4">
                                <code className="text-[10px] font-mono text-indigo-400 truncate">{adminPanelUrl}</code>
                                <a 
                                    href={adminPanelUrl} 
                                    target="_blank"
                                    className="p-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left: General & Access Info */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <User className="text-indigo-500" size={20} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Información Principal</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Complejo</label>
                                <input 
                                    type="text"
                                    value={editData?.nombre}
                                    onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-indigo-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Dueño / Responsable</label>
                                <input 
                                    type="text"
                                    value={editData?.dueno}
                                    onChange={(e) => setEditData({...editData, dueno: e.target.value})}
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-indigo-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Mail size={10} /> Email
                                    </label>
                                    <input 
                                        type="email"
                                        value={editData?.email}
                                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Phone size={10} /> Teléfono
                                    </label>
                                    <input 
                                        type="text"
                                        value={editData?.telefono}
                                        onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                            <Lock className="text-amber-500" size={20} />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Credenciales de Acceso</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-slate-950 border border-white/5 p-5 rounded-2xl">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mb-2">Usuario Administrador</p>
                                <p className="text-xs font-black text-white">admin</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña Nueva</label>
                                <input 
                                    type="text"
                                    value={editData?.password}
                                    onChange={(e) => setEditData({...editData, password: e.target.value})}
                                    placeholder="Dejar igual para no cambiar"
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-800"
                                />
                                <p className="text-[8px] text-slate-600 font-bold uppercase mt-1 px-1 italic">Este es el acceso principal al panel administrativo.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Modules & Advanced */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Module Toggles */}
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[48px] space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/5">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Módulos Personalizados</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Activa o desactiva funcionalidades específicas para este cliente</p>
                            </div>
                            <div className="bg-slate-950 border border-white/5 p-4 rounded-3xl min-w-[200px]">
                                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Plan Actual</p>
                                <select 
                                    value={editData?.plan}
                                    onChange={(e) => {
                                        setEditData({...editData, plan: e.target.value});
                                        changePlan(tenant.id, e.target.value);
                                    }}
                                    className="w-full bg-transparent text-sm font-black italic text-indigo-400 outline-none"
                                >
                                    <option value="Free">Plan Gratuito</option>
                                    <option value="Basic">Plan Inicial</option>
                                    <option value="Pro">Plan Profesional</option>
                                    <option value="Premium">Plan Master</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allModules.map(mod => {
                                const isActive = editData?.activeModules.includes(mod.id);
                                return (
                                    <div 
                                        key={mod.id}
                                        onClick={() => toggleModule(mod.id)}
                                        className={`flex items-center justify-between p-6 rounded-[28px] border transition-all cursor-pointer group ${
                                            isActive 
                                            ? 'bg-indigo-500/10 border-indigo-500/30' 
                                            : 'bg-slate-950 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{mod.icon}</div>
                                            <div>
                                                <p className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-500'}`}>{mod.name}</p>
                                                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Módulo {mod.category}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isActive ? 'bg-indigo-500 border-indigo-500' : 'border-slate-800'
                                        }`}>
                                            {isActive && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-[48px] flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="text-sm font-black uppercase italic text-red-400 tracking-wider">Zona de Control Crítico</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Suspendé el acceso o elimina permanentemente este complejo de la plataforma.</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => toggleStatus(tenant.id, tenant.estado)}
                                className="px-8 py-4 bg-slate-950 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
                            >
                                {tenant.estado === 'activo' ? 'Suspender Acceso' : 'Reactivar Acceso'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
