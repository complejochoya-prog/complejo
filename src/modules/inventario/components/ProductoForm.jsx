import React, { useState, useEffect } from 'react';
import { X, Check, Save, Sparkles, Loader2 } from 'lucide-react';

const INITIAL = {
    codigo: '', nombre: '', categoria: '', precio: '',
    stock: '', stock_minimo: '', sector: 'BAR', img: ''
};

const SECTORES = ['BAR', 'COCINA', 'ALMACEN', 'LIMPIEZA', 'OTROS'];

export default function ProductoForm({ isOpen, onClose, onSave, initial = null, predefinedSector = null }) {
    const [form, setForm] = useState({ ...INITIAL });
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    const generateAIImage = async () => {
        if (!form.nombre) {
            alert("⚠️ Escribí primero el nombre del producto para que la IA sepa qué generar.");
            return;
        }
        
        setGeneratingAI(true);
        try {
            // Usamos Pollinations AI (API gratuita sin key) temporalmente para la demo
            // Si tenés OpenAI podés cambiar este endpoint usando tu process.env.VITE_OPENAI_KEY
            const prompt = `ultra realistic food photography, studio lighting, dark modern background, restaurant menu style, highly detailed: ${form.nombre}`;
            const randomSeed = Math.floor(Math.random() * 100000); // Para forzar nueva imagen
            const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${randomSeed}`;
            
            // Verificamos cargando la imagen
            const img = new Image();
            img.onload = () => {
                setForm(prev => ({ ...prev, img: aiUrl }));
                setGeneratingAI(false);
            };
            img.onerror = () => {
                alert("❌ Error generando la imagen. Reintentá.");
                setGeneratingAI(false);
            };
            img.src = aiUrl;
            
        } catch (error) {
            console.error(error);
            setGeneratingAI(false);
        }
    };

    useEffect(() => {
        if (initial) {
            setForm({ 
                ...INITIAL, ...initial, 
                precio: String(initial.precio || ''),
                stock: String(initial.stock || ''),
                stock_minimo: String(initial.stock_minimo || '') 
            });
        } else {
            setForm({ ...INITIAL, sector: predefinedSector || 'BAR' });
        }
    }, [initial, predefinedSector, isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                ...form,
                precio: Number(form.precio) || 0,
                stock: Number(form.stock) || 0,
                stock_minimo: Number(form.stock_minimo) || 0,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] border border-white/[0.08] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                            {initial ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Gestión de Inventario</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Código</label>
                            <input type="text" value={form.codigo} onChange={e => set('codigo', e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="Ej: BAR-01" required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Sector / Área</label>
                            <select value={form.sector} onChange={e => set('sector', e.target.value)} disabled={!!predefinedSector}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none disabled:opacity-50">
                                {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Nombre del Producto</label>
                        <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="Ej: Hamburguesa Clásica" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Categoría</label>
                            <input type="text" value={form.categoria} onChange={e => set('categoria', e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="Ej: BURGERS" required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Precio de Venta</label>
                            <input type="number" min="0" value={form.precio} onChange={e => set('precio', e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all" placeholder="0.00" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Imagen (URL o Subir desde PC)</label>
                        <div className="flex gap-2 items-center">
                            <input type="url" value={form.img || ''} onChange={e => set('img', e.target.value)} disabled={generatingAI}
                                className="flex-1 bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50" placeholder="https://..." />
                            
                            <button 
                                type="button" 
                                onClick={generateAIImage}
                                disabled={generatingAI || !form.nombre}
                                className="w-[120px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-indigo-500/30 shrink-0 self-stretch disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                            >
                                {generatingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-300" />}
                                <span className="text-[10px] font-black uppercase">Crear IA</span>
                            </button>

                            <label className="w-14 items-stretch bg-slate-800 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:bg-slate-700 transition-colors border border-white/10 shrink-0 self-stretch">
                                <input type="file" accept="image/*" className="hidden" disabled={generatingAI} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => set('img', e.target.result);
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                <span className="text-white text-[9px] font-black uppercase mt-0.5">Subir</span>
                            </label>
                        </div>
                        {form.img && (
                            <div className="mt-2 w-full h-32 rounded-2xl border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center relative group">
                                <img src={form.img} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/10 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
                                        Vista Previa
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 relative border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Stock Actual</label>
                            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} disabled={!!initial}
                                className="w-full bg-transparent border-none p-0 text-xl italic font-black text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 disabled:opacity-50 mt-1" placeholder="0" required />
                            {initial && <p className="text-[8px] uppercase tracking-widest text-emerald-500 mt-1">Usar Control Stock para modificar</p>}
                        </div>
                        <div className="space-y-1.5 relative border border-amber-500/20 bg-amber-500/5 rounded-2xl p-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Stock Mínimo</label>
                            <input type="number" min="0" value={form.stock_minimo} onChange={e => set('stock_minimo', e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-xl italic font-black text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 mt-1" placeholder="0" required />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full py-4 rounded-2xl bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
