import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2, QrCode, Star, ChevronLeft } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useClientAuth } from '../hooks/useClientAuth';
import ReservationCard from '../components/ReservationCard';
import { fetchHistorialReservas } from '../services/clientService';
import { createPaymentPreference } from '../../admin/services/paymentService';
import CheckInCard from '../../access_control/components/CheckInCard';
import { useParams, useNavigate } from 'react-router-dom';

export default function ClientReservations() {
    const { negocioId } = useParams();
    const { clientUser } = useClientAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQR, setSelectedQR] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!clientUser) return navigate(`/${negocioId}`);

        const load = async () => {
            const history = await fetchHistorialReservas(negocioId, clientUser.id);
            setReservas(history);
            setLoading(false);
        };
        load();
    }, [negocioId, clientUser, navigate]);

    const handlePay = async (reserva) => {
        try {
            const pref = await createPaymentPreference(negocioId, {
                cliente: clientUser.name,
                items: [{ title: `Reserva - ${reserva.cancha}`, unit_price: reserva.precio, quantity: 1 }],
                external_reference: reserva.id
            });
            window.location.href = pref.sandbox_init_point;
        } catch (error) {
            alert('Error al iniciar MercadoPago');
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 pb-32 overflow-hidden">
             {/* Animated Background Layers */}
             <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 animate-mesh opacity-10" />
                <div className="absolute inset-0 bg-grid-white opacity-5" />
            </div>

            <div className="relative z-10 px-6 pt-10">
                <header className="mb-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={10} className="text-amber-500" fill="currentColor" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60 leading-none">Tu Historial</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">Mis Reservas</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{clientUser?.name || 'Cliente'} / Digital Pass</p>
                    </div>
                    <div className="w-16 h-16 bg-amber-500/10 rounded-3xl border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl">
                        <CalendarDays size={32} />
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="relative">
                            <Loader2 size={48} className="animate-spin text-amber-500" />
                            <div className="absolute inset-0 blur-xl bg-amber-500/20 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sincronizando agendamientos...</span>
                    </div>
                ) : reservas.length === 0 ? (
                    <div className="text-center py-24 glass-premium rounded-[40px] p-10 border border-white/5 space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                           <CalendarDays size={40} />
                        </div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Aún no tienes <br /> <span className="text-amber-500">reservas activas</span>
                        </p>
                        <button onClick={() => navigate(`/${negocioId}/app`)} className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            Reservar Ahora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reservas.map((r, idx) => (
                            <div key={r.id} className="relative animate-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 150}ms` }}>
                                <ReservationCard 
                                    reserva={r} 
                                    negocioId={negocioId} 
                                    onPay={handlePay} 
                                />
                                {r.pagado && (
                                    <button 
                                        onClick={() => setSelectedQR(r)}
                                        className="absolute -top-3 -right-3 bg-amber-500 text-black w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-10 border-[6px] border-slate-950 group"
                                        title="Pase de Acceso QR"
                                    >
                                        <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedQR && (
                <CheckInCard 
                    reserva={selectedQR} 
                    onClose={() => setSelectedQR(null)} 
                />
            )}
        </div>
    );
}

