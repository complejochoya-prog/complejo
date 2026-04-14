import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchHorariosDisponibles, fetchCanchasDisponibles, submitReserva } from '../services/clientService';
import { useClientAuth } from '../hooks/useClientAuth';
import ReservationForm from './ReservationForm';
import { 
    ArrowLeft, 
    Clock, 
    CalendarDays, 
    Loader2, 
    User, 
    Phone, 
    CreditCard, 
    ChevronRight, 
    Check,
    CalendarCheck,
    Sun,
    Moon,
    Lock,
    Timer
} from 'lucide-react';

export default function ClientFieldDetail() {
    const { negocioId, fieldId } = useParams();
    const navigate = useNavigate();
    const { clientUser, loading: authLoading } = useClientAuth();
    const { config } = useConfig();
    
    const [espacios, setEspacios] = useState([]);
    const [cancha, setCancha] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [selectedHora, setSelectedHora] = useState(null);
    const [selectedHoraFin, setSelectedHoraFin] = useState(null); // Para modo franja
    const [rentMode, setRentMode] = useState('1h'); // '1h', '1.5h', 'franja'
    
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        cantidadPersonas: 1
    });
    const [paymentMethod, setPaymentMethod] = useState('Pagar en el complejo');

    // Generate next 14 days
    const diasDelMes = useMemo(() => {
        const dias = [];
        const hoy = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(hoy.getDate() + i);
            dias.push({
                numero: d.getDate(),
                nombre: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', ''),
                fullDate: d.toISOString().split('T')[0]
            });
        }
        return dias;
    }, []);

    const nombreMesActual = new Date().toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();

    useEffect(() => {
        if (clientUser) {
            const names = (clientUser.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                nombre: prev.nombre || names[0] || '',
                apellido: prev.apellido || names.slice(1).join(' ') || '',
                telefono: prev.telefono || clientUser.phone || ''
            }));
        }
    }, [clientUser]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const list = await fetchCanchasDisponibles(negocioId, fecha);
                setEspacios(list);
                
                const found = list.find(c => c.id === fieldId) || list[0];
                setCancha(found);
                
                if (found) {
                    // El servicio ya marca las horas pasadas como no disponibles
                    const hs = await fetchHorariosDisponibles(found.id, fecha);
                    setHorarios(hs);
                }
            } catch (error) {
                console.error("Error init:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
        setSelectedHora(null);
        setSelectedHoraFin(null);
    }, [negocioId, fieldId, fecha]);

    const handleSelectHora = (hora) => {
        if (rentMode === '1h') {
            setSelectedHora(hora);
            setSelectedHoraFin(null);
            return;
        }

        if (!selectedHora || (selectedHora && selectedHoraFin)) {
            setSelectedHora(hora);
            setSelectedHoraFin(null);
        } else {
            // Modo "Desde - Hasta"
            const startIdx = horarios.findIndex(h => h.hora === selectedHora);
            const endIdx = horarios.findIndex(h => h.hora === hora);
            
            if (endIdx < startIdx) {
                setSelectedHora(hora);
                setSelectedHoraFin(null);
                return;
            }

            // Verificar disponibilidad en el rango
            const range = horarios.slice(startIdx, endIdx + 1);
            if (range.every(h => h.disponible)) {
                setSelectedHoraFin(hora);
            } else {
                setSelectedHora(hora);
                setSelectedHoraFin(null);
                alert("El rango seleccionado contiene horarios no disponibles.");
            }
        }
    };

    const getSelectedRange = () => {
        if (!selectedHora) return [];
        if (!selectedHoraFin) return [selectedHora];
        
        const startIdx = horarios.findIndex(h => h.hora === selectedHora);
        const endIdx = horarios.findIndex(h => h.hora === selectedHoraFin);
        return horarios.slice(startIdx, endIdx + 1).map(h => h.hora);
    };

    const calculateTotalPrice = () => {
        const range = getSelectedRange();
        return range.reduce((total, horaStr) => {
            const h = horarios.find(slot => slot.hora === horaStr);
            const basePrice = h?.esNocturno ? cancha?.precio_nocturno : cancha?.precio_diurno;
            return total + (basePrice || 0);
        }, 0);
    };

    const handleBooking = async () => {
        const range = getSelectedRange();
        if (range.length === 0 || !cancha) return;
        
        if (!formData.nombre || !formData.apellido || !formData.telefono) {
            alert("Por favor completa tus datos de contacto.");
            return;
        }

        // Validar cupos
        if (cancha?.capacidad) {
            if (!formData.cantidadPersonas || formData.cantidadPersonas < 1) {
                alert("Debes indicar cuántas personas asistirán.");
                return;
            }
            const invalidRange = range.some(hStr => {
                const hourObj = horarios.find(h => h.hora === hStr);
                return hourObj && hourObj.cuposDisponibles !== null && formData.cantidadPersonas > hourObj.cuposDisponibles;
            });
            if (invalidRange) {
                alert("La cantidad de personas excede los cupos disponibles en el horario seleccionado.");
                return;
            }
        }

        setBookingLoading(true);
        try {
            const totalPrice = calculateTotalPrice();

            const res = await submitReserva(negocioId, {
                canchaId: cancha.id,
                fecha,
                hora: range.join(' - '),
                cliente: formData,
                pago: paymentMethod,
                precio: totalPrice
            });

            if (res.success) {
                navigate(`/${negocioId}/app/reserva-confirmada`, { 
                    state: { 
                        reservation: {
                            fieldName: cancha.nombre,
                            date: fecha,
                            time: range.join(' - '),
                            firstName: formData.nombre,
                            lastName: formData.apellido,
                            phone: formData.telefono,
                            price: totalPrice,
                            complexPhone: config?.whatsapp || "5491122334455"
                        } 
                    } 
                });
            }
        } catch (error) {
            alert("Error al procesar la reserva.");
        } finally {
            setBookingLoading(false);
        }
    };

    const formatearFechaTablero = (f) => {
        const d = new Date(f + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase();
    };

    const horariosDiurnos = horarios.filter(h => !h.esNocturno);
    const horariosNocturnos = horarios.filter(h => h.esNocturno);

    const isInRange = (hora) => {
        if (!selectedHora || !selectedHoraFin) return false;
        const startIdx = horarios.findIndex(h => h.hora === selectedHora);
        const endIdx = horarios.findIndex(h => h.hora === selectedHoraFin);
        const currentIdx = horarios.findIndex(h => h.hora === hora);
        return currentIdx >= startIdx && currentIdx <= endIdx;
    };

    if (loading && !espacios.length) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-52 bg-[#050507] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* ── HEADER & SPACE SELECTOR ── */}
            <header className="px-6 py-8 space-y-6 bg-gradient-to-b from-indigo-950/10 to-transparent">
                <div className="flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Reserva Online</p>
                        <h1 className="font-black italic text-2xl uppercase text-white leading-none tracking-tighter">GIOVANNI SPORTS</h1>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    {espacios.map(esp => (
                        <button 
                            key={esp.id}
                            onClick={() => {
                                setCancha(esp);
                                setSelectedHora(null);
                                setSelectedHoraFin(null);
                            }}
                            className={`flex-none px-6 py-4 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-1 ${
                                cancha?.id === esp.id 
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' 
                                : 'bg-white/5 border-white/5 text-slate-500'
                            }`}
                        >
                            <span className="text-[10px] font-black uppercase opacity-60">{esp.tipo || 'Espacio'}</span>
                            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{esp.nombre}</span>
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 space-y-12">
                
                {/* ── TIPO DE ALQUILER ── */}
                <section>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button 
                            onClick={() => { setRentMode('1h'); setSelectedHora(null); setSelectedHoraFin(null); }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rentMode === '1h' ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
                        >
                            1 Hora
                        </button>
                        <button 
                            onClick={() => { setRentMode('franja'); setSelectedHora(null); setSelectedHoraFin(null); }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rentMode === 'franja' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500'}`}
                        >
                            Desde - Hasta
                        </button>
                    </div>
                </section>

                {/* ── 1. CALENDARIO ── */}
                <section>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex gap-2 items-center">
                            <CalendarDays size={16} className="text-indigo-500" /> Calendario
                        </h3>
                        <span className="text-xs font-bold text-white uppercase italic">{nombreMesActual}</span>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        {diasDelMes.map(dia => (
                            <button 
                                key={dia.fullDate}
                                onClick={() => {
                                    setFecha(dia.fullDate);
                                }}
                                className={`flex-none w-16 py-4 rounded-[24px] flex flex-col items-center justify-center transition-all duration-300 border ${
                                    fecha === dia.fullDate 
                                    ? 'bg-white text-black border-white shadow-xl scale-105 z-10' 
                                    : 'bg-white/5 border-white/5 text-slate-400'
                                }`}
                            >
                                <span className={`text-[9px] font-black uppercase mb-1 ${fecha === dia.fullDate ? 'opacity-60' : ''}`}>{dia.nombre}</span>
                                <span className="text-lg font-black">{dia.numero}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── 2. HORARIOS ── */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex gap-2 items-center">
                                <Sun size={16} className="text-amber-500" /> Turnos Mañana/Tarde
                            </h3>
                            {rentMode === 'franja' && selectedHora && !selectedHoraFin && (
                                <span className="text-[10px] text-indigo-400 font-black animate-pulse uppercase">Selecciona el horario final (HASTA)</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {horariosDiurnos.map((h, i) => {
                                const isSelected = selectedHora === h.hora || selectedHoraFin === h.hora || isInRange(h.hora);
                                return (
                                    <button 
                                        key={i}
                                        disabled={!h.disponible}
                                        onClick={() => handleSelectHora(h.hora)}
                                        className={`py-4 rounded-xl border transition-all active:scale-95 text-center relative overflow-hidden group flex flex-col items-center justify-center ${
                                            !h.disponible 
                                            ? 'bg-white/[0.02] border-transparent text-slate-700 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] z-10'
                                                : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <span className="font-black italic text-sm tracking-tighter uppercase">{h.hora}</span>
                                        {cancha?.capacidad && h.disponible && (
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Libres: {h.cuposDisponibles}</span>
                                        )}
                                        {!h.disponible && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Lock size={12} className="text-white/20" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex gap-2 items-center">
                            <Moon size={16} className="text-indigo-400" /> Turnos Noche
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            {horariosNocturnos.map((h, i) => {
                                const isSelected = selectedHora === h.hora || selectedHoraFin === h.hora || isInRange(h.hora);
                                return (
                                    <button 
                                        key={i}
                                        disabled={!h.disponible}
                                        onClick={() => handleSelectHora(h.hora)}
                                        className={`py-4 rounded-xl border transition-all active:scale-95 text-center relative overflow-hidden group flex flex-col items-center justify-center ${
                                            !h.disponible 
                                            ? 'bg-white/[0.02] border-transparent text-slate-700 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] z-10'
                                                : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <span className="font-black italic text-sm tracking-tighter uppercase">{h.hora}</span>
                                        {cancha?.capacidad && h.disponible && (
                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Libres: {h.cuposDisponibles}</span>
                                        )}
                                        {!h.disponible && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Lock size={12} className="text-white/20" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="pt-4">
                    <ReservationForm formData={formData} setFormData={setFormData} cancha={cancha} />
                </div>

                <section className="space-y-4">
                    <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex gap-2 items-center">
                        <CreditCard size={16} className="text-indigo-500" /> Forma de Pago
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {['Pagar en el complejo', 'Transferencia', 'MercadoPago'].map(method => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                    paymentMethod === method 
                                    ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                }`}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                                {paymentMethod === method && (
                                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── FLOATING ACTION BAR ── */}
            {selectedHora && (
                <div className="fixed bottom-0 left-0 right-0 p-6 z-50 animate-in slide-in-from-bottom-10 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent">
                    <div className="max-w-md mx-auto">
                        <div className="bg-[#111116]/95 backdrop-blur-xl border border-white/10 p-6 rounded-[35px] shadow-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{cancha?.nombre}</p>
                                    <h4 className="text-xl font-black italic text-white tracking-tighter leading-none">
                                        DESDE {selectedHora} HASTA {
                                            selectedHoraFin 
                                                ? (horarios[horarios.findIndex(h => h.hora === selectedHoraFin) + 1]?.hora || selectedHoraFin + ' (+1h)') 
                                                : (horarios[horarios.findIndex(h => h.hora === selectedHora) + 1]?.hora || selectedHora + ' (+1h)')
                                        }
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                                        <Timer size={10} /> {fecha} • Total: {getSelectedRange().length} horas
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-2xl font-black italic text-emerald-400 leading-none">
                                        ${calculateTotalPrice().toLocaleString()}
                                    </h4>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleBooking}
                                disabled={bookingLoading}
                                className="w-full bg-white text-black py-5 rounded-2xl font-black text-[12px] uppercase tracking-[2px] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <CalendarCheck size={18} />
                                        CONFIRMAR RESERVA
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}
