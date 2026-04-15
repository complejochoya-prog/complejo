import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, Bike, MapPin, PackageCheck, History, Navigation, User, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import PaymentModal from '../components/PaymentModal';
import { useConfig } from '../../../core/services/ConfigContext';

export default function DeliveryApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config, orders, updateOrder } = useConfig();
    
    // Auth State
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    
    // UI State
    const [activeTab, setActiveTab] = useState('LISTOS');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

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
            paid: true,
            paymentMethod: paymentDetails.method,
            receiptImage: paymentDetails.receipt || null,
            horaEntregado: new Date().toISOString()
        });

        try {
            const { registerExternalMovement } = await import('../../caja/services/cajaService');
            await registerExternalMovement({
                tipo: 'entrada',
                categoria: 'Delivery bar',
                descripcion: `Entrega #${orderId.slice(-4)} - ${selectedOrder.cliente} (${selectedOrder.direccion})`,
                monto: selectedOrder.total,
                metodo_pago: paymentDetails.method,
                origen: 'delivery',
                repartidor: userName,
                usuario: userName
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
    
    const listosData = deliveryOrders.filter(o => o.estado === 'listo' || o.estado === 'listo_para_salir');
    const enCaminoData = deliveryOrders.filter(o => o.estado === 'en_camino' && o.riderId === userId);
    const historialData = deliveryOrders.filter(o => (o.estado === 'entregado' || o.estado === 'paid') && o.riderId === userId);

    return (
        <div className="fixed inset-0 bg-[#0f0f13] text-white font-inter flex flex-col overflow-hidden selection:bg-cyan-500/30">
            {/* Cinematic Map Background Simulation */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top Navigation Panel */}
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

                {/* Integrated Segmented Control */}
                <div className="px-5 pb-4">
                    <div className="bg-black/60 border border-white/10 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden backdrop-blur-md">
                        {[
                            { id: 'LISTOS', label: 'Cola', count: listosData.length, icon: PackageCheck },
                            { id: 'EN CAMINO', label: 'Ruta', count: enCaminoData.length, icon: Navigation },
                            { id: 'HISTORIAL', label: 'Hist.', count: historialData.length, icon: History }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); triggerFeedback(); }}
                                className={`flex-1 py-3 flex flex-col items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative ${
                                    activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <tab.icon size={16} className={activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                                {tab.label}
                                {tab.count > 0 && tab.id !== 'HISTORIAL' && (
                                    <span className="absolute top-1.5 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center shadow-md">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* dynamic Content Slider */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 scroll-smooth">
                {activeTab === 'LISTOS' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <SectionHeader title="Pedidos Pendientes" count={listosData.length} color="cyan" />
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

                {activeTab === 'EN CAMINO' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <SectionHeader title="En Ruta" count={enCaminoData.length} color="orange" />
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

            {/* Unified Payment Modal for Rider App Context */}
            {paymentModalOpen && selectedOrder && (
                <PaymentModal 
                    isOpen={paymentModalOpen} 
                    onClose={() => setPaymentModalOpen(false)}
                    onConfirm={handlePaymentConfirm}
                    orderTotal={selectedOrder.total || 0}
                />
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                * { scrollbar-width: none; -ms-overflow-style: none; overflow-x: hidden; }
                *::-webkit-scrollbar { display: none; }
                .pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
                .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
            `}} />
        </div>
    );
}

function SectionHeader({ title, count, color }) {
    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
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

function RiderOrderCard({ order, actionLabel, onAction, colorMode, isHistory }) {
    // Determine gradient depending on action type
    const gradientClasses = colorMode === 'emerald' 
        ? 'from-emerald-500 to-emerald-400 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]'
        : 'from-cyan-500 to-cyan-400 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.5)]';

    return (
        <div className={`bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-white/10 p-5 ${isHistory ? 'opacity-50' : 'shadow-2xl'}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        #{order.id.slice(-4)}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-white mt-1 pr-4">{order.cliente}</h3>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Cobrar</span>
                    <span className="text-lg font-black text-white">${order.total}</span>
                </div>
            </div>

            <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white leading-tight">{order.direccion}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Destino</p>
                    </div>
                </div>
            </div>

            {!isHistory && (
                <button 
                    onClick={onAction}
                    className={`w-full py-4 rounded-[20px] bg-gradient-to-r ${gradientClasses} text-slate-950 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all`}
                >
                    {actionLabel} <ChevronRight size={16} />
                </button>
            )}
        </div>
    );
}
