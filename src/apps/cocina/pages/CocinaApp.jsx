import React, { useState } from 'react';
import { Flame, Check, AlertTriangle, BellRing } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useAuth } from '../../../context/AuthContext';

export default function CocinaApp() {
    const { config } = useConfig();
    const { user, logout } = useAuth();
    
    // Fallback data for monitor
    const [pedidosNuevos, setNuevos] = useState([
        { id: '#003', mesa: 2, items: ['🍔 2x Hamburguesa Pro', '🍟 1x Papas Fritas'], time: 'hace 2 min' },
    ]);
    const [pedidosPrep, setPrep] = useState([
        { id: '#001', mesa: 5, items: ['🍕 1x Pizza Muzzarella'], time: 'hace 8 min' },
        { id: '#002', mesa: 8, items: ['🍔 4x Hamburguesa Simple'], time: 'hace 10 min' },
    ]);
    const [pedidosListos, setListos] = useState([]);

    const moveToPrep = (idx) => {
        const item = pedidosNuevos[idx];
        setNuevos(pedidosNuevos.filter((_, i) => i !== idx));
        setPrep([item, ...pedidosPrep]);
    };

    const movetoListos = (idx) => {
        const item = pedidosPrep[idx];
        setPrep(pedidosPrep.filter((_, i) => i !== idx));
        setListos([item, ...pedidosListos]);
    };

    return (
        <div className="min-h-screen bg-neutral-950 font-inter text-white flex flex-col overflow-hidden">
            {/* Cabecera Monitor */}
            <header className="bg-neutral-900 border-b border-white/10 p-4 flex items-center justify-between shadow-xl z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                        <Flame size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter italic">MONITOR COCINA</h1>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{config?.nombre || 'SND'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        <BellRing size={14} className="text-red-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-red-400">{pedidosNuevos.length} Nuevos</span>
                    </div>
                    <button onClick={logout} className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                        Desconectar
                    </button>
                </div>
            </header>

            {/* Tableros (Grid) */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                
                {/* 1. Nuevos */}
                <div className="bg-neutral-900/50 rounded-[40px] border border-red-500/20 flex flex-col overflow-hidden shadow-2xl shadow-red-500/5 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-500" />
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-black uppercase tracking-tighter italic text-red-500 flex items-center gap-2">
                            <span>ENTRANTES</span>
                            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-[10px]">{pedidosNuevos.length}</span>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {pedidosNuevos.map((p, i) => (
                            <div key={p.id} className="bg-neutral-900 rounded-3xl p-5 border border-red-500/50 shadow-lg relative cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => moveToPrep(i)}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-2xl font-black italic">{p.id}</span>
                                    <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">MESA {p.mesa}</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {p.items.map(it => (
                                        <p key={it} className="text-sm font-bold text-slate-300 bg-white/5 p-2 rounded-xl">{it}</p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-1 text-orange-400"><AlertTriangle size={12}/> {p.time}</span>
                                    <span className="text-red-400 group-hover:underline cursor-pointer">A PREPARAR</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. En Preparación */}
                <div className="bg-neutral-900/50 rounded-[40px] border border-amber-500/20 flex flex-col overflow-hidden shadow-2xl shadow-amber-500/5 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-black uppercase tracking-tighter italic text-amber-500 flex items-center gap-2">
                            <span>EN CURSO</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px]">{pedidosPrep.length}</span>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {pedidosPrep.map((p, i) => (
                            <div key={p.id} className="bg-neutral-900 rounded-3xl p-5 border border-amber-500/30 shadow-lg relative cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all" onClick={() => movetoListos(i)}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-2xl font-black italic">{p.id}</span>
                                    <span className="px-3 py-1 bg-white/5 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest">MESA {p.mesa}</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {p.items.map(it => (
                                        <p key={it} className="text-sm font-bold text-slate-300 bg-white/5 p-2 rounded-xl">{it}</p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    <span>{p.time}</span>
                                    <span className="text-emerald-400">MARCAR LISTO</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Listos */}
                <div className="bg-neutral-900/50 rounded-[40px] border border-emerald-500/20 flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-black uppercase tracking-tighter italic text-emerald-500 flex items-center gap-2">
                            <span>DESPACHO</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px]">{pedidosListos.length}</span>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {pedidosListos.map(p => (
                            <div key={p.id} className="bg-neutral-900 rounded-2xl p-4 border border-emerald-500/20 flex items-center justify-between opacity-70">
                                <div>
                                    <span className="text-lg font-black italic mr-3">{p.id}</span>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">Mesa {p.mesa}</span>
                                </div>
                                <Check size={20} className="text-emerald-500" />
                            </div>
                        ))}
                        {pedidosListos.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center text-[10px] font-black uppercase tracking-widest text-emerald-500 p-10">
                                No hay despachos recientes
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
