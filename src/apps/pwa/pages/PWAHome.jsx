import React, { useState } from 'react';
import { CalendarRange, MapPin, Search, CreditCard, Loader2 } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { createPaymentPreference } from '../../../modules/admin/services/paymentService';
import { useAuth } from '../../../context/AuthContext';

export default function PWAHome() {
    const { config, negocioId } = useConfig();
    const { user } = useAuth();
    const [loadingPaymentId, setLoadingPaymentId] = useState(null);

    const pendingPayments = [
        { id: 'res_1', title: 'Reserva Cancha 1', subtitle: 'Hoy 20:00hs', is: 'PAGAR RESERVA', price: 8000, type: 'reserva' },
        { id: 'bar_1', title: 'Pedido del Bar #014', subtitle: 'En preparación', is: 'PAGAR PEDIDO', price: 12500, type: 'bar' },
        { id: 'tor_1', title: 'Torneo Padel Amateur', subtitle: 'Sábado 15', is: 'PAGAR INSCRIPCIÓN', price: 15000, type: 'torneo' },
    ];

    const handlePayment = async (item) => {
        setLoadingPaymentId(item.id);
        try {
            const pref = await createPaymentPreference(negocioId, {
                cliente: user?.name || 'Invitado',
                items: [{ title: item.title, unit_price: item.price, quantity: 1 }],
                external_reference: item.id
            });
            // Simulate redirection to MP checkout
            window.location.href = pref.sandbox_init_point;
        } catch (error) {
            console.error(error);
            alert('Error al iniciar el pago.');
        } finally {
            setLoadingPaymentId(null);
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header / Saludo */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 bg-white/10 w-40 h-40 rounded-full blur-2xl" />
                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-2">Bienvenido de vuelta</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{config?.nombre || 'Complejo'}</p>
                <div className="mt-6 flex items-center justify-between">
                    <button className="bg-white text-indigo-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                        <CalendarRange size={14} className="inline -mt-1" />
                        Reservar Ahora
                    </button>
                </div>
            </div>

            {/* FASE 11: Módulo de Pagos Pendientes (MP) */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2 flex items-center gap-2">
                    <CreditCard size={14} /> Pagos Pendientes
                </h3>
                <div className="flex flex-col gap-3">
                    {pendingPayments.map(p => (
                        <div key={p.id} className="bg-slate-900 border border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">{p.title}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.subtitle}</p>
                                </div>
                                <span className="text-lg font-black italic tracking-tighter text-blue-400">
                                    ${p.price.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <button
                                onClick={() => handlePayment(p)}
                                disabled={loadingPaymentId !== null}
                                className="w-full bg-[#009EE3] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[#008CCh] transition-colors disabled:opacity-50"
                            >
                                {loadingPaymentId === p.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        {p.is}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2">¿Qué querés hacer hoy?</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col gap-3 group active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <CalendarRange size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">Canchas Futbol</span>
                    </div>
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col gap-3 group active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <MapPin size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">Canchas Padel</span>
                    </div>
                </div>
            </div>

            {/* Promociones embebidas */}
            <div className="bg-violet-900/40 border border-violet-500/30 p-5 rounded-[32px]">
                <span className="bg-violet-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">PROMO ACTIVA</span>
                <h4 className="text-xl font-black italic mt-3">Miércoles 2x1</h4>
                <p className="text-[10px] text-violet-300 font-bold uppercase tracking-widest mt-1">En Cervezas Tiradas</p>
            </div>
        </div>
    );
}
