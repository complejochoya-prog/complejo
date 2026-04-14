import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, CreditCard, CheckCircle2, Clock } from 'lucide-react';

export default function ReservationCard({ reserva, negocioId, onPay }) {
    const isPaid = reserva.pagado || reserva.estado === 'completada';
    
    return (
        <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col gap-3 shadow-lg relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1">{reserva.cancha}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <CalendarRange size={12} />
                        {reserva.fecha} a las {reserva.hora}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black italic tracking-tighter text-indigo-400 block">
                        ${reserva.precio.toLocaleString('es-AR')}
                    </span>
                    {isPaid ? (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1 mt-1 justify-end">
                            <CheckCircle2 size={10} /> Pagado
                        </span>
                    ) : (
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1 mt-1 justify-end">
                            <Clock size={10} /> Pendiente
                        </span>
                    )}
                </div>
            </div>

            {!isPaid && onPay && (
                <button
                    onClick={() => onPay(reserva)}
                    className="w-full bg-[#009EE3] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[#008CCh] transition-colors mt-2"
                >
                    <CreditCard size={14} /> Pagar con MercadoPago
                </button>
            )}
        </div>
    );
}
