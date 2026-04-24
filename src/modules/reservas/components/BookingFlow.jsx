import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';
import { fetchEspacios } from '../../admin/services/espaciosService';
import ReservationForm from '../../client_app/pages/ReservationForm';
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
    Moon,
    Users,
    MapPin,
    ArrowLeft,
    Share2,
    Heart,
    Star,
    CheckCircle,
    CreditCard,
    Check,
    CalendarCheck,
    Loader2
} from 'lucide-react';

const ICON_MAP = {
    'Fútbol 5': Trophy,
    'Cancha de Fútbol': Trophy,
    'Vóley': Activity,
    'Cancha de Vóley': Activity,
    'Piscina': Waves,
    'Quincho': UtensilsCrossed,
    'Padel': Activity,
};

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function BookingFlow() {
    const { negocioId } = useParams();
    const { businessInfo, config } = useConfig();
    const { 
        resources: contextResources, 
        getAvailableSlots, 
        bookings, 
        liveUsage, 
        checkAvailability, 
        timeSchedule,
        addBooking
    } = useReservas();
    
    const location = useLocation();
    const navigate = useNavigate();

    // Local state for spaces from service (for images/desc)
    const [serviceEspacios, setServiceEspacios] = useState([]);
    const [loadingEspacios, setLoadingEspacios] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchEspacios(negocioId);
                setServiceEspacios(data);
            } finally {
                setLoadingEspacios(false);
            }
        };
        load();
    }, [negocioId]);

    // Merge resources from context with images from service
    const resources = useMemo(() => {
        // 1. If we have real resources in context (Firestore), use them
        if (contextResources && contextResources.length > 0) {
            return contextResources.map(res => {
                const serviceMatch = serviceEspacios.find(s => 
                    s.id === res.id || s.title?.toLowerCase() === res.name?.toLowerCase()
                );
                return {
                    ...res,
                    active: res.active !== false,
                    img: res.img || serviceMatch?.img || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800',
                    desc: res.desc || serviceMatch?.desc || 'Instalación profesional de alta calidad.',
                    capacidad: res.capacidad || serviceMatch?.capacidad || null
                };
            });
        }
        
        // 2. FALLBACK: If Firestore is empty, use the mock/local spaces from the service
        return serviceEspacios.map(s => ({
            id: s.id,
            name: s.name || s.title, // Support both during migration
            category: s.category || 'Deportes',
            active: s.active !== false,
            img: s.img,
            desc: s.desc,
            priceDiurno: s.priceDiurno || 8000,
            precioNocturno: s.precioNocturno || 12000,
            capacidad: s.capacidad || null
        }));
    }, [contextResources, serviceEspacios]);

    const today = new Date();
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlot, setSelectedSlot] = useState(null); 
    const [rentalMode, setRentalMode] = useState('hora'); // 'hora' | 'franja'
    const [startSlot, setStartSlot] = useState(null);
    const [endSlot, setEndSlot] = useState(null);

    // Form data & Payment
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        cantidadPersonas: 1
    });
    const [paymentMethod, setPaymentMethod] = useState('Pagar en el complejo');
    const [bookingLoading, setBookingLoading] = useState(false);

    // Filter categories
    const categories = useMemo(() => {
        const cats = [...new Set(resources.filter(r => r.active).map(r => r.category || 'Recreación'))];
        return cats.length > 0 ? ['Todos', ...cats] : ['Todos'];
    }, [resources]);
    
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    useEffect(() => {
        if (categories.length > 0 && !categories.includes(selectedCategory)) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    // Pre-select resource
    const { fieldId } = useParams();
    useEffect(() => {
        const pre = location.state?.preselectedResource || (fieldId ? { id: fieldId } : null);
        if (pre) {
            const match = resources.find(r =>
                r.id === pre.id || r.name?.toLowerCase() === (pre.name || '').toLowerCase()
            );
            if (match) setSelectedResource(match);
        }
    }, [location.state, resources, fieldId]);

    // Calendar logic
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
        return days;
    }, [currentMonthDate]);

    // Time schedule slots
    const availableScheduleSlots = useMemo(() => {
        if (!timeSchedule || timeSchedule.length === 0) {
            const slots = [];
            for (let h = 8; h <= 23; h++) {
                slots.push({ hour: `${h}:00`, type: h >= 19 ? 'nocturno' : 'diurno', priceDiurno: 5000, precioNocturno: 7000 });
            }
            return slots;
        }
        let slots = (typeof getAvailableSlots === 'function') ? getAvailableSlots(selectedDate) : timeSchedule;
        if (selectedResource?.availableHours) slots = slots.filter(s => selectedResource.availableHours.includes(s.hour));
        return slots;
    }, [timeSchedule, selectedDate, getAvailableSlots, selectedResource]);

    const getSlotStatus = (slotHour) => {
        if (!selectedResource) return 'Disponible';
        const dateStr = selectedDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        if (dateStr === todayStr) {
            const currentHour = today.getHours();
            const slotHourNum = parseInt(slotHour.split(':')[0], 10);
            if (slotHourNum <= currentHour) return 'Pasado';
        }

        if (typeof checkAvailability === 'function') {
            const requestedAmount = parseInt(formData.cantidadPersonas) || 1;
            if (!checkAvailability(selectedResource.id, dateStr, slotHour, requestedAmount)) return 'Ocupado';
        }
        return 'Disponible';
    };

    const getPrice = (slot) => {
        if (!slot || !selectedResource) return 0;
        const hourNum = parseInt(slot.hour.split(':')[0], 10);
        const isDiurno = hourNum >= 8 && hourNum < 19;
        
        if (selectedResource.priceDiurno !== undefined && selectedResource.precioNocturno !== undefined) {
            const base = isDiurno ? selectedResource.priceDiurno : selectedResource.precioNocturno;
            if (selectedResource.name === 'Piscina') return base * formData.cantidadPersonas;
            return base;
        }
        return isDiurno ? (slot.priceDiurno || 5000) : (slot.precioNocturno || 7000);
    };

    const rangeSlots = useMemo(() => {
        if (rentalMode !== 'franja' || !startSlot || !endSlot) return [];
        const startIdx = availableScheduleSlots.findIndex(s => s.hour === startSlot.hour);
        const endIdx = availableScheduleSlots.findIndex(s => s.hour === endSlot.hour);
        if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return [];
        return availableScheduleSlots.slice(startIdx, endIdx);
    }, [rentalMode, startSlot, endSlot, availableScheduleSlots]);

    const hoursCount = rentalMode === 'hora' ? 1 : rangeSlots.length;
    const currentPrice = rentalMode === 'hora' ? (selectedSlot ? getPrice(selectedSlot) : 0) : rangeSlots.reduce((acc, slot) => acc + getPrice(slot), 0);
    
    const hasValidSelection = rentalMode === 'hora' ? !!selectedSlot : (hoursCount > 0);

    const handleBooking = async () => {
        if (!hasValidSelection || !selectedResource) return;
        if (!formData.nombre || !formData.apellido || !formData.telefono) {
            alert("Por favor completa tus datos de contacto.");
            return;
        }

        const dateStr = selectedDate.toISOString().split('T')[0];
        const timeStr = rentalMode === 'hora' ? selectedSlot.hour : `${startSlot.hour} - ${endSlot.hour}`;
        const requestedAmount = parseInt(formData.cantidadPersonas) || 1;

        if (rentalMode === 'hora' && typeof checkAvailability === 'function') {
            if (!checkAvailability(selectedResource.id, dateStr, selectedSlot.hour, requestedAmount)) {
                alert("La cantidad de personas solicitada supera el cupo disponible para este horario.");
                return;
            }
        }

        setBookingLoading(true);
        try {
            // Integration with createReserva from context (which uses Firestore)
            const endTimeStr = rentalMode === 'hora' ? null : endSlot.hour;

            if (addBooking) {
                await addBooking({
                    resource: selectedResource,
                    canchaId: selectedResource.id, // For Admin ReservasPage
                    fullDate: dateStr,
                    fecha: dateStr, // For Admin ReservasPage
                    time: timeStr,
                    hora: timeStr, // For Admin ReservasPage
                    endTime: endTimeStr,
                    price: currentPrice,
                    precio: currentPrice, // For Admin ReservasPage
                    cliente: formData,
                    pago: paymentMethod,
                    rentalMode,
                    status: 'Pendiente'
                });
            }

            setTimeout(() => {
                navigate(`/${negocioId}/pedido-confirmado`, { 
                    state: { 
                        reserva: {
                            fieldName: selectedResource.name,
                            date: dateStr,
                            time: timeStr,
                            firstName: formData.nombre,
                            lastName: formData.apellido,
                            phone: formData.telefono,
                            price: currentPrice
                        } 
                    } 
                });
                setBookingLoading(false);
            }, 800);
        } catch (error) {
            console.error("Error booking:", error);
            alert("Error al procesar la reserva.");
            setBookingLoading(false);
        }
    };

    // --- LOADING STATE ---
    if (loadingEspacios) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-white">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando oferta deportiva...</p>
            </div>
        );
    }

    // --- STEP 1: GALLERY VIEW ---
    if (!selectedResource) {
        return (
            <div className="min-h-screen bg-[#020617] text-white font-inter pb-20">
                <header className="relative h-[40vh] flex items-end px-6 pb-12 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" alt="Bg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                    <div className="relative z-10 max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Complex</span>
                            <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={10} className="fill-amber-500 text-amber-500" />)}</div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-2">ELIGE TU <span className="text-amber-500">ESPACIO</span></h1>
                        <p className="text-slate-400 font-medium max-w-lg text-sm md:text-base">Reserva las mejores instalaciones con tecnología de punta y servicios exclusivos.</p>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 space-y-12">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-amber-500 border-amber-500 text-black shadow-xl shadow-amber-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>{cat}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resources.filter(r => (r.category === selectedCategory || selectedCategory === 'Todos') && r.active).map(res => (
                            <div key={res.id} className="group relative bg-[#0f172a] border border-white/5 rounded-[40px] overflow-hidden flex flex-col transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-2 shadow-2xl">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={res.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={res.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2"><div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest">Disponible Hoy</span></div></div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div><h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors leading-none">{res.name}</h3><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">{res.category || 'Deportes'}</span></div>
                                        <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-500">{(() => { const I = ICON_MAP[res.name] || Trophy; return <I size={20} />; })()}</div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-8 font-medium italic">{res.desc}</p>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5"><div className="flex items-center gap-2 mb-1"><Sun size={14} className="text-amber-400" /><span className="text-[8px] font-black uppercase text-slate-500">Diurno</span></div><p className="text-lg font-black italic text-white">${res.priceDiurno?.toLocaleString() || '5.000'}</p></div>
                                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5"><div className="flex items-center gap-2 mb-1"><Moon size={14} className="text-indigo-400" /><span className="text-[8px] font-black uppercase text-slate-500">Nocturno</span></div><p className="text-lg font-black italic text-white">${res.precioNocturno?.toLocaleString() || '7.000'}</p></div>
                                    </div>
                                    <button onClick={() => setSelectedResource(res)} className="w-full bg-white text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-amber-500 hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2 group">Reservar Ahora <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // --- STEP 2: BOOKING VIEW ---
    return (
        <div className="min-h-screen bg-[#050508] text-white font-inter pb-60">
            {/* Header */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <img src={selectedResource.img} className="w-full h-full object-cover opacity-50" alt={selectedResource.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/40" />
                <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
                    <button onClick={() => setSelectedResource(null)} className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"><ArrowLeft size={20} /></button>
                    <div className="flex gap-2"><button className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white"><Share2 size={20} /></button></div>
                </div>
                <div className="absolute bottom-8 left-8 flex flex-col items-start">
                    <div className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">{selectedResource.category || 'Espacio Seleccionado'}</div>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{selectedResource.name}</h2>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
                
                {/* Mode Selector */}
                <section>
                    <div className="flex bg-white/5 p-1.5 rounded-[28px] border border-white/5">
                        <button onClick={() => { setRentalMode('hora'); setSelectedSlot(null); setStartSlot(null); setEndSlot(null); }} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center transition-all duration-300 ${rentalMode === 'hora' ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-white'}`}><span className="text-[10px] font-black uppercase tracking-widest">Turno Simple</span><span className="text-[8px] font-bold opacity-60">1 HORA</span></button>
                        <button onClick={() => { setRentalMode('franja'); setSelectedSlot(null); setStartSlot(null); setEndSlot(null); }} className={`flex-1 py-4 rounded-[22px] flex flex-col items-center justify-center transition-all duration-300 ${rentalMode === 'franja' ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}><span className="text-[10px] font-black uppercase tracking-widest">Franja Horaria</span><span className="text-[8px] font-bold opacity-60">PERSONALIZADO</span></button>
                    </div>
                </section>

                {/* Calendar */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><Calendar size={18} className="text-amber-500" /> Selecciona el Día</h3>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))} className="p-2 text-slate-500 hover:text-white"><ChevronLeft size={20} /></button>
                            <span className="text-xs font-black uppercase tracking-widest text-white italic">{MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}</span>
                            <button onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))} className="p-2 text-slate-500 hover:text-white"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        {calendarDays.filter(d => d && d >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).map(d => {
                            const isSelected = selectedDate.toDateString() === d.toDateString();
                            return (
                                <button key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedSlot(null); setStartSlot(null); setEndSlot(null); }} className={`flex-none w-16 md:w-20 py-6 rounded-[32px] flex flex-col items-center justify-center transition-all duration-300 border ${isSelected ? 'bg-white text-black border-white shadow-2xl scale-110' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}><span className="text-[8px] font-black uppercase mb-1 opacity-60">{DAY_NAMES[d.getDay()].substring(0,2)}</span><span className="text-xl font-black">{d.getDate()}</span></button>
                            );
                        })}
                    </div>
                </section>

                {/* Time Slots */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-[10px] items-center text-slate-600 font-black uppercase tracking-[0.3em] flex gap-3"><Sun size={18} className="text-amber-500" /> Diurnos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {availableScheduleSlots.filter(s => s.type === 'diurno').map(slot => {
                                const status = getSlotStatus(slot.hour);
                                const isSelected = rentalMode === 'hora' ? selectedSlot?.hour === slot.hour : (startSlot?.hour === slot.hour || endSlot?.hour === slot.hour || (startSlot && endSlot && slot.hour > startSlot.hour && slot.hour < endSlot.hour));
                                const isDisabled = status !== 'Disponible';
                                return (
                                    <button key={slot.hour} disabled={isDisabled && !isSelected} onClick={() => { if (rentalMode === 'hora') setSelectedSlot(slot); else { if (!startSlot || (startSlot && endSlot)) { setStartSlot(slot); setEndSlot(null); } else if (slot.hour > startSlot.hour) setEndSlot(slot); else setStartSlot(slot); } }} className={`relative py-5 rounded-[22px] border transition-all duration-300 flex flex-col items-center justify-center ${isSelected ? 'bg-amber-500 border-amber-400 text-black shadow-xl' : isDisabled ? 'bg-black/20 border-white/5 text-slate-700' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}>
                                        <span className="text-lg font-black italic tracking-tighter">{slot.hour}</span>
                                        {!isDisabled && <span className={`text-[8px] font-bold mt-1 ${isSelected ? 'text-black opacity-70' : 'text-slate-500'}`}>${getPrice(slot).toLocaleString()}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[10px] items-center text-slate-600 font-black uppercase tracking-[0.3em] flex gap-3"><Moon size={18} className="text-indigo-400" /> Nocturnos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {availableScheduleSlots.filter(s => s.type === 'nocturno').map(slot => {
                                const status = getSlotStatus(slot.hour);
                                const isSelected = rentalMode === 'hora' ? selectedSlot?.hour === slot.hour : (startSlot?.hour === slot.hour || endSlot?.hour === slot.hour || (startSlot && endSlot && slot.hour > startSlot.hour && slot.hour < endSlot.hour));
                                const isDisabled = status !== 'Disponible';
                                return (
                                    <button key={slot.hour} disabled={isDisabled && !isSelected} onClick={() => { if (rentalMode === 'hora') setSelectedSlot(slot); else { if (!startSlot || (startSlot && endSlot)) { setStartSlot(slot); setEndSlot(null); } else if (slot.hour > startSlot.hour) setEndSlot(slot); else setStartSlot(slot); } }} className={`relative py-5 rounded-[22px] border transition-all duration-300 flex flex-col items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl' : isDisabled ? 'bg-black/20 border-white/5 text-slate-700' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}>
                                        <span className="text-lg font-black italic tracking-tighter">{slot.hour}</span>
                                        {!isDisabled && <span className={`text-[8px] font-bold mt-1 ${isSelected ? 'text-white opacity-70' : 'text-slate-500'}`}>${getPrice(slot).toLocaleString()}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Form & Payment */}
                <div className="pt-8 space-y-12">
                    <ReservationForm formData={formData} setFormData={setFormData} cancha={selectedResource} />
                    
                    <section className="space-y-4">
                        <h3 className="text-[10px] items-center text-slate-500 font-black uppercase tracking-widest flex gap-2"><CreditCard size={16} className="text-amber-500" /> Forma de Pago</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {['Pagar en el complejo', 'Transferencia', 'MercadoPago'].map(method => (
                                <button key={method} onClick={() => setPaymentMethod(method)} className={`p-6 rounded-[24px] border flex items-center justify-between transition-all ${paymentMethod === method ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
                                    <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                                    {paymentMethod === method && <div className="size-5 bg-amber-500 rounded-full flex items-center justify-center"><Check size={12} className="text-black" /></div>}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Floating Bar */}
            {hasValidSelection && (
                <div className="fixed bottom-0 left-0 right-0 p-6 z-50 animate-in slide-in-from-bottom duration-500 bg-gradient-to-t from-[#050508] via-[#050508] to-transparent">
                    <div className="max-w-4xl mx-auto bg-white text-black p-6 md:p-8 rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-amber-500/20">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <div className="hidden md:flex size-16 rounded-[24px] bg-black text-white items-center justify-center"><Clock size={32} /></div>
                            <div>
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{rentalMode === 'hora' ? selectedSlot.hour : `${startSlot.hour} - ${endSlot ? endSlot.hour : '...'}`} HS</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()} • Total: ${currentPrice.toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={handleBooking} disabled={bookingLoading} className="w-full md:w-auto px-12 py-5 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-amber-600 hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                            {bookingLoading ? <Loader2 className="animate-spin" size={20} /> : <><CalendarCheck size={20} /> Confirmar Reserva</>}
                        </button>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
