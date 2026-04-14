import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Zap, Globe, Clock, Box } from 'lucide-react';
import { useMarketplace } from '../hooks/useMarketplace';
import InstallButton from '../components/InstallButton';

export default function ModuleDetail() {
    const { negocioId, moduleId } = useParams();
    const navigate = useNavigate();
    const { modules, loading, installing, handleInstall, handleUninstall } = useMarketplace(negocioId);

    const module = modules.find(m => m.id === moduleId);

    if (loading && !module) return null;
    if (!module) return <div>Módulo no encontrado</div>;

    const specs = [
        { label: 'Ecosistema', val: 'SaaS Giovanni', icon: Globe },
        { label: 'Instalación', val: '< 1 min', icon: Zap },
        { label: 'Soporte', val: '24/7 Incluido', icon: ShieldCheck },
        { label: 'Versión', val: 'v2.4.0', icon: Box }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver a la Tienda
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Visual / Info Column */}
                <div className="lg:col-span-3 space-y-10">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-slate-900 rounded-[32px] border border-white/5 flex items-center justify-center text-5xl shadow-2xl">
                            {module.icon}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">
                                {module.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{module.category}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${module.installed ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {module.installed ? 'Activo en este complejo' : 'Pendiente de instalación'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[48px] space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Descripción Completa</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                {module.desc} Este módulo se integra perfectamente con tu base de datos actual para ofrecerte herramientas avanzadas de {module.category}. 
                                Diseñado específicamente para el ecosistema de Complejo Giovanni, no requiere configuración adicional una vez instalado.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                            {specs.map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <s.icon size={18} className="text-indigo-400" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                                        <p className="text-[10px] font-black text-white uppercase">{s.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pricing / Action Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[48px] shadow-2xl sticky top-24">
                        <div className="mb-10">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-2">Precio del Módulo</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black italic text-white leading-none">
                                    ${module.price.toLocaleString()}
                                </span>
                                <span className="text-sm font-black uppercase italic text-indigo-400">ARS</span>
                            </div>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-4">Pago único por complejo · Impuestos incluidos</p>
                        </div>

                        <div className="space-y-6">
                            <InstallButton 
                                isInstalled={module.installed} 
                                isInstalling={installing === module.id}
                                onClick={() => module.installed ? handleUninstall(module.id) : handleInstall(module.id)}
                            />

                            <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Qué incluye este módulo:</h4>
                                <ul className="space-y-3">
                                    {['Actualizaciones vitalicias', 'Reportes dedicados', 'Integración PWA'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <ShieldCheck size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
