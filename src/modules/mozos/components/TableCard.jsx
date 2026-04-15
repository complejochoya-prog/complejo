import React, { useMemo } from 'react';
import { Users, Timer, ArrowRight, Utensils, Receipt, Bell } from 'lucide-react';

export default function TableCard({ number, activeOrders, onClick }) {
    const isBusy = activeOrders && activeOrders.length > 0;
    
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

    if (isBusy) {
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
            statusText = "Mesa Ocupada";
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
    }
    
    return (
        <button 
            onClick={() => onClick(number)}
            className={`relative p-5 rounded-[28px] border-2 transition-all active:scale-[0.97] text-left group overflow-hidden ${cardStyle}`}
        >
            {isBusy && (
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <IconState size={100} />
                </div>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-colors ${iconStyle}`}>
                        <span className="text-xl font-black">{number}</span>
                    </div>
                </div>

                <div className="space-y-1 mt-6">
                    <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                        Mesa {number}
                    </h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${statusColor}`}>
                        {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                        {statusText}
                    </p>
                </div>

                {isBusy && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Espera</span>
                           <span className={`text-[11px] font-bold ${statusColor} flex items-center gap-1`}>
                               <Timer size={12} /> {waitTime}
                           </span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Órdenes</span>
                           <span className="text-[11px] font-bold text-white">
                               {activeOrders.length} item(s)
                           </span>
                        </div>
                    </div>
                )}
            </div>

            <div className={`absolute top-5 right-5 transition-opacity ${isBusy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <ArrowRight size={18} className={isBusy ? statusColor : 'text-white/20'} />
            </div>
        </button>
    );
}
