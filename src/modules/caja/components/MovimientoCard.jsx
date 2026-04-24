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
    Bike,
    Hash,
    Image as ImageIcon,
    X,
} from 'lucide-react';

const methodConfig = {
    efectivo: { icon: Banknote, label: 'Efectivo', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    transferencia: { icon: CreditCard, label: 'Transf.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    mercadopago: { icon: Smartphone, label: 'Card/MP', color: 'text-sky-400', bg: 'bg-sky-500/10' },
};

const origenLabels = {
    reserva: { label: 'Reserva', icon: '⚽', color: 'text-blue-400' },
    bar: { label: 'Bar', icon: '🍺', color: 'text-amber-400' },
    delivery: { label: 'Delivery', icon: '🛵', color: 'text-sky-400' },
    manual: { label: 'Manual', icon: '✏️', color: 'text-slate-400' },
    gasto: { label: 'Gasto', icon: '📦', color: 'text-rose-400' },
};

export default function MovimientoCard({ movimiento, onDelete }) {
    const [showImage, setShowImage] = React.useState(false);
    const isEntry = movimiento.tipo === 'entrada';
    const imageUrl = movimiento.receiptImage || movimiento.metadata?.receiptImage;
    const method = methodConfig[movimiento.metodo_pago] || methodConfig.efectivo;
    const MethodIcon = method.icon;
    const origin = origenLabels[movimiento.origen] || { label: movimiento.origen, icon: '❓', color: 'text-slate-400' };

    return (
        <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/[0.04] rounded-[24px] p-4 hover:border-white/10 hover:bg-slate-900/60 transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Visual Indicator */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                    isEntry 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                    {isEntry ? <ArrowUpRight size={22} className="stroke-[3px]" /> : <ArrowDownLeft size={22} className="stroke-[3px]" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${origin.color} flex items-center gap-1`}>
                            {origin.icon} {origin.label}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <h4 className="text-[13px] font-black uppercase tracking-tight text-white truncate group-hover:text-amber-500 transition-colors">
                            {movimiento.categoria || 'Sin Categoría'}
                        </h4>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-2">
                        {movimiento.descripcion || 'Sin descripción adicional'}
                    </p>

                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <Clock size={11} className="text-slate-600" />
                            {movimiento.hora}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-500">
                            <User size={11} className="text-slate-600" />
                            {movimiento.usuario || 'Sistema'}
                        </div>
                        <div className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg ${method.bg} border border-white/[0.03] text-[9px] font-black uppercase tracking-widest ${method.color}`}>
                            <MethodIcon size={11} />
                            {method.label}
                        </div>
                        {movimiento.referenceId && (
                             <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.03] text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <Hash size={11} className="text-slate-600" />
                                REF: {movimiento.referenceId.slice(-6).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                    <div className={`text-2xl font-black italic tracking-tighter leading-none mb-1 ${isEntry ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isEntry ? '+' : '-'}${Number(movimiento.monto).toLocaleString('es-AR')}
                    </div>
                    <div className="flex justify-end gap-2">
                         {imageUrl && (
                            <button
                                onClick={() => setShowImage(true)}
                                className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-90"
                                title="Ver Comprobante"
                            >
                                <ImageIcon size={14} />
                            </button>
                        )}
                         {onDelete && (
                            <button
                                onClick={() => onDelete(movimiento.id)}
                                className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-90"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {showImage && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowImage(false)} />
                    <div className="relative max-w-lg w-full bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase italic text-white">Comprobante</h3>
                            <button onClick={() => setShowImage(false)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-2">
                            <img src={imageUrl} className="w-full rounded-[32px] shadow-2xl" alt="Comprobante" />
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {movimiento.descripcion || 'Transferencia'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
