import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';
import {
    CheckCircle2, Calendar, Clock, MapPin, MessageCircle,
    ArrowLeft, ShieldCheck, Banknote, CreditCard, Upload,
    Copy, Check, FileImage, Sun, Moon, ChevronRight, Info
} from 'lucide-react';

export default function ReservationConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { businessInfo } = useConfig();
    const { addBooking } = useReservas();
    const fileInputRef = useRef(null);

    // Get booking data from router state or use defaults
    const bookingData = location.state || {
        resource: { name: 'Fútbol 5' },
        date: new Date().getDate(),
        fullDate: new Date().toISOString().split('T')[0],
        dayOfWeek: new Date().toLocaleDateString('es-AR', { weekday: 'long' }).replace(/^\w/, (c) => c.toUpperCase()),
        time: '21:00',
        endTime: '22:00',
        price: 12000,
        rentalMode: 'hora',
        hoursCount: 1,
        displayTime: '21:00',
        slotType: 'nocturno',
        appliedPrice: 12000,
    };

    const isRange = bookingData.rentalMode === 'franja' && bookingData.hoursCount > 1;
    const timeLabel = isRange ? `${bookingData.time} a ${bookingData.endTime}` : `${bookingData.time}`;
    const hoursLabel = `${bookingData.hoursCount} ${bookingData.hoursCount === 1 ? 'hora' : 'horas'}`;
    const isDiurno = bookingData.slotType === 'diurno';

    const [paymentMethod, setPaymentMethod] = useState(null); // 'efectivo' | 'transferencia'
    const [receipt, setReceipt] = useState(null);
    const [copied, setCopied] = useState(null);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt({
                    name: file.name,
                    data: reader.result // Base64
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleWhatsAppConfirm = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // 1. Save to Firebase for internal control
            await addBooking({
                clientName,
                clientPhone: `+54${clientPhone}`,
                resource: bookingData.resource,
                date: bookingData.date,
                fullDate: bookingData.fullDate,
                dayOfWeek: bookingData.dayOfWeek,
                isWeekend: bookingData.isWeekend,
                time: bookingData.time,
                endTime: bookingData.endTime,
                price: bookingData.price,
                appliedPrice: bookingData.appliedPrice,
                slotType: bookingData.slotType,
                rentalMode: bookingData.rentalMode,
                hoursCount: bookingData.hoursCount,
                paymentMethod,
                hasReceipt: !!receipt,
                receiptImage: receipt?.data || null, // Actual image data
                displayTime: bookingData.displayTime,
                paymentStatus: 'Sin Pagar',
                createdAt: new Date().toISOString()
            }, {
                amount: bookingData.price,
                receiptImage: receipt?.data // Pass the base64 image
            });

            setSubmitStatus('success');

            // 2. Format WhatsApp Message
            const slotTypeLabel = bookingData.slotType === 'diurno' ? '🌞 Diurno' : '🌙 Nocturno';
            const msg = encodeURIComponent(
                `🏟️ *PEDIDO DE RESERVA - ${businessInfo.businessName || 'COMPLEJO GIOVANNI'}*\n\n` +
                `👤 *Cliente:* ${clientName}\n` +
                `📞 *WhatsApp:* +54${clientPhone}\n\n` +
                `📌 *Espacio:* ${bookingData.resource.name}\n` +
                `📅 *Fecha:* ${bookingData.dayOfWeek} ${bookingData.date}\n` +
                `🕐 *Horario:* ${timeLabel} HS (${hoursLabel})\n` +
                `✨ *Turno:* ${slotTypeLabel}\n\n` +
                `💰 *Total:* $${bookingData.price.toLocaleString()}\n` +
                `💳 *Pago:* ${paymentMethod === 'efectivo' ? 'Efectivo en el complejo' : 'Transferencia Realizada'}` +
                (receipt ? `\n📎 *Comprobante:* Adjunto en WhatsApp` : '') +
                `\n\n_Por favor, confirme la disponibilidad de este turno._`
            );

            // 3. Open WhatsApp
            window.open(`https://wa.me/549${businessInfo.whatsapp || '3855374835'}?text=${msg}`, '_blank');

            // 4. Redirect after a delay
            setTimeout(() => {
                navigate('/home');
            }, 3000);

        } catch (error) {
            console.error("Error saving booking:", error);
            setSubmitStatus('error');
            setIsSubmitting(false);
        }
    };

    const isPhoneValid = clientPhone.length >= 10;
    const canConfirm = paymentMethod && clientName && isPhoneValid;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-40 font-inter overflow-x-hidden">
            <header className="px-6 py-10 space-y-2 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/booking-flow" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">CONFIRMAR <span className="text-gold">RESERVA</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resumen y Validación</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-12">
                {/* Progress Indicators */}
                <div className="flex items-center gap-4 px-2">
                    <div className="flex-1 h-1.5 bg-gold rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gold rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                    <span className="text-[10px] font-black text-gold uppercase tracking-tighter italic whitespace-nowrap">Paso 3 de 3</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left Side: Client & Payment */}
                    <div className="md:col-span-7 space-y-10">
                        {/* Client Form */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-10 space-y-8 animate-in slide-in-from-left duration-500">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                    <CheckCircle2 size={20} className="text-gold" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Datos del Solicitante</h3>
                            </div>
                            
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-bold placeholder:text-slate-700"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">WhatsApp (Argentina)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-black italic tracking-tighter text-lg">
                                            +54
                                        </div>
                                        <input
                                            type="tel"
                                            value={clientPhone}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 13) setClientPhone(val);
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-20 pr-6 py-5 outline-none focus:border-gold/50 focus:bg-gold/5 transition-all font-black tracking-widest placeholder:text-slate-700"
                                            placeholder="385 555555"
                                        />
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-4">Sin el 0 ni el 15. Ej: 385 1234567</p>
                                </div>
                            </div>
                        </section>

                        {/* Payment Selection */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-10 space-y-8 animate-in slide-in-from-left duration-700">
                             <div className="flex items-center gap-4">
                                <div className="size-10 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                    <CreditCard size={20} className="text-gold" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Forma de Pago</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('efectivo')}
                                    className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${paymentMethod === 'efectivo'
                                        ? 'border-gold bg-gold/10 shadow-2xl shadow-gold/20'
                                        : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl transition-all ${paymentMethod === 'efectivo' ? 'bg-gold text-slate-950' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                                        <Banknote size={32} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-sm font-black italic uppercase tracking-tighter">Efectivo</span>
                                        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Pagas al llegar</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('transferencia')}
                                    className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${paymentMethod === 'transferencia'
                                        ? 'border-gold bg-gold/10 shadow-2xl shadow-gold/20'
                                        : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                                        }`}
                                >
                                    <div className={`p-4 rounded-2xl transition-all ${paymentMethod === 'transferencia' ? 'bg-gold text-slate-950' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                                        <CreditCard size={32} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-sm font-black italic uppercase tracking-tighter">Transferencia</span>
                                        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Seña anticipada</span>
                                    </div>
                                </button>
                            </div>

                            {/* Transfer Details View */}
                            {paymentMethod === 'transferencia' && (
                                <div className="space-y-5 animate-in slide-in-from-bottom duration-300">
                                    <div className="bg-gold/5 border border-gold/20 rounded-[32px] p-8 space-y-6">
                                        <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] italic text-center">Datos de la Cuenta</p>
                                        
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between bg-slate-900/50 rounded-2xl p-5 border border-white/5 group">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Alias de pago</p>
                                                    <p className="text-xl font-black italic tracking-tighter text-gold group-hover:text-white transition-colors uppercase">{businessInfo.alias || 'COMPLEJO.GIOVANNI'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(businessInfo.alias, 'alias')}
                                                    className={`p-3 rounded-xl transition-all ${copied === 'alias' ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-500 hover:text-gold'}`}
                                                >
                                                    {copied === 'alias' ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between bg-slate-900/50 rounded-2xl p-5 border border-white/5 group">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">CBU / CVU</p>
                                                    <p className="text-sm font-mono tracking-wider text-white opacity-80">{businessInfo.cbu || '0000000000000000000000'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(businessInfo.cbu, 'cbu')}
                                                    className={`p-3 rounded-xl transition-all ${copied === 'cbu' ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-500 hover:text-gold'}`}
                                                >
                                                    {copied === 'cbu' ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Receipt Upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/5 hover:border-gold/30 rounded-[32px] p-10 text-center cursor-pointer transition-all bg-white/[0.01] group"
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {receipt ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <FileImage size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black italic tracking-tighter text-green-400">¡Comprobante Cargado!</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{receipt.name}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="size-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-700 group-hover:text-gold transition-colors">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black italic uppercase tracking-tighter text-slate-500 group-hover:text-white transition-colors">Subir Comprobante</p>
                                                    <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Opcional: Acelera tu confirmación</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'efectivo' && (
                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-[32px] p-8 flex items-start gap-4 animate-in fade-in duration-500">
                                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <Info size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black italic uppercase tracking-tighter text-blue-400">Importante:</p>
                                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                                            Al seleccionar efectivo, abonarás el total al ingresar al complejo. Tu reserva quedará en estado "Pendiente de Validación" hasta que confirmes por WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Side: Summary Ticket */}
                    <div className="md:col-span-5 relative">
                        <div className="sticky top-32 space-y-6">
                            <div className="relative bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-3xl animate-in zoom-in duration-500">
                                {/* Ticket Design Top */}
                                <div className="bg-gold p-6 text-center transform -skew-x-6 mx-4 mt-4 rounded-2xl">
                                    <span className="text-xs font-black text-slate-950 uppercase tracking-[0.3em] italic">Resumen del Ticket</span>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="grid gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-[22px] bg-white/5 flex items-center justify-center text-gold border border-white/10 shadow-lg">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Espacio Reservado</p>
                                                <p className="text-2xl font-black italic uppercase tracking-tighter text-white">{bookingData.resource.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-[22px] bg-white/5 flex items-center justify-center text-gold border border-white/10 shadow-lg">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Fecha del Turno</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xl font-black italic uppercase tracking-tighter text-white">
                                                        {bookingData.dayOfWeek} {bookingData.date}
                                                    </p>
                                                    {bookingData.isWeekend && <span className="text-[8px] font-black bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-purple-500/20">Wknd</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-[22px] bg-white/5 flex items-center justify-center text-gold border border-white/10 shadow-lg">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Horario y Duración</p>
                                                <p className="text-xl font-black italic uppercase tracking-tighter text-white">{timeLabel} HS</p>
                                                <p className="text-[10px] font-black text-gold/60 uppercase tracking-widest mt-0.5">{hoursLabel} de juego</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className={`size-14 rounded-[22px] flex items-center justify-center border shadow-lg ${isDiurno ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'}`}>
                                                {isDiurno ? <Sun size={24} /> : <Moon size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Categoría de Turno</p>
                                                <p className={`text-xl font-black italic uppercase tracking-tighter ${isDiurno ? 'text-amber-400' : 'text-indigo-400'}`}>{isDiurno ? 'Diurno' : 'Nocturno'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Footer */}
                                    <div className="pt-8 border-t border-dashed border-white/10 mt-4">
                                        <div className="flex items-end justify-between">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">Total a Pagar</span>
                                                <span className="text-5xl font-black italic tracking-tighter text-gold leading-none">${bookingData.price.toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">ID RESERVA</p>
                                                <p className="text-[10px] font-mono text-white opacity-40">#{(Math.random()*10000).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Punch Holes Aesthetic */}
                                <div className="absolute top-1/2 -left-4 size-8 bg-slate-950 rounded-full border border-white/5"></div>
                                <div className="absolute top-1/2 -right-4 size-8 bg-slate-950 rounded-full border border-white/5"></div>
                            </div>

                            <button
                                onClick={handleWhatsAppConfirm}
                                disabled={!canConfirm || isSubmitting}
                                className={`w-full p-8 rounded-[32px] font-black italic uppercase tracking-tighter flex items-center justify-center gap-4 transition-all shadow-2xl overflow-hidden group relative ${canConfirm && !isSubmitting
                                    ? 'bg-[#25D366] text-white hover:scale-[1.02] active:scale-95 shadow-[#25D366]/20'
                                    : 'bg-white/5 text-slate-700 grayscale cursor-not-allowed border border-white/5'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-xl tracking-tighter">
                                    {isSubmitting ? 'Registrando...' : 'Confirmar Reserva'}
                                </span>
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* UI Status Alerts */}
                            {submitStatus === 'success' && (
                                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[32px] animate-in zoom-in text-center space-y-2">
                                    <p className="text-sm font-black italic text-green-400 uppercase tracking-tight">¡RESERVA REGISTRADA!</p>
                                    <p className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest leading-relaxed">Te estamos redirigiendo a WhatsApp para finalizar la comunicación...</p>
                                </div>
                            )}

                            {!canConfirm && !isSubmitting && (
                                <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic animate-pulse">
                                    {!clientName ? 'Ingresá tu nombre para continuar' : !isPhoneValid ? 'Teléfono incompleto' : !paymentMethod ? 'Seleccioná un método de pago' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Validation Info Footer */}
            <section className="max-w-4xl mx-auto px-6 mt-20 mb-40 text-center space-y-4 opacity-40">
                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    <ShieldCheck size={16} />
                    <span>Reserva Segura SSL 256-bit</span>
                </div>
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                    Al confirmar esta reserva aceptás los términos y condiciones del complejo. Las reservas sin seña o validación por WhatsApp pueden ser canceladas automáticamente.
                </p>
            </section>
        </div>
    );
}
