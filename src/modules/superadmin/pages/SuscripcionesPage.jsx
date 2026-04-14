import React, { useState, useEffect } from 'react';
import { 
    CreditCard, Calendar, CheckCircle2, XCircle, 
    AlertTriangle, RefreshCw, Filter, Search, Clock, 
    ArrowRight, Shield, Zap, PauseCircle, PlayCircle
} from 'lucide-react';
import { fetchSuscripciones, renovarSuscripcion, cambiarEstadoSuscripcion } from '../services/superadminService';

export default function SuscripcionesPage() {
    const [suscripciones, setSuscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        loadData();
        setTimeout(() => setAnimate(true), 100);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchSuscripciones();
            setSuscripciones(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRenovar = async (id, plan) => {
        if (confirm(`¿Renovar suscripción para ${id}? Se extenderá 30 días.`)) {
            await renovarSuscripcion(id, plan);
            loadData();
        }
    };

    const handleEstado = async (id, estado) => {
        await cambiarEstadoSuscripcion(id, estado);
        loadData();
    };

    const filtered = suscripciones.filter(s => 
        s.negocioId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`space-y-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Suscripciones</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Control de planes y pagos de la plataforma
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Suscripciones', value: suscripciones.length, icon: CreditCard, color: 'text-blue-400' },
                    { label: 'Activas', value: suscripciones.filter(s => s.estado === 'activo').length, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Vencidas', value: suscripciones.filter(s => s.estado === 'vencido').length, icon: AlertTriangle, color: 'text-red-400' },
                    { label: 'En Prueba', value: suscripciones.filter(s => s.estado === 'prueba').length, icon: Clock, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Buscar por ID de negocio..."
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold focus:border-violet-500/50 outline-none transition-all placeholder-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((sub) => {
                    const isVencido = sub.estado === 'vencido' || (new Date(sub.fecha_vencimiento) < new Date());
                    
                    return (
                        <div key={sub.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-6 w-full lg:w-auto">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isVencido ? 'from-red-500/20 to-red-600/10 border-red-500/30' : 'from-violet-500/20 to-fuchsia-600/10 border-violet-500/30'} border flex items-center justify-center`}>
                                    <Shield size={28} className={isVencido ? 'text-red-400' : 'text-violet-400'} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">{sub.negocioId}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isVencido ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {isVencido ? 'Vencido' : sub.estado}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            Plan {sub.plan}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full lg:w-auto px-6 border-x border-white/5">
                                <div className="text-center lg:text-left">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Último Pago</p>
                                    <p className="text-[10px] font-bold">{sub.ultimo_pago || '---'}</p>
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Inició</p>
                                    <p className="text-[10px] font-bold">{sub.fecha_inicio || '---'}</p>
                                </div>
                                <div className="text-center lg:text-left col-span-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Vencimiento</p>
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isVencido ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {sub.fecha_vencimiento || '---'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                <button 
                                    onClick={() => handleRenovar(sub.negocioId, sub.plan)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20"
                                >
                                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> Renovar
                                </button>
                                
                                {sub.estado === 'activo' ? (
                                    <button 
                                        onClick={() => handleEstado(sub.negocioId, 'suspendido')}
                                        className="p-3 rounded-xl border border-white/5 hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 transition-all"
                                        title="Suspender"
                                    >
                                        <PauseCircle size={14} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleEstado(sub.negocioId, 'activo')}
                                        className="p-3 rounded-xl border border-white/5 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 transition-all"
                                        title="Activar"
                                    >
                                        <PlayCircle size={14} />
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => window.open(`/${sub.negocioId}`, '_blank')}
                                    className="p-3 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 transition-all"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
                        <AlertTriangle size={48} className="mx-auto text-slate-800 mb-4" />
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No hay suscripciones que coincidan con la búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
}
