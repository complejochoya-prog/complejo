import React, { useState } from 'react';
import { PackageOpen, AlertTriangle, ArrowRight, Settings2, Sparkles, Loader2, Eye, ListPlus, CheckCircle2, Power } from 'lucide-react';

export default function ProductoInventarioCard({ producto, onEdit, onMovement, onGenerateAI, onViewDetail, onToggleDisponible }) {
    const [generating, setGenerating] = useState(false);
    const [toggling, setToggling] = useState(false);
    
    const handleGenerate = async (e) => {
        e.stopPropagation();
        if (!onGenerateAI) return;
        setGenerating(true);
        try {
            await onGenerateAI(producto);
        } finally {
            setGenerating(false);
        }
    };

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (!onToggleDisponible) return;
        setToggling(true);
        try {
            await onToggleDisponible(producto);
        } finally {
            setToggling(false);
        }
    };

    const stock = Number(producto.stock !== undefined ? producto.stock : (producto.stock_actual || 0));
    const stockMin = Number(producto.stock_minimo || 5);
    const isOutOfStock = stock <= 0;
    const isLowStock = !isOutOfStock && stock <= stockMin;
    const isOff = producto.disponible === false;

    const progress = Math.min(100, Math.max(0, (stock / (stockMin * 2 || 10)) * 100));

    return (
        <div 
            onClick={() => onViewDetail && onViewDetail(producto)}
            className={`group relative bg-slate-900/60 backdrop-blur-sm border rounded-[28px] p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between
            ${isOff 
                ? 'border-rose-500/20 bg-slate-950/60 opacity-80 hover:opacity-100 hover:border-rose-500/40' 
                : isOutOfStock 
                    ? 'border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/50' 
                    : isLowStock 
                        ? 'border-amber-500/30 bg-amber-500/[0.03] hover:border-amber-500/50' 
                        : 'border-white/[0.06] hover:border-amber-500/40'}`}
        >
            <div>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-3.5 gap-3.5">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-slate-950 relative shadow-inner">
                        {producto.img ? (
                            <img src={producto.img} alt={producto.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                                <PackageOpen size={24} />
                            </div>
                        )}
                        {isOff && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                <Power size={18} className="text-rose-400 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-white/[0.06]">
                                <span>{producto.codigo || 'S/C'}</span>
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                                <span>{producto.categoria || 'BAR'}</span>
                            </span>
                            
                            {/* Availability status badge */}
                            {isOff ? (
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 flex items-center gap-1">
                                    <Power size={10} /> <span>Apagado (Pausado)</span>
                                </span>
                            ) : isOutOfStock ? (
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 flex items-center gap-1">
                                    <AlertTriangle size={10} /> <span>Sin Stock</span>
                                </span>
                            ) : isLowStock ? (
                                <span className="text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-1">
                                    <AlertTriangle size={10} /> <span>Stock Bajo</span>
                                </span>
                            ) : (
                                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 size={10} /> <span>Disponible</span>
                                </span>
                            )}
                        </div>

                        <h4 className="text-white font-black italic uppercase tracking-tighter truncate w-full text-base group-hover:text-amber-400 transition-colors">
                            <span>{producto.nombre}</span>
                        </h4>

                        <p className="text-sm font-black text-emerald-400 italic tracking-tight mt-0.5">
                            <span>${Number(producto.precio || 0).toLocaleString('es-AR')}</span>
                        </p>
                    </div>
                </div>

                {/* Ingredients preview if available */}
                {producto.ingredientes && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-400 line-clamp-2">
                        <span className="font-bold text-slate-300">Ingredientes: </span>
                        <span>{producto.ingredientes}</span>
                    </div>
                )}
            </div>

            {/* Bottom Actions & Stock bar */}
            <div className="space-y-3 pt-2 border-t border-white/5">
                {/* Stock Progress Context */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500"><span>Mín: {stockMin}</span></span>
                        <span className={`text-sm italic font-black tracking-tight ${isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                            <span>{stock} ud.</span>
                        </span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                        <div 
                            className={`h-full transition-all duration-1000 ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Quick actions row */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onViewDetail && onViewDetail(producto); }}
                        className="flex-1 py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all border border-white/5"
                    >
                        <Eye size={12} />
                        <span>Detalle</span>
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); onMovement && onMovement(producto); }} 
                        title="Ajustar Stock"
                        className="py-2 px-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all border border-indigo-500/20"
                    >
                        <ArrowRight size={12} />
                        <span>Stock</span>
                    </button>

                    {/* Power Toggle Button */}
                    <button 
                        onClick={handleToggle}
                        disabled={toggling}
                        title={isOff ? "Encender Producto (Habilitar)" : "Apagar Producto (Pausar)"}
                        className={`p-2 rounded-xl transition-all border ${
                            isOff 
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/30' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border-emerald-500/30'
                        } disabled:opacity-50`}
                    >
                        {toggling ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(producto); }} 
                        title="Editar Todo"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all border border-white/5"
                    >
                        <Settings2 size={14} />
                    </button>

                    {onGenerateAI && (
                        <button 
                            onClick={handleGenerate} 
                            disabled={generating} 
                            title="Generar Imagen con IA"
                            className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/20 transition-all disabled:opacity-50"
                        >
                            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

