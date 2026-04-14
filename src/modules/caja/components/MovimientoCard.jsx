import React from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    User,
    Banknote,
    CreditCard,
    Smartphone,
    Trash2,
    Bike
} from 'lucide-react';

const methodConfig = {
    efectivo: { icon: Banknote, label: 'Efectivo', color: 'text-emerald-400' },
    transferencia: { icon: CreditCard, label: 'Transferencia', color: 'text-blue-400' },
    mercadopago: { icon: Smartphone, label: 'MercadoPago', color: 'text-sky-400' },
};

const origenLabels = {
    reserva: '⚽ Reserva',
    bar: '🍺 Bar',
    delivery: '🛵 Delivery',
    manual: '✏️ Manual',
    gasto: '📦 Gasto',
};

export default function MovimientoCard({ movimiento, onDelete }) {
    const isEntry = movimiento.tipo === 'entrada';
    const method = methodConfig[movimiento.metodo_pago] || methodConfig.efectivo;
    const MethodIcon = method.icon;
    const origenLabel = origenLabels[movimiento.origen] || movimiento.origen;

    return (
        <div className="group relative bg-slate-900/60 backdrop-blur-sm border border-white/[0.04] rounded-2xl p-4 md:p-5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isEntry
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                    }`}
                >
                    {isEntry ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                            {movimiento.categoria}
                        </h4>
                        <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-500 uppercase tracking-widest border border-white/5">
                            {origenLabel}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        {movimiento.descripcion}
                    </p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <Clock size={11} />
                            {movimiento.hora}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <User size={11} />
                            {movimiento.usuario}
                        </div>
                        {movimiento.repartidor && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">
                                <Bike size={11} />
                                Repartidor: {movimiento.repartidor}
                            </div>
                        )}
                        {movimiento.mozo && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                                <User size={11} />
                                Mozo: {movimiento.mozo}
                            </div>
                        )}
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${method.color}`}>
                            <MethodIcon size={11} />
                            {method.label}
                        </div>
                    </div>
                </div>

                {/* Amount & Actions */}
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p
                        className={`text-xl font-black italic tracking-tighter ${
                            isEntry ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                    >
                        {isEntry ? '+' : '-'}${movimiento.monto.toLocaleString('es-AR')}
                    </p>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(movimiento.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"
                            title="Eliminar movimiento"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
