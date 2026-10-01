import React, { useState, useEffect } from 'react';
import { 
    X, 
    Lock, 
    Loader2, 
    CheckCircle2, 
    AlertTriangle, 
    Banknote, 
    CreditCard, 
    Smartphone, 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Printer, 
    FileText,
    ArrowRight
} from 'lucide-react';

export default function CierreCajaModal({
    isOpen,
    onClose,
    session,
    stats,
    movements,
    onConfirmClose,
    onOpenTicket
}) {
    const initialBalance = Number(session?.initialBalance || session?.initialAmount || 0);
    const totalIngresos = Number(stats?.ingresosHoy || 0);
    const totalEgresos = Number(stats?.egresosHoy || 0);
    const porEfectivo = Number(stats?.porEfectivo || 0);
    const porTransferencia = Number(stats?.porTransferencia || 0);
    const porMercadopago = Number(stats?.porMercadopago || 0);

    const efectivoEsperado = initialBalance + porEfectivo - totalEgresos;

    const [efectivoReal, setEfectivoReal] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [cajero, setCajero] = useState('Administrador');
    const [loading, setLoading] = useState(false);
    const [closedResult, setClosedResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setEfectivoReal(efectivoEsperado.toString());
            setObservaciones('');
            setClosedResult(null);
            setLoading(false);
        }
    }, [isOpen, efectivoEsperado]);

    if (!isOpen) return null;

    const realCashNumber = parseFloat(efectivoReal) || 0;
    const diferencia = realCashNumber - efectivoEsperado;

    const handleCloseShift = async () => {
        setLoading(true);
        try {
            const closePayload = {
                user: cajero,
                initialBalance,
                totalIngresos,
                totalEgresos,
                porEfectivo,
                porTransferencia,
                porMercadopago,
                efectivoEsperado,
                efectivoReal: realCashNumber,
                diferencia,
                finalBalance: realCashNumber,
                observaciones: observaciones.trim()
            };

            const result = await onConfirmClose(closePayload);
            if (result && result.success) {
                setClosedResult(result.closedSession || { ...session, ...closePayload });
            } else {
                alert("Ocurrió un error al cerrar el turno: " + (result?.error || "Error desconocido"));
            }
        } catch (err) {
            console.error("Error closing shift:", err);
            alert("Error al cerrar caja: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
            <div className="relative bg-slate-900 w-full max-w-xl rounded-[36px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden my-auto scale-in-center">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                                Cierre de Turno
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-1">
                                Control de Arqueo y Registro Histórico
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                {closedResult ? (
                    /* Shift Closed Success Screen */
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                            <CheckCircle2 size={44} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                                ¡Turno Cerrado Exitosamente!
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-sm mx-auto">
                                El balance final de <span className="text-emerald-400 font-black">${realCashNumber.toLocaleString('es-AR')}</span> ha quedado guardado como disponible para el próximo turno.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => {
                                    onOpenTicket(closedResult);
                                    onClose();
                                }}
                                className="h-14 rounded-2xl bg-indigo-500 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Printer size={18} /> Ver e Imprimir Reporte
                            </button>
                            <button
                                onClick={onClose}
                                className="h-14 rounded-2xl bg-white/10 text-white hover:bg-white/15 font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Shift Closing Form */
                    <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                        
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                    Fondo Inicial
                                </p>
                                <p className="text-base font-black text-white italic tracking-tight">
                                    ${initialBalance.toLocaleString('es-AR')}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1">
                                    <TrendingUp size={10} /> Ingresos
                                </p>
                                <p className="text-base font-black text-emerald-400 italic tracking-tight">
                                    ${totalIngresos.toLocaleString('es-AR')}
                                </p>
                            </div>
                            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1 flex items-center gap-1">
                                    <TrendingDown size={10} /> Egresos
                                </p>
                                <p className="text-base font-black text-rose-400 italic tracking-tight">
                                    ${totalEgresos.toLocaleString('es-AR')}
                                </p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                                Desglose por Método
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <Banknote size={14} className="text-emerald-400" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-600">Efectivo</p>
                                        <p className="font-bold text-white font-mono">${porEfectivo.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={14} className="text-blue-400" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-600">Transfer</p>
                                        <p className="font-bold text-white font-mono">${porTransferencia.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Smartphone size={14} className="text-sky-400" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-600">MP</p>
                                        <p className="font-bold text-white font-mono">${porMercadopago.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arqueo Input */}
                        <div className="space-y-3 bg-slate-950/80 p-5 rounded-3xl border border-indigo-500/20 shadow-inner">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                                    <Banknote size={14} /> Efectivo Real Contado en Caja
                                </label>
                                <span className="text-[9px] font-bold text-slate-500">
                                    Esperado: ${efectivoEsperado.toLocaleString('es-AR')}
                                </span>
                            </div>

                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-2xl">$</span>
                                <input
                                    type="number"
                                    value={efectivoReal}
                                    onChange={(e) => setEfectivoReal(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-2xl font-black text-white focus:outline-none focus:border-indigo-500/60 transition-all font-mono"
                                />
                            </div>

                            {/* Live Difference Badge */}
                            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                diferencia === 0
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : diferencia > 0
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                                <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                                    {diferencia === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                    {diferencia === 0 ? 'Caja Cuadrada Perfecta' : diferencia > 0 ? 'Sobrante de Efectivo' : 'Faltante de Efectivo'}
                                </span>
                                <span className="font-black font-mono text-sm">
                                    {diferencia > 0 ? '+' : ''}${diferencia.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        {/* Responsible User & Observations */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Responsable de Cierre
                                </label>
                                <input
                                    type="text"
                                    value={cajero}
                                    onChange={(e) => setCajero(e.target.value)}
                                    placeholder="Nombre del cajero"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Notas / Observaciones
                                </label>
                                <input
                                    type="text"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Ej: Se dejó cambio para mañana..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={handleCloseShift}
                                disabled={loading}
                                className="w-full h-16 rounded-2xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black uppercase tracking-[0.15em] text-xs shadow-[0_20px_40px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Cerrando Turno...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Confirmar y Cerrar Caja
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
