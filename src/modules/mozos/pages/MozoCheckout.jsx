import React, { useState, useMemo } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { Wallet, ChevronRight, Receipt, CreditCard, Banknote, Landmark } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { getMozoSession } from '../services/mozoService';

export default function MozoCheckout() {
    const { negocioId } = useConfig();
    const { orders, updateOrderStatus } = usePedidos();
    const mozo = getMozoSession();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const pendingBills = useMemo(() => {
        // Group pending orders by table
        const pending = orders.filter(o => o.status !== 'paid');
        const grouped = {};
        
        pending.forEach(o => {
            if (!grouped[o.table]) {
                grouped[o.table] = {
                    table: o.table,
                    total: 0,
                    orders: [],
                    mozoName: o.mozoName || 'Sistema',
                    lastActivity: o.createdAt
                };
            }
            grouped[o.table].total += (o.total || 0);
            grouped[o.table].orders.push(o);
        });

        return Object.values(grouped).sort((a, b) => a.table - b.table);
    }, [orders]);

    const handleConfirmPayment = async (details) => {
        try {
            const { registerExternalMovement } = await import('../../caja/services/cajaService');
            
            // For each order in the table (if we pay by table) or single order
            const targetOrders = selectedOrder.orders || [selectedOrder];
            const totalToPay = selectedOrder.total || selectedOrder.monto;

            await registerExternalMovement(negocioId, {
                tipo: 'entrada',
                categoria: 'Venta mozo',
                monto: totalToPay,
                descripcion: `Mesa ${selectedOrder.table} - Cobro realizado por ${mozo.name}`,
                metodo_pago: (details.method || 'efectivo').toLowerCase(),
                origen: 'bar',
                mozo: mozo.name,
                receiptImage: details.receipt // Pass the base64 image
            });

            targetOrders.forEach(o => {
                updateOrderStatus(String(o.id), 'paid');
            });

            setIsPaymentOpen(false);
            setSelectedOrder(null);
        } catch (e) {
            console.error(e);
            alert("Error al procesar el cobro");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            <header className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950">
                    <Wallet size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Cierre de Cuentas</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cobro rápido de mesas</p>
                </div>
            </header>

            <div className="space-y-3">
                {pendingBills.length > 0 ? (
                    pendingBills.map(bill => (
                        <button 
                            key={bill.table}
                            onClick={() => {
                                setSelectedOrder(bill);
                                setIsPaymentOpen(true);
                            }}
                            className="w-full flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-[30px] active:scale-[0.98] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 font-black italic tracking-tighter text-xl">
                                    {bill.table}
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white">Mesa {bill.table}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{bill.orders.length} pedidos pendientes</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total a Cobrar</p>
                                    <p className="text-xl font-black italic tracking-tighter text-emerald-400">${bill.total.toLocaleString()}</p>
                                </div>
                                <ChevronRight className="text-slate-800 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="py-24 text-center space-y-4 opacity-30">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Receipt size={32} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest">No hay cuentas pendientes</p>
                    </div>
                )}
            </div>

            <PaymentModal 
                isOpen={isPaymentOpen}
                order={selectedOrder}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handleConfirmPayment}
            />
        </div>
    );
}
