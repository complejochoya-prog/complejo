import React from 'react';
import { Clock, CheckCircle2, Play, Receipt, User } from 'lucide-react';

export default function OrderCard({ order, onPay }) {
    const statusConfig = {
        pendiente: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pendiente', icon: Clock },
        preparando: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'En Cocina', icon: Play },
        listo: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: '¡Listo!', icon: CheckCircle2 },
        paid: { color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Pagado', icon: Receipt },
    };

    const getStatus = (order) => {
        if (order.status === 'paid') return 'paid';
        if (order.estado === 'listo_para_salir' || order.estado === 'listo') return 'listo';
        if (order.estado === 'preparando') return 'preparando';
        return 'pendiente';
    };

    const status = getStatus(order);
    const config = statusConfig[status] || statusConfig.pendiente;
    const Icon = config.icon;

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-white italic">
                            #{String(order.id).slice(-4)}
                        </h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black italic tracking-tighter text-white">
                        ${order.total.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        {order.products.length} productos
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {order.products.map((p, i) => (
                    <div key={i} className="flex justify-between text-[11px] font-bold text-slate-300">
                        <span>{p.quantity}x {p.nombre}</span>
                        <span>${(p.precio * p.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>

            {order.status === 'listo' && (
                <button 
                    onClick={() => onPay(order)}
                    className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Receipt size={16} /> Cobrar Cuenta
                </button>
            )}
        </div>
    );
}
