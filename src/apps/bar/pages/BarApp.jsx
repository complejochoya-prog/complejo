import React, { useState } from 'react';
import { Coffee, Search, CheckCircle, Clock } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useAuth } from '../../../context/AuthContext';

export default function BarApp() {
    const { config } = useConfig();
    const { user, logout } = useAuth();
    const [mesas] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
    const [pedidos] = useState([
        { id: '#001', mesa: 3, estado: 'pendiente', items: ['2x Cerveza', '1x Papas'] },
        { id: '#002', mesa: 5, estado: 'listo', items: ['1x Gaseosa'] }
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter">
            {/* Header */}
            <header className="bg-slate-900 border-b border-white/10 p-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Coffee className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight leading-none">BAR TPV</h1>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{config?.nombre || 'Complejo'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Mozo: {user?.name}</span>
                    <button onClick={logout} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Salir
                    </button>
                </div>
            </header>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mesas */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Mesas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {mesas.map(m => (
                            <button key={m} className="aspect-square bg-slate-900 border border-white/5 rounded-3xl flex flex-col items-center justify-center hover:bg-amber-500 hover:text-black transition-colors group">
                                <span className="text-3xl font-black italic tracking-tighter">{m}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-black/60 tracking-widest mt-1">Mesa</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pedidos Activos */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Pedidos en Curso</h2>
                    <div className="space-y-3">
                        {pedidos.map(p => (
                            <div key={p.id} className="bg-slate-900 p-4 rounded-3xl border border-white/5 relative overflow-hidden">
                                {p.estado === 'listo' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                                {p.estado === 'pendiente' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
                                
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <span className="text-lg font-black italic">{p.id}</span>
                                    <span className="text-[10px] font-black uppercase py-1 px-2 rounded-lg bg-white/5">Mesa {p.mesa}</span>
                                </div>
                                <ul className="pl-2 space-y-1 mb-4">
                                    {p.items.map(i => (
                                        <li key={i} className="text-xs text-slate-400 font-medium font-bold">{i}</li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${p.estado === 'listo' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-amber-500 hover:text-black'}`}>
                                    {p.estado === 'listo' ? 'Entregar' : 'Ver Pedido'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
