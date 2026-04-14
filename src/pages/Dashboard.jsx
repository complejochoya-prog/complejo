import React, { useEffect, useState } from 'react';
import { 
    Users, Calendar, Beer, TrendingUp, Package, 
    ChevronRight, Zap, Target, ArrowUpRight 
} from 'lucide-react';

export default function Dashboard() {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    const stats = [
        { label: 'Ingresos Hoy', value: '$45,200', change: '+12%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Canchas Hoy', value: '18 / 24', change: '80%', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Clientes Nuevos', value: '12', change: '+4', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Stock Bajo', value: '5 ítems', change: 'Crítico', icon: Package, color: 'text-red-400', bg: 'bg-red-500/10' },
    ];

    return (
        <div className={`space-y-10 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        CENTRAL <span className="text-amber-500">CONTROL</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resumen general del complejo deportivo</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Servidores Estables</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[32px] group hover:border-amber-500/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            <span className={`text-[10px] font-black ${stat.color} px-2 py-1 rounded-lg bg-white/5`}>{stat.change}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black italic tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2 */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black uppercase tracking-tight italic">Actividad <span className="text-amber-500">Reciente</span></h3>
                            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Ver historial</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { msg: 'Nueva reserva: Cancha 1 a las 20:00hs', time: 'hace 5 min', user: 'Juan Pérez' },
                                { msg: 'Venta registrada: $3.500 (Bar)', time: 'hace 12 min', user: 'Caja 1' },
                                { msg: 'Stock actualizado: Cerveza Quilmes', time: 'hace 25 min', user: 'Admin' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs group-hover:bg-amber-500 group-hover:text-black transition-all">⚡</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-wider truncate">{item.msg}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.user} • {item.time}</p>
                                    </div>
                                    <ArrowUpRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                    <div className="bg-amber-500 rounded-[40px] p-8 text-black space-y-6 relative overflow-hidden group">
                        <Zap size={150} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.85]">PANEL <br /> DE ALERTAS</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">No hay emergencias pendientes en el sistema.</p>
                        <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Realizar Backup</button>
                    </div>

                    <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <Target size={20} className="text-blue-400" />
                            <h3 className="text-sm font-black uppercase tracking-tight italic">Objetivo Mensual</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ventas</span>
                                <span className="text-sm font-black italic text-white">75%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
