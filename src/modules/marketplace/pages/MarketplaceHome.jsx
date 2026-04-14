import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Sparkles, LayoutGrid, Info, Loader2, Code } from 'lucide-react';
import { useMarketplace } from '../hooks/useMarketplace';
import ModuleCard from '../components/ModuleCard';
import ModuleCategory from '../components/ModuleCategory';

export default function MarketplaceHome() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { modules, loading, installing, handleInstall, handleUninstall } = useMarketplace(negocioId);
    
    const [category, setCategory] = useState('todos');
    const [search, setSearch] = useState('');

    const categories = ['todos', 'operaciones', 'eventos', 'automatizacion', 'administracion'];

    const filtered = modules.filter(m => {
        const matchesCat = category === 'todos' || m.category === category;
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-4">
                        <ShoppingBag size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                            Extiende tu Complejo
                        </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                        Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Store</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 px-1">Encuentra módulos exclusivos para escalar tu negocio</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(`/admin/marketplace/installed`)}
                        className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                    >
                        <LayoutGrid size={18} />
                        Mis Módulos
                    </button>
                    <button 
                        onClick={() => navigate(`/admin/marketplace/api`)}
                        className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-indigo-600 hover:text-white transition-all"
                    >
                        <Code size={18} />
                        API Pública
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar nuevas funcionalidades (IA, Torneos, IoT...)" 
                        className="w-full bg-slate-900 border border-white/5 rounded-[28px] pl-16 pr-8 py-6 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors text-white placeholder:text-slate-600 shadow-2xl"
                    />
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <ModuleCategory 
                            key={cat} 
                            label={cat} 
                            active={category === cat} 
                            onClick={() => setCategory(cat)} 
                        />
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Cargando Tienda...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map(module => (
                        <ModuleCard 
                            key={module.id} 
                            module={module} 
                            isInstalling={installing === module.id}
                            onInstall={handleInstall}
                            onUninstall={handleUninstall}
                            onClick={() => navigate(`/admin/marketplace/module/${module.id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Promo Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[48px] p-12 relative overflow-hidden text-white shadow-2xl shadow-indigo-600/30">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles size={200} />
                </div>
                <div className="max-w-2xl space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full border border-white/10">
                        <Info size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Sugerencia para ti</span>
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-tight">
                        ¿Quieres más reservas?<br/>Prueba el motor de <span className="underline decoration-indigo-400 decoration-8 underline-offset-4">IA Analytics</span>
                    </h2>
                    <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest opacity-80 leading-relaxed">
                        Detecta automáticamente horarios vacíos y genera ofertas inteligentes para aumentar tu ocupación hasta en un 35%.
                    </p>
                    <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-black/20">
                        Saber más sobre IA
                    </button>
                </div>
            </div>
        </div>
    );
}
