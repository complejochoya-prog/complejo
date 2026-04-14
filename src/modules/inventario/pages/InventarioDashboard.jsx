import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useInventario from '../hooks/useInventario';
import { PackageOpen, Coffee, ChefHat, Archive, Droplets, Grid, AlertTriangle } from 'lucide-react';

const SECTORES_DATA = [
    { id: 'BAR', label: 'Inventario Bar', desc: 'Bebidas, cafetería, menú, etc.', icon: Coffee, path: 'bar', color: 'amber' },
    { id: 'COCINA', label: 'Inventario Cocina', desc: 'Insumos, frescos, secos.', icon: ChefHat, path: 'cocina', color: 'orange' },
    { id: 'ALMACEN', label: 'Inventario Almacén', desc: 'Depósito general, herramientas.', icon: Archive, path: 'almacen', color: 'indigo' },
    { id: 'LIMPIEZA', label: 'Inventario Limpieza', desc: 'Productos limpieza, mantenimiento.', icon: Droplets, path: 'limpieza', color: 'emerald' },
    { id: 'OTROS', label: 'Otros Sectores', desc: 'Elementos varios.', icon: Grid, path: 'otros', color: 'slate' },
];

export default function InventarioDashboard() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { stats, loading } = useInventario();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-xl">
                        <PackageOpen size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                            Control de Inventario
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Gestión centralizada de stock por sectores
                        </p>
                    </div>
                </div>
            </header>

            {/* Global Stats Alerts */}
            {!loading && stats?.alertas > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-tighter text-amber-500">
                                Alerta Global de Stock
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mt-0.5">
                                Hay {stats.alertas} artículos por debajo del mínimo sugerido
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sectores Grid */}
            <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2 mb-4">
                    Explorar Sectores
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {SECTORES_DATA.map(sec => {
                        const Icon = sec.icon;
                        const secStats = stats?.por_sector?.[sec.id];
                        const alertas = secStats?.alertas || 0;
                        const itemsTotal = secStats?.cantidad || 0;

                        return (
                            <div key={sec.id} onClick={() => navigate(`/${negocioId}/inventario/${sec.path}`)}
                                className={`group relative bg-slate-900/60 backdrop-blur-sm border rounded-3xl p-5 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer overflow-hidden
                                    ${alertas > 0 ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-white/[0.04] hover:border-white/10'}`}>
                                
                                {/* Background glow */}
                                <div className={`absolute -top-14 -right-14 w-32 h-32 bg-${sec.color}-500 opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity duration-700`} />
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-${sec.color}-500 bg-${sec.color}-500/10 shadow-lg border border-${sec.color}-500/20 group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} />
                                        </div>
                                        {alertas > 0 && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                                                <AlertTriangle size={12} /> {alertas} Avisos
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-lg font-black italic tracking-tighter text-white uppercase group-hover:text-amber-400 transition-colors">
                                        {sec.label}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-4">
                                        {sec.desc}
                                    </p>
                                    
                                    <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Total ítems</p>
                                            <p className="text-lg font-black italic tracking-tighter text-white">{itemsTotal}</p>
                                        </div>
                                        <div className="space-y-0.5 text-right">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Valor</p>
                                            <p className="text-sm font-black italic tracking-tighter text-emerald-400">${(secStats?.valor || 0).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Summary List */}
            {!loading && stats?.alertas === 0 && (
                <div className="text-center py-16 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-3xl">
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        El stock de todos los sectores está en niveles óptimos.
                    </p>
                </div>
            )}
        </div>
    );
}
