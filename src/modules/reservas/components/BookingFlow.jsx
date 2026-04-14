import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    Info,
    CheckCircle2,
    AlertCircle,
    Waves,
    UtensilsCrossed,
    Trophy,
    Activity,
    LayoutGrid,
    Clock,
    Timer,
    Sun,
    Moon
} from 'lucide-react';

const ICON_MAP = {
    'Fútbol 5': Trophy,
    'Cancha de Fútbol': Trophy,
    'Vóley': Activity,
    'Cancha de Vóley': Activity,
    'Piscina': Waves,
    'Quincho': UtensilsCrossed,
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function BookingFlow() {
    const { businessInfo } = useConfig();
    const { resources, blockedSlots, isSlotBlocked, getBlockReason, getAvailableSlots, getSlotPrice, getResourcePrice, bookings, liveUsage, checkAvailability, timeSchedule } = useReservas();
    const location = useLocation();

    const today = new Date();
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Deportes');
    // selectedDate is a JS Date object
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState(null); // full slot object
    const [peopleCount, setPeopleCount] = useState(1);

    // Range mode
    const [rentalMode, setRentalMode] = useState('hora'); // 'hora' | 'franja'
    const [startSlot, setStartSlot] = useState(null);
    const [endSlot, setEndSlot] = useState(null);

    // Pre-select resource passed from Home page
    useEffect(() => {
        if (location.state?.preselectedResource) {
            const pre = location.state.preselectedResource;
            const match = resources.find(r =>
                r.id === pre.id || r.name.toLowerCase() === pre.name.toLowerCase()
            );
            if (match) {
                setSelectedResource(match);
                setSelectedCategory(match.category);
            } else {
                setSelectedResource(pre);
            }
        }
    }, [location.state, resources]);


    const categories = [...new Set(resources.filter(r => r.active).map(r => r.category))];

    // Build calendar: next 14 days from today
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Padding for first week
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    }, [currentMonthDate]);

    const handleNextMonth = () => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handlePrevMonth = () => {
        setCurrentMonthDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            // Don't let them go before current month
            if (newDate < new Date(today.getFullYear(), today.getMonth(), 1)) return prev;
            return newDate;
        });
    };

    // Available slots for the selected date (from admin schedule)
    const availableScheduleSlots = useMemo(() => {
        if (!timeSchedule || timeSchedule.length === 0) return [];
        let slots = getAvailableSlots(selectedDate);
        // Filter by resource's available hours
        if (selectedResource?.availableHours) {
            slots = slots.filter(s => selectedResource.availableHours.includes(s.hour));
        }
        return slots;
    }, [timeSchedule, selectedDate, getAvailableSlots, selectedResource]);

    const getSlotStatus = (slotHour) => {
        if (!selectedResource) return 'Disponible';
        const dateStr = selectedDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        // 1. Time Validation for 'Today'
        if (dateStr === todayStr) {
            const currentHour = today.getHours();
            const slotHourNum = parseInt(slotHour.split(':')[0], 10);
            if (slotHourNum <= currentHour) {
                return 'Pasado';
            }
        }

        // Manual Blocks
        if (isSlotBlocked(selectedResource.id, dateStr, slotHour)) {
            const reason = getBlockReason(selectedResource.id, dateStr, slotHour);
            return reason ? `Bloqueado: ${reason}` : 'Bloqueado';
        }

        // Real Firebase Bookings & Live Usage check
        // Find existing non-cancelled bookings for THIS resource on THIS date
        const existingBookings = bookings.filter(b =>
            b.resource?.id === selectedResource.id &&
            b.fullDate === dateStr &&
            b.status !== 'Cancelado'
        );

        // Find existing liveUsage sessions for THIS resource on THIS date
        // Note: liveUsage duration could span multiple hours. We check overlapping logic.
        const existingLive = liveUsage.filter(u =>
            u.resourceId === selectedResource.id &&
            u.date === dateStr &&
            u.status !== 'finished'
        );

        // Helper: does a liveUsage session overlap with slotHour?
        const isLiveOverlapping = (session, hourStr) => {
            const slotNum = parseInt(hourStr.split(':')[0], 10);
            const sessionStartNum = parseInt(session.slot.split(':')[0], 10);
            const sessionEndNum = sessionStartNum + (session.duration || 1);
            return slotNum >= sessionStartNum && slotNum < sessionEndNum; // slot length is 1hr
        };

        // Special logic for Piscina (summing people up)
        if (selectedResource.name === 'Piscina') {
            // First check if Quincho is fully booked (exclusive rule)
            // Check online bookings for Quincho
            const quinchoBookings = bookings.filter(b =>
                b.resource?.name === 'Quincho' &&
                b.fullDate === dateStr &&
                b.status !== 'Cancelado' &&
                (
                    (b.rentalMode === 'hora' && b.time === slotHour) ||
                    (b.rentalMode === 'franja' && slotHour >= b.time && slotHour < b.endTime)
                )
            );
            // Check liveUsage for Quincho
            const quinchoLive = liveUsage.filter(u =>
                u.resourceId === 'quincho' &&
                u.date === dateStr &&
                u.status !== 'finished' &&
                isLiveOverlapping(u, slotHour)
            );

            if (quinchoBookings.length > 0 || quinchoLive.length > 0) return 'Bloqueado por Evento';

            // Otherwise sum up total people in Piscina for this hour
            let currentCount = existingBookings.reduce((sum, b) => {
                const isOverlapping =
                    (b.rentalMode === 'hora' && b.time === slotHour) ||
                    (b.rentalMode === 'franja' && slotHour >= b.time && slotHour < b.endTime);
                // Assume 1 person per online booking currently
                return isOverlapping ? sum + 1 : sum;
            }, 0);

            // Add liveUsage people count
            currentCount += existingLive.reduce((sum, session) => {
                return isLiveOverlapping(session, slotHour) ? sum + (parseInt(session.peopleCount) || 1) : sum;
            }, 0);

            if (currentCount >= (selectedResource.capacity || 10)) return 'Ocupado';
            if (currentCount > (selectedResource.capacity || 10) - 3) return 'Últimos Lugares';
            return 'Disponible';
        }

        // Standard logic for Courts/Quincho (strict 1 per time)
        if (!checkAvailability(selectedResource.id, dateStr, slotHour)) return 'Ocupado';

        return 'Disponible';
    };

    // Price for a slot object — use resource-specific day/night pricing
    const getPrice = (slot) => {
        if (!slot || !selectedResource) return 0;
        // Use resource-specific pricing
        const hourNum = parseInt(slot.hour.split(':')[0], 10);
        const isDiurno = hourNum >= 8 && hourNum < 19;
        if (selectedResource.priceDiurno !== undefined && selectedResource.precioNocturno !== undefined) {
            const base = isDiurno ? selectedResource.priceDiurno : selectedResource.precioNocturno;
            if (selectedResource.name === 'Piscina') return base * peopleCount;
            return base;
        }
        // Fallback to global slot price
        const base = getSlotPrice(slot);
        if (selectedResource.name === 'Piscina') return base * peopleCount;
        return base;
    };

    // For franja mode: slots between start and end
    const rangeSlots = useMemo(() => {
        if (rentalMode !== 'franja' || !startSlot || !endSlot) return [];
        const startIdx = availableScheduleSlots.findIndex(s => s.hour === startSlot.hour);
        const endIdx = availableScheduleSlots.findIndex(s => s.hour === endSlot.hour);
        if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return [];
        return availableScheduleSlots.slice(startIdx, endIdx);
    }, [rentalMode, startSlot, endSlot, availableScheduleSlots]);

    const hoursCount = useMemo(() => {
        if (rentalMode === 'hora') return 1;
        return rangeSlots.length;
    }, [rentalMode, rangeSlots]);

    // Total price for franja: sum of each slot's price
    const rangePrice = useMemo(() => {
        if (rentalMode === 'hora') return selectedSlot ? getPrice(selectedSlot) : 0;
        if (rangeSlots.length === 0) return 0;
        return rangeSlots.reduce((acc, slot) => acc + getPrice(slot), 0);
    }, [rentalMode, selectedSlot, rangeSlots, selectedResource, peopleCount]);

    const rangeAllAvailable = useMemo(() => {
        return rangeSlots.length > 0 && rangeSlots.every(s => {
            const st = getSlotStatus(s.hour);
            return st === 'Disponible' || st === 'Últimos Lugares';
        });
    }, [rangeSlots, selectedResource, selectedDate]);

    const hasValidSelection = rentalMode === 'hora'
        ? !!selectedSlot
        : (hoursCount > 0 && rangeAllAvailable);

    const currentPrice = rangePrice;

    const displayTime = rentalMode === 'hora'
        ? selectedSlot?.hour
        : (startSlot && endSlot ? `${startSlot.hour} - ${endSlot.hour}` : null);

    // The slot type for single-hour mode
    const activeSlotType = rentalMode === 'hora'
        ? selectedSlot?.type
        : (rangeSlots.length > 0 ? rangeSlots[0]?.type : null);

    const handleModeChange = (mode) => {
        setRentalMode(mode);
        setSelectedSlot(null);
        setStartSlot(null);
        setEndSlot(null);
    };

    const handleResourceSelect = (res) => {
        setSelectedResource(res);
        setSelectedSlot(null);
        setStartSlot(null);
        setEndSlot(null);
    };

    // Day of week for selected date
    const selectedDayName = DAY_NAMES[selectedDate.getDay()];
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 5 || selectedDate.getDay() === 6;

    const confirmState = {
        resource: selectedResource,
        date: selectedDate.getDate(),
        fullDate: selectedDate.toISOString().split('T')[0],
        dayOfWeek: selectedDayName,
        isWeekend,
        time: rentalMode === 'hora' ? selectedSlot?.hour : startSlot?.hour,
        endTime: rentalMode === 'hora' ? selectedSlot?.hour : endSlot?.hour,
        price: currentPrice,
        rentalMode,
        hoursCount,
        displayTime,
        slotType: activeSlotType,
        appliedPrice: currentPrice,
        priceDiurno: selectedSlot?.priceDiurno,
        precioNocturno: selectedSlot?.precioNocturno,
    };

    return (
        <div className="min-h-screen bg-slate-950 font-inter text-white pb-40 overflow-x-hidden">
            <header className="px-6 py-10 space-y-2 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/home" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">RESERVAR <span className="text-gold">TURNO</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Paso {selectedResource ? (hasValidSelection ? '3' : '2') : '1'} de 3
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">
                {/* Paso 1: Selección de Espacio */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="flex-1 h-1.5 bg-gold rounded-full"></div>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full"></div>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full"></div>
                        <span className="text-[10px] font-black text-gold uppercase tracking-tighter italic">Paso 1 de 3</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gold">Selecciona tu espacio</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">¿Qué actividad vas a realizar hoy?</p>
                    </div>

                    <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-2xl w-fit border border-white/5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setSelectedResource(null); setSelectedSlot(null); setStartSlot(null); setEndSlot(null); }}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.filter(r => r.category === selectedCategory && r.active).map(res => {
                            const isSelected = selectedResource?.id === res.id;
                            const precioDiurnoStr = res.priceDiurno ? `$${res.priceDiurno.toLocaleString()}` : 'N/A';
                            const precioNocturnoStr = res.precioNocturno ? `$${res.precioNocturno.toLocaleString()}` : 'N/A';
                            
                            return (
                                <button
                                    key={res.id}
                                    onClick={() => handleResourceSelect(res)}
                                    className={`group relative p-8 rounded-[32px] text-left transition-all duration-300 border backdrop-blur-xl flex flex-col justify-between min-h-[160px] ${isSelected
                                        ? 'bg-gold/10 border-gold shadow-2xl shadow-gold/10'
                                        : 'bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-gold transition-colors">{res.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{res.desc || 'Instalación profesional'}</p>
                                        </div>
                                        {isSelected && <CheckCircle2 size={24} className="text-gold animate-in zoom-in" />}
                                    </div>
                                    
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Precios turno</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Sun size={12} className="text-amber-400" />
                                                    <span className="text-xs font-black italic tracking-tighter text-white/50">{precioDiurnoStr}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Moon size={12} className="text-indigo-400" />
                                                    <span className="text-xs font-black italic tracking-tighter text-white/50">{precioNocturnoStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gold/10 px-4 py-2 rounded-xl text-gold border border-gold/20 font-black italic uppercase tracking-tighter text-sm">
                                            Seleccionar
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {selectedResource && (
                    <>
                        {/* Step 2: Date & Time */}
                        <section className="space-y-8 animate-in slide-in-from-bottom duration-500">
                            <div className="flex items-center gap-4 px-2">
                                <div className="flex-1 h-1.5 bg-gold rounded-full"></div>
                                <div className="flex-1 h-1.5 bg-gold rounded-full"></div>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full"></div>
                                <span className="text-[10px] font-black text-gold uppercase tracking-tighter italic">Paso 2 de 3</span>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gold">Fecha y Horario</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    Hoy: {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())}
                                </p>
                            </div>

                            {/* Rental Mode Selector */}
                            <div className="flex gap-3 p-1.5 bg-white/[0.03] rounded-[20px] border border-white/5 w-fit">
                                <button
                                    onClick={() => handleModeChange('hora')}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-300 ${rentalMode === 'hora'
                                        ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Clock size={16} />
                                    <div className="text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest block leading-tight">Por Hora</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-70 block leading-tight">1 turno</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleModeChange('franja')}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-300 ${rentalMode === 'franja'
                                        ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Timer size={16} />
                                    <div className="text-left">
                                        <span className="text-[10px] font-black uppercase tracking-widest block leading-tight">Franja Horaria</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-70 block leading-tight">Múltiples horas</span>
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Calendar */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            disabled={currentMonthDate.getMonth() === today.getMonth() && currentMonthDate.getFullYear() === today.getFullYear()}
                                            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Days of week header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                                        <div key={day} className="text-center text-[8px] font-black uppercase tracking-widest text-slate-600">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((d, index) => {
                                        if (!d) return <div key={`empty-${index}`} className="aspect-square" />;

                                        const isSelected = selectedDate.toDateString() === d.toDateString();
                                        const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                        const isWknd = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;

                                        return (
                                            <button
                                                key={d.toISOString()}
                                                disabled={isPast}
                                                onClick={() => {
                                                    setSelectedDate(d);
                                                    setSelectedSlot(null);
                                                    setStartSlot(null);
                                                    setEndSlot(null);
                                                }}
                                                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative ${isSelected
                                                    ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                                    : isPast
                                                        ? 'opacity-20 cursor-not-allowed'
                                                        : 'hover:bg-white/10 text-slate-300 bg-white/[0.02]'
                                                    }`}
                                            >
                                                <span className="font-black">{d.getDate()}</span>
                                                {isWknd && !isPast && (
                                                    <div className={`absolute bottom-1 size-1 rounded-full ${isSelected ? 'bg-slate-900' : 'bg-purple-400'}`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Day type badge */}
                                <div className={`mt-4 px-4 py-2 rounded-2xl text-center ${isWeekend ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isWeekend ? 'text-purple-400' : 'text-blue-400'}`}>
                                        {isWeekend ? '🎉 Fin de semana' : '📅 Día de semana'}
                                    </span>
                                </div>
                            </div>

                            {/* Time slots */}
                            <div className="md:col-span-2 space-y-4">
                                {/* Available slots info */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        {availableScheduleSlots.length} franjas disponibles para el {selectedDayName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg">
                                            <Sun size={10} className="text-amber-400" />
                                            <span className="text-[8px] font-black text-amber-400 uppercase">Diurno</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 rounded-lg">
                                            <Moon size={10} className="text-indigo-400" />
                                            <span className="text-[8px] font-black text-indigo-400 uppercase">Nocturno</span>
                                        </div>
                                    </div>
                                </div>

                                {rentalMode === 'hora' ? (
                                    /* Single hour selection - Split into Día and Noche */
                                    <div className="space-y-8">
                                        {/* Día Section */}
                                        {availableScheduleSlots.filter(s => s.type === 'diurno').length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black italic uppercase tracking-tighter text-amber-500 flex items-center gap-2">
                                                    <span>🟡 Día</span>
                                                    <div className="h-px bg-amber-500/20 flex-1"></div>
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {availableScheduleSlots.filter(s => s.type === 'diurno').map(slot => {
                                                        const status = getSlotStatus(slot.hour);
                                                        const isSelected = selectedSlot?.hour === slot.hour;
                                                        const isDisabled = status === 'Ocupado' || status.startsWith('Bloqueado') || status === 'Pasado';
                                                        const price = getPrice(slot);

                                                        return (
                                                            <button
                                                                key={slot.hour}
                                                                disabled={isDisabled}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border overflow-hidden transition-all duration-300 ${isSelected
                                                                    ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20 text-slate-950 scale-105 z-10'
                                                                    : isDisabled
                                                                        ? 'bg-transparent border-dashed border-white/10 cursor-not-allowed opacity-40 hover:opacity-40'
                                                                        : 'bg-white/5 border-white/10 hover:border-amber-500/50 hover:bg-white/10 text-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className={`text-base font-black italic tracking-tighter`}>
                                                                        {slot.hour}
                                                                    </span>
                                                                </div>
                                                                {!isDisabled && (
                                                                    <span className={`text-[9px] font-black mt-1 ${isSelected ? 'text-slate-800' : 'text-amber-400'}`}>
                                                                        ${price.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                {isDisabled && (
                                                                    <span className={`text-[7px] font-bold uppercase tracking-widest mt-1 ${status === 'Pasado' ? 'text-red-400' : 'text-slate-500'}`}>{status}</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Noche Section */}
                                        {availableScheduleSlots.filter(s => s.type === 'nocturno').length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black italic uppercase tracking-tighter text-indigo-400 flex items-center gap-2">
                                                    <span>🌙 Noche</span>
                                                    <div className="h-px bg-indigo-500/20 flex-1"></div>
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {availableScheduleSlots.filter(s => s.type === 'nocturno').map(slot => {
                                                        const status = getSlotStatus(slot.hour);
                                                        const isSelected = selectedSlot?.hour === slot.hour;
                                                        const isDisabled = status === 'Ocupado' || status.startsWith('Bloqueado') || status === 'Pasado';
                                                        const price = getPrice(slot);

                                                        return (
                                                            <button
                                                                key={slot.hour}
                                                                disabled={isDisabled}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border overflow-hidden transition-all duration-300 ${isSelected
                                                                    ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white scale-105 z-10'
                                                                    : isDisabled
                                                                        ? 'bg-transparent border-dashed border-white/10 cursor-not-allowed opacity-40 hover:opacity-40'
                                                                        : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className={`text-base font-black italic tracking-tighter`}>
                                                                        {slot.hour}
                                                                    </span>
                                                                </div>
                                                                {!isDisabled && (
                                                                    <span className={`text-[9px] font-black mt-1 ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                                                        ${price.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                {isDisabled && (
                                                                    <span className={`text-[7px] font-bold uppercase tracking-widest mt-1 ${status === 'Pasado' ? 'text-red-400' : 'text-slate-500'}`}>{status}</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Time range selection */
                                    <div className="space-y-6">
                                        {/* From selector */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-green-400">▶</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desde</span>
                                                {startSlot && <span className="text-xs font-black italic text-gold ml-auto">{startSlot.hour}</span>}
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {availableScheduleSlots.map(slot => {
                                                    const status = getSlotStatus(slot.hour);
                                                    const isSelected = startSlot?.hour === slot.hour;
                                                    const isDisabled = status === 'Ocupado' || status.startsWith('Bloqueado') || status === 'Pasado';
                                                    const isDiurno = slot.type === 'diurno';
                                                    return (
                                                        <button
                                                            key={slot.hour}
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                setStartSlot(slot);
                                                                if (endSlot && availableScheduleSlots.findIndex(s => s.hour === endSlot.hour) <= availableScheduleSlots.findIndex(s => s.hour === slot.hour)) {
                                                                    setEndSlot(null);
                                                                }
                                                            }}
                                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${isSelected
                                                                ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20 text-slate-950 scale-105 z-10'
                                                                : isDisabled
                                                                    ? 'bg-transparent border-dashed border-white/10 cursor-not-allowed opacity-40'
                                                                    : isDiurno
                                                                        ? 'bg-amber-500/5 border-amber-500/10 hover:border-green-500/40 text-white'
                                                                        : 'bg-indigo-500/5 border-indigo-500/10 hover:border-green-500/40 text-white'
                                                                }`}
                                                        >
                                                            <span className={`text-sm font-black italic tracking-tighter ${isSelected ? 'text-slate-950' : isDisabled ? 'text-slate-600' : 'text-white'}`}>{slot.hour}</span>
                                                            <span className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'text-slate-800' : isDiurno ? 'text-amber-500/50' : 'text-indigo-500/50'}`}>
                                                                {isDiurno ? 'DÍA' : 'NOCHE'}
                                                            </span>
                                                            {!isDisabled && <span className={`text-[8px] font-black mt-0.5 ${isSelected ? 'text-green-950' : 'text-slate-500'}`}>${getPrice(slot).toLocaleString()}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* To selector */}
                                        {startSlot && (
                                            <div className="space-y-3 animate-in slide-in-from-bottom duration-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-red-400">■</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hasta</span>
                                                    {endSlot && <span className="text-xs font-black italic text-gold ml-auto">{endSlot.hour}</span>}
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {availableScheduleSlots
                                                        .filter(s => availableScheduleSlots.findIndex(x => x.hour === s.hour) > availableScheduleSlots.findIndex(x => x.hour === startSlot.hour))
                                                        .map(slot => {
                                                            const startIdx = availableScheduleSlots.findIndex(s => s.hour === startSlot.hour);
                                                            const thisIdx = availableScheduleSlots.findIndex(s => s.hour === slot.hour);
                                                            const intermediateSlots = availableScheduleSlots.slice(startIdx, thisIdx);
                                                            const allAvailable = intermediateSlots.every(s => {
                                                                const st = getSlotStatus(s.hour);
                                                                return st === 'Disponible' || st === 'Últimos Lugares';
                                                            });
                                                            const isSelected = endSlot?.hour === slot.hour;
                                                            const hours = thisIdx - startIdx;
                                                            const isDiurno = slot.type === 'diurno';
                                                            const totalRangePrice = intermediateSlots.reduce((acc, s) => acc + getPrice(s), 0);
                                                            return (
                                                                <button
                                                                    key={slot.hour}
                                                                    disabled={!allAvailable}
                                                                    onClick={() => setEndSlot(slot)}
                                                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${isSelected
                                                                        ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20 text-white scale-105 z-10'
                                                                        : !allAvailable
                                                                            ? 'bg-transparent border-dashed border-white/10 cursor-not-allowed opacity-40'
                                                                            : isDiurno
                                                                                ? 'bg-amber-500/5 border-amber-500/10 hover:border-red-400/40 text-white'
                                                                                : 'bg-indigo-500/5 border-indigo-500/10 hover:border-red-400/40 text-white'
                                                                        }`}
                                                                >
                                                                    <span className={`text-sm font-black italic tracking-tighter ${isSelected ? 'text-white' : !allAvailable ? 'text-slate-600' : 'text-white'}`}>{slot.hour}</span>
                                                                    <span className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 ${allAvailable ? isSelected ? 'text-red-200' : 'text-gold/60' : 'text-slate-600'}`}>
                                                                        {allAvailable ? `${hours}h · $${totalRangePrice.toLocaleString()}` : 'No disp.'}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Step 3: Resumen Final */}
                        {hasValidSelection && (
                            <section className="bg-gold/10 border border-gold/30 rounded-[40px] p-8 md:p-12 animate-in zoom-in duration-500 shadow-2xl shadow-gold/10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="size-20 rounded-[32px] bg-gold flex items-center justify-center shadow-2xl shadow-gold/30 transform -rotate-3 hover:rotate-0 transition-transform">
                                            {(() => { const I = ICON_MAP[selectedResource.name] || Trophy; return <I size={40} className="text-slate-950" />; })()}
                                        </div>
                                        <div className="space-y-2 text-center md:text-left">
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedResource.name}</h4>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] bg-gold/5 px-3 py-1.5 rounded-full border border-gold/20">
                                                    {selectedDayName} {selectedDate.getDate()} • {displayTime} HS
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                                    {hoursCount} {hoursCount === 1 ? 'hora' : 'horas'}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                {activeSlotType === 'diurno'
                                                    ? <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20"><Sun size={14} className="text-amber-400" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Diurno</span></div>
                                                    : <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><Moon size={14} className="text-indigo-400" /><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Nocturno</span></div>
                                                }
                                                <span className="text-3xl font-black italic tracking-tighter text-gold">${currentPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/reservation-confirm"
                                        state={confirmState}
                                        className="w-full md:w-auto px-12 py-6 bg-gold text-slate-950 font-black italic uppercase tracking-tighter rounded-[24px] hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-gold/20 flex items-center justify-center gap-3 group text-lg"
                                    >
                                        Siguiente Paso
                                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                    </Link>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
