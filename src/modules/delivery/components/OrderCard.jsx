import React from 'react';
import { Package, User, MapPin, Clock, Phone, ChevronRight, Copy } from 'lucide-react';

export default function OrderCard({ order, primaryAction, primaryLabel, primaryColor, isHistory }) {
    
    const handleCopy = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert("Copiado al portapapeles");
        }
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            {/* Design detail */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${isHistory ? 'bg-slate-500/10' : 'bg-cyan-500/10'} rounded-full blur-3xl -mr-12 -mt-12`}></div>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">#{order.id.toString().slice(-4)}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Clock size={12} /> {order.hora}
                    </p>
                </div>
                {isHistory && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                        Completado
                    </span>
                )}
            </div>

            <div className="space-y-4 mb-6">
                <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Cliente</p>
                            <p className="text-sm font-bold text-white leading-tight">{order.cliente || 'Desconocido'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                            <Phone size={14} />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Teléfono</p>
                                <p className="text-sm font-bold text-white leading-tight">{order.telefono || 'Sin especificar'}</p>
                            </div>
                            {order.telefono && (
                                <button onClick={() => handleCopy(order.telefono)} className="text-slate-500 hover:text-white transition-colors active:scale-90">
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                            <MapPin size={14} />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Dirección de Entrega</p>
                                <p className="text-sm font-bold text-white leading-tight">{order.direccion || order.observaciones || 'No detallada'}</p>
                            </div>
                        </div>
                    </div>

                    {order.ubicacionLink && (
                        <div className="pt-2">
                            <a 
                                href={order.ubicacionLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 transition-all"
                            >
                                <MapPin size={12} /> Abrir Ubicación Real
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Resumen pedido</p>
                    {order.productos?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-bold"><span className="text-cyan-400 font-black">{item.quantity}x</span> {item.nombre}</span>
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-white/5 flex justify-between font-black text-sm text-white">
                        <span className="uppercase tracking-widest">Total a cobrar:</span>
                        <span className="italic text-emerald-400">${order.total?.toLocaleString() || '0'}</span>
                    </div>
                </div>
            </div>

            {!isHistory && primaryAction && (
                <button 
                    onClick={primaryAction}
                    className={`w-full py-4 rounded-2xl ${primaryColor} text-slate-950 font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/10 active:scale-95 transition-all`}
                >
                    {primaryLabel} <ChevronRight size={16} className="mb-0.5" />
                </button>
            )}
        </div>
    );
}
