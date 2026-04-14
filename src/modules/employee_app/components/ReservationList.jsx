import React from 'react';
import { CalendarRange, CreditCard, PlayCircle, Clock } from 'lucide-react';

export default function ReservationList({ reservas, onChangeStatus }) {
    if (!reservas.length) {
        return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-sm">Sin reservas asigandas.</div>;
    }

    return (
        <div className="space-y-3">
            {reservas.map(r => (
                <div key={r.id} className="bg-slate-900 border border-white/5 p-4 md:px-6 md:py-5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 ${
                            r.estado === 'jugando' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                            <CalendarRange size={24} />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                                {r.cancha}
                                <span className={`text-[9px] px-2 py-0.5 rounded ${r.estado === 'jugando' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                    {r.estado}
                                </span>
                            </h4>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-1.5">
                                <Clock size={12} className="text-indigo-400" /> {r.hora} - {r.cliente}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => onChangeStatus(r.id, 'estado', r.estado === 'jugando' ? 'pendiente' : 'jugando')}
                            className="bg-slate-950 border border-slate-700 text-slate-300 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:text-white flex-1 transition-colors"
                        >
                            <PlayCircle size={14} className={r.estado === 'jugando' ? 'text-slate-500' : 'text-emerald-400'} /> 
                            {r.estado === 'jugando' ? 'Finalizar' : 'Empezar'}
                        </button>
                        
                        <button 
                            onClick={() => onChangeStatus(r.id, 'pago_estado', 'pagado')}
                            disabled={r.pago_estado === 'pagado'}
                            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 flex-1 transition-colors ${
                                r.pago_estado === 'pagado'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 active:scale-95'
                            }`}
                        >
                            <CreditCard size={14} /> 
                            {r.pago_estado === 'pagado' ? 'Abonado' : `Cobrar $${r.precio}`}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
