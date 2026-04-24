import React, { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Receipt, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export default function PaymentModal({ isOpen, order, onClose, onConfirm }) {
    const [method, setMethod] = useState('Efectivo');
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !order) return null;

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

    const handleConfirm = async () => {
        if (method === 'Transferencia' && !receipt) {
            alert("Por favor suba la foto del comprobante");
            return;
        }
        setLoading(true);
        // Simulation delay
        setTimeout(() => {
            onConfirm({ method, receipt });
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-slate-900 w-full max-w-md rounded-[40px] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                            Cobrar Mesa {order.table}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            Total a cobrar: <span className="text-white">${order.total.toLocaleString()}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'Efectivo', icon: Banknote, color: 'text-emerald-500' },
                            { id: 'Tarjeta', icon: CreditCard, color: 'text-blue-500' },
                            { id: 'Transferencia', icon: Smartphone, color: 'text-sky-500' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                                    method === m.id 
                                        ? `border-white/20 bg-white/5 ${m.color}` 
                                        : 'border-white/5 bg-slate-950/50 text-slate-600 grayscale'
                                }`}
                            >
                                <m.icon size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{m.id}</span>
                            </button>
                        ))}
                    </div>

                    {method === 'Transferencia' && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Comprobante de Pago</label>
                            {receipt ? (
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black group">
                                    <img src={receipt} alt="Preview" className="w-full h-full object-contain" />
                                    <button 
                                        onClick={() => setReceipt(null)}
                                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/5 rounded-3xl bg-slate-950/50 hover:bg-slate-950 hover:border-sky-500/20 cursor-pointer transition-all">
                                    <Upload size={24} className="text-slate-600 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Subir Foto</span>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-6 rounded-3xl bg-white text-slate-950 text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <CheckCircle2 size={20} /> Confirmar Cobro
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
