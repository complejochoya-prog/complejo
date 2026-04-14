import React, { useState, useEffect } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Hash,
    MessageSquare,
    UtensilsCrossed,
    Truck,
    RotateCcw,
    Trash2,
    Printer,
    Check,
    Timer
} from 'lucide-react';

// ── Delay Timer Component ──
function DelayTimer({ startTime, stopped }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (stopped) return;

        const calculate = () => {
            const startStr = startTime?.toDate ? startTime.toDate() : (startTime instanceof Date ? startTime : new Date(startTime));
            const start = new Date(startStr);
            const diff = Math.floor((Date.now() - start.getTime()) / 1000);
            setElapsed(diff > 0 ? diff : 0);
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [startTime, stopped]);

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    // Color logic based on delay
    let colorClass = 'text-green-400';
    if (minutes >= 10 && minutes < 20) colorClass = 'text-yellow-400';
    if (minutes >= 20) colorClass = 'text-red-500 animate-pulse';

    const timeStr = hours > 0
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className={`flex items-center gap-2 ${colorClass}`}>
            <Timer size={16} className="shrink-0" />
            <span className="text-2xl font-black italic tracking-tighter tabular-nums">{timeStr}</span>
        </div>
    );
}

export default function Kitchen() {
    const { orders, updateOrder, removeOrder } = usePedidos();
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'done'

    // Helper to check if an order has items for the kitchen
    const hasKitchenItems = (order) => {
        const products = order?.productos || order?.items || [];
        return products.some(item => item?.sector === 'cocina');
    };

    const kitchenOrders = (orders || []).filter(o => hasKitchenItems(o));

    const activeOrders = kitchenOrders.filter(o => o.status === 'active' || o.status === 'confirmado' || o.status === 'preparando');
    const listoOrders = kitchenOrders.filter(o => o.status === 'listo' || o.status === 'listo_para_salir');
    const doneOrders = kitchenOrders.filter(o => o.status === 'done' || o.status === 'paid' || o.status === 'entregado' || o.status === 'en_camino');

    const handleStartPrep = async (id) => {
        await updateOrder(id, { status: 'preparando', horaInicio: new Date() });
    };

    const handleMarkListo = async (order) => {
        const updates = {
            status: order.type === 'Delivery' ? 'listo_para_salir' : 'listo',
            horaListo: new Date(),
            cronometroActivo: false
        };
        await updateOrder(order.id, updates);
    };

    const handleMarkConfirmado = async (id) => {
        await updateOrder(id, { status: 'confirmado' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar definitivamente este pedido?')) {
            await removeOrder(id);
        }
    };

    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank');
        const orderDate = order.timestamp?.toDate ? order.timestamp.toDate() : order.timestamp;
        const startTimeStr = orderDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--';
        const dateStr = orderDate?.toLocaleDateString() || '';

        const html = `
            <html>
                <head>
                    <title>Imprimir Comanda #${order.id.split('-')[1]}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10mm; }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .title { font-size: 20px; font-weight: bold; margin: 5px 0; }
                        .info { font-size: 14px; margin: 5px 0; }
                        .type { font-size: 18px; font-weight: bold; padding: 5px; border: 1px solid #000; display: inline-block; margin: 10px 0; }
                        .items { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        .items th { border-bottom: 1px solid #000; text-align: left; padding: 5px; }
                        .items td { padding: 5px; vertical-align: top; }
                        .notes { font-style: italic; border: 1px solid #000; padding: 10px; margin-top: 10px; font-size: 12px; }
                        .footer { margin-top: 20px; text-align: center; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">COMPLEJO GIOVANNI</div>
                        <div class="info">${dateStr} - ${startTimeStr}</div>
                        <div class="title underline">COMANDA #${order.id.split('-')[1]}</div>
                    </div>

                    <div style="text-align: center;">
                        <div class="type">${order.type === 'Local' ? 'MESA ' + order.tableNumber : '🚚 DELIVERY'}</div>
                        ${order.orderType === 'adicional' ? '<div style="font-size: 16px; font-weight: bold; color: red;">*** ADICIONAL ***</div>' : ''}
                    </div>

                    <table class="items">
                        <thead>
                            <tr>
                                <th>CANT</th>
                                <th>PRODUCTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.productos || order.items || []).filter(i => i.sector === 'cocina').map(item => `
                                <tr>
                                    <td style="font-weight:bold; font-size:18px;">${item.cantidad || item.quantity}</td>
                                    <td style="font-size:16px;">${(item.nombre || item.name).toUpperCase()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    ${order.notes ? `
                        <div class="info" style="font-weight:bold; margin-top:10px;">OBSERVACIONES:</div>
                        <div class="notes">${order.notes}</div>
                    ` : ''}

                    <div class="footer">
                        GIOVANNI SPORTS & BAR<br>
                        ¡Buen provecho!
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Get status label and color
    const getStatusInfo = (status) => {
        switch (status) {
            case 'confirmado': return { label: 'NUEVO', color: 'bg-gold text-slate-950', barColor: 'bg-gold animate-pulse' };
            case 'preparando': return { label: 'EN PREPARACIÓN', color: 'bg-yellow-500 text-slate-950', barColor: 'bg-yellow-500' };
            case 'listo': return { label: 'LISTO', color: 'bg-green-500 text-slate-950', barColor: 'bg-green-500' };
            case 'listo_para_salir': return { label: 'LISTO PARA SALIR', color: 'bg-blue-500 text-white', barColor: 'bg-blue-500' };
            case 'en_camino': return { label: 'EN CAMINO', color: 'bg-purple-500 text-white', barColor: 'bg-purple-500' };
            case 'entregado': return { label: 'ENTREGADO', color: 'bg-slate-500 text-white', barColor: 'bg-slate-500' };
            default: return { label: 'NUEVO', color: 'bg-gold text-slate-950', barColor: 'bg-gold animate-pulse' };
        }
    };

    // Render an order card
    const renderOrderCard = (order) => {
        const statusInfo = getStatusInfo(order.status);
        const orderDate = order.timestamp?.toDate ? order.timestamp.toDate() : order.timestamp;
        const timerStart = order.horaInicio || order.timestamp;

        return (
            <div
                key={order.id}
                className={`relative group bg-white/[0.03] border rounded-[32px] overflow-hidden transition-all duration-500 ${order.status === 'listo' ? 'border-green-500 shadow-lg shadow-green-500/10' : order.status === 'preparando' ? 'border-yellow-500/50' : 'border-white/10 hover:border-gold/30'}`}
            >
                {/* Status Bar */}
                <div className={`h-2 w-full ${statusInfo.barColor}`} />

                <div className="p-6 space-y-5">
                    {/* Header: Mesa + Status + Actions */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {order.type === 'Local' ? (
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gold text-slate-950 rounded-full shadow-lg shadow-gold/20">
                                        <UtensilsCrossed size={14} />
                                        <span className="text-xs font-black uppercase italic">Mesa {order.tableNumber}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                                        <Truck size={14} />
                                        <span className="text-xs font-black uppercase italic">Delivery</span>
                                    </div>
                                )}
                                {order.orderType === 'adicional' && (
                                    <div className="flex items-center justify-center px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase animate-pulse ring-2 ring-red-500/50">
                                        ⚠️ ADICIONAL
                                    </div>
                                )}
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">
                                Recibido: {orderDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => handlePrint(order)}
                                className="p-2.5 bg-white/5 text-slate-400 hover:text-gold hover:bg-gold/10 rounded-xl transition-all border border-white/5 hover:border-gold/30"
                                title="Imprimir Comanda"
                            >
                                <Printer size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(order.id)}
                                className="p-2.5 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Delay Timer */}
                    <div className="flex items-center justify-between bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {order.status === 'entregado' || order.status === 'paid' || order.status === 'done' ? 'Tiempo Final' : 'Tiempo de demora'}
                        </span>
                        <DelayTimer startTime={timerStart} stopped={order.status === 'listo' || order.status === 'entregado' || order.status === 'paid' || order.status === 'done'} />
                    </div>

                    {/* Items List - NO PRICES */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            Detalle del Pedido
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </p>
                        <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 space-y-3 shadow-inner">
                            {(order.productos || order.items || []).filter(i => i.sector === 'cocina').map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="size-10 bg-gold text-slate-950 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-gold/10">
                                        {item.cantidad || item.quantity}
                                    </div>
                                    <span className="font-black uppercase tracking-tight text-white text-xl leading-tight">
                                        {item.nombre || item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">Observaciones</p>
                            <div className="flex gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl shadow-xl shadow-orange-500/5">
                                <MessageSquare size={18} className="text-orange-500 shrink-0" />
                                <p className="text-sm text-orange-200 font-bold italic leading-relaxed">"{order.notes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2">
                        {(order.status === 'confirmado' || order.status === 'active') && (
                            <button
                                onClick={() => handleStartPrep(order.id)}
                                className="w-full py-4 bg-gold/10 border-2 border-gold/30 text-gold hover:bg-gold hover:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold/5"
                            >
                                <UtensilsCrossed size={18} /> Empezar a Preparar
                            </button>
                        )}
                        {order.status === 'preparando' && (
                            <button
                                onClick={() => handleMarkListo(order)}
                                className="w-full py-4 bg-green-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95"
                            >
                                <Check size={18} /> 🟢 Pedido Listo
                            </button>
                        )}
                        {order.status === 'listo' && (
                            <div className="w-full py-4 bg-green-500/10 border-2 border-green-500/30 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 text-green-400">
                                <CheckCircle2 size={18} /> Listo — Esperando Mozo
                            </div>
                        )}
                    </div>

                    {/* Footer: Order ID only */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Hash size={10} className="text-slate-600" />
                            <span className="text-[10px] font-black text-slate-600 italic tracking-tighter">{order.id.split('-')[1]}</span>
                        </div>
                        {order.mozoName && (
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Mozo: {order.mozoName}</span>
                        )}
                        {order.clientName && (
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Cliente: {order.clientName}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gold rounded-2xl text-slate-950 shadow-lg shadow-gold/20">
                            <ChefHat size={24} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">COMANDAS <span className="text-gold">COCINA</span></h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <Clock size={12} className="text-gold" />
                        Gestión de pedidos en tiempo real
                    </p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        En Cocina ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('listo')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'listo' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Listos ({listoOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('done')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'done' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Historial ({doneOrders.length})
                    </button>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'active' ? activeOrders : activeTab === 'listo' ? listoOrders : doneOrders).map(order => renderOrderCard(order))}

                {(activeTab === 'active' ? activeOrders : activeTab === 'listo' ? listoOrders : doneOrders).length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[48px]">
                        <div className="p-6 bg-white/5 rounded-full text-slate-700">
                            <UtensilsCrossed size={64} strokeWidth={1} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black italic uppercase tracking-tighter text-slate-400">
                                {activeTab === 'active' ? 'Sin pedidos en cocina' : activeTab === 'listo' ? 'Sin pedidos listos' : 'Sin historial'}
                            </p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Todo está bajo control en la cocina</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
