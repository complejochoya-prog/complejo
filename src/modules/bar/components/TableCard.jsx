import React from 'react';
import { getStatusConfig } from '../services/barService';
import MozoBadge from './MozoBadge';
import { ShoppingCart, Clock, User, AlertTriangle } from 'lucide-react';

export default function TableCard({ table, currentOrders, onClick }) {
    const config = getStatusConfig(table.status);
    const total = currentOrders.reduce((acc, o) => acc + (o.price * o.quantity), 1200); // Demo total if 0
    const productsCount = currentOrders.reduce((acc, o) => acc + o.quantity, 0);

    const isOccupied = table.status === 'ocupada' || table.status === 'atendiendo';

    return (
        <button 
            onClick={() => onClick(table)}
            className={`w-full text-left p-6 rounded-[40px] border transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden backdrop-blur-sm 
                ${isOccupied 
                    ? 'bg-slate-900/60 border-emerald-500/30 shadow-[0_20px_40px_rgba(16,185,129,0.1)]' 
                    : table.status === 'limpiando'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                }
            `}
        >
            {/* Status Glow Line */}
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 ${isOccupied ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : table.status === 'limpiando' ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-slate-800'}`} />

            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                    <span className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white leading-none group-hover:scale-110 transition-transform origin-left">
                        {table.tableNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isOccupied ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{config.label}</span>
                    </span>
                </div>
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isOccupied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-800/80 border-white/5 text-slate-500'}`}>
                    {isOccupied ? <ShoppingCart size={20} /> : <User size={20} />}
                </div>
            </div>

            <div className="space-y-4">
                {isOccupied && <MozoBadge name={table.mozoName || 'Asignando...'} />}
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Consumo Actual</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black text-emerald-500">$</span>
                            <span className="text-2xl font-black text-white italic tracking-tighter">
                                {productsCount > 0 ? total.toLocaleString() : '0'}
                            </span>
                        </div>
                    </div>

                    {productsCount > 0 && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-slate-500 mb-1">
                                <Clock size={10} />
                                <span className="text-[8px] font-bold uppercase">hace 12m</span>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                                {productsCount} UN.
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Gloss Area */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Status Based Overlays */}
            {table.status === 'limpiando' && (
                <div className="absolute top-2 right-2">
                    <AlertTriangle className="text-amber-500 animate-bounce" size={16} />
                </div>
            )}
        </button>
    );
}
