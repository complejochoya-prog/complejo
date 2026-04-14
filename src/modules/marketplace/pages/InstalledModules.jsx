import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, CheckCircle2, Sliders } from 'lucide-react';
import { useMarketplace } from '../hooks/useMarketplace';
import ModuleCard from '../components/ModuleCard';

export default function InstalledModules() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { modules, loading, installing, handleInstall, handleUninstall } = useMarketplace(negocioId);

    const installed = modules.filter(m => m.installed);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ChevronLeft size={16} /> Volver a la Tienda
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 border border-white/5 p-10 rounded-[48px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <CheckCircle2 size={120} />
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/30">
                        <LayoutGrid size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                            Mis <span className="text-emerald-400">Módulos</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Gestiona las herramientas activas en tu complejo</p>
                    </div>
                </div>

                <div className="z-10">
                    <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                        <Sliders size={18} />
                        Configurar Todo
                    </button>
                </div>
            </div>

            {installed.length === 0 && !loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-6 border-2 border-dashed border-white/5 rounded-[48px]">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700">
                        <LayoutGrid size={40} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-black uppercase tracking-widest text-white">No tienes módulos instalados</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visita la tienda para extender las capacidades de tu complejo</p>
                    </div>
                    <button 
                        onClick={() => navigate(`/admin/marketplace`)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                        Ver Catálogo Completo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {installed.map(module => (
                        <ModuleCard 
                            key={module.id} 
                            module={module} 
                            isInstalling={installing === module.id}
                            onInstall={handleInstall}
                            onUninstall={handleUninstall}
                            onClick={() => navigate(`/admin/modulos/${module.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
