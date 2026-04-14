import React, { useState } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { useCaja } from '../services/CajaContext';
import { Lock, Unlock, Plus, History, Image as ImageIcon, X, CreditCard, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Caja() {
    const { currentCaja, cajaMovements, openCaja, closeCaja } = useCaja();
    const storedAdminId = localStorage.getItem('userId') || 'admin';
    const storedAdminName = localStorage.getItem('userName') || 'Administrador';

    const [isOpening, setIsOpening] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [initialAmount, setInitialAmount] = useState('');
    const [realCash, setRealCash] = useState('');
    const [closingObs, setClosingObs] = useState('');

    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Filter movements by current caja
    const todaysMovements = cajaMovements.filter(m => currentCaja && m.cajaId === currentCaja.id);

    // Calculate totals
    const totalCashMovement = todaysMovements
        .filter(m => m.method === 'Efectivo')
        .reduce((sum, m) => sum + Number(m.amount), 0);
    const totalTransferMovement = todaysMovements
        .filter(m => m.method === 'Transferencia')
        .reduce((sum, m) => sum + Number(m.amount), 0);
    const totalCardMovement = todaysMovements
        .filter(m => m.method === 'Tarjeta')
        .reduce((sum, m) => sum + Number(m.amount), 0);

    const expectedCash = (currentCaja?.initialAmount || 0) + totalCashMovement;

    const handleOpenCaja = async (e) => {
        e.preventDefault();
        await openCaja(Number(initialAmount), storedAdminId, storedAdminName);
        setIsOpening(false);
        setInitialAmount('');
    };

    const handleCloseCaja = async (e) => {
        e.preventDefault();
        const difference = Number(realCash) - expectedCash;

        await closeCaja(currentCaja.id, {
            closedBy: { id: storedAdminId, name: storedAdminName },
            expectedCash,
            realCash: Number(realCash),
            difference,
            totalTransfer: totalTransferMovement,
            totalCard: totalCardMovement,
            observations: closingObs
        });

        setIsClosing(false);
        setRealCash('');
        setClosingObs('');
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 text-white rounded-2xl shadow-lg ${currentCaja ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                            {currentCaja ? <Unlock size={24} /> : <Lock size={24} />}
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            Caja <span className={currentCaja ? 'text-green-400' : 'text-red-400'}>{currentCaja ? 'Abierta' : 'Cerrada'}</span>
                        </h1>
                    </div>
                    {currentCaja && (
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                            Abierta por: <span className="text-white">{currentCaja.openedBy?.name}</span> • {format(currentCaja.openedAt, "dd/MM/yyyy HH:mm")}
                        </p>
                    )}
                    {!currentCaja && (
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                            Debes abrir la caja para poder realizar cobros en el sistema.
                        </p>
                    )}
                </div>

                <div className="flex gap-4">
                    {!currentCaja ? (
                        <button
                            onClick={() => setIsOpening(true)}
                            className="bg-green-500 hover:bg-green-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
                        >
                            <Unlock size={18} /> ABRIR CAJA
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsClosing(true)}
                            className="bg-red-500 hover:bg-red-400 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
                        >
                            <Lock size={18} /> CERRAR CAJA
                        </button>
                    )}
                </div>
            </div>

            {currentCaja && (
                <>
                    {/* Totals Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 hover:border-slate-500 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                Monto Inicial
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black italic tracking-tighter">${currentCaja.initialAmount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">
                            <p className="text-[10px] text-green-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                Efectivo <Banknote size={12} />
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black italic tracking-tighter text-green-400">${totalCashMovement.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6">
                            <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                Transferencias
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black italic tracking-tighter text-purple-400">${totalTransferMovement.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                Efectivo Esperado en Caja
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black italic tracking-tighter">${expectedCash.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Movements List */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <History size={16} className="text-purple-400" /> Movimientos de Hoy
                            </h2>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Hora</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Tipo</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Detalle</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Usuario</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {todaysMovements.map(m => (
                                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{format(m.timestamp, "HH:mm")}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-900 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold">{m.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-black text-xs uppercase text-slate-500">{m.userName || 'Admin'}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-black text-green-400 text-sm italic tracking-tighter mb-1">
                                                ${(m.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-300">
                                                {m.method}
                                                {m.method === 'Transferencia' && m.receiptImage && (
                                                    <button onClick={() => setSelectedReceipt(m.receiptImage)} className="ml-2 text-purple-400 hover:text-white transition-colors">
                                                        <ImageIcon size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {todaysMovements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No hay movimientos en esta caja aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Modals */}
            {isOpening && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleOpenCaja} className="bg-slate-900 border border-green-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Unlock className="text-green-500" /> Abrir Caja
                            </h2>
                            <button type="button" onClick={() => setIsOpening(false)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monto inicial en caja (Efectivo)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={initialAmount}
                                        onChange={e => setInitialAmount(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-8 pr-4 py-4 font-bold outline-none focus:border-green-500 transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors">
                            Confirmar Apertura
                        </button>
                    </form>
                </div>
            )}

            {isClosing && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleCloseCaja} className="bg-slate-900 border border-red-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Lock className="text-red-500" /> Cerrar Caja
                            </h2>
                            <button type="button" onClick={() => setIsClosing(false)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-400">Efectivo Esperado:</span>
                                <span>${expectedCash.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-purple-400">Transferencias (Cuentas):</span>
                                <span className="text-purple-400">${totalTransferMovement.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Efectivo real contado en caja</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={realCash}
                                        onChange={e => setRealCash(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-8 pr-4 py-4 font-bold outline-none focus:border-red-500 transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                                {realCash !== '' && (
                                    <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${Number(realCash) - expectedCash < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        Diferencia: ${(Number(realCash) - expectedCash).toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Observaciones (Opcional)</label>
                                <textarea
                                    value={closingObs}
                                    onChange={e => setClosingObs(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-red-500 transition-colors min-h-[100px]"
                                    placeholder="Detalle sobre diferencias u otros..."
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-red-500 hover:bg-red-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors">
                            Cerrar Caja
                        </button>
                    </form>
                </div>
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-2 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-4 border-b border-white/5 mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                <ImageIcon size={16} /> Comprobante de Transferencia
                            </h3>
                            <button onClick={() => setSelectedReceipt(null)} className="text-slate-500 hover:text-white bg-white/5 p-2 rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex justify-center bg-slate-950 rounded-2xl overflow-hidden p-2">
                            <img src={selectedReceipt} alt="Comprobante" className="max-h-[70vh] object-contain rounded-xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
