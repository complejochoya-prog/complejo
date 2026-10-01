import React, { useState, useEffect } from 'react';
import { 
    X, 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    CreditCard, 
    MapPin, 
    Banknote, 
    Smartphone, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    DollarSign,
    FileText,
    Sparkles
} from 'lucide-react';
import { db } from '../../../firebase/config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { addMovement } from '../../../core/services/cajaService';

export default function NuevaReservaModal({
    isOpen,
    onClose,
    negocioId,
    listEspacios = [],
    reservas = [],
    initialCanchaId = '',
    initialHora = '',
    initialDate = '',
    onReservaCreated
}) {
    const todayStr = new Date().toISOString().split('T')[0];

    const [canchaId, setCanchaId] = useState('');
    const [fecha, setFecha] = useState(todayStr);
    const [hora, setHora] = useState('20:00');
    const [duracion, setDuracion] = useState('1'); // 1 hora, 1.5 horas, 2 horas
    
    // Client data
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [notas, setNotas] = useState('');

    // Financial data
    const [precio, setPrecio] = useState('8000');
    const [montoPagado, setMontoPagado] = useState('8000');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [estado, setEstado] = useState('confirmada');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Predefined hours
    const availableHours = [
        '08:00', '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00', '17:00', 
        '18:00', '19:00', '20:00', '21:00', '22:00', 
        '23:00', '00:00', '01:00'
    ];

    useEffect(() => {
        if (isOpen) {
            setErrorMsg('');
            setLoading(false);
            if (initialDate) setFecha(initialDate);
            else setFecha(todayStr);

            if (initialCanchaId) {
                setCanchaId(initialCanchaId);
            } else if (listEspacios.length > 0) {
                setCanchaId(listEspacios[0].id);
            }

            if (initialHora) {
                setHora(initialHora);
            } else {
                setHora('20:00');
            }

            setNombre('');
            setApellido('');
            setTelefono('');
            setNotas('');
            setDuracion('1');
        }
    }, [isOpen, initialCanchaId, initialHora, initialDate, listEspacios]);

    // Auto calculate price based on selected space and time
    useEffect(() => {
        if (!canchaId || listEspacios.length === 0) return;
        const selectedEspacio = listEspacios.find(e => e.id === canchaId);
        if (selectedEspacio) {
            const hourNum = parseInt(hora.split(':')[0], 10);
            const isNocturno = hourNum >= 19 || hourNum <= 3;
            let basePrice = isNocturno 
                ? (selectedEspacio.precioNocturno || selectedEspacio.precio || 8000)
                : (selectedEspacio.precioDiurno || selectedEspacio.precio || 6000);
            
            const mult = parseFloat(duracion) || 1;
            const finalPrice = Math.round(basePrice * mult);
            setPrecio(finalPrice.toString());
            setMontoPagado(finalPrice.toString());
        }
    }, [canchaId, hora, duracion, listEspacios]);

    if (!isOpen) return null;

    const selectedEspacio = listEspacios.find(e => e.id === canchaId) || {};

    const isOccupied = (slotHora) => {
        return reservas.some(r => 
            r.canchaId === canchaId &&
            r.fecha === fecha &&
            r.status !== 'cancelada' &&
            r.status !== 'Cancelada' &&
            (r.hora === slotHora || r.hora?.split(' - ').includes(slotHora))
        );
    };

    const handleSaveReserva = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!canchaId) {
            setErrorMsg('Por favor selecciona un espacio o cancha.');
            return;
        }
        if (!fecha) {
            setErrorMsg('Por favor selecciona la fecha del turno.');
            return;
        }
        if (!hora) {
            setErrorMsg('Por favor selecciona el horario.');
            return;
        }
        if (!nombre.trim()) {
            setErrorMsg('Por favor ingresa el nombre del cliente.');
            return;
        }

        // Check if slot is occupied
        if (isOccupied(hora)) {
            const confirmOverlap = window.confirm(`El horario ${hora} hs para esta cancha ya registra una reserva. ¿Deseas guardar de todas formas?`);
            if (!confirmOverlap) return;
        }

        setLoading(true);
        try {
            const resId = `res-${Date.now()}`;
            const numPrecio = parseFloat(precio) || 0;
            const numMontoPagado = parseFloat(montoPagado) || 0;

            const reservaPayload = {
                id: resId,
                negocio_id: negocioId,
                canchaId: canchaId,
                resource: {
                    id: canchaId,
                    name: selectedEspacio.name || selectedEspacio.title || selectedEspacio.nombre || 'Cancha'
                },
                fecha: fecha,
                hora: hora,
                time: hora,
                duracion: duracion,
                precio: numPrecio,
                montoPagado: numMontoPagado,
                pago: numMontoPagado >= numPrecio ? metodoPago : (numMontoPagado > 0 ? `Seña (${metodoPago})` : 'Pendiente'),
                metodoPago: metodoPago,
                status: estado,
                tipo: 'presencial',
                cliente: {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    telefono: telefono.trim(),
                    notas: notas.trim()
                },
                clientName: `${nombre.trim()} ${apellido.trim()}`.trim(),
                clientPhone: telefono.trim(),
                createdPresencial: true,
                createdAt: new Date().toISOString(),
                timestamp: serverTimestamp()
            };

            // Save reservation in Firestore
            await setDoc(doc(db, 'negocios', negocioId, 'reservas', resId), reservaPayload);

            // If cash/transfer/MP payment received, record in Caja Mágica!
            if (numMontoPagado > 0) {
                await addMovement(negocioId, {
                    monto: numMontoPagado,
                    tipo: 'entrada',
                    categoria: 'Reserva Cancha',
                    metodoPago: metodoPago.toLowerCase(),
                    descripcion: `Reserva Presencial: ${selectedEspacio.name || 'Cancha'} - ${nombre.trim()} ${apellido.trim()} (${fecha} ${hora} hs)`,
                    origen: 'reserva',
                    usuario: 'Administración',
                    metadata: {
                        reservaId: resId,
                        cliente: `${nombre.trim()} ${apellido.trim()}`.trim(),
                        telefono: telefono.trim(),
                        fecha: fecha,
                        hora: hora,
                        canchaId: canchaId
                    }
                });
            }

            if (onReservaCreated) {
                onReservaCreated(reservaPayload);
            }
            onClose();
        } catch (err) {
            console.error("Error creating presencial reserva:", err);
            setErrorMsg("Error al registrar la reserva: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
            <div className="relative bg-slate-900 w-full max-w-2xl rounded-[36px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden my-auto scale-in-center">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-none">
                                Nueva Reserva Presencial
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-1">
                                Cargar turno en mostrador o teléfono
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSaveReserva} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                    {errorMsg && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Section 1: Espacio & Fecha */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 flex items-center gap-2">
                                <MapPin size={13} className="text-indigo-400" /> Cancha / Espacio
                            </label>
                            <select
                                value={canchaId}
                                onChange={(e) => setCanchaId(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60 cursor-pointer uppercase tracking-wider"
                                required
                            >
                                {listEspacios.map(esp => (
                                    <option key={esp.id} value={esp.id}>
                                        {esp.name || esp.title || esp.nombre || esp.id} {esp.tipo ? `(${esp.tipo})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-1 flex items-center gap-2">
                                <Calendar size={13} className="text-indigo-400" /> Fecha del Turno
                            </label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60 uppercase"
                                required
                            />
                        </div>
                    </div>

                    {/* Section 2: Horarios Grid */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                <Clock size={13} className="text-indigo-400" /> Horario de Inicio
                            </label>
                            <div className="flex gap-2">
                                {['1', '1.5', '2'].map((dur) => (
                                    <button
                                        key={dur}
                                        type="button"
                                        onClick={() => setDuracion(dur)}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                            duracion === dur
                                                ? 'bg-indigo-500 text-slate-950 border-indigo-500'
                                                : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                                        }`}
                                    >
                                        {dur === '1' ? '1 Hora' : dur === '1.5' ? '1h 30m' : '2 Horas'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hours Chips */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {availableHours.map((h) => {
                                const occupied = isOccupied(h);
                                const isSelected = hora === h;
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setHora(h)}
                                        className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all border relative flex flex-col items-center justify-center gap-0.5 ${
                                            isSelected
                                                ? 'bg-indigo-500 text-slate-950 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105 z-10'
                                                : occupied
                                                ? 'bg-rose-500/10 text-rose-400/80 border-rose-500/20 hover:border-rose-500/40'
                                                : 'bg-slate-950/70 text-slate-300 border-white/5 hover:border-indigo-500/40 hover:bg-slate-900'
                                        }`}
                                    >
                                        <span>{h}</span>
                                        {occupied && (
                                            <span className="text-[7px] font-sans font-bold uppercase tracking-tighter opacity-70">
                                                Ocupado
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 3: Datos del Cliente */}
                    <div className="bg-slate-950/50 p-5 rounded-3xl border border-white/5 space-y-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                            <User size={12} className="text-indigo-400" /> Información del Cliente
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre del cliente"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Apellido (opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Teléfono / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej: 3855123456"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60 font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Notas / Equipo (opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Equipo Los Pumas / Seña pendiente"
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/60"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Cobro & Caja Mágica */}
                    <div className="bg-slate-950/60 p-5 rounded-3xl border border-indigo-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                                <DollarSign size={13} /> Cobro & Registro en Caja Mágica
                            </span>
                            <span className="text-[9px] font-bold text-slate-500">
                                Se registrará el ingreso automáticamente
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Precio Total */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                                    Precio Total del Turno ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                                    <input
                                        type="number"
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-white font-mono focus:outline-none focus:border-indigo-500/60"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Monto Cobrado Ahora */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                        Monto Cobrado Ahora ($)
                                    </label>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setMontoPagado(precio)}
                                            className="text-[8px] font-bold text-indigo-400 hover:underline"
                                        >
                                            Total
                                        </button>
                                        <span className="text-slate-600 text-[8px]">•</span>
                                        <button
                                            type="button"
                                            onClick={() => setMontoPagado(Math.round((parseFloat(precio) || 0) / 2).toString())}
                                            className="text-[8px] font-bold text-amber-400 hover:underline"
                                        >
                                            50%
                                        </button>
                                        <span className="text-slate-600 text-[8px]">•</span>
                                        <button
                                            type="button"
                                            onClick={() => setMontoPagado('0')}
                                            className="text-[8px] font-bold text-slate-400 hover:underline"
                                        >
                                            $0
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">$</span>
                                    <input
                                        type="number"
                                        value={montoPagado}
                                        onChange={(e) => setMontoPagado(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/60"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Método de Pago */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                            {[
                                { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'text-emerald-400' },
                                { id: 'transferencia', label: 'Transferencia', icon: CreditCard, color: 'text-blue-400' },
                                { id: 'mercadopago', label: 'MercadoPago', icon: Smartphone, color: 'text-sky-400' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMetodoPago(m.id)}
                                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                                        metodoPago === m.id
                                            ? 'bg-indigo-500 text-slate-950 border-indigo-400 shadow-md'
                                            : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                                    }`}
                                >
                                    <m.icon size={14} className={metodoPago === m.id ? 'text-slate-950' : m.color} />
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-slate-950 font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin text-slate-950" size={20} />
                                    Guardando Reserva...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Confirmar y Guardar Reserva
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
