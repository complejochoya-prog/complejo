import React from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { Archive, Lock, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CajaHistory() {
    const { cajaHistory } = useConfig();

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
                            <Archive size={24} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Historial <span className="text-red-400">Caja</span></h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <Lock size={12} className="text-red-400" />
                        Registro de cajas cerradas
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Apertura</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Cierre</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Usuarios</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Efectivo Real</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Transferencias</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(cajaHistory || []).map(caja => {
                            const openingStr = caja.openedAt ? format(caja.openedAt, "dd/MM/yy HH:mm", { locale: es }) : '-';
                            const closingStr = caja.closedAt ? format(caja.closedAt, "dd/MM/yy HH:mm", { locale: es }) : '-';
                            const diff = caja.difference || 0;

                            return (
                                <tr key={caja.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-sm uppercase">{openingStr.split(' ')[0]}</div>
                                        <div className="text-[10px] text-slate-500 tracking-widest font-black">{openingStr.split(' ')[1]}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-sm uppercase">{closingStr.split(' ')[0]}</div>
                                        <div className="text-[10px] text-slate-500 tracking-widest font-black">{closingStr.split(' ')[1]}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-[10px] text-slate-500 tracking-widest font-black mb-1">Ap: <span className="text-white">{caja.openedBy?.name}</span></div>
                                        <div className="text-[10px] text-slate-500 tracking-widest font-black">C: <span className="text-white">{caja.closedBy?.name}</span></div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-black text-white text-sm italic tracking-tighter mb-1">
                                            ${(caja.realCash || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-black text-purple-400 text-sm italic tracking-tighter mb-1">
                                            ${(caja.totalTransfer || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className={`font-black text-sm italic tracking-tighter ${diff < 0 ? 'text-red-400' : diff > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                                            {diff > 0 ? '+' : ''}{diff.toLocaleString()}
                                        </div>
                                        {caja.observations && (
                                            <div className="mt-1 text-[9px] font-bold text-slate-500 uppercase max-w-[150px] ml-auto truncate" title={caja.observations}>
                                                {caja.observations}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {(!cajaHistory || cajaHistory.length === 0) && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                    Aún no hay cajas cerradas para mostrar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
