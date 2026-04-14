import React from 'react';
import { AlertTriangle, MessageSquare, CreditCard, Clock } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function SubscriptionExpired() {
    const { config, subscription } = useConfig();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 lg:p-10">
            <div className="max-w-2xl w-full">
                <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 rounded-[48px] p-10 lg:p-16 text-center space-y-8 relative overflow-hidden backdrop-blur-xl">
                    
                    {/* Background Icon */}
                    <AlertTriangle size={300} className="absolute -bottom-20 -right-20 text-red-500/5 rotate-12" />

                    {/* Icon Header */}
                    <div className="relative mx-auto w-24 h-24 rounded-3xl bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/40 animate-pulse">
                        <Clock size={48} className="text-white" />
                    </div>

                    {/* Text content */}
                    <div className="space-y-4 relative">
                        <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                            SUSCRIPCIÓN <span className="text-red-500">VENCIDA</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
                            El acceso a las funciones administrativas de <span className="text-white">{config?.nombre || 'este complejo'}</span> ha sido suspendido.
                        </p>
                    </div>

                    {/* Plan Details */}
                    <div className="grid grid-cols-2 gap-4 relative">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Plan Contratado</p>
                            <p className="text-xl font-black uppercase text-white italic">{subscription?.plan || 'Básico'}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Venció el</p>
                            <p className="text-xl font-black uppercase text-red-400 italic">
                                {subscription?.fecha_vencimiento ? new Date(subscription.fecha_vencimiento).toLocaleDateString() : 'Pendiente'}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 relative">
                        <button 
                            onClick={() => window.location.href = `mailto:soporte@giovannisass.com?subject=Renovación-${config?.negocioId}`}
                            className="flex-1 flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            <MessageSquare size={16} /> Contactar Soporte
                        </button>
                        <button 
                            className="flex-1 flex items-center justify-center gap-3 bg-red-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:scale-105 transition-all shadow-xl shadow-red-600/20"
                        >
                            <CreditCard size={16} /> Pagar Ahora
                        </button>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] relative">
                        Complejo Giovanni Master Platform &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
