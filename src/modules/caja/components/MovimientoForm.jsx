import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';

const categories = {
    entrada: ['Reserva de cancha', 'Venta bar', 'Delivery bar', 'Ingreso manual', 'Otro'],
    salida: ['Compra insumos', 'Pago proveedor', 'Sueldos', 'Mantenimiento', 'Gastos varios', 'Otro'],
};

const origenMap = {
    'Reserva de cancha': 'reserva',
    'Venta bar': 'bar',
    'Delivery bar': 'delivery',
    'Ingreso manual': 'manual',
    Otro: 'manual',
    'Compra insumos': 'gasto',
    'Pago proveedor': 'gasto',
    Sueldos: 'gasto',
    Mantenimiento: 'gasto',
    'Gastos varios': 'gasto',
};

const INITIAL_STATE = {
    tipo: 'entrada',
    categoria: '',
    descripcion: '',
    monto: '',
    metodo_pago: 'efectivo',
    observaciones: '',
    receiptImage: null,
};

export default function MovimientoForm({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...INITIAL_STATE });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, receiptImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoria || !formData.monto) return;

        setSaving(true);
        try {
            await onSave({
                tipo: formData.tipo,
                categoria: formData.categoria,
                descripcion: formData.descripcion || formData.categoria,
                monto: parseFloat(formData.monto),
                metodo_pago: formData.metodo_pago,
                origen: origenMap[formData.categoria] || 'manual',
                observaciones: formData.observaciones,
                receiptImage: formData.receiptImage, // Base64 string
            });
            setFormData({ ...INITIAL_STATE });
            onClose();
        } catch (err) {
            console.error('Error registering movement:', err);
        } finally {
            setSaving(false);
        }
    };

    const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-900 w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] border border-white/[0.08] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                            Registrar Movimiento
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Carga manual de caja
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Tipo toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => { set('tipo', 'entrada'); set('categoria', ''); }}
                            className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
                                formData.tipo === 'entrada'
                                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <Plus size={14} /> Ingreso
                        </button>
                        <button
                            type="button"
                            onClick={() => { set('tipo', 'salida'); set('categoria', ''); }}
                            className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
                                formData.tipo === 'salida'
                                    ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/30'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <Minus size={14} /> Egreso
                        </button>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                            Categoría
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => set('categoria', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>
                                Seleccionar categoría...
                            </option>
                            {categories[formData.tipo].map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Monto + Método */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                Monto
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">
                                    $
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={formData.monto}
                                    onChange={(e) => set('monto', e.target.value)}
                                    className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl pl-10 pr-5 py-4 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                Método
                            </label>
                            <select
                                value={formData.metodo_pago}
                                onChange={(e) => set('metodo_pago', e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="mercadopago">MercadoPago</option>
                            </select>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                            Descripción
                        </label>
                        <input
                            type="text"
                            value={formData.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-5 py-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            placeholder="Detalle del movimiento..."
                            required
                        />
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                            Observaciones <span className="text-slate-700">(opcional)</span>
                        </label>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => set('observaciones', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-5 py-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all h-20 resize-none"
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    {/* Receipt Upload (only for Transferencia) */}
                    {formData.metodo_pago === 'transferencia' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                                Comprobante de Pago
                            </label>
                            {formData.receiptImage ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black group">
                                    <img src={formData.receiptImage} alt="Receipt Preview" className="w-full h-full object-contain" />
                                    <button 
                                        type="button"
                                        onClick={() => set('receiptImage', null)}
                                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/[0.08] rounded-2xl bg-slate-950/50 hover:bg-slate-950 hover:border-indigo-500/30 cursor-pointer transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Subir Comprobante</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-[0.97] disabled:opacity-50 ${
                            formData.tipo === 'entrada'
                                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                                : 'bg-rose-500 text-slate-950 shadow-rose-500/20'
                        }`}
                    >
                        <Check size={18} />
                        {saving ? 'Guardando...' : 'Confirmar Registro'}
                    </button>

                    <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] px-6">
                        Se registrará con fecha y hora actual automáticamente
                    </p>
                </form>
            </div>
        </div>
    );
}
