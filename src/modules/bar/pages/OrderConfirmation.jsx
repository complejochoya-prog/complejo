import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Home, Utensils, CalendarCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart.jsx';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../services/PedidosContext';

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { negocioId: configNegocioId } = useConfig();
    const { negocioId: paramsNegocioId } = useParams();
    const negocioId = paramsNegocioId || configNegocioId || 'giovanni';

    const rawOrder = location.state?.order;
    const reserva = location.state?.reserva;

    // Handle order or reserva payload
    const order = React.useMemo(() => {
        return rawOrder || (reserva ? {
            id: reserva.id || `RES-${Date.now().toString().slice(-4)}`,
            cliente: `${reserva.firstName || ''} ${reserva.lastName || ''}`.trim() || 'Cliente',
            items: [{
                nombre: `Reserva: ${reserva.fieldName || 'Espacio'} (${reserva.date || ''} ${reserva.time || ''})`,
                cantidad: 1,
                precio: reserva.price || reserva.precio || 0
            }],
            total: reserva.price || reserva.precio || 0,
            hora: reserva.time || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            status: 'Confirmado',
            isReserva: true
        } : null);
    }, [rawOrder, reserva]);

    const { clearCart } = useCart();
    const { orders } = usePedidos();
    // Clear cart on load
    useEffect(() => {
        if (typeof clearCart === 'function') {
            clearCart();
        }
    }, []);

    // Automatic redirect to home if no order/reserva
    useEffect(() => {
        if (!order) {
            navigate(`/${negocioId}`, { replace: true });
        }
    }, [order, negocioId, navigate]);

    // Filter active table orders if applicable
    const tableOrders = (orders || []).filter(o => 
        (o.mesa === order?.mesa && order?.mesa) || 
        (o.cliente === order?.cliente && order?.cliente)
    ).filter(o => o.status !== 'paid' && o.estado !== 'paid');

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Pedido Procesado</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Tu orden ha sido registrada en el sistema</p>
                <button
                    onClick={() => navigate(`/${negocioId}/menu`)}
                    className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center pb-32">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-bounce border border-emerald-500/30">
                        {order.isReserva ? <CalendarCheck size={56} /> : <CheckCircle2 size={56} />}
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic mb-2">
                        {order.isReserva ? '¡Reserva Confirmada!' : '¡Pedido Confirmado!'}
                    </h1>
                    <p className="text-emerald-400 font-black uppercase tracking-widest text-[11px]">
                        {order.isReserva ? 'Tu lugar ha sido reservado con éxito' : 'Tu orden ya está siendo procesada'}
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden space-y-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {order.isReserva ? 'Detalle Reserva' : 'Estado de Orden'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            CONFIRMADO
                        </span>
                    </div>

                    {order.isReserva ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold uppercase">Cliente</span>
                                <span className="text-white font-black">{order.cliente}</span>
                            </div>
                            {order.items && order.items[0] && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase">Espacio / Turno</span>
                                    <span className="text-amber-400 font-black">{order.items[0].nombre}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        tableOrders.length > 0 ? (
                            tableOrders.map((orderGroup) => (
                                <div key={orderGroup.id} className="space-y-3 border-b border-white/5 pb-4 last:border-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pedido #{String(orderGroup.id).slice(-4)}</span>
                                        <span className="text-[9px] font-black text-amber-500 uppercase px-2 py-0.5 bg-amber-500/10 rounded">{orderGroup.status}</span>
                                    </div>
                                    {(orderGroup.items || []).map((item, i) => (
                                        <div key={i} className="flex justify-between items-start text-xs">
                                            <span className="text-slate-300 font-bold">{item.cantidad || item.quantity}x {item.nombre}</span>
                                            <span className="text-white font-black">${(Number(item.precio || 0) * Number(item.cantidad || item.quantity || 1)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="space-y-3">
                                {(order.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between items-start text-xs">
                                        <span className="text-slate-300 font-bold">{item.cantidad || item.quantity || 1}x {item.nombre}</span>
                                        <span className="text-white font-black">${(Number(item.precio || 0) * Number(item.cantidad || item.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                        <span className="text-3xl font-black italic tracking-tighter text-white">
                            ${Number(order.total || 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => navigate(`/${negocioId}`)}
                        className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-xl active:scale-95 hover:bg-slate-200 transition-all"
                    >
                        <Home size={18} />
                        Volver al Inicio Ahora
                    </button>
                    
                    {!order.isReserva && (
                        <button 
                            onClick={() => navigate(`/${negocioId}/menu`)}
                            className="w-full bg-slate-900 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 border border-white/5 active:scale-95 transition-all"
                        >
                            <Utensils size={18} />
                            Pedir algo más
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
