import React, { useState } from 'react';
import { X, Banknote, CreditCard, Upload, CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onConfirm, orderTotal }) {
    const [method, setMethod] = useState('Efectivo');
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (method === 'Transferencia' && !receipt) {
            alert("Por favor suba el comprobante de transferencia");
            return;
        }

        setLoading(true);
        // Simulate processing
        setTimeout(() => {
            onConfirm({ method, receipt });
            setLoading(false);
            setReceipt(null);
            setMethod('Efectivo');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 border-t sm:border border-white/10 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Registrar Pago</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Monto total a cobrar</p>
                    <div className="text-4xl font-black text-emerald-400 italic mt-1 tracking-tighter">
                        ${orderTotal.toLocaleString()}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setMethod('Efectivo')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                    method === 'Efectivo' 
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20' 
                                    : 'bg-slate-950 border-white/5 text-slate-500'
                                }`}
                            >
                                <Banknote size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Efectivo</span>
                            </button>
                            <button 
                                onClick={() => setMethod('Transferencia')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                                    method === 'Transferencia' 
                                    ? 'bg-blue-500 border-blue-400 text-slate-950 shadow-lg shadow-blue-500/20' 
                                    : 'bg-slate-950 border-white/5 text-slate-500'
                                }`}
                            >
                                <CreditCard size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Transferencia</span>
                            </button>
                        </div>
                    </div>

                    {method === 'Transferencia' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comprobante de Pago</label>
                            {receipt ? (
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-slate-950">
                                    <img src={receipt} alt="Comprobante" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setReceipt(null)}
                                        className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950 cursor-pointer hover:border-blue-500/50 transition-colors">
                                    <Upload className="text-slate-600 mb-2" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subir imagen / foto</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4 ${
                            method === 'Efectivo' ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <CheckCircle2 size={18} />
                                Finalizar Entrega
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
