import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, Bike, MapPin, PackageCheck, History, Navigation, User, ChevronRight, CheckCircle2, Clock, Phone, ShoppingBag, AlertCircle, Flame, Package } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { useConfig } from '../../../core/services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';

export default function DeliveryApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();
    const { orders, updateOrder, updateOrderStatus } = usePedidos();
    
    // Auth State
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    
    // UI State
    const [activeTab, setActiveTab] = useState('COCINA');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Notification
    const notificationSound = useRef(null);
    const lastNotifiedCount = useRef(0);

    useEffect(() => {
        notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    useEffect(() => {
        const uid = localStorage.getItem('delivery_userId');
        const name = localStorage.getItem('delivery_userName');
        if (!uid) {
            navigate(`/${negocioId}/app/delivery/login`);
        } else {
            setUserId(uid);
            setUserName(name);
        }
    }, [navigate, negocioId]);

    // Haptics & Desktop Sounds
    const triggerFeedback = () => {
        if ("vibrate" in navigator) {
            navigator.vibrate(50);
        }
    };

    const handleLogout = () => {
        triggerFeedback();
        localStorage.removeItem('delivery_userId');
        localStorage.removeItem('delivery_userName');
        localStorage.removeItem('delivery_userRole');
        navigate(`/${negocioId}/app/delivery/login`);
    };

    const handleRecoger = (orderId) => {
        triggerFeedback();
        updateOrder(orderId, {
            estado: 'en_camino',
            status: 'en_camino',
            riderId: userId,
            riderName: userName,
            horaSalida: new Date().toISOString()
        });
        setActiveTab('EN CAMINO');
    };

    const handleOpenPayment = (order) => {
        triggerFeedback();
        setSelectedOrder(order);
        setPaymentModalOpen(true);
    };

    const handlePaymentConfirm = async (paymentDetails) => {
        const orderId = selectedOrder.id;
        triggerFeedback();
        
        updateOrder(orderId, {
            estado: 'entregado',
            status: 'entregado',
            paid: true,
            paymentMethod: paymentDetails.method,
            receiptImage: paymentDetails.receipt || null,
            horaEntregado: new Date().toISOString()
        });

        try {
            const { registerExternalMovement } = await import('../../caja/services/cajaService');
            await registerExternalMovement(negocioId, {
                tipo: 'entrada',
                categoria: 'Delivery bar',
                descripcion: `Entrega #${orderId.slice(-4)} - ${selectedOrder.cliente} (${selectedOrder.direccion})`,
                monto: selectedOrder.total,
                metodo_pago: (paymentDetails.method || 'efectivo').toLowerCase(),
                origen: 'delivery',
                repartidor: userName,
                usuario: userName,
                receiptImage: paymentDetails.receipt // Base64 image
            });
        } catch (err) {
            console.error("Error al registrar caja:", err);
        }

        setPaymentModalOpen(false);
        setSelectedOrder(null);
        setActiveTab('HISTORIAL');
    };

    const allOrders = orders || [];
    const deliveryOrders = allOrders.filter(o => o.tipo === 'Delivery');
    
    // Categorías de pedidos delivery
    const cocinaData = deliveryOrders.filter(o => 
        ['nuevo', 'pendiente', 'preparando', 'en_cocina'].includes(o.estado || o.status)
    );
    const listosData = deliveryOrders.filter(o => 
        ['listo', 'listo_para_salir', 'para_entregar'].includes(o.estado || o.status)
    );
    const enCaminoData = deliveryOrders.filter(o => 
        (o.estado === 'en_camino' || o.status === 'en_camino') && o.riderId === userId
    );
    const historialData = deliveryOrders.filter(o => 
        ['entregado', 'paid'].includes(o.estado || o.status) && o.riderId === userId
    );

    // 🔔 Notificación cuando entra un nuevo delivery
    useEffect(() => {
        const newCount = cocinaData.length + listosData.length;
        if (newCount > lastNotifiedCount.current && lastNotifiedCount.current > 0) {
            try {
                notificationSound.current?.play().catch(() => {});
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
            } catch (e) {}
        }
        lastNotifiedCount.current = newCount;
    }, [cocinaData.length, listosData.length]);

    const tabs = [
        { id: 'COCINA', label: 'Cocina', count: cocinaData.length, icon: Flame, color: 'orange' },
        { id: 'LISTOS', label: 'Cola', count: listosData.length, icon: PackageCheck, color: 'cyan' },
        { id: 'EN CAMINO', label: 'Ruta', count: enCaminoData.length, icon: Navigation, color: 'emerald' },
        { id: 'HISTORIAL', label: 'Hist.', count: historialData.length, icon: History, color: 'slate' }
    ];

    return (
        <div className="fixed inset-0 bg-[#0f0f13] text-white font-inter flex flex-col overflow-hidden selection:bg-cyan-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 bg-black/40 backdrop-blur-3xl border-b border-white/5 pt-safe-top">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded-[18px] flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-white/20">
                                <Bike size={24} className="text-white drop-shadow-md" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-widest text-white shadow-sm">Rider Panel</h1>
                            <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                {userName || 'Rider Activo'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-5 pb-4">
                    <div className="bg-black/60 border border-white/10 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden backdrop-blur-md">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); triggerFeedback(); }}
                                className={`flex-1 py-3 flex flex-col items-center gap-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 relative ${
                                    activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <tab.icon size={16} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                                {tab.label}
                                {tab.count > 0 && tab.id !== 'HISTORIAL' && (
                                    <span className={`absolute top-1 right-2 min-w-[18px] h-[18px] text-white text-[9px] rounded-full flex items-center justify-center shadow-md px-1 ${
                                        tab.id === 'COCINA' ? 'bg-orange-500 animate-pulse' : 'bg-rose-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 scroll-smooth pb-20">
                
                {/* 🔥 EN COCINA — Pedidos preparándose */}
                {activeTab === 'COCINA' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <SectionHeader title="En Cocina" count={cocinaData.length} color="orange" />
                        {cocinaData.length === 0 ? (
                            <DeliveryEmptyState icon={Flame} title="Sin pedidos en cocina" desc="Cuando entre un delivery, aparecerá aquí." />
                        ) : (
                            cocinaData.map((order) => (
                                <RiderOrderCard 
                                    key={order.id} 
                                    order={order} 
                                    colorMode="orange"
                                    showStatus={true}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* 📦 LISTOS — Para recoger */}
                {activeTab === 'LISTOS' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <SectionHeader title="Listos para Recoger" count={listosData.length} color="cyan" />
                        {listosData.length === 0 ? (
                            <DeliveryEmptyState icon={Clock} title="Sin pedidos en cola" desc="Toma un descanso, te avisaremos." />
                        ) : (
                            listosData.map((order) => (
                                <RiderOrderCard 
                                    key={order.id} 
                                    order={order} 
                                    actionLabel="Tomar Viaje" 
                                    onAction={() => handleRecoger(order.id)} 
                                    colorMode="cyan" 
                                />
                            ))
                        )}
                    </div>
                )}

                {/* 🚴 EN CAMINO */}
                {activeTab === 'EN CAMINO' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <SectionHeader title="En Ruta" count={enCaminoData.length} color="emerald" />
                        {enCaminoData.length === 0 ? (
                            <DeliveryEmptyState icon={Navigation} title="Destino Libre" desc="No tienes pedidos en tu mochila." />
                        ) : (
                            enCaminoData.map((order) => (
                                <RiderOrderCard 
                                    key={order.id} 
                                    order={order} 
                                    actionLabel="Marcar Entregado" 
                                    onAction={() => handleOpenPayment(order)} 
                                    colorMode="emerald" 
                                />
                            ))
                        )}
                    </div>
                )}

                {/* 📜 HISTORIAL */}
                {activeTab === 'HISTORIAL' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <SectionHeader title="Viajes Completados" count={historialData.length} color="slate" />
                        {historialData.length === 0 ? (
                            <DeliveryEmptyState icon={CheckCircle2} title="Aún sin viajes" desc="Completa tu primer entrega hoy." />
                        ) : (
                            historialData.map((order) => (
                                <RiderOrderCard 
                                    key={order.id} 
                                    order={order} 
                                    isHistory={true} 
                                />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Payment Modal */}
            {paymentModalOpen && selectedOrder && (
                <PaymentModal 
                    isOpen={paymentModalOpen} 
                    onClose={() => setPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirm}
                    orderTotal={selectedOrder.total || 0}
                />
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                * { scrollbar-width: none; -ms-overflow-style: none; }
                *::-webkit-scrollbar { display: none; }
                .pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
                .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
            `}} />
        </div>
    );
}

/* ── Helper Components ── */

function SectionHeader({ title, count, color }) {
    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        slate: 'text-slate-400 bg-slate-400/10 border-white/10'
    };
    return (
        <div className="flex items-center justify-between pl-1">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-300 drop-shadow-md">{title}</h2>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${colorClasses[color]}`}>{count}</span>
        </div>
    );
}

function DeliveryEmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[32px] border border-white/5 bg-white/[0.02] mt-4 backdrop-blur-md">
            <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-slate-600 mb-6 shadow-xl border border-white/5 relative">
                <div className="absolute inset-0 bg-white/5 blur-xl"></div>
                <Icon size={36} strokeWidth={1.5} className="relative z-10" />
            </div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">{title}</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 px-8">{desc}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    const statusMap = {
        nuevo: { label: 'Recibido', color: 'bg-blue-500', pulse: true },
        pendiente: { label: 'Pendiente', color: 'bg-slate-500', pulse: false },
        preparando: { label: 'En Cocina', color: 'bg-orange-500', pulse: true },
        en_cocina: { label: 'En Cocina', color: 'bg-orange-500', pulse: true },
        listo: { label: 'Listo', color: 'bg-emerald-500', pulse: true },
        listo_para_salir: { label: 'Listo para salir', color: 'bg-cyan-500', pulse: true },
        en_camino: { label: 'En camino', color: 'bg-violet-500', pulse: false },
        entregado: { label: 'Entregado', color: 'bg-emerald-700', pulse: false },
        paid: { label: 'Cobrado', color: 'bg-emerald-700', pulse: false },
    };
    const cfg = statusMap[status] || { label: status, color: 'bg-slate-600', pulse: false };
    return (
        <span className={`text-[8px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-full ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''} shadow-lg`}>
            {cfg.label}
        </span>
    );
}

function OrderTimer({ timestamp }) {
    const [elapsed, setElapsed] = useState('');
    useEffect(() => {
        const getMs = (val) => {
            if (!val) return Date.now();
            if (val instanceof Date) return val.getTime();
            if (val.toDate) return val.toDate().getTime();
            const d = new Date(val);
            return isNaN(d.getTime()) ? Date.now() : d.getTime();
        };
        const start = getMs(timestamp);
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - start) / 1000);
            const mins = Math.floor(diff / 60);
            const secs = diff % 60;
            setElapsed(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [timestamp]);

    return (
        <span className="text-[11px] font-mono font-black text-amber-400 tabular-nums">
            ⏱ {elapsed}
        </span>
    );
}

function RiderOrderCard({ order, actionLabel, onAction, colorMode, isHistory, showStatus }) {
    const items = order.items || order.productos || [];
    const cliente = order.cliente || order.customerName || 'Cliente';
    const telefono = order.telefono || order.phone || order.celular || '';
    const direccion = order.direccion || order.address || 'Sin dirección';
    const notas = order.notas || order.observaciones || order.notes || '';
    const total = order.total || 0;
    const status = order.estado || order.status || 'nuevo';

    const gradientMap = {
        emerald: 'from-emerald-500 to-emerald-400 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]',
        cyan: 'from-cyan-500 to-cyan-400 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.5)]',
        orange: 'from-orange-500 to-amber-400 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]',
    };
    const gradientClasses = gradientMap[colorMode] || gradientMap.cyan;

    const borderMap = {
        orange: 'border-orange-500/20',
        cyan: 'border-cyan-500/20',
        emerald: 'border-emerald-500/20',
    };

    return (
        <div className={`bg-slate-900/80 backdrop-blur-xl rounded-[28px] border ${borderMap[colorMode] || 'border-white/10'} overflow-hidden ${isHistory ? 'opacity-50' : 'shadow-2xl'}`}>
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                                #{String(order.id).slice(-5)}
                            </span>
                            {showStatus && <StatusBadge status={status} />}
                            <OrderTimer timestamp={order.timestamp || order.createdAt} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                            <User size={16} className="text-slate-500" />
                            {cliente}
                        </h3>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">Total</span>
                        <span className="text-xl font-black text-white">${typeof total === 'number' ? total.toLocaleString() : total}</span>
                    </div>
                </div>
            </div>

            {/* Client Details */}
            <div className="px-5 space-y-2 mb-3">
                {/* Dirección */}
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white leading-tight truncate">{direccion}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Destino</p>
                    </div>
                </div>

                {/* Teléfono */}
                {telefono && (
                    <a href={`tel:${telefono}`} className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors group">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Phone size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">{telefono}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Llamar cliente</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-600" />
                    </a>
                )}
            </div>

            {/* Items del pedido */}
            {items.length > 0 && (
                <div className="px-5 mb-3">
                    <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                            <ShoppingBag size={12} className="text-amber-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detalle del Pedido</span>
                            <span className="text-[9px] font-black text-amber-400 ml-auto">{items.length} items</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                            {item.cantidad || item.quantity || 1}
                                        </span>
                                        <span className="text-[11px] font-bold text-white truncate">
                                            {item.nombre || item.productName || item.name}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 ml-2 shrink-0">
                                        ${((item.precio || item.price || 0) * (item.cantidad || item.quantity || 1)).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Notas */}
            {notas && (
                <div className="px-5 mb-3">
                    <div className="flex items-start gap-2 bg-amber-500/10 rounded-2xl p-3 border border-amber-500/20">
                        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-300 font-bold leading-tight">{notas}</p>
                    </div>
                </div>
            )}

            {/* Action Button */}
            {!isHistory && !showStatus && onAction && (
                <div className="p-5 pt-2">
                    <button 
                        onClick={onAction}
                        className={`w-full py-4 rounded-[20px] bg-gradient-to-r ${gradientClasses} text-slate-950 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all`}
                    >
                        {actionLabel} <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Status footer for kitchen view */}
            {showStatus && (
                <div className="px-5 pb-4 pt-1">
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2">
                            <Flame size={14} className="text-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {status === 'nuevo' ? 'Esperando cocina...' : 
                                 status === 'preparando' || status === 'en_cocina' ? 'Preparando tu pedido...' : 
                                 'Procesando...'}
                            </span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    </div>
                </div>
            )}
        </div>
    );
}
