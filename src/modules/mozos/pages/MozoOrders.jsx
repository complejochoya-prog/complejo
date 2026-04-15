import React, { useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { getMozoSession } from '../services/mozoService';
import OrderCard from '../components/OrderCard';
import { ClipboardList, ShoppingBag, Clock } from 'lucide-react';

export default function MozoOrders() {
    const { orders } = useConfig();
    const { updateOrderStatus } = usePedidos();
    const mozo = getMozoSession();

    const myOrders = useMemo(() => {
        return orders.filter(o => o.mozoId === mozo.id && o.status !== 'paid')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders, mozo.id]);

    const stats = useMemo(() => {
        return {
            ready: myOrders.filter(o => o.estado === 'listo' || o.estado === 'listo_para_salir').length,
            preparing: myOrders.filter(o => o.estado === 'preparando').length,
            new: myOrders.filter(o => o.estado === 'nuevo' || o.estado === 'pendiente').length
        };
    }, [myOrders]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            <header className="flex items-center justify-between bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-slate-950">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">Mis Pedidos</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoreo en tiempo real</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {stats.ready > 0 && (
                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase animate-pulse">
                            ¡{stats.ready} Listos!
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {myOrders.length > 0 ? (
                    myOrders.map(order => (
                        <div key={order.id} className="relative group">
                            <OrderCard 
                                order={order} 
                                showHeader={true}
                                isMozoMode={true}
                                onStatusChange={(o, s) => {
                                    if ('vibrate' in navigator) navigator.vibrate([30, 20, 50]);
                                    if (updateOrderStatus) updateOrderStatus(String(o.id), s);
                                }}
                            />
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                    order.estado === 'listo' || order.estado === 'listo_para_salir' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                    order.estado === 'preparando' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                    'bg-slate-800 border-white/5 text-slate-500'
                                }`}>
                                    {order.estado || 'pendiente'}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 text-center space-y-4 opacity-30">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest">No hay pedidos activos</p>
                            <p className="text-[10px] font-bold text-slate-500">Todo está al día en la cocina</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
