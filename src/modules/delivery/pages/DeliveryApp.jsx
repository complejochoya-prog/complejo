import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, Bike, MapPin, PackageCheck, History, Bell } from 'lucide-react';
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
    
    // Modals
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Audio for notification
    const [audioContext, setAudioContext] = useState(null);

    // Load user & check auth
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

    // Notifications logic
    useEffect(() => {
        const myReadyOrders = (orders || []).filter(o => 
            o.tipo === 'Delivery' && 
            o.estado === 'listo_para_salir' &&
            (!o.riderId || o.riderId === userId)
        );

        if (myReadyOrders.length > 0) {
            const alerted = JSON.parse(localStorage.getItem('alerted_delivery_orders')) || [];
            const newAlerts = myReadyOrders.filter(o => !alerted.includes(o.id));
            
            if (newAlerts.length > 0) {
                playBeep();
                if ("vibrate" in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
                const updatedAlerts = [...alerted, ...newAlerts.map(o => o.id)];
                localStorage.setItem('alerted_delivery_orders', JSON.stringify(updatedAlerts));
            }
        }
    }, [orders, userId]);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
            osc.start();
            osc.stop(ctx.currentTime + 1);
        } catch (e) { }
    };

    const handleLogout = () => {
        localStorage.removeItem('delivery_userId');
        localStorage.removeItem('delivery_userName');
        localStorage.removeItem('delivery_userRole');
        navigate(`/${negocioId}/app/delivery/login`);
    };

    // Actions
    const handleRecoger = (orderId) => {
        updateOrder(orderId, {
            estado: 'en_camino',
            riderId: userId,
            riderName: userName,
            horaSalida: new Date().toISOString()
        });
    };

    const handleOpenPayment = (order) => {
        setSelectedOrder(order);
        setPaymentModalOpen(true);
    };

    const handlePaymentConfirm = async (paymentDetails) => {
        const orderId = selectedOrder.id;
        
        // Update Order Status
        updateOrder(orderId, {
            estado: 'entregado',
            paid: true,
            paymentMethod: paymentDetails.method,
            receiptImage: paymentDetails.receipt || null,
            horaEntregado: new Date().toISOString()
        });

        // Register in Caja
        try {
            const { registerExternalMovement } = await import('../../caja/services/cajaService');
            await registerExternalMovement({
                tipo: 'entrada',
                categoria: 'Delivery bar',
                descripcion: `Entrega #${orderId.slice(-4)} - ${selectedOrder.cliente} (${selectedOrder.direccion})`,
                monto: selectedOrder.total,
                metodo_pago: paymentDetails.method,
                origen: 'delivery',
                repartidor: userName, // Custom field for the user's request
                usuario: userName
            });
        } catch (err) {
            console.error("Error al registrar en caja:", err);
        }

        setPaymentModalOpen(false);
        setSelectedOrder(null);
    };

    // Tabs filtering
    const allOrders = orders || [];
    const deliveryOrders = allOrders.filter(o => o.tipo === 'Delivery');
    
    const listosData = allOrders.filter(o => (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.tipo === 'Delivery');
    const enCaminoData = deliveryOrders.filter(o => o.estado === 'en_camino' && o.riderId === userId);
    const historialData = deliveryOrders.filter(o => (o.estado === 'entregado' || o.estado === 'paid') && o.riderId === userId);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pb-20">
            {/* App Header */}
            <header className="bg-slate-900 border-b border-white/5 px-4 pt-4 pb-2 sticky top-0 z-40">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Bike size={20} />
                        </div>
                        <div>
                            <h1 className="text-[13px] font-black uppercase tracking-widest text-white leading-none">Mi Ruta</h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Repartidor: {userName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full border border-white/5 bg-slate-800 flex items-center justify-center text-rose-400 active:scale-95 transition-all shadow-xl"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5 relative">
                    {['LISTOS', 'EN CAMINO', 'HISTORIAL'].map((tab) => {
                        let icon;
                        let count = 0;
                        if (tab === 'LISTOS') {
                            icon = PackageCheck;
                            count = listosData.length;
                        }
                        if (tab === 'EN CAMINO') {
                            icon = MapPin;
                            count = enCaminoData.length;
                        }
                        if (tab === 'HISTORIAL') {
                            icon = History;
                            count = historialData.length;
                        }
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-all relative ${
                                    activeTab === tab 
                                    ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20 text-slate-950 scale-100 z-10' 
                                    : 'text-slate-500 hover:text-slate-300 active:scale-95'
                                }`}
                            >
                                {count > 0 && tab !== 'HISTORIAL' && (
                                    <span className="absolute top-1right-1 flex h-3 w-3 top-[-3px] right-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === tab ? 'bg-white' : 'bg-cyan-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${activeTab === tab ? 'bg-white' : 'bg-cyan-500'}`}></span>
                                    </span>
                                )}
                                {React.createElement(icon, { size: 16 })}
                                <span className="text-[8px] font-black uppercase tracking-widest">{tab}</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-y-auto z-10 space-y-4">
                {activeTab === 'LISTOS' && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pedidos listos en barra/cocina</h2>
                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">{listosData.length}</span>
                        </div>
                        {listosData.length === 0 ? (
                            <EmptyState icon={PackageCheck} text="No hay pedidos listos" sub="Para la modalidad delivery" />
                        ) : (
                            listosData.map(o => (
                                <OrderCard 
                                    key={o.id} 
                                    order={o} 
                                    primaryAction={() => handleRecoger(o.id)}
                                    primaryLabel="Recoger Pedido"
                                    primaryColor="bg-cyan-500"
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'EN CAMINO' && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-4">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">En tránsito actual</h2>
                            <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">{enCaminoData.length}</span>
                        </div>
                        {enCaminoData.length === 0 ? (
                            <EmptyState icon={MapPin} text="No tienes viajes activos" sub="Recoge un pedido en sucursal" />
                        ) : (
                            enCaminoData.map(o => (
                                <OrderCard 
                                    key={o.id} 
                                    order={o} 
                                    primaryAction={() => handleOpenPayment(o)}
                                    primaryLabel="Marcar Entregado"
                                    primaryColor="bg-emerald-500"
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'HISTORIAL' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 space-y-4">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tus Entregas Completadas</h2>
                        </div>
                        {historialData.length === 0 ? (
                            <EmptyState icon={History} text="Tu historial está vacío" sub="Comienza con tu primer reparto" />
                        ) : (
                            historialData.map(o => (
                                <OrderCard 
                                    key={o.id} 
                                    order={o} 
                                    isHistory 
                                />
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={paymentModalOpen} 
                onClose={() => setPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
                orderTotal={selectedOrder?.total || 0}
            />
        </div>
    );
}

function EmptyState({ icon: Icon, text, sub }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-[32px] border border-white/5 bg-slate-900/50 mt-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-4 shadow-xl">
                <Icon size={32} />
            </div>
            <h3 className="text-sm font-black uppercase text-white tracking-widest">{text}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{sub}</p>
        </div>
    );
}
