import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Home, Utensils } from 'lucide-react';
import { useCart } from '../hooks/useCart.jsx';

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { order } = location.state || {};
    const { clearCart } = useCart();

    // Solo limpiar el carrito — el pedido ya fue guardado por CartPage + barService
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <button 
                    onClick={() => navigate(`/${negocioId}/app/menu`)}
                    className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center">
            <div className="max-w-md w-full space-y-12">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8 animate-bounce">
                        <CheckCircle2 size={64} />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2 tracking-tight">¡Pedido<br/>Enviado!</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tu orden ya está en proceso en cocina</p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modalidad</span>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                                {order.type || order.tipo}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Resumen</span>
                            {(order.items || []).map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white">{item.cantidad || item.quantity}x</span>
                                            <span className="text-sm font-bold text-slate-300">{item.nombre}</span>
                                        </div>
                                        {item.observaciones && (
                                            <p className="text-[9px] text-slate-500 mt-1 italic">"{item.observaciones}"</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-black text-white">${(item.precio * (item.cantidad || item.quantity)).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Pagado</span>
                            <span className="text-3xl font-black italic tracking-tighter text-white">
                                ${(order.total || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={() => navigate(`/${negocioId}/app`)}
                        className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                    >
                        <Home size={18} />
                        Volver al Inicio
                    </button>
                    
                    <button 
                        onClick={() => navigate(`/${negocioId}/app/menu`)}
                        className="w-full bg-slate-900 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 border border-white/5 active:scale-95 transition-all"
                    >
                        <Utensils size={18} />
                        Pedir algo más
                    </button>
                </div>
            </div>
        </div>
    );
}
