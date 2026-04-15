import React from 'react';
import { Package, User, MapPin, Clock, Phone, ChevronRight, Copy, Navigation, CreditCard, ExternalLink } from 'lucide-react';

export default function OrderCard({ order, primaryAction, primaryLabel, primaryColor, isHistory }) {
    
    const handleCopy = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert("Copiado al portapapeles");
        }
    };

    return (
        <div className={`relative group transition-all duration-300 ${isHistory ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            {/* Glossy Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[32px] pointer-events-none" />
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                {/* Status Indicator */}
                {!isHistory && (
                    <div className="absolute top-0 right-0 p-6">
                         <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                    </div>
                )}

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">#{order.id.toString().slice(-4)}</h3>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 rounded-full text-slate-500">Dlvry_id:ORD-XP</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} className="text-cyan-500" /> Recibido {order.hora}
                        </p>
                    </div>
                    {isHistory && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                                Completado
                            </span>
                            <span className="text-[8px] text-slate-600 font-black uppercase mt-1">Caja: OK</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    {/* Destination Banner */}
                    <div className="bg-black/60 rounded-[28px] p-5 border border-white/5 group-hover:bg-black/80 transition-all">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                <MapPin size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Destino</p>
                                <p className="text-[15px] font-black uppercase tracking-tight text-white leading-tight">
                                    {order.deliveryAddress || order.direccion || order.observaciones || 'No detallada'}
                                </p>
                                {order.deliveryNote && (
                                    <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider mt-2.5 bg-orange-500/10 w-fit px-2 py-0.5 rounded-md">
                                        Nota: {order.deliveryNote}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Cliente</p>
                                    <p className="text-[11px] font-bold text-slate-300 truncate">{order.cliente || 'Anonim.'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Llamar</p>
                                        <p className="text-[11px] font-bold text-slate-300 truncate">{order.telefono || '---'}</p>
                                    </div>
                                </div>
                                {order.telefono && (
                                    <button onClick={() => handleCopy(order.telefono)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-90 shadow-2xl">
                                        <Copy size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {(order.ubicacionLink || order.deliveryAddress) && (
                            <div className="pt-4">
                                <a 
                                    href={order.ubicacionLink || `https://www.google.com/maps/search/${encodeURIComponent(order.deliveryAddress)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 transition-all group/btn shadow-2xl"
                                >
                                    <Navigation size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> 
                                    Navegar a Destino
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Order Details Mini */}
                    <div className="px-2 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-2"><Package size={12} /> Contenido</span>
                            <span>{order.items?.length || order.productos?.length || 0} items</span>
                        </div>
                        <div className="space-y-2">
                            {(order.items || order.productos)?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="text-slate-400 font-bold">
                                        <span className="text-cyan-400 font-black mr-2">{item.quantity}x</span> {item.nombre}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1.5">Monto Final</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                        <CreditCard size={18} />
                                    </div>
                                    <span className="text-2xl font-black italic tracking-tighter text-white">
                                        ${order.total?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            </div>
                            {isHistory && (
                                <div className="text-right">
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Pago</p>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{order.paymentMethod || 'EFECTIVO'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isHistory && primaryAction && (
                    <button 
                        onClick={primaryAction}
                        className={`w-full py-6 rounded-[28px] ${primaryColor} text-slate-950 font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] hover:scale-[1.01] transition-all relative overflow-hidden group/main`}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/main:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-3">
                            {primaryLabel} <ChevronRight size={18} strokeWidth={3} className="group-hover/main:translate-x-1 transition-transform" />
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
