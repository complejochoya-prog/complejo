import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, AlertCircle, Save, History } from 'lucide-react';
import { fetchMovimientos } from '../services/inventarioService';

export default function StockControl({ isOpen, onClose, onSave, producto }) {
    const [tipo, setTipo] = useState('Ingreso'); // Ingreso, Ajuste_Positivo, Ajuste_Negativo, Pérdida
    const [cantidad, setCantidad] = useState('');
    const [origen, setOrigen] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [movements, setMovements] = useState([]);

    useEffect(() => {
        if(isOpen && producto) {
            fetchMovimientos(producto.id).then(moves => setMovements(moves.slice(0, 5)));
        }
    }, [isOpen, producto]);

    if (!isOpen || !producto) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const qty = Number(cantidad);
        if(!qty || qty <= 0) {
            setError('Cantidad inválida'); return;
        }

        const isSalida = ['Ajuste_Negativo', 'Pérdida'].includes(tipo);
        if(isSalida && producto.stock < qty) {
            setError(`Stock insuficiente. Actual: ${producto.stock}`); return;
        }

        setSaving(true);
        try {
            // Map the internal types to the service expected types
            const recordType = tipo === 'Ajuste_Negativo' ? 'Salida' : tipo;
            await onSave({
                productoId: producto.id,
                tipo: recordType,
                cantidad: qty,
                origen: origen || 'Control Manual'
            });
            setCantidad(''); setOrigen(''); setTipo('Ingreso');
            onClose();
        } catch (err) {
            setError('Error al registrar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 w-full sm:max-w-sm sm:rounded-[32px] rounded-t-[32px] border border-white/[0.08] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-950/50">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Control Stock</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">{producto.nombre}</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 bg-indigo-500/[0.02] border-b border-white/[0.02] flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stock Actual</p>
                        <p className={`text-3xl font-black italic tracking-tighter mt-1 ${producto.stock <= producto.stock_minimo ? 'text-amber-500' : 'text-emerald-400'}`}>
                            {producto.stock}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stock Mínimo</p>
                        <p className="text-lg font-black text-slate-400 italic tracking-tighter mt-1">{producto.stock_minimo}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tipo Togglers */}
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setTipo('Ingreso')}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${
                                tipo === 'Ingreso' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner' : 'bg-slate-950 border-white/[0.04] text-slate-500 hover:border-white/10'
                            }`}>
                            <ArrowUpCircle size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ingresar</span>
                        </button>
                        <button type="button" onClick={() => setTipo('Pérdida')}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${
                                tipo === 'Pérdida' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-inner' : 'bg-slate-950 border-white/[0.04] text-slate-500 hover:border-white/10'
                            }`}>
                            <ArrowDownCircle size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Descontar</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Cantidad</label>
                            <input type="number" min="1" value={cantidad} onChange={e => {setCantidad(e.target.value); setError('');}} required
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all text-center" placeholder="1" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Motivo / Proveedor</label>
                        <input type="text" value={origen} onChange={e => setOrigen(e.target.value)} required
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="Ej: Compra Coca Cola, Merma cocina..." />
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                            <AlertCircle size={14} />
                            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={saving}
                        className="w-full py-4 rounded-2xl bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                        <Save size={18} /> Confirmar Movimiento
                    </button>

                    {movements.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                <History size={12} /> Últimos Movimientos
                            </h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {movements.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-white/[0.03]">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.tipo} • {m.fecha}</p>
                                            <p className="text-xs font-bold text-slate-300">{m.origen}</p>
                                        </div>
                                        <div className={`text-sm font-black tracking-tighter italic ${['Ingreso', 'Ajuste_Positivo'].includes(m.tipo) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {['Ingreso', 'Ajuste_Positivo'].includes(m.tipo) ? '+' : '-'}{m.cantidad}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
