import React, { useMemo } from 'react';
import { Users, Timer, ArrowRight, Utensils, Receipt, Bell, Sparkles } from 'lucide-react';

export default function TableCard({ number, activeOrders, mesaEstado, onClick }) {
    const isBusy = activeOrders && activeOrders.length > 0;
    const isExplicitlyOccupied = mesaEstado === 'ocupada';
    const isCleaning = mesaEstado === 'limpieza' || mesaEstado === 'limpiando';
    
    // Check states
    const hasReadyFood = activeOrders?.some(o => o.estado === 'listo');
    const isWaitingFood = activeOrders?.some(o => o.estado === 'en_preparacion' || o.estado === 'nuevo');
    
    // Calculate time since oldest incomplete order
    const waitTime = useMemo(() => {
        if (!isBusy) return null;
        const oldest = activeOrders.reduce((prev, curr) => {
            return (new Date(prev.createdAt) < new Date(curr.createdAt)) ? prev : curr;
        });
        const diff = Math.floor((new Date() - new Date(oldest.createdAt)) / 60000);
        return diff > 0 ? `${diff} min` : 'Recién';
    }, [activeOrders, isBusy]);

    // Appearance State logic
    let cardStyle = "border-white/5 bg-[#141210] hover:border-white/20 hover:bg-[#1a1715]";
    let iconStyle = "bg-slate-800 text-slate-500";
    let statusText = "Mesa Libre";
    let statusColor = "text-slate-500";
    let IconState = Users;

    if (isCleaning) {
        // High priority: Cleaning required
        cardStyle = "border-amber-400/80 bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-[#141210] shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40";
        iconStyle = "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 animate-pulse";
        statusText = "🧹 Requiere Limpieza";
        statusColor = "text-amber-300";
        IconState = Sparkles;
    } else if (isBusy) {
        if (hasReadyFood) {
            // Priority: Has food ready to be served
            cardStyle = "border-rose-500/50 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]";
            iconStyle = "bg-rose-500 text-white animate-pulse";
            statusText = "Comida Lista!";
            statusColor = "text-rose-400";
            IconState = Bell;
        } else if (isWaitingFood) {
            // Waiting for kitchen
            cardStyle = "border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
            iconStyle = "bg-gradient-to-br from-amber-400 to-amber-600 text-[#0c0a09] shadow-lg shadow-amber-500/20";
            statusText = "Esperando Comida";
            statusColor = "text-amber-400";
            IconState = Utensils;
        } else {
            // Just pending payments or delivered
            cardStyle = "border-emerald-500/30 bg-emerald-500/10";
            iconStyle = "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20";
            statusText = "Cuenta Pendiente";
            statusColor = "text-emerald-400";
            IconState = Receipt;
        }
    } else if (isExplicitlyOccupied) {
        // No orders, but explicitly marked as occupied by waiter or customer scan
        cardStyle = "border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.05)]";
        iconStyle = "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20";
        statusText = "Ocupada (Sin Órdenes)";
        statusColor = "text-indigo-400";
        IconState = Users;
    }
    
    return (
        <button 
            onClick={() => onClick(number)}
            className={`relative p-3.5 sm:p-5 rounded-2xl sm:rounded-[28px] border-2 transition-all active:scale-[0.97] text-left group overflow-hidden ${cardStyle}`}
        >
            {isBusy && (
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-[0.03]">
                    <IconState size={50} className="sm:w-20 sm:h-20" />
                </div>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-[18px] flex items-center justify-center transition-colors ${iconStyle}`}>
                        <span className="text-base sm:text-xl font-black">{number}</span>
                    </div>
                </div>

                <div className="space-y-0.5 sm:space-y-1 mt-2.5 sm:mt-5">
                    <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                        Mesa {number}
                    </h3>
                    <p className={`text-[8.5px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-1.5 ${statusColor}`}>
                        {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                        {statusText}
                    </p>
                </div>

                {isBusy && (
                    <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Espera</span>
                           <span className={`text-[10px] sm:text-[11px] font-bold ${statusColor} flex items-center gap-1`}>
                               <Timer size={11} /> {waitTime}
                           </span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Órdenes</span>
                           <span className="text-[10px] sm:text-[11px] font-bold text-white">
                               {activeOrders.length} item(s)
                           </span>
                        </div>
                    </div>
                )}
            </div>

            <div className={`absolute top-3.5 right-3.5 sm:top-5 sm:right-5 transition-opacity ${(isBusy || isExplicitlyOccupied) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <ArrowRight size={14} className={`sm:w-[18px] sm:h-[18px] ${(isBusy || isExplicitlyOccupied) ? statusColor : 'text-white/20'}`} />
            </div>
        </button>
    );
}
