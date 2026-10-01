import React from 'react';
import { getStatusConfig } from '../services/barService';
import MozoBadge from './MozoBadge';
import { ShoppingCart, User, AlertTriangle, Trash2, Sparkles } from 'lucide-react';

export default function TableCard({ table, currentOrders, onClick, onDelete, onMarkCleaning, onMarkClean }) {
    const isCleaning = table.status === 'limpieza' || table.status === 'limpiando';
    const isOccupied = table.status === 'ocupada' || table.status === 'atendiendo';
    const isFree = table.status === 'disponible' || table.status === 'libre';
    const config = getStatusConfig(table.status);

    const total = currentOrders.reduce((acc, o) => {
        return acc + (o.total || (o.price * o.quantity) || 0);
    }, 0);
    const productsCount = currentOrders.reduce((acc, o) => {
        const lineItems = o.products || o.items;
        if (lineItems && lineItems.length > 0) {
            return acc + lineItems.reduce((sum, item) => sum + (item.cantidad || item.quantity || 1), 0);
        }
        return acc + (o.quantity || 1);
    }, 0);

    return (
        <button 
            onClick={() => onClick(table)}
            className={`w-full text-left p-6 rounded-[32px] border transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-xl
                ${isOccupied 
                    ? 'bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border-emerald-500/30 shadow-[0_20px_40px_rgba(16,185,129,0.15)]' 
                    : isCleaning
                    ? 'bg-gradient-to-br from-slate-900/90 via-amber-950/30 to-amber-900/20 border-amber-500/40 shadow-[0_20px_40px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'
                    : 'bg-gradient-to-br from-slate-900/60 to-slate-900/20 border-white/5 hover:border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
                }
            `}
        >
            {/* Gloss Area & Animated Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 ${isOccupied ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : isCleaning ? 'bg-amber-400 shadow-[0_0_15px_#f59e0b]' : 'bg-slate-800'}`} />

            {/* Header: Table Number & Icon */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col relative z-10">
                    <span className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white leading-none group-hover:scale-105 transition-transform origin-left drop-shadow-2xl">
                        {table.tableNumber.toString().padStart(2, '0')}
                    </span>
                    <div className="mt-2 flex items-center gap-1.5 bg-black/40 w-fit px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : isCleaning ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-slate-500'}`} />
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isCleaning ? 'text-amber-400' : 'text-slate-300'}`}>
                            {isCleaning ? '🧹 Para Limpieza' : config.label}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                        isOccupied 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : isCleaning
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-800/80 border-white/10 text-slate-500 shadow-inner'
                    }`}>
                        {isOccupied ? <ShoppingCart size={20} /> : isCleaning ? <span className="text-lg">🧹</span> : <User size={20} />}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {isCleaning && onMarkClean && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMarkClean(table.tableNumber); }}
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-emerald-500 hover:text-black transition-all"
                                title="Marcar como Limpia y Disponible"
                            >
                                <Sparkles size={10} /> Limpia
                            </button>
                        )}
                        {!isOccupied && !isCleaning && onMarkCleaning && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMarkCleaning(table.tableNumber); }}
                                className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:text-black"
                                title="Mandar a Limpieza"
                            >
                                🧹
                            </button>
                        )}
                        {isFree && onDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(table.tableNumber); }}
                                className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                title="Eliminar Mesa"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content: Mozo & Consumo */}
            <div className="space-y-4 relative z-10">
                {isOccupied && <MozoBadge name={table.mozoName || 'Asignando...'} />}
                {isCleaning && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center gap-2">
                        <span className="text-sm">🧹</span>
                        <p className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">Aviso de limpieza enviado al personal</p>
                    </div>
                )}
                
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Consumo Actual</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-[12px] font-black ${isOccupied ? 'text-emerald-500' : 'text-slate-600'}`}>$</span>
                            <span className={`text-2xl font-black italic tracking-tighter ${isOccupied ? 'text-white drop-shadow-md' : 'text-slate-600'}`}>
                                {productsCount > 0 ? total.toLocaleString() : '0'}
                            </span>
                        </div>
                    </div>

                    {productsCount > 0 && (
                        <div className="flex flex-col items-end">
                            <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 shadow-inner shadow-emerald-500/10">
                                {productsCount} UN.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
