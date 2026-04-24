import React from 'react';
import { X, Image as ImageIcon, Calendar, Clock, DollarSign, ExternalLink } from 'lucide-react';

export default function TransferGallery({ isOpen, onClose, movements }) {
    if (!isOpen) return null;

    const transfers = movements.filter(m => 
        m.metodo_pago === 'transferencia' && 
        (m.receiptImage || m.metadata?.receiptImage)
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
            
            <div className="relative bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                            <ImageIcon className="text-blue-400" size={32} />
                            Galería de Transferencias
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                            {transfers.length} Comprobantes registrados hoy
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all group"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {transfers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
                                <ImageIcon size={40} />
                            </div>
                            <p className="font-black uppercase tracking-widest text-sm">No hay transferencias con comprobante</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {transfers.map((m) => {
                                const imageUrl = m.receiptImage || m.metadata?.receiptImage;
                                return (
                                    <div 
                                        key={m.id} 
                                        className="group bg-slate-950/50 rounded-[32px] border border-white/5 overflow-hidden flex flex-col transition-all hover:border-blue-500/30 hover:-translate-y-1 shadow-xl"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden bg-black">
                                            <img 
                                                src={imageUrl} 
                                                alt={m.descripcion} 
                                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                                            
                                            <a 
                                                href={imageUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="absolute top-4 right-4 p-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black text-white italic leading-tight">
                                                        {m.descripcion || 'Sin descripción'}
                                                    </h3>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-slate-500">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{m.fecha}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-500">
                                                            <Clock size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{m.hora || '00:00'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-emerald-500 flex items-center gap-1">
                                                    <DollarSign size={14} />
                                                    <span className="text-sm font-black tracking-tighter">{m.monto.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    {m.origen || 'Caja'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">
                                                    Transferencia
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                `}} />
            </div>
        </div>
    );
}
