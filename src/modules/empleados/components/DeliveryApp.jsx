import React, { useState, useEffect, useMemo } from 'react';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useAuth } from '../../empleados/services/AuthContext';
import {
    Bike,
    MapPin,
    MessageSquare,
    Phone,
    CheckCircle2,
    Clock,
    Banknote,
    CreditCard,
    Camera,
    ClipboardList,
    History,
    Bell,
    ChevronRight,
    Utensils,
    LogOut,
    X
} from 'lucide-react';
import LockScreen from '../../core/components/LockScreen';

export default function DeliveryApp() {
    const { orders, updateOrder } = usePedidos();
    const { users } = useAuth();
    const riderName = localStorage.getItem('userName');
    const riderId = localStorage.getItem('userId');

    // User status check & Auto-logout
    const currentUser = users.find(u => u.id === riderId);

    useEffect(() => {
        if (currentUser && currentUser.activo === false) {
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
        }
    }, [currentUser]);

    if (currentUser && currentUser.activo === false) {
        return <LockScreen userType="delivery" />;
    }

    const [activeTab, setActiveTab] = useState('listos');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [receiptImage, setReceiptImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [notifiedOrders, setNotifiedOrders] = useState(new Set());
    const [activeNotification, setActiveNotification] = useState(null);

    const readyOrders = useMemo(() => orders.filter(o => o.type === 'Delivery' && o.status === 'listo_para_salir'), [orders]);
    const myWayOrders = useMemo(() => orders.filter(o => o.type === 'Delivery' && o.status === 'en_camino' && o.riderId === riderId), [orders]);
    const myHistory = useMemo(() => orders.filter(o => o.type === 'Delivery' && (o.status === 'entregado' || o.status === 'paid') && o.riderId === riderId), [orders]);

    useEffect(() => {
        const assignedReady = orders.filter(o => o.type === 'Delivery' && o.status === 'listo_para_salir' && o.riderId === riderId);
        if (assignedReady.length > 0) {
            const newOrders = assignedReady.filter(o => !notifiedOrders.has(o.id));
            if (newOrders.length > 0) {
                const newest = newOrders[0];
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log("Audio block:", e));
                setActiveNotification(newest);
                if (navigator.vibrate) navigator.vibrate([500, 110, 500, 110, 500]);
                setNotifiedOrders(prev => {
                    const updated = new Set(prev);
                    newOrders.forEach(o => updated.add(o.id));
                    return updated;
                });
                setTimeout(() => setActiveNotification(null), 6000);
            }
        }
    }, [orders, riderId, notifiedOrders]);

    const handlePickup = async (orderId) => {
        await updateOrder(orderId, {
            status: 'en_camino',
            riderId,
            riderName,
            horaSalida: new Date()
        });
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedOrder(null);
        setPaymentMethod(null);
        setReceiptImage(null);
    };

    const handleDeliverSubmit = async () => {
        if (!selectedOrder) return;
        if (!paymentMethod) {
            alert("Por favor selecciona un método de pago");
            return;
        }
        setIsSubmitting(true);
        try {
            await updateOrder(selectedOrder.id, {
                status: 'entregado',
                paymentMethod,
                receiptImage,
                horaEntregado: new Date(),
                paid: true
            });
            closePaymentModal();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const renderOrderCard = (order, type) => (
        <div key={order.id} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4 mb-4">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-black italic tracking-tighter">Pedido #{order.id.split('-')[1]}</span>
                        <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-slate-500">
                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{order.clientName || 'Cliente'}</h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">A cobrar</p>
                    <p className="text-2xl font-black text-gold italic">${order.total?.toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dirección de Entrega</p>
                        <p className="text-sm font-bold text-white leading-tight">{order.address || 'Ver en mapa'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={18} className="text-slate-400 shrink-0" />
                    <p className="text-sm font-bold text-white">{order.clientPhone || 'Sin teléfono'}</p>
                </div>
            </div>

            <div className="space-y-1 opacity-60">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Productos</p>
                <p className="text-xs font-bold truncate">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                {type === 'listos' && (
                    <button
                        onClick={() => handlePickup(order.id)}
                        className="col-span-2 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <Bike size={20} /> Recoger Pedido
                    </button>
                )}
                {type === 'en_camino' && (
                    <>
                        <div className="col-span-2 grid grid-cols-2 gap-3 pb-2">
                            <a
                                href={`tel:${order.clientPhone || ''}`}
                                className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                            >
                                <Phone size={16} /> Llamar
                            </a>
                            <a
                                href={`https://wa.me/${(order.clientPhone || '').replace('+', '')}`}
                                className="py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-green-500/20 transition-colors"
                            >
                                <MessageSquare size={16} /> WhatsApp
                            </a>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedOrder(order);
                                setIsPaymentModalOpen(true);
                            }}
                            className="col-span-2 py-4 bg-gold text-slate-950 rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                        >
                            <CheckCircle2 size={18} /> Marcar como Entregado
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col pb-24">
            {/* Header */}
            <header className="p-6 pt-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                        <Bike size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                            DELIVERY <span className="text-blue-500">APP</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Hola, {riderName}
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500">
                    <LogOut size={20} />
                </button>
            </header>

            {/* Tabs */}
            <div className="px-6 flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('listos')}
                    className={`flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${activeTab === 'listos' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                    Listos ({readyOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('en_camino')}
                    className={`flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${activeTab === 'en_camino' ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                    En Camino ({myWayOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('historial')}
                    className={`flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${activeTab === 'historial' ? 'bg-white/10 border-white/10 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                >
                    Mi Historial
                </button>
            </div>

            {/* List */}
            <main className="flex-1 px-6 overflow-y-auto">
                {activeTab === 'listos' && (
                    <>
                        {readyOrders.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30">
                                <Utensils size={48} />
                                <p className="mt-4 font-black uppercase italic tracking-widest text-[10px]">No hay pedidos listos</p>
                            </div>
                        ) : (
                            readyOrders.map(o => renderOrderCard(o, 'listos'))
                        )}
                    </>
                )}

                {activeTab === 'en_camino' && (
                    <>
                        {myWayOrders.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30">
                                <Bike size={48} />
                                <p className="mt-4 font-black uppercase italic tracking-widest text-[10px]">No tienes pedidos en camino</p>
                            </div>
                        ) : (
                            myWayOrders.map(o => renderOrderCard(o, 'en_camino'))
                        )}
                    </>
                )}

                {activeTab === 'historial' && (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total de Entregas Hoy</p>
                            <p className="text-4xl font-black italic tracking-tighter text-gold">${myHistory.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}</p>
                            <div className="mt-4 flex gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase">Pedidos</p>
                                    <p className="text-xl font-black italic">{myHistory.length}</p>
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase">Promedio</p>
                                    <p className="text-xl font-black italic">
                                        ${myHistory.length ? Math.round(myHistory.reduce((acc, o) => acc + (o.total || 0), 0) / myHistory.length).toLocaleString() : 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {myHistory.map(order => (
                            <div key={order.id} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div className="size-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-white uppercase truncate">{order.clientName}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight truncate">{order.address}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-gold">${order.total?.toLocaleString()}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase">{order.paymentMethod}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Nav Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 p-4 z-40">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gold/10 rounded-xl text-gold">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase">Efectivo a entregar</p>
                            <p className="text-lg font-black italic leading-none">
                                ${myHistory.filter(o => o.paymentMethod === 'Efectivo').reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex -space-x-3">
                        <div className="size-10 rounded-full border-4 border-slate-950 bg-blue-500 flex items-center justify-center text-[10px] font-black">{readyOrders.length}</div>
                        <div className="size-10 rounded-full border-4 border-slate-950 bg-purple-500 flex items-center justify-center text-[10px] font-black">{myWayOrders.length}</div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md p-6 flex items-end">
                    <div className="w-full bg-slate-900 border border-white/10 rounded-[40px] p-8 space-y-8 animate-in slide-in-from-bottom duration-300">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Confirmar Entrega</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Registrar pago del pedido</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Método de Pago</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('Efectivo')}
                                    className={`py-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'Efectivo' ? 'bg-gold/10 border-gold text-gold shadow-lg shadow-gold/10' : 'bg-white/5 border-transparent text-slate-500'}`}
                                >
                                    <Banknote size={32} />
                                    <span className="text-[10px] font-black uppercase">Efectivo</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('Transferencia')}
                                    className={`py-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'Transferencia' ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-transparent text-slate-500'}`}
                                >
                                    <CreditCard size={32} />
                                    <span className="text-[10px] font-black uppercase">Transferencia</span>
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'Transferencia' && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Comprobante de Pago</p>
                                <div className="relative aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center group">
                                    {receiptImage ? (
                                        <>
                                            <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setReceiptImage(null)}
                                                className="absolute top-4 right-4 p-2 bg-red-500 rounded-xl text-white shadow-lg"
                                            >
                                                <History size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <Camera size={32} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                                            <span className="text-[10px] font-black uppercase text-slate-500">Subir Foto</span>
                                            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={closePaymentModal}
                                className="flex-1 py-5 bg-white/5 rounded-2xl font-black uppercase text-xs text-slate-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeliverSubmit}
                                disabled={isSubmitting || (paymentMethod === 'Transferencia' && !receiptImage)}
                                className="flex-[2] py-5 bg-gold text-slate-950 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-gold/20 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? 'Procesando...' : 'Confirmar y Finalizar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Notification Popup */}
            {activeNotification && (
                <div className="fixed top-24 left-4 right-4 z-50 animate-in slide-in-from-top fade-in duration-300">
                    <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-4 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[shrink_6s_linear_forwards]"></div>
                        <button
                            onClick={() => setActiveNotification(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-start gap-4">
                            <div className="size-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                <Bell size={24} className="animate-bounce" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-blue-400">¡Pedido Listo!</h3>
                                <div className="space-y-0.5 text-sm font-bold text-white">
                                    <p>Cliente: {activeNotification.clientName || 'Sin Nombre'}</p>
                                    <p className="flex items-center gap-1 text-slate-400">
                                        <Phone size={14} /> Tel: {activeNotification.clientPhone || 'Sin Teléfono'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes shrink {
                            from { width: 100%; }
                            to { width: 0%; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
