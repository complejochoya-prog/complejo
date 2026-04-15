import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Home, Utensils, Bike, Package, Clock, MapPin, ChevronRight, MessageSquare } from 'lucide-react';

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { order } = location.state || {};
    
    // Mock tracking status
    const [status, setStatus] = useState(0); // 0: Recibido, 1: Preparando, 2: En Camino, 3: Entregado

    useEffect(() => {
        if (!order) return;
        
        // Progress status every few seconds for demo
        const timer = setInterval(() => {
            setStatus(prev => (prev < 3 ? prev + 1 : prev));
        }, 8000);
        
        return () => clearInterval(timer);
    }, [order]);

    if (!order) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-700">
                    <Package size={40} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-8">No encontramos el pedido</h2>
                <button 
                    onClick={() => navigate(`/${negocioId}/app/bar`)}
                    className="bg-emerald-500 text-slate-950 px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    Ir al Menú
                </button>
            </div>
        );
    }

    const steps = [
        { label: 'Recibido', icon: Package, time: 'Confirmado por el bar' },
        { label: 'Cocinando', icon: Utensils, time: 'Preparando tu plato' },
        { label: 'En Camino', icon: Bike, time: 'El repartidor está cerca' },
        { label: 'Entregado', icon: CheckCircle2, time: '¡Disfruta tu comida!' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white font-inter pb-20 selection:bg-emerald-500/30">
            {/* Header / Nav */}
            <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tighter italic leading-none">Orden #{Math.floor(Math.random() * 9000) + 1000}</h1>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">Sigue tu pedido en vivo</p>
                    </div>
                </div>
                <button onClick={() => navigate(`/${negocioId}/app`)} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all">
                    <Home size={18} className="text-slate-400" />
                </button>
            </header>

            <main className="px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Live Progress Card */}
                <section className="bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Clock size={120} className="animate-pulse" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-1">
                                    {status < 3 ? 'Llegará pronto' : '¡Pedido Entregado!'}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                    Entrega estimada: 15-20 min
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Modalidad</span>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    {order.type}
                                </span>
                            </div>
                        </div>

                        {/* Animated Stepper */}
                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-white/5" />
                            <div className="absolute left-[18px] top-6 w-[2px] bg-gradient-to-b from-emerald-500 to-emerald-500/0 transition-all duration-1000" style={{ height: `${(status/3)*100}%` }} />

                            {steps.map((step, i) => {
                                const Icon = step.icon;
                                const isActive = i <= status;
                                const isCurrent = i === status;
                                return (
                                    <div key={i} className={`flex items-start gap-5 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
                                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center relative z-10 transition-all duration-500 ${
                                            isCurrent ? 'bg-emerald-500 text-slate-950 scale-125 shadow-xl shadow-emerald-500/40' : (isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-900 text-slate-600')
                                        }`}>
                                            <Icon size={18} strokeWidth={isCurrent ? 3 : 2} className={isCurrent ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h4 className={`text-[12px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                                {step.label}
                                            </h4>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                {step.time}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Info Card */}
                <section className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="p-6 space-y-6">
                        {order.deliveryAddress && (
                            <div className="flex items-start gap-4">
                                <MapPin size={18} className="text-emerald-500 mt-1" />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Dirección de Entrega</h4>
                                    <p className="text-xs font-black uppercase tracking-tight text-white">{order.deliveryAddress}</p>
                                    {order.deliveryNote && <p className="text-[9px] text-slate-400 mt-1 italic opacity-60">"{order.deliveryNote}"</p>}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden">
                                     <img src="https://ui-avatars.com/api/?name=Rider&background=020617&color=10b981&bold=true" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Tu Repartidor</h4>
                                    <p className="text-xs font-black uppercase tracking-tight text-white">Mateo G.</p>
                                </div>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/10 active:scale-90">
                                <MessageSquare size={18} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Summary Mini */}
                <section className="bg-white/5 border border-white/10 rounded-[32px] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Resumen del Pedido</h3>
                        <span className="text-[11px] font-black italic tracking-tighter text-white">${order.total.toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-300">
                                    <span className="text-emerald-500 mr-2">{item.quantity}x</span> {item.nombre}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">${(item.precio * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate(`/${negocioId}/app/bar`)}
                        className="flex-1 bg-white/[0.03] border border-white/5 text-slate-400 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Utensils size={16} />
                        Pedir más
                    </button>
                    <button 
                         onClick={() => navigate(`/${negocioId}/app`)}
                        className="flex-1 bg-white text-slate-950 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 hover:scale-[1.02] transition-all"
                    >
                        <Home size={16} />
                        Inicio
                    </button>
                </div>

            </main>
        </div>
    );
}
