import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Check, Save, Sparkles, Loader2, ListPlus, FileText, 
    Package, DollarSign, Tag, Layers, Plus, ChevronDown, CheckCircle2, Power 
} from 'lucide-react';
import { buildProductAIImageUrl, preloadAIImage } from '../utils/iaPromptHelper';

const INITIAL = {
    codigo: '', 
    nombre: '', 
    categoria: '', 
    precio: '',
    descripcion: '',
    ingredientes: '',
    stock: '', 
    stock_minimo: '', 
    sector: 'BAR', 
    img: '',
    disponible: true
};

const SECTORES = ['BAR', 'COCINA', 'ALMACEN', 'LIMPIEZA', 'OTROS'];

const DEFAULT_CATEGORIES = [
    'Carnes', 'Parrilla', 'Burgers', 'Pizzas', 'Lomos', 
    'Pastas', 'Ensaladas', 'Papas', 'Tacos', 'Bebidas', 
    'Cervezas', 'Tragos', 'Cafeteria', 'Licuados', 'Tortas', 
    'Combos', 'Promos', 'Snacks', 'Postres', 'Guarniciones'
];

export default function ProductoForm({ 
    isOpen, 
    onClose, 
    onSave, 
    initial = null, 
    predefinedSector = null,
    existingCategories = []
}) {
    const [form, setForm] = useState({ ...INITIAL });
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // State for creating new custom category
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Merge and deduplicate categories
    const allCategories = useMemo(() => {
        const set = new Set();
        DEFAULT_CATEGORIES.forEach(c => set.add(c.toUpperCase()));
        existingCategories.forEach(c => { if (c) set.add(String(c).toUpperCase()); });
        if (form.categoria) set.add(String(form.categoria).toUpperCase());
        return Array.from(set).sort();
    }, [existingCategories, form.categoria]);

    const generateAIImage = async () => {
        if (!form.nombre || !form.nombre.trim()) {
            alert("⚠️ Escribí primero el nombre del producto para que la IA sepa qué generar.");
            return;
        }
        
        setGeneratingAI(true);
        try {
            const aiUrl = buildProductAIImageUrl(form.nombre, form.categoria);
            await preloadAIImage(aiUrl);
            setForm(prev => ({ ...prev, img: aiUrl }));
        } catch (error) {
            console.error(error);
            alert("❌ Error generando la imagen. Reintentá.");
        } finally {
            setGeneratingAI(false);
        }
    };

    useEffect(() => {
        setIsCreatingCategory(false);
        setNewCategoryName('');

        if (initial) {
            setForm({ 
                ...INITIAL, 
                ...initial, 
                categoria: initial.categoria ? initial.categoria.toUpperCase() : 'CARNES',
                precio: String(initial.precio !== undefined ? initial.precio : ''),
                stock: String(initial.stock !== undefined ? initial.stock : ''),
                stock_minimo: String(initial.stock_minimo !== undefined ? initial.stock_minimo : ''),
                descripcion: initial.descripcion || initial.desc || '',
                ingredientes: initial.ingredientes || initial.ingredients || '',
                disponible: initial.disponible !== false
            });
        } else {
            setForm({ 
                ...INITIAL, 
                sector: predefinedSector || 'BAR',
                categoria: 'CARNES',
                codigo: `BAR-${Math.floor(100 + Math.random() * 900)}`,
                disponible: true
            });
        }
    }, [initial, predefinedSector, isOpen]);

    if (!isOpen) return null;

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleAddNewCategory = (e) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim().toUpperCase();
        if (!trimmed) {
            alert("Por favor escribí el nombre de la nueva categoría.");
            return;
        }
        set('categoria', trimmed);
        setIsCreatingCategory(false);
        setNewCategoryName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const stockNum = Number(form.stock) || 0;
            const catFormatted = (form.categoria || 'GENERAL').trim().toUpperCase();
            await onSave({
                ...form,
                categoria: catFormatted,
                precio: Number(form.precio) || 0,
                stock: stockNum,
                stock_actual: stockNum,
                stock_minimo: Number(form.stock_minimo) || 0,
                disponible: form.disponible !== false,
                descripcion: form.descripcion || '',
                ingredientes: form.ingredientes || ''
            });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-slate-900 w-full sm:max-w-xl sm:rounded-[32px] rounded-t-[32px] border border-white/[0.08] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                            <span>{initial ? 'Editar Producto Completo' : 'Crear Nuevo Producto'}</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                            <span>Gestión de Inventario, Categorías e Ingredientes</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    
                    {/* Código y Sector */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                                <Tag size={12} className="text-amber-500" />
                                <span>Código</span>
                            </label>
                            <input 
                                type="text" 
                                value={form.codigo} 
                                onChange={e => set('codigo', e.target.value)}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all" 
                                placeholder="Ej: BAR-01" 
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                                <Layers size={12} className="text-sky-400" />
                                <span>Sector / Área</span>
                            </label>
                            <select 
                                value={form.sector} 
                                onChange={e => set('sector', e.target.value)} 
                                disabled={!!predefinedSector}
                                className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none disabled:opacity-50"
                            >
                                {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Nombre del producto */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                            <FileText size={12} className="text-emerald-400" />
                            <span>Nombre del Producto</span>
                        </label>
                        <input 
                            type="text" 
                            value={form.nombre} 
                            onChange={e => set('nombre', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all" 
                            placeholder="Ej: Parrillada Completa, Hamburguesa Clásica..." 
                            required 
                        />
                    </div>

                    {/* ── SELECCIÓN Y CREACIÓN DE CATEGORÍAS ─────────────────── */}
                    <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                                <Layers size={12} />
                                <span>Categoría del Producto</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                className="text-[9px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all flex items-center gap-1"
                            >
                                <Plus size={11} />
                                <span>{isCreatingCategory ? 'Elegir de la lista' : '+ Nueva Categoría'}</span>
                            </button>
                        </div>

                        {isCreatingCategory ? (
                            /* Nueva categoría input */
                            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Nombre de la nueva categoría (ej: PARRILLADA)..."
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white uppercase focus:outline-none focus:border-indigo-400"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNewCategory}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20"
                                    >
                                        <span>Asignar</span>
                                    </button>
                                </div>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                    <span>Se creará e integrará automáticamente al menú y al inventario.</span>
                                </p>
                            </div>
                        ) : (
                            /* Dropdown selector de categorías existentes */
                            <div className="space-y-2.5">
                                <div className="relative">
                                    <select 
                                        value={form.categoria} 
                                        onChange={e => set('categoria', e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-amber-400 uppercase tracking-wider focus:outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {allCategories.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-900 text-white">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>

                                {/* Quick Pills for popular categories */}
                                <div className="flex gap-1.5 flex-wrap">
                                    {['CARNES', 'PARRILLA', 'BURGERS', 'PIZZAS', 'LOMOS', 'BEBIDAS', 'TRAGOS', 'CAFETERIA', 'POSTRES'].map(quickCat => (
                                        <button
                                            key={quickCat}
                                            type="button"
                                            onClick={() => set('categoria', quickCat)}
                                            className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                                                form.categoria === quickCat
                                                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                                                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <span>{quickCat}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Precio de Venta */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                            <DollarSign size={12} className="text-emerald-400" />
                            <span>Precio de Venta ($)</span>
                        </label>
                        <input 
                            type="number" 
                            min="0" 
                            step="1" 
                            value={form.precio} 
                            onChange={e => set('precio', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all" 
                            placeholder="0.00" 
                            required 
                        />
                    </div>

                    {/* Ingredientes / Receta */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                            <ListPlus size={12} className="text-amber-400" />
                            <span>Ingredientes / Receta / Composición</span>
                        </label>
                        <textarea 
                            rows={2} 
                            value={form.ingredientes} 
                            onChange={e => set('ingredientes', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500/50 transition-all" 
                            placeholder="Ej: Tira de asado, vacío, chorizo, morcilla, chinchulines, papas fritas y ensalada mixta..."
                        />
                    </div>

                    {/* Descripción Comercial */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-1.5">
                            <FileText size={12} className="text-purple-400" />
                            <span>Descripción Comercial / Detalle</span>
                        </label>
                        <textarea 
                            rows={2} 
                            value={form.descripcion} 
                            onChange={e => set('descripcion', e.target.value)}
                            className="w-full bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500/50 transition-all" 
                            placeholder="Ej: Parrillada completa para 2 personas con cortes seleccionados de primera calidad."
                        />
                    </div>

                    {/* Imagen con Generación IA o Carga Local */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                            <span>Imagen (URL o Subir foto)</span>
                        </label>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="url" 
                                value={form.img || ''} 
                                onChange={e => set('img', e.target.value)} 
                                disabled={generatingAI}
                                className="flex-1 bg-slate-950 border border-white/[0.06] rounded-2xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all disabled:opacity-50" 
                                placeholder="https://..." 
                            />
                            
                            <button 
                                type="button" 
                                onClick={generateAIImage}
                                disabled={generatingAI || !form.nombre}
                                className="w-[120px] bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-amber-500/30 shrink-0 self-stretch disabled:opacity-50 shadow-lg shadow-amber-500/20 font-black"
                            >
                                {generatingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                <span className="text-[10px] font-black uppercase">Foto IA</span>
                            </button>

                            <label className="w-14 items-stretch bg-slate-800 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:bg-slate-700 transition-colors border border-white/10 shrink-0 self-stretch">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    disabled={generatingAI} 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => set('img', ev.target.result);
                                            reader.readAsDataURL(file);
                                        }
                                    }} 
                                />
                                <span className="text-white text-[9px] font-black uppercase mt-0.5">Subir</span>
                            </label>
                        </div>
                        {form.img && (
                            <div className="mt-2 w-full h-32 rounded-2xl border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center relative group">
                                <img src={form.img} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
                                        <span>Vista Previa Foto</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stock Actual y Stock Mínimo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 relative border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1.5">
                                <Package size={12} />
                                <span>Stock Actual (ud)</span>
                            </label>
                            <input 
                                type="number" 
                                min="0" 
                                value={form.stock} 
                                onChange={e => set('stock', e.target.value)} 
                                className="w-full bg-transparent border-none p-0 text-2xl italic font-black text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 mt-1" 
                                placeholder="0" 
                                required 
                            />
                            <p className="text-[8px] uppercase tracking-widest text-emerald-400/70 mt-1">
                                <span>{Number(form.stock) > 0 ? '🟢 En Stock para Venta' : '🔴 Sin Stock (Agotado)'}</span>
                            </p>
                        </div>

                        <div className="space-y-1.5 relative border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                <span>Stock Mínimo (Alerta)</span>
                            </label>
                            <input 
                                type="number" 
                                min="0" 
                                value={form.stock_minimo} 
                                onChange={e => set('stock_minimo', e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-2xl italic font-black text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 mt-1" 
                                placeholder="0" 
                                required 
                            />
                            <p className="text-[8px] uppercase tracking-widest text-slate-500 mt-1">
                                <span>Alerta automática</span>
                            </p>
                        </div>
                    </div>

                    {/* Estado del Producto (Encendido / Apagado) */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Power size={15} className={form.disponible ? "text-emerald-400" : "text-rose-400"} />
                                <span className="text-xs font-black uppercase tracking-wider text-white">
                                    <span>Estado: {form.disponible ? 'Encendido (Habilitado)' : 'Apagado (Pausado)'}</span>
                                </span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                                <span>{form.disponible ? 'El producto está activo y disponible para ordenar.' : 'El producto está apagado/pausado y no se podrá ordenar en bar, mozos ni menú.'}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set('disponible', !form.disponible)}
                            className={`shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border shadow-lg ${
                                form.disponible 
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                            }`}
                        >
                            <Power size={12} />
                            <span>{form.disponible ? 'ENCENDIDO' : 'APAGADO'}</span>
                        </button>
                    </div>

                    {/* Submit button */}
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[12px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{saving ? 'Guardando...' : (initial ? 'Guardar Cambios' : 'Crear Producto')}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
