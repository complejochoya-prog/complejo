import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Users,
    CreditCard,
    Banknote,
    ArrowRightLeft,
    CheckCircle2,
    Activity,
    History,
    Play,
    StopCircle,
    Calendar,
    Trash2,
    Plus,
    Timer,
    FileText,
    ChevronDown,
    DollarSign
} from 'lucide-react';
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';
import { useCaja } from '../../caja/services/CajaContext';

// Timer Component for Active Sessions
function SessionTimer({ startTime, durationMins, status }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (status !== 'En curso' || !startTime) return;

        const interval = setInterval(() => {
            const start = new Date(startTime).getTime();
            const durationMs = durationMins * 60 * 1000;
            const end = start + durationMs;
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                const overdue = Math.abs(diff);
                const mins = Math.floor(overdue / (1000 * 60));
                const secs = Math.floor((overdue % (1000 * 60)) / 1000);
                setTimeLeft(`+ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            } else {
                const mins = Math.floor(diff / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMins, status]);

    if (status !== 'En curso') return <span className="text-[8px] opacity-30 italic">Esperando inicio...</span>;

    const isOverdue = timeLeft.startsWith('+');

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isOverdue ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-gold/10 border-gold/30 text-gold'}`}>
            <Timer size={10} className={isOverdue ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-black font-mono">{timeLeft}</span>
        </div>
    );
}

export default function InPersonRegistration() {
    const { businessInfo } = useConfig();
    const { currentCaja } = useCaja();
    const {
        resources,
        liveUsage,
        bookings,
        usageHistory,
        addLiveUsage,
        startLiveUsage,
        finishLiveUsage,
        timeSlots,
        checkAvailability,
        isSlotBlocked,
        getBlockReason
    } = useReservas();

    const activeResources = resources.filter(r => r.active !== false);

    const [selectedResourceId, setSelectedResourceId] = useState(activeResources[0]?.id || 'futbol');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [peopleCount, setPeopleCount] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showManualForm, setShowManualForm] = useState(false);
    // New states
    const [rentalMode, setRentalMode] = useState('hora'); // 'hora' | 'franja'
    const [endSlot, setEndSlot] = useState(timeSlots[1] || '09:00');
    const [observations, setObservations] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

    // Auto-calculate duration when franja mode changes
    const calculateFranjaDuration = () => {
        if (rentalMode !== 'franja') return selectedDuration;
        const startH = parseInt(selectedSlot.split(':')[0], 10);
        const startM = parseInt(selectedSlot.split(':')[1], 10);
        const endH = parseInt(endSlot.split(':')[0], 10);
        const endM = parseInt(endSlot.split(':')[1], 10);
        let diff = (endH * 60 + endM) - (startH * 60 + startM);
        if (diff <= 0) diff += 24 * 60; // Handle cross-midnight
        return diff / 60;
    };

    const computedDuration = rentalMode === 'franja' ? calculateFranjaDuration() : selectedDuration;

    const selectedResource = activeResources.find(r => r.id === selectedResourceId);

    // Determine if selected slot is diurno or nocturno
    const selectedHourNum = parseInt(selectedSlot?.split(':')[0] || '0', 10);
    const isDiurno = selectedHourNum >= 8 && selectedHourNum < 19;

    // Use resource-specific day/night pricing
    const getResourceHourPrice = () => {
        if (!selectedResource) return 0;
        if (selectedResource.priceDiurno !== undefined && selectedResource.precioNocturno !== undefined) {
            return isDiurno ? selectedResource.priceDiurno : selectedResource.precioNocturno;
        }
        return selectedResource.price || 0;
    };

    const hourPrice = getResourceHourPrice();
    const computedPrice = hourPrice * computedDuration;

    // Helper: does a liveUsage session overlap with slotHour?
    const isLiveOverlapping = (session, hourStr) => {
        const slotNum = parseInt(hourStr.split(':')[0], 10);
        const sessionStartNum = parseInt(session.slot.split(':')[0], 10);
        const sessionEndNum = sessionStartNum + (session.duration || 1);
        return slotNum >= sessionStartNum && slotNum < sessionEndNum;
    };

    // Helper: does an online booking overlap with slotHour?
    const isBookingOverlapping = (booking, hourStr) => {
        if (booking.rentalMode === 'hora' && booking.time === hourStr) return true;
        if (booking.rentalMode === 'franja' && hourStr >= booking.time && hourStr < booking.endTime) return true;
        return false;
    };

    // Business Logic: Exclusivity & Availability
    const isQuinchoOccupied = (slotHour, dateStr) => {
        const quinchoLive = liveUsage.some(u =>
            u.resourceId === 'quincho' &&
            u.date === dateStr &&
            u.status !== 'finished' &&
            isLiveOverlapping(u, slotHour)
        );
        const quinchoOnline = bookings.some(b =>
            b.resource?.name === 'Quincho' &&
            b.fullDate === dateStr &&
            b.status !== 'Cancelado' &&
            isBookingOverlapping(b, slotHour)
        );
        return quinchoLive || quinchoOnline;
    };

    const getPoolOccupancy = (slotHour, dateStr) => {
        const liveCount = liveUsage
            .filter(u => u.resourceId === 'piscina' && u.date === dateStr && u.status !== 'finished' && isLiveOverlapping(u, slotHour))
            .reduce((acc, curr) => acc + (parseInt(curr.peopleCount) || 1), 0);

        const onlineCount = bookings
            .filter(b => b.resource?.name === 'Piscina' && b.fullDate === dateStr && b.status !== 'Cancelado' && isBookingOverlapping(b, slotHour))
            .reduce((acc) => acc + 1, 0);

        return liveCount + onlineCount;
    };

    const isResourceAvailable = (resId, slotHour, dateStr) => {
        const resourceObj = resources.find(r => r.id === resId);

        if (resId === 'piscina') {
            const currentUsers = getPoolOccupancy(slotHour, dateStr);
            if (currentUsers >= (resourceObj?.capacity || 10)) return false;
            // Quincho exclusivity usually means pool is closed or limited
            if (isQuinchoOccupied(slotHour, dateStr)) return false;
            return true;
        }

        // Use shared logic for general resources
        return checkAvailability(resId, dateStr, slotHour);
    };

    const handleRegister = async () => {
        if (isSubmitting) return;
        if (!clientName) return alert("Por favor, ingrese el nombre del cliente");
        if (!currentCaja) return alert("❌ Debe abrir caja para poder registrar pagos/señas.");

        setIsSubmitting(true);
        setSubmitStatus(null);

        const resource = activeResources.find(r => r.id === selectedResourceId);
        if (!resource) {
            setIsSubmitting(false);
            return alert("Seleccione un espacio válido");
        }

        // Validate franja
        if (rentalMode === 'franja' && computedDuration <= 0) {
            setIsSubmitting(false);
            return alert("La hora de fin debe ser posterior a la hora de inicio");
        }

        // Validate people count for pool
        if (selectedResourceId === 'piscina') {
            const count = parseInt(peopleCount);
            if (count < 1) {
                setIsSubmitting(false);
                return alert("Ingrese una cantidad de personas válida");
            }
            if (count > (resource?.capacity || 10)) {
                setIsSubmitting(false);
                return alert(`La cantidad de personas excede la capacidad máxima de la piscina (${resource?.capacity || 10})`);
            }
        }

        // Compute end slot
        const finalEndSlot = rentalMode === 'franja' ? endSlot : (() => {
            const startH = parseInt(selectedSlot.split(':')[0], 10);
            const startM = parseInt(selectedSlot.split(':')[1], 10);
            const totalMin = startH * 60 + startM + selectedDuration * 60;
            const endH = Math.floor(totalMin / 60) % 24;
            const endM = totalMin % 60;
            return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        })();

        // Validation across the entire duration
        const startHourInt = parseInt(selectedSlot.split(':')[0], 10);
        const hoursToCheck = Math.ceil(computedDuration);
        for (let i = 0; i < hoursToCheck; i++) {
            const checkHour = `${(startHourInt + i).toString().padStart(2, '0')}:00`;

            // Check schedule blocks first
            if (isSlotBlocked(selectedResourceId, selectedDate, checkHour)) {
                const reason = getBlockReason(selectedResourceId, selectedDate, checkHour);
                setIsSubmitting(false);
                return alert(`Horario bloqueado a las ${checkHour}: ${reason || 'No disponible'}`);
            }

            if (selectedResourceId === 'piscina') {
                const current = getPoolOccupancy(checkHour, selectedDate);
                if (current + parseInt(peopleCount) > (resource?.capacity || 10)) {
                    setIsSubmitting(false);
                    return alert(`Capacidad de piscina excedida para las ${checkHour} (Máximo ${resource?.capacity || 10} personas)`);
                }
                if (isQuinchoOccupied(checkHour, selectedDate)) {
                    setIsSubmitting(false);
                    return alert(`No se puede reservar piscina a las ${checkHour} because the Quincho está reservado.`);
                }
            } else {
                if (!isResourceAvailable(selectedResourceId, checkHour, selectedDate)) {
                    setIsSubmitting(false);
                    return alert(`El recurso no está disponible a las ${checkHour}`);
                }
            }
        }

        // REAL-TIME BLOCKING: Check if there's an active shift in this space right now
        // This includes both Online bookings and LiveUsage sessions
        const isCurrentlyOccupied = liveUsage.some(u => u.resourceId === selectedResourceId && u.status === 'active') ||
            bookings.some(b => b.resource?.id === selectedResourceId && b.status === 'En curso');

        if (isCurrentlyOccupied) {
            setIsSubmitting(false);
            return alert("❌ Este espacio ya se encuentra ocupado por un turno en curso.");
        }

        try {
            await addLiveUsage({
                resourceId: selectedResourceId,
                resourceName: resource.name,
                clientName,
                clientPhone,
                peopleCount: selectedResourceId === 'piscina' ? parseInt(peopleCount) : null,
                slot: selectedSlot,
                endSlot: finalEndSlot,
                date: selectedDate,
                duration: computedDuration * 60, // Convert hours to minutes
                rentalMode,
                paymentMethod,
                totalPrice: computedPrice,
                observations: observations.trim() || null,
                status: 'pending', // Decoupled: Starts as pending
                actualStartTime: null, // Timer will start only when admin clicks "Start"
            }, {
                amount: computedPrice,
                method: paymentMethod
            });

            setSubmitStatus('success');
            setClientName('');
            setClientPhone('');
            setObservations('');
            setPeopleCount(1);

            // Re-enable after 2 seconds
            setTimeout(() => {
                setIsSubmitting(false);
                setSubmitStatus(null);
            }, 2000);

        } catch (error) {
            console.error("Error saving live usage:", error);
            setSubmitStatus('error');
            setIsSubmitting(false);
        }
    };

    const activeSessions = liveUsage.filter(u => u.status !== 'finished' && u.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        REGISTRO <span className="text-gold">PRESENCIAL</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Caja y Gestión de Disponibilidad Directa</p>
                </div>
                <div className="flex items-center gap-2 bg-action-green/10 border border-action-green/30 px-3 py-1.5 rounded-full">
                    <span className="size-2 rounded-full bg-action-green animate-pulse"></span>
                    <span className="text-[8px] font-black text-action-green uppercase tracking-widest">Sincronización Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Registration Form */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Space Selection + Date */}
                    <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                                <MapPin size={14} className="text-gold" />
                                Espacio / Cancha
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Space Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Seleccionar Espacio</label>
                                <div className="relative">
                                    <select
                                        value={selectedResourceId}
                                        onChange={(e) => setSelectedResourceId(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold appearance-none outline-none focus:border-gold/50 text-white cursor-pointer"
                                    >
                                        {activeResources.map(res => (
                                            <option key={res.id} value={res.id} className="bg-slate-900 text-white">
                                                {res.name} — ${res.price?.toLocaleString()}/h
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
                                </div>
                            </div>
                            {/* Date Calendar */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Fecha de Reserva</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-gold/50 text-white cursor-pointer"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Client Info + Time + Conditional Fields */}
                    <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-10">
                        {/* Client Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Nombre del Cliente</label>
                                <input
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold transition-all outline-none focus:border-gold/50 text-white"
                                    placeholder="Nombre o Equipo..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">WhatsApp</label>
                                <input
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold transition-all outline-none focus:border-gold/50 text-white"
                                    placeholder="+54 9 ..."
                                />
                            </div>
                        </div>

                        {/* Rental Mode Selection */}
                        <div className="space-y-4">
                            <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 italic flex items-center gap-2">
                                <Clock size={12} className="text-gold" />
                                Tipo de Alquiler
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setRentalMode('hora')}
                                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${rentalMode === 'hora'
                                        ? 'bg-gold/10 border-gold text-gold ring-1 ring-gold'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    <Timer size={20} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Por Hora</span>
                                    <span className="text-[7px] text-slate-500">Seleccionar inicio + duración</span>
                                </button>
                                <button
                                    onClick={() => setRentalMode('franja')}
                                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${rentalMode === 'franja'
                                        ? 'bg-gold/10 border-gold text-gold ring-1 ring-gold'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    <Clock size={20} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Por Franja</span>
                                    <span className="text-[7px] text-slate-500">Seleccionar desde — hasta</span>
                                </button>
                            </div>
                        </div>

                        {/* Time Selection - depends on rental mode */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                                    <Clock size={14} className="text-gold" />
                                    {rentalMode === 'hora' ? 'Horarios Disponibles' : 'Seleccionar Rango'}
                                </h3>
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                                    {selectedResourceId === 'piscina' ? 'Basado en capacidad' : 'Exclusividad total'}
                                </p>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {timeSlots.map(slot => {
                                    const blocked = isSlotBlocked(selectedResourceId, selectedDate, slot);
                                    const blockReason = blocked ? getBlockReason(selectedResourceId, selectedDate, slot) : null;
                                    const available = !blocked && isResourceAvailable(selectedResourceId, slot, selectedDate);
                                    const isSelected = rentalMode === 'hora'
                                        ? selectedSlot === slot
                                        : (selectedSlot === slot || endSlot === slot);

                                    // Range logic for visualization
                                    let isInRange = false;
                                    if (rentalMode === 'franja' && selectedSlot && endSlot) {
                                        const startIdx = timeSlots.indexOf(selectedSlot);
                                        const endIdx = timeSlots.indexOf(endSlot);
                                        const currentIdx = timeSlots.indexOf(slot);
                                        if (startIdx !== -1 && endIdx !== -1) {
                                            const min = Math.min(startIdx, endIdx);
                                            const max = Math.max(startIdx, endIdx);
                                            isInRange = currentIdx >= min && currentIdx <= max;
                                        }
                                    }

                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => {
                                                if (!available) {
                                                    alert(`❌ "${slot} HS" no está disponible (ocupado por otra reserva).`);
                                                    return;
                                                }
                                                if (rentalMode === 'hora') {
                                                    setSelectedSlot(slot);
                                                } else {
                                                    if (!selectedSlot || (selectedSlot && endSlot)) {
                                                        setSelectedSlot(slot);
                                                        setEndSlot(null);
                                                    } else {
                                                        setEndSlot(slot);
                                                    }
                                                }
                                            }}
                                            className={`relative group py-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1
                                                ${!available
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-500 cursor-not-allowed opacity-60'
                                                    : isSelected || isInRange
                                                        ? 'bg-gold/20 border-gold text-gold ring-1 ring-gold shadow-lg shadow-gold/10 scale-105 z-10'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-gold/50 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-[10px] font-black italic">{slot}</span>
                                            <span className={`text-[6px] font-bold uppercase tracking-tighter ${!available ? 'text-red-500/60' : 'text-slate-600 group-hover:text-gold/60'}`}>
                                                {blocked ? (blockReason || 'Bloqueado') : (!available ? 'Ocupado' : 'Libre')}
                                            </span>
                                            {!available && (
                                                <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg">
                                                    <div className="size-1 bg-white rounded-full" />
                                                </div>
                                            )}
                                            {available && (isSelected || isInRange) && (
                                                <CheckCircle2 size={10} className="absolute -top-1 -right-1 text-gold" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {rentalMode === 'hora' ? (
                                <div className="space-y-2 mt-6">
                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Duración del Turno</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[0.5, 1, 1.5, 2, 3].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setSelectedDuration(d)}
                                                className={`py-3 rounded-xl border text-[10px] font-black italic transition-all ${selectedDuration === d
                                                    ? 'bg-gold/20 border-gold text-gold'
                                                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                                            >
                                                {d === 0.5 ? '30M' : `${d}H`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-3xl">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Desde</p>
                                            <p className="text-sm font-black text-white italic">{selectedSlot ? `${selectedSlot} HS` : '--:--'}</p>
                                        </div>
                                        <ArrowRightLeft size={16} className="text-gold opacity-30" />
                                        <div className="text-center">
                                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Hasta</p>
                                            <p className="text-sm font-black text-white italic">{endSlot ? `${endSlot} HS` : '--:--'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gold/10 border border-gold/20 rounded-2xl px-6 py-2">
                                        <Timer size={14} className="text-gold" />
                                        <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                                            {computedDuration > 0 ? `${computedDuration} hora${computedDuration !== 1 ? 's' : ''}` : 'Seleccione Rango'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* People Count - ONLY for Piscina */}
                        {selectedResourceId === 'piscina' && (
                            <div className="space-y-2 animate-in slide-in-from-top duration-300">
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                    <Users size={12} className="text-gold" />
                                    Cantidad de Personas
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={peopleCount}
                                        onChange={(e) => setPeopleCount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-gold/50 text-white"
                                        min="1"
                                        max={selectedResource?.capacity || 10}
                                    />
                                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[7px] font-black text-gold uppercase tracking-widest pl-2">
                                        Capacidad máxima: {selectedResource?.capacity || 10} personas
                                    </p>
                                    <span className="text-[7px] text-slate-500">|</span>
                                    <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest">
                                        Ocupación actual: {getPoolOccupancy(selectedSlot, selectedDate)} / {selectedResource?.capacity || 10}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Observations */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                <FileText size={12} className="text-gold" />
                                Observaciones (Opcional)
                            </label>
                            <textarea
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold transition-all outline-none focus:border-gold/50 text-white resize-none"
                                placeholder="Notas adicionales..."
                                rows={2}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-4">
                            <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 italic">Método de Pago</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'cash', label: 'Efectivo', icon: Banknote },
                                    { id: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
                                    { id: 'card', label: 'Tarjeta', icon: CreditCard }
                                ].map(method => {
                                    const Icon = method.icon;
                                    const isActive = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 ${isActive
                                                ? 'bg-white/5 border-gold text-gold ring-1 ring-gold'
                                                : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/20'
                                                }`}
                                        >
                                            <Icon size={24} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-2xl px-8 py-5">
                            <div className="flex items-center gap-3">
                                <DollarSign size={20} className="text-gold" />
                                <div>
                                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Precio Total</p>
                                    <p className="text-[8px] text-slate-500 mt-0.5">
                                        {selectedResource?.name} × {computedDuration}h × ${selectedResource?.price?.toLocaleString()}/h
                                    </p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-gold">${computedPrice.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={isSubmitting}
                            className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest italic flex items-center justify-center gap-3 shadow-2xl transition-all ${isSubmitting ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-gold text-slate-950 shadow-gold/20 hover:scale-[1.01]'}`}
                        >
                            {isSubmitting ? (
                                <>Procesando...</>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Registrar Alquiler Presencial
                                </>
                            )}
                        </button>

                        {/* Success/Error Alerts */}
                        {submitStatus === 'success' && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-in zoom-in duration-300">
                                <p className="text-xs font-black text-green-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> ✅ Alquiler registrado con éxito
                                </p>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-in shake duration-300">
                                <p className="text-xs font-black text-red-500 uppercase tracking-widest text-center">
                                    ❌ Error al registrar el alquiler. Intente nuevamente.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col h-full space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest italic leading-none text-white">
                                <Activity size={16} className="text-red-500 inline mr-2" />
                                En Juego Ahora
                            </h3>
                            <button
                                onClick={() => setShowManualForm(!showManualForm)}
                                className="bg-white/5 p-2 rounded-xl text-gold hover:bg-white/10 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {showManualForm && (
                            <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 space-y-4 animate-in slide-in-from-top duration-300">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gold italic">Agregar Sesión Manual</p>
                                <div className="space-y-2">
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none"
                                        placeholder="Nombre del Cliente..."
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                                const name = e.target.value;
                                                if (!name) return;
                                                const res = activeResources[0];
                                                await addLiveUsage({
                                                    resourceId: res.id,
                                                    resourceName: res.name,
                                                    clientName: name,
                                                    peopleCount: null,
                                                    slot: 'Manual',
                                                    date: new Date().toISOString().split('T')[0],
                                                    duration: 1,
                                                    rentalMode: 'hora',
                                                    paymentMethod: 'cash',
                                                    totalPrice: res.price
                                                });
                                                e.target.value = '';
                                                setShowManualForm(false);
                                            }
                                        }}
                                    />
                                    <p className="text-[6px] text-slate-500 uppercase font-bold italic">Presiona ENTER para agregar rápido ({activeResources[0]?.name} - 1h)</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
                            {activeSessions.map(session => (
                                <div key={session.id} className="p-6 rounded-2xl bg-slate-900 border border-white/5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">{session.resourceName}</p>
                                            <h4 className="text-sm font-black italic uppercase tracking-tighter leading-none text-white">{session.clientName}</h4>
                                            <p className="text-[7px] text-slate-500 font-bold uppercase mt-1">
                                                {session.rentalMode === 'franja' ? `${session.slot} — ${session.endSlot}` : `${session.slot} HS`}
                                                <span className="mx-2 opacity-20">|</span>
                                                {session.duration}H
                                                {session.peopleCount && (
                                                    <>
                                                        <span className="mx-2 opacity-20">|</span>
                                                        {session.peopleCount} PERS
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest mb-2 ${session.status === 'En curso' ? 'bg-action-green/20 text-action-green' : 'bg-amber-500/20 text-amber-500'}`}>
                                                {session.status === 'En curso' ? '🟢 EN USO' : '🟡 PENDIENTE'}
                                            </div>
                                            <SessionTimer startTime={session.actualStartTime} durationMins={session.duration} status={session.status} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-3">
                                        {session.status === 'pending' ? (
                                            <button
                                                onClick={() => startLiveUsage(session.id, session.duration)}
                                                className="flex-1 bg-action-green text-slate-950 py-2.5 rounded-xl text-[8px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all"
                                            >
                                                <Play size={12} fill="currentColor" /> Iniciar Uso
                                            </button>
                                        ) : (
                                            <button onClick={() => finishLiveUsage(session.id)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-[8px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-red-500 transition-all">
                                                <StopCircle size={12} fill="currentColor" /> Finalizar Uso
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {activeSessions.length === 0 && (
                                <div className="text-center py-10 opacity-30">
                                    <Activity size={24} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad actual</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="xl:col-span-12">
                    <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6 text-white">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                                <History size={14} className="text-gold" />
                                Historial de Usos
                            </h3>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Últimos 20 registros</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-600">
                                        <th className="py-4 px-4">Recurso</th>
                                        <th className="py-4 px-4">Cliente</th>
                                        <th className="py-4 px-4">Fecha</th>
                                        <th className="py-4 px-4">Tipo</th>
                                        <th className="py-4 px-4">Horario</th>
                                        <th className="py-4 px-4">Horas</th>
                                        <th className="py-4 px-4">Personas</th>
                                        <th className="py-4 px-4">Obs.</th>
                                        <th className="py-4 px-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usageHistory.slice(0, 20).map(item => (
                                        <tr key={item.id} className="border-b border-white/5 text-[10px] font-bold text-slate-400 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-4 uppercase italic tracking-tighter text-white">{item.resourceName}</td>
                                            <td className="py-4 px-4 uppercase">{item.clientName}</td>
                                            <td className="py-4 px-4">{item.date}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${item.rentalMode === 'franja' ? 'bg-blue-500/20 text-blue-400' : 'bg-gold/20 text-gold'
                                                    }`}>
                                                    {item.rentalMode === 'franja' ? 'Franja' : 'Hora'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {item.rentalMode === 'franja'
                                                    ? `${item.slot} — ${item.endSlot}`
                                                    : `${item.slot} HS`
                                                }
                                            </td>
                                            <td className="py-4 px-4">{item.duration}h</td>
                                            <td className="py-4 px-4">{item.peopleCount || '–'}</td>
                                            <td className="py-4 px-4 max-w-[120px] truncate" title={item.observations || ''}>{item.observations || '–'}</td>
                                            <td className="py-4 px-4 text-right text-gold font-black">${item.totalPrice?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {usageHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="py-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                                No hay registros históricos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
