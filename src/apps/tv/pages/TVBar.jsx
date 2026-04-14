import React, { useState, useEffect } from 'react';
import { Beer, Settings2, Clock } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function TVBar() {
    const { negocioId } = useConfig();
    const [pedidos, setPedidos] = useState({
        nuevos: [
            { id: '#014', mesa: 'MESA 4', items: ['2x Cerveza', '1x Papas'], time: '2m' },
            { id: '#015', mesa: 'BARRA 1', items: ['1x Gaseosa Cola'], time: '0m' },
        ],
        preparando: [
            { id: '#012', mesa: 'MESA 2', items: ['🍕 Pizza Muzza', '🍻 4x Pinta IPA'], time: '8m' },
        ],
        listos: [
            { id: '#011', mesa: 'MESA 5', items: ['🍔 2x Burger'], time: '1m' },
        ]
    });

    useEffect(() => {
        // Refresh cada 5 segundos
        const timer = setInterval(() => {
            // Simulated fetch
            // fetchPedidos().then(setPedidos);
        }, 5000);
        return () => clearInterval(timer);
    }, [negocioId]);

    const Column = ({ title, desc, data, gradient, borderColor }) => (
        <div className={`bg-slate-900 border ${borderColor} rounded-[40px] shadow-2xl overflow-hidden shadow-amber-500/5 relative flex flex-col`}>
            <div className={`absolute top-0 left-0 right-0 h-4 bg-gradient-to-r ${gradient}`} />
            <div className="p-8 pb-6 text-center border-b border-white/5">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">{title}</h2>
                <p className="text-sm font-black uppercase tracking-widest text-white/50">{desc}</p>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
                {data.map(p => (
                    <div key={p.id} className="bg-slate-950 p-6 rounded-3xl border border-white/5 shadow-inner">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                            <span className="text-4xl font-black italic">{p.id}</span>
                            <span className={`px-4 py-2 rounded-xl text-xl font-black uppercase tracking-tighter bg-gradient-to-r ${gradient}`}>{p.mesa}</span>
                        </div>
                        <ul className="space-y-3">
                            {p.items.map((item, idx) => (
                                <li key={idx} className="text-2xl font-bold text-slate-300">{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-8 pt-0 animate-in fade-in duration-1000">
            <div className="flex justify-between items-end mb-12">
                <h1 className="text-6xl font-black uppercase tracking-tighter italic text-amber-500 flex items-center gap-6">
                    <Beer size={56} />
                    MONITOR BAR
                </h1>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-3xl">
                    <span className="text-4xl font-black tracking-tighter text-amber-400">PEDIDOS EN CURSO: {pedidos.nuevos.length + pedidos.preparando.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full pb-8">
                <Column 
                    title="NUEVOS" 
                    desc="Recién Recibidos" 
                    data={pedidos.nuevos} 
                    gradient="from-slate-600 to-slate-400" 
                    borderColor="border-slate-500/30" 
                />
                <Column 
                    title="PREPARANDO" 
                    desc="En Cocina/Barra" 
                    data={pedidos.preparando} 
                    gradient="from-amber-600 to-yellow-500" 
                    borderColor="border-amber-500/30" 
                />
                <Column 
                    title="LISTOS" 
                    desc="Retirar en Mostrador" 
                    data={pedidos.listos} 
                    gradient="from-emerald-600 to-green-400" 
                    borderColor="border-emerald-500/30" 
                />
            </div>
        </div>
    );
}
