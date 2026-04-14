import React, { useState } from 'react';
import { Monitor, Tv, Laptop, Clock, Beer, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { Link } from 'react-router-dom';

export default function PantallasPage() {
    const { negocioId } = useConfig();
    
    // Simulate configurable screens
    const [screens, setScreens] = useState([
        { id: 'turnos', name: 'Tablero de Turnos', desc: 'Muestra las canchas y turnos', path: 'turnos', icon: Clock, enabled: true },
        { id: 'bar', name: 'Monitor del Bar', desc: 'Muestra los pedidos en curso', path: 'bar', icon: Beer, enabled: true },
        { id: 'promos', name: 'Publicidad y Eventos', desc: 'Banner rotativo interactivo', path: 'promos', icon: Sparkles, enabled: true },
        { id: 'ranking', name: 'Ranking General', desc: 'Top 8 de jugadores locales', path: 'ranking', icon: Trophy, enabled: false },
    ]);

    const toggleScreen = (id) => {
        setScreens(screens.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Operativa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">TVs</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Gestión de Monitores Externos
                    </p>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                    <Monitor size={18} className="text-blue-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                        {screens.filter(s => s.enabled).length} Pantallas Activas
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {screens.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.id} className={`p-8 rounded-[32px] border transition-all duration-300 relative group overflow-hidden ${
                            s.enabled 
                            ? 'bg-blue-500/10 border-blue-500/20' 
                            : 'bg-slate-900 border-white/5 opacity-70'
                        }`}>
                            {s.enabled && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />}
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.enabled ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                    <Icon size={28} />
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={s.enabled} onChange={() => toggleScreen(s.id)} />
                                    <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                                </label>
                            </div>

                            <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${s.enabled ? 'text-white' : 'text-slate-400'}`}>
                                {s.name}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">
                                {s.desc}
                            </p>

                            <div className="mt-auto">
                                {s.enabled ? (
                                    <Link 
                                        to={`/${negocioId}/pantalla/${s.path}`}
                                        target="_blank"
                                        className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-black shadow-xl shadow-blue-600/20 group"
                                    >
                                        <ExternalLink size={16} className="group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] uppercase tracking-widest">Proyectar (Nueva Pestaña)</span>
                                    </Link>
                                ) : (
                                    <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-950 text-slate-500 border border-white/5 font-black opacity-50 cursor-not-allowed">
                                        <span className="text-[10px] uppercase tracking-widest">Pantalla Desactivada</span>
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
