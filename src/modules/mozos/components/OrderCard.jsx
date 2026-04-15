import React from 'react';
import { Clock, CheckCircle2, Receipt, ChefHat, Truck, Package, HandPlatter, MessageSquare } from 'lucide-react';

export default function OrderCard({ order, onPay, onStatusChange, isMozoMode }) {
    const statusConfig = {
        nuevo:      { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Enviado a Cocina',       icon: Package },
        pendiente:  { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    label: 'Enviado a Cocina',       icon: Package },
        preparando: { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  label: 'En Preparación 🔥',      icon: ChefHat },
        en_cocina:  { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  label: 'En Cocina 🔥',           icon: ChefHat },
        listo:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '¡Listo para retirar!',   icon: CheckCircle2 },
        listo_para_salir: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '¡Listo para retirar!', icon: CheckCircle2 },
        para_entregar:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '¡Listo para retirar!', icon: CheckCircle2 },
        retirado:   { color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     label: 'Retirado de Cocina',     icon: HandPlatter },
        entregado:  { color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  label: 'Entregado en Mesa',      icon: Truck },
        paid:       { color: 'text-slate-500',   bg: 'bg-slate-500/10',   border: 'border-white/5',        label: 'Pagado ✓',               icon: Receipt },
    };

    const getStatus = (order) => {
        if (order.status === 'paid' || order.paid) return 'paid';
        const estado = order.estado || order.status || 'nuevo';
        if (estado === 'entregado' && !order.paid) return 'entregado';
        if (estado === 'retirado') return 'retirado';
        if (['listo', 'listo_para_salir', 'para_entregar'].includes(estado)) return 'listo';
        if (['preparando', 'en_cocina', 'en_preparacion'].includes(estado)) return 'preparando';
        if (estado === 'nuevo' || estado === 'pendiente') return 'nuevo';
        return 'nuevo';
    };

    const status = getStatus(order);
    const config = statusConfig[status] || statusConfig.nuevo;
    const Icon = config.icon;

    const productsList = order.products || order.items || [];

    const handleAction = (newStatus) => {
        if ('vibrate' in navigator) navigator.vibrate([50, 30]);
        if (onStatusChange) onStatusChange(order, newStatus);
    };

    return (
        <div className={`bg-white/[0.02] backdrop-blur-md rounded-[24px] border ${config.border} p-5 space-y-4 transition-all ${status === 'listo' ? 'ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${config.bg} ${config.color} border border-current/10 shrink-0`}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-white">
                            Comanda #{String(order.id).slice(-4)}
                        </h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                            {config.label}
                        </span>
                        {order.hora && (
                            <p className="text-[9px] text-slate-600 font-bold mt-0.5">{order.hora}</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black tracking-tight text-white">
                        ${(order.total || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        {productsList.length} items
                    </p>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2">
                {productsList.map((p, i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-300 truncate pr-4">{p.quantity || p.cantidad}x {p.nombre}</span>
                            <span className="text-slate-500 shrink-0">${((p.precio || p.price || 0) * (p.quantity || p.cantidad || 1)).toLocaleString()}</span>
                        </div>
                        {/* Show product observation/note if exists */}
                        {(p.comment || p.nota || p.notes || p.note) && (
                            <div className="flex items-center gap-1.5 ml-1">
                                <MessageSquare size={10} className="text-amber-500/60 shrink-0" />
                                <span className="text-[9px] text-amber-500/80 font-bold italic truncate">
                                    {p.comment || p.nota || p.notes || p.note}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MOZO ACTION BUTTONS — based on current status */}
            {isMozoMode && status !== 'paid' && (
                <div className="space-y-2">
                    {/* Status: nuevo/pendiente → Waiting for kitchen */}
                    {(status === 'nuevo' || status === 'pendiente') && (
                        <div className="py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/70 flex items-center justify-center gap-2">
                                <Package size={14} /> Esperando que cocina lo tome...
                            </p>
                        </div>
                    )}

                    {/* Status: preparando → In kitchen, wait */}
                    {status === 'preparando' && (
                        <div className="py-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/70 flex items-center justify-center gap-2">
                                <ChefHat size={14} /> Cocina preparando el pedido...
                            </p>
                        </div>
                    )}

                    {/* Status: listo → Mozo can mark as RETIRADO */}
                    {status === 'listo' && (
                        <button 
                            onClick={() => handleAction('retirado')}
                            className="w-full py-4 bg-emerald-500 text-white rounded-[16px] text-[11px] font-black uppercase tracking-widest active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 animate-pulse-slow"
                        >
                            <HandPlatter size={18} /> Retirar de Cocina
                        </button>
                    )}

                    {/* Status: retirado → Mozo can mark as ENTREGADO */}
                    {status === 'retirado' && (
                        <button 
                            onClick={() => handleAction('entregado')}
                            className="w-full py-4 bg-sky-500 text-white rounded-[16px] text-[11px] font-black uppercase tracking-widest active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                        >
                            <Truck size={18} /> Entregar en Mesa
                        </button>
                    )}

                    {/* Status: entregado → Waiting to be paid (no action needed) */}
                    {status === 'entregado' && (
                        <div className="py-3 bg-violet-500/5 border border-violet-500/10 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400/70 flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} /> Entregado — pendiente de cobro
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
            `}} />
        </div>
    );
}
