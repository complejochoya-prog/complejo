import React, { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export default function PaymentModal({ isOpen, order, orderTotal, onClose, onConfirm }) {
    const [method, setMethod] = useState('Efectivo');
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || (!order && !orderTotal && orderTotal !== 0)) return null;

    const total = Number(order?.total ?? orderTotal ?? order?.monto ?? 0);
    const tableNumber = order?.table || order?.mesa;
    const clientName = order?.cliente || order?.customer;

    const modalTitle = tableNumber 
        ? `Cobrar Mesa ${tableNumber}` 
        : (clientName ? `Cobro — ${clientName}` : 'Confirmar Cobro');

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = async () => {
        if (method === 'Transferencia' && !receipt) {
            alert("Por favor suba la foto del comprobante");
            return;
        }
        setLoading(true);
        try {
            if (onConfirm) {
                await onConfirm({ method, receipt });
            }
        } catch (err) {
            console.error('[PaymentModal] Error al procesar cobro:', err);
            alert("Ocurrió un error al procesar el cobro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-[#121115] w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-[36px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-black/30">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white leading-tight">
                            {modalTitle}
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            Total a cobrar: <span className="text-emerald-400 font-black">${total.toLocaleString()}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Payment Methods */}
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">
                            Método de Pago
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                { id: 'Efectivo', icon: Banknote, color: 'text-emerald-400' },
                                { id: 'Tarjeta', icon: CreditCard, color: 'text-blue-400' },
                                { id: 'Transferencia', icon: Smartphone, color: 'text-sky-400' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMethod(m.id)}
                                    className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                                        method === m.id 
                                            ? `border-white/30 bg-white/10 ${m.color} shadow-lg shadow-white/5` 
                                            : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-slate-300'
                                    }`}
                                >
                                    <m.icon size={20} />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{m.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {method === 'Transferencia' && (
                        <div className="space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                Comprobante de Transferencia
                            </label>
                            {receipt ? (
                                <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black group">
                                    <img src={receipt} alt="Comprobante" className="w-full h-full object-contain" />
                                    <button 
                                        type="button"
                                        onClick={() => setReceipt(null)}
                                        className="absolute top-2 right-2 p-1.5 bg-rose-500 rounded-lg text-white shadow-lg active:scale-90 transition-transform"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed border-white/10 rounded-xl sm:rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-sky-500/30 cursor-pointer transition-all">
                                    <Upload size={20} className="text-slate-500 mb-1" />
                                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subir Foto o Captura</span>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-4 sm:py-4.5 rounded-xl sm:rounded-2xl bg-white text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 hover:bg-slate-100"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <CheckCircle2 size={18} /> Confirmar Cobro
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
