import React, { useState } from 'react';
import { PackageOpen, AlertTriangle, ArrowRight, Settings2, Sparkles, Loader2 } from 'lucide-react';

export default function ProductoInventarioCard({ producto, onEdit, onMovement, onGenerateAI }) {
    const [generating, setGenerating] = useState(false);
    
    const handleGenerate = async () => {
        if (!onGenerateAI) return;
        setGenerating(true);
        try {
            await onGenerateAI(producto);
        } finally {
            setGenerating(false);
        }
    };
    const isLowStock = producto.stock <= producto.stock_minimo;
    const isOutOfStock = producto.stock === 0;

    const progress = Math.min(100, Math.max(0, (producto.stock / (producto.stock_minimo * 2 || 10)) * 100));

    return (
        <div className={`group relative bg-slate-900/60 backdrop-blur-sm border rounded-2xl p-4 md:p-5 transition-all duration-300
            ${isOutOfStock ? 'border-rose-500/30 bg-rose-500/[0.02]' 
            : isLowStock ? 'border-amber-500/30 bg-amber-500/[0.02]' 
            : 'border-white/[0.04] hover:border-white/10'}`}
        >
            <div className="flex justify-between items-start mb-3 gap-4">
                {producto.img && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-slate-950">
                        <img src={producto.img} alt={producto.nombre} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-0.5 rounded-lg border border-white/[0.05]">
                            {producto.codigo}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            {producto.categoria}
                        </span>
                        {isLowStock && !isOutOfStock && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                <AlertTriangle size={10} /> Stock Bajo
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                                <AlertTriangle size={10} /> Sin Stock
                            </span>
                        )}
                    </div>
                    <h4 className="text-white font-black italic uppercase tracking-tighter truncate w-full text-sm md:text-base">
                        {producto.nombre}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Precio: ${producto.precio.toLocaleString('es-AR')}
                    </p>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onGenerateAI && (
                        <button onClick={handleGenerate} disabled={generating} title="Generar Imagen IA"
                            className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50">
                            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                    )}
                    <button onClick={() => onMovement(producto)} title="Movimiento de Stock"
                        className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all">
                        <ArrowRight size={14} />
                    </button>
                    <button onClick={() => onEdit(producto)} title="Editar Producto"
                        className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 border border-white/5 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all">
                        <Settings2 size={14} />
                    </button>
                </div>
            </div>

            {/* Stock Progress Context */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Stock Min: {producto.stock_minimo}</span>
                    <span className={`text-base italic tracking-tighter ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {producto.stock} ud.
                    </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.02]">
                    <div 
                        className={`h-full transition-all duration-1000 ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
