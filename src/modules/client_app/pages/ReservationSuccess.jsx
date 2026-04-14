import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowLeft, Home } from 'lucide-react';

export default function ReservationSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { reservation } = location.state || {};

    if (!reservation) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-slate-400 mb-6 font-bold uppercase tracking-widest text-xs">No se encontró información de la reserva</p>
                <button 
                    onClick={() => navigate(`/${negocioId || 'giovanni'}/app`)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const { fieldName, date, time, firstName, lastName, phone, price, complexPhone } = reservation;
    const whatsAppTarget = complexPhone || "5491122334455"; 

    const handleWhatsApp = () => {
        const message = `Hola, quiero confirmar mi reserva.

Cancha: ${fieldName}
Fecha: ${date}
Hora: ${time}

Nombre: ${firstName} ${lastName}
Teléfono: ${phone}`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsAppTarget}?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-md mx-auto h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8 animate-bounce transition-all">
                        <CheckCircle2 size={64} />
                    </div>
                    
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-center mb-2">¡Reserva<br/>Confirmada!</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center mb-12">Tu turno ha sido bloqueado con éxito</p>

                    <div className="w-full bg-slate-900 border border-white/5 rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancha</span>
                            <p className="text-xl font-black uppercase italic tracking-tight">{fieldName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha</span>
                                <p className="text-lg font-black italic">{date}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horario</span>
                                <p className="text-lg font-black italic">{time} hs</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente</span>
                                <p className="text-lg font-bold">{firstName} {lastName}</p>
                                <p className="text-sm text-slate-400">{phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pb-8">
                    <button 
                        onClick={handleWhatsApp}
                        className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                    >
                        <MessageSquare size={20} />
                        Confirmar por WhatsApp
                    </button>

                    <button 
                        onClick={() => navigate(`/${negocioId}/app`)}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 border border-white/5 active:scale-95 transition-all"
                    >
                        <Home size={18} />
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
