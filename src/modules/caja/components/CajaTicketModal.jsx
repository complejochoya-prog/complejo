import React, { useRef } from 'react';
import { 
    X, 
    Printer, 
    CheckCircle2, 
    AlertCircle, 
    Lock, 
    Calendar, 
    Clock, 
    User, 
    DollarSign, 
    Banknote, 
    CreditCard, 
    Smartphone, 
    Utensils, 
    CalendarCheck, 
    Truck, 
    FileText 
} from 'lucide-react';

function formatDate(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export default function CajaTicketModal({ isOpen, onClose, sessionData, negocioName = "COMPLEJO CHOYA" }) {
    const printAreaRef = useRef(null);

    if (!isOpen || !sessionData) return null;

    const s = sessionData;
    const initialBalance = Number(s.initialBalance || s.initialAmount || 0);
    const totalIngresos = Number(s.totalIngresos || 0);
    const totalEgresos = Number(s.totalEgresos || 0);
    const ganancia = Number(s.ganancia ?? (totalIngresos - totalEgresos));
    const desglose = s.desglose || { efectivo: 0, transferencia: 0, mercadopago: 0 };
    
    const efectivoEsperado = Number(s.efectivoEsperado ?? (initialBalance + (desglose.efectivo || 0) - totalEgresos));
    const efectivoReal = Number(s.efectivoReal ?? s.finalBalance ?? efectivoEsperado);
    const diferencia = Number(s.diferencia ?? (efectivoReal - efectivoEsperado));

    const resumenOrigen = s.resumenOrigen || {
        bar: s.barVentas || 0,
        reservas: s.reservasVentas || 0,
        delivery: s.deliveryVentas || 0
    };

    const movements = s.movementsSnapshot || s.movements || [];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
            {/* Modal Box */}
            <div className="relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none print:bg-white print:text-black">
                
                {/* Header Actions (hidden in print) */}
                <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black uppercase italic tracking-tighter text-white">
                                Comprobante de Cierre de Caja
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Reporte financiero imprimible
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                            <Printer size={16} /> Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Content Body */}
                <div ref={printAreaRef} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 print:text-black">
                    
                    {/* Ticket Header */}
                    <div className="text-center pb-6 border-b border-dashed border-white/10 print:border-black/30 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 print:text-black">
                            Sistema de Gestión & Bóveda
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white print:text-black">
                            {negocioName}
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-gray-700">
                            INFORME DETALLADO DE ARQUEO Y CIERRE DE TURNO
                        </p>
                        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 print:bg-gray-100 print:text-black print:border-gray-300">
                            Turno ID: <span className="text-white print:text-black font-mono font-black">{s.id || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/50 p-4 rounded-2xl border border-white/5 print:bg-gray-50 print:border-gray-200 print:text-black">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                Apertura:
                            </span>
                            <span className="font-bold text-white print:text-black">
                                {formatDate(s.openedAt)} {formatTime(s.openedAt)}
                            </span>
                            <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-0.5">
                                Por: {s.openedBy || 'Sistema'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                Cierre:
                            </span>
                            <span className="font-bold text-white print:text-black">
                                {formatDate(s.closedAt || new Date().toISOString())} {formatTime(s.closedAt || new Date().toISOString())}
                            </span>
                            <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-0.5">
                                Por: {s.closedBy || 'Administrador'}
                            </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                Estado:
                            </span>
                            <span className="inline-flex items-center gap-1 font-black text-rose-400 print:text-black uppercase text-[11px]">
                                <Lock size={12} /> Turno Cerrado
                            </span>
                            <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-0.5">
                                Movimientos: {movements.length || s.movementsCount || 0}
                            </span>
                        </div>
                    </div>

                    {/* Balance Financial Summary */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 print:text-black flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-400 print:text-black" /> Resumen Económico del Turno
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 print:bg-gray-50 print:border-gray-200">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                    Fondo Inicial
                                </span>
                                <span className="text-base font-black text-white italic print:text-black">
                                    ${initialBalance.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 print:bg-gray-50 print:border-gray-200">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 print:text-gray-600 block">
                                    (+) Ingresos
                                </span>
                                <span className="text-base font-black text-emerald-400 italic print:text-black">
                                    ${totalIngresos.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 print:bg-gray-50 print:border-gray-200">
                                <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 print:text-gray-600 block">
                                    (-) Egresos/Gastos
                                </span>
                                <span className="text-base font-black text-rose-400 italic print:text-black">
                                    ${totalEgresos.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 print:bg-gray-50 print:border-gray-200">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 print:text-gray-600 block">
                                    (=) Ganancia Neta
                                </span>
                                <span className="text-base font-black text-indigo-300 italic print:text-black">
                                    ${ganancia.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Arqueo de Caja (Efectivo & Diferencia) */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 print:bg-gray-100 print:border-gray-300">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 print:text-black flex items-center gap-1.5">
                                <Banknote size={14} /> Control de Arqueo de Efectivo
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                diferencia === 0
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-gray-400 print:text-black'
                                    : diferencia > 0
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 print:border-gray-400 print:text-black'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 print:border-gray-400 print:text-black'
                            }`}>
                                {diferencia === 0 ? '✓ Caja Cuadrada' : diferencia > 0 ? `+ Sobrante $${diferencia.toLocaleString('es-AR')}` : `- Faltante $${Math.abs(diferencia).toLocaleString('es-AR')}`}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 print:border-gray-300 text-center">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                    Efectivo Teórico
                                </span>
                                <span className="text-sm font-black text-slate-300 print:text-black">
                                    ${efectivoEsperado.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                    Efectivo Real Contado
                                </span>
                                <span className="text-base font-black text-emerald-400 print:text-black underline underline-offset-4">
                                    ${efectivoReal.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                    Diferencia
                                </span>
                                <span className={`text-sm font-black ${
                                    diferencia === 0 ? 'text-slate-400 print:text-black' : diferencia > 0 ? 'text-blue-400 print:text-black' : 'text-rose-400 print:text-black'
                                }`}>
                                    {diferencia > 0 ? '+' : ''}${diferencia.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desglose por Método de Pago & Áreas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Métodos de Cobro */}
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2.5 print:bg-white print:border-gray-200">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 print:text-black flex items-center gap-1.5">
                                <CreditCard size={12} /> Métodos de Pago Ingresados
                            </span>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><Banknote size={12} className="text-emerald-400 print:text-black" /> Efectivo</span>
                                    <span className="font-bold font-mono">${(desglose.efectivo || 0).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><CreditCard size={12} className="text-blue-400 print:text-black" /> Transferencia</span>
                                    <span className="font-bold font-mono">${(desglose.transferencia || 0).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><Smartphone size={12} className="text-sky-400 print:text-black" /> MercadoPago</span>
                                    <span className="font-bold font-mono">${(desglose.mercadopago || 0).toLocaleString('es-AR')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Origen de Ventas */}
                        <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2.5 print:bg-white print:border-gray-200">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 print:text-black flex items-center gap-1.5">
                                <Utensils size={12} /> Ingresos por Sector
                            </span>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><CalendarCheck size={12} className="text-indigo-400 print:text-black" /> Canchas / Turnos</span>
                                    <span className="font-bold font-mono">${(resumenOrigen.reservas || 0).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><Utensils size={12} className="text-amber-400 print:text-black" /> Consumos Bar</span>
                                    <span className="font-bold font-mono">${(resumenOrigen.bar || 0).toLocaleString('es-AR')}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300 print:text-black">
                                    <span className="flex items-center gap-1.5"><Truck size={12} className="text-sky-400 print:text-black" /> Pedidos Delivery</span>
                                    <span className="font-bold font-mono">${(resumenOrigen.delivery || 0).toLocaleString('es-AR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones if any */}
                    {s.observaciones && (
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-xs space-y-1 print:bg-gray-50 print:border-gray-200">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 print:text-gray-600 block">
                                Observaciones / Notas de Cierre:
                            </span>
                            <p className="text-slate-300 print:text-black italic font-medium">
                                "{s.observaciones}"
                            </p>
                        </div>
                    )}

                    {/* Detailed Movements Table (if available) */}
                    {movements.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 print:text-black block">
                                Detalle de Movimientos Registrados ({movements.length})
                            </span>
                            <div className="border border-white/5 rounded-xl overflow-hidden print:border-gray-300">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-950 text-slate-400 font-bold border-b border-white/5 print:bg-gray-200 print:text-black print:border-gray-300">
                                        <tr>
                                            <th className="p-2">Hora</th>
                                            <th className="p-2">Descripción</th>
                                            <th className="p-2">Origen / Método</th>
                                            <th className="p-2 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 print:divide-gray-200 text-slate-300 print:text-black font-medium">
                                        {movements.slice(0, 50).map((m, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02]">
                                                <td className="p-2 font-mono text-[10px] text-slate-500 print:text-gray-600">{m.hora || '-'}</td>
                                                <td className="p-2">
                                                    <span className="font-bold">{m.descripcion || m.categoria}</span>
                                                </td>
                                                <td className="p-2 uppercase text-[9px] text-slate-400 print:text-gray-600">
                                                    {m.origen} • {m.metodoPago || m.metodo_pago}
                                                </td>
                                                <td className={`p-2 text-right font-black font-mono ${
                                                    m.tipo === 'entrada' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black'
                                                }`}>
                                                    {m.tipo === 'entrada' ? '+' : '-'}${Number(m.monto || 0).toLocaleString('es-AR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Signatures & Footer */}
                    <div className="pt-8 border-t border-dashed border-white/10 print:border-gray-400 grid grid-cols-2 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="border-b border-white/20 print:border-black h-12 w-4/5 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">
                                Firma del Cajero / Responsable
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="border-b border-white/20 print:border-black h-12 w-4/5 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 print:text-black">
                                Firma de Administración / Gerencia
                            </p>
                        </div>
                    </div>

                    <div className="text-center text-[9px] text-slate-600 print:text-gray-500 font-mono pt-4">
                        Documento generado automáticamente por Sistema Giovanni • {new Date().toLocaleString('es-AR')}
                    </div>
                </div>
            </div>
        </div>
    );
}
