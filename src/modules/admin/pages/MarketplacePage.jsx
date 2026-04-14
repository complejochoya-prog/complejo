import React, { useState, useEffect } from 'react';
import { ShoppingBag, Puzzle, ShieldAlert, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export default function MarketplacePage() {
    const { negocioId, config, activeModules } = useConfig();
    const [modulosDisponibles, setModulosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                const snap = await getDocs(collection(db, 'saas_modulos'));
                let mods = snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Solo mostramos modulos activos globalmente en la plataforma
                mods = mods.filter(m => m.activo);
                setModulosDisponibles(mods);
            } catch (err) {
                console.error("Error loading marketplace", err);
            } finally {
                setLoading(false);
            }
        };

        loadMarketplace();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Marketplace <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">SaaS</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Expande las capacidades de {config?.nombre || 'tu complejo'}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <ShoppingBag size={18} className="text-violet-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                        {modulosDisponibles.length} Módulos Disponibles
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {modulosDisponibles.map((mod) => {
                    const isEnabled = activeModules.includes(mod.id);
                    const isCore = mod.required;
                    const requiresUpgrade = !isEnabled && !isCore && mod.precio > 0;

                    return (
                        <div 
                            key={mod.id}
                            className={`relative rounded-[32px] p-8 border transition-all duration-300 flex flex-col h-full
                                ${isEnabled 
                                    ? 'bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEnabled ? 'bg-violet-500 text-white shadow-xl shadow-violet-500/20' : 'bg-white/5 text-slate-500'}`}>
                                    <Puzzle size={28} />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white italic tracking-tighter">
                                        {mod.precio > 0 ? `$${mod.precio}` : 'FREE'}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">por mes</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                    {mod.nombre}
                                    {isCore && (
                                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-400 text-[8px] uppercase tracking-widest">Base</span>
                                    )}
                                </h3>
                                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{mod.categoria}</p>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                                {mod.descripcion}
                            </p>

                            <div className="mt-auto">
                                {isEnabled ? (
                                    <div className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Instalado y Activo</span>
                                    </div>
                                ) : requiresUpgrade ? (
                                    <button 
                                        onClick={() => window.location.href = `mailto:ventas@giovannisaas.com?subject=Upgrate-${negocioId}-${mod.id}`}
                                        className="w-full group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-black"
                                    >
                                        <ShieldAlert size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] uppercase tracking-widest">Requiere Plan Superior</span>
                                    </button>
                                ) : (
                                    <button className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all font-black shadow-lg shadow-violet-600/30 group">
                                        <Zap size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] uppercase tracking-widest">Activar Gratis</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
