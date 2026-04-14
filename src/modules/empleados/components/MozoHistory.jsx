import React, { useState } from 'react';
import { useConfig } from '../../core/services/ConfigContext';
import { History, Search, Calendar, CreditCard, Banknote, ListChecks, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MozoHistory() {
    const { orders, users } = useConfig();
    const mozos = (users || []).filter(u => u.role === 'mozo');

    const [filterMozo, setFilterMozo] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Only Paid or Entregado (Delivery done) orders from a mozo
    let historyData = (orders || []).filter(o => (o.status === 'paid' || o.status === 'entregado' || o.status === 'done') && (o.source === 'mozo' || o.type === 'Delivery'));

    // Apply Filters
    if (filterMozo) {
        historyData = historyData.filter(o => o.mozoId === filterMozo);
    }
    if (filterMethod) {
        historyData = historyData.filter(o => o.paymentMethod === filterMethod);
    }
    if (filterDate) {
        // filterDate is YYYY-MM-DD
        historyData = historyData.filter(o => {
            if (!o.timestamp) return false;
            const orderDateStr = o.timestamp?.toDate ? o.timestamp.toDate().toISOString().split('T')[0] : new Date(o.timestamp).toISOString().split('T')[0];
            return orderDateStr === filterDate;
        });
    }

    // Sort by most recent paidAt/horaEntregado or timestamp
    historyData.sort((a, b) => {
        const timeA = a.paidAt ? new Date(a.paidAt) : (a.horaEntregado ? new Date(a.horaEntregado) : (a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)));
        const timeB = b.paidAt ? new Date(b.paidAt) : (b.horaEntregado ? new Date(b.horaEntregado) : (b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)));
        return timeB - timeA;
    });

    const totalSales = historyData.reduce((sum, o) => sum + (o.total || 0), 0);

    return (
        <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-white font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                            <History size={24} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Historial <span className="text-purple-400">Pedidos</span></h1>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <ListChecks size={12} className="text-purple-400" />
                        Registro de ventas, entregas y tiempos
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Filtrado</p>
                    <p className="text-2xl font-black italic text-green-400 tracking-tighter">${totalSales.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex-1 min-w-[200px]">
                    <Search size={16} className="text-slate-500" />
                    <select
                        value={filterMozo}
                        onChange={(e) => setFilterMozo(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full"
                    >
                        <option value="">Cualquier Mozo / Delivery</option>
                        {mozos.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex-1 min-w-[200px]">
                    <CreditCard size={16} className="text-slate-500" />
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full"
                    >
                        <option value="">Efectivo / Tarjeta / Transfer</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex-1 min-w-[200px]">
                    <Calendar size={16} className="text-slate-500" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-transparent outline-none text-sm font-bold w-full text-slate-300 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Pedido</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Cliente / Mozo</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Inicio / Fin</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Productos</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Total</th>
                            <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {historyData.map(order => {
                            const dateObj = order.timestamp?.toDate ? order.timestamp.toDate() : (order.timestamp ? new Date(order.timestamp) : new Date());
                            const endObj = order.horaEntregado ? new Date(order.horaEntregado) : (order.paidAt ? new Date(order.paidAt) : null);

                            const dateFormated = format(dateObj, "dd MMM", { locale: es });
                            const startTime = format(dateObj, "HH:mm");
                            const endTime = endObj ? format(endObj, "HH:mm") : '--:--';

                            // Preparation duration
                            let prepTime = '--:--';
                            if (endObj && order.horaInicio) {
                                const startPrep = new Date(order.horaInicio);
                                const diffMs = endObj - startPrep;
                                const diffHrs = Math.floor(diffMs / 3600000);
                                const diffMins = Math.floor((diffMs % 3600000) / 60000);
                                const diffSecs = Math.floor((diffMs % 60000) / 1000);
                                prepTime = diffHrs > 0
                                    ? `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
                                    : `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
                            }

                            return (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {order.type === 'Delivery' ? (
                                                <div className="p-1 px-2 bg-blue-500/20 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest">Delivery</div>
                                            ) : (
                                                <div className="p-1 px-2 bg-gold/20 text-gold rounded-full text-[8px] font-black uppercase tracking-widest">Mesa {order.tableNumber}</div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 tracking-widest font-black mt-1 leading-none">{dateFormated}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-black text-sm italic uppercase">{order.clientName || order.mozoName || 'GUEST'}</div>
                                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
                                            {order.type === 'Delivery' ? 'Delivery Directo' : `Mozo: ${order.mozoName || '-'}`}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-300 tracking-tighter underline decoration-gold/30">{startTime} → {endTime}</span>
                                            <span className="text-[9px] font-black uppercase text-green-400/70 tracking-widest mt-1">Duración: {prepTime}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="max-w-[180px] text-[10px] font-medium text-slate-400 leading-tight">
                                            {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-black text-green-400 text-sm italic tracking-tighter mb-1">
                                            ${(order.total || 0).toLocaleString()}
                                        </div>
                                        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-slate-300">
                                            {order.paymentMethod === 'Efectivo' && <Banknote size={10} />}
                                            {order.paymentMethod === 'Tarjeta' && <CreditCard size={10} />}
                                            {order.paymentMethod === 'Transferencia' && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.5 5.5H2.5C1.67 5.5 1 6.17 1 7v10c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5V7c0-.83-.67-1.5-1.5-1.5zm-5.07 10.59l-3.54-3.54c-.19-.19-.51-.19-.71 0l-1.77 1.77-4.24-4.24c-.2-.2-.2-.51 0-.71l3.54-3.54c.2-.2.51-.2.71 0l1.77 1.77 4.24 4.24c.19.19.19.51 0 .71z"></path></svg>}
                                            {order.paymentMethod || 'Pagar'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {order.receiptImage && (
                                            <button
                                                onClick={() => setSelectedReceipt(order.receiptImage)}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                <ImageIcon size={14} /> Foto
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {historyData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                    No se encontraron ventas para estos filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-2 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-4 border-b border-white/5 mb-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                <ImageIcon size={16} /> Comprobante de Transferencia
                            </h3>
                            <button onClick={() => setSelectedReceipt(null)} className="text-slate-500 hover:text-white bg-white/5 p-2 rounded-xl transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex justify-center bg-slate-950 rounded-2xl overflow-hidden p-2">
                            <img src={selectedReceipt} alt="Comprobante" className="max-h-[70vh] object-contain rounded-xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
