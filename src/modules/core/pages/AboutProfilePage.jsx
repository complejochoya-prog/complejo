import React, { useState } from 'react';
import { 
    MapPin, 
    Phone, 
    MessageCircle, 
    Calendar, 
    Clock, 
    Trophy, 
    Users, 
    Heart, 
    Sparkles, 
    Utensils, 
    Award, 
    CheckCircle2, 
    Flame, 
    Share2, 
    Compass, 
    ShieldCheck, 
    Star,
    Coffee,
    Zap,
    Send
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';

export default function AboutProfilePage() {
    const { negocioId: paramsNegocioId } = useParams();
    const { config, negocioId: configNegocioId } = useConfig();
    const negocioId = paramsNegocioId || configNegocioId || 'giovanni';
    const navigate = useNavigate();

    const telefono = '3855374835';
    const telefonoFormatted = '+54 9 385 537-4835';
    const wspUrl = `https://wa.me/5493855374835?text=Hola%20Complejo%20Giovanni,%20los%20contacto%20desde%20la%20web`;

    const [copied, setCopied] = useState(false);

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(telefono);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 pb-36">
            
            {/* ── Hero Banner con Gradiente y Destellos ── */}
            <section className="relative overflow-hidden pt-12 pb-20 px-6 lg:px-12 border-b border-white/5 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                    {/* Badge de Origen */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-amber-500/10">
                        <MapPin size={14} className="animate-bounce" />
                        Choya · Santiago del Estero · Argentina
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-8 space-y-6">
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-white">
                                COMPLEJO <span className="text-amber-500">GIOVANNI</span>
                            </h1>
                            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
                                El epicentro deportivo, gastronómico y social de la localidad de <strong className="text-white font-black">Choya</strong>. Un espacio donde la pasión por el fútbol, el pádel y la amistad santiagueña se viven los 365 días del año.
                            </p>

                            {/* Botones de Acción Rápida */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <a 
                                    href={wspUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <MessageCircle size={18} />
                                    WhatsApp Oficial
                                </a>

                                <a 
                                    href={`tel:${telefono}`}
                                    className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95 transition-all"
                                >
                                    <Phone size={18} className="text-amber-400" />
                                    {telefonoFormatted}
                                </a>

                                <button 
                                    onClick={handleCopyPhone}
                                    className="px-5 py-4 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white text-xs font-bold transition-all"
                                    title="Copiar número"
                                >
                                    {copied ? '✓ ¡Copiado!' : 'Copiar Tel.'}
                                </button>
                            </div>
                        </div>

                        {/* Card Destacada de Contacto & Ubicación */}
                        <div className="lg:col-span-4 bg-slate-900/80 border border-white/10 rounded-[36px] p-8 shadow-2xl backdrop-blur-xl relative space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Atención Directa</p>
                                        <p className="text-xs font-black uppercase tracking-wider text-white">Choya, Sgo. del Estero</p>
                                    </div>
                                </div>
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 font-medium">Teléfono / WhatsApp:</span>
                                    <span className="font-black text-amber-400">{telefono}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 font-medium">Días de Apertura:</span>
                                    <span className="font-black text-white">Lunes a Domingos</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 font-medium">Horario de Canchas:</span>
                                    <span className="font-black text-emerald-400">08:00 hs — 02:00 hs</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-slate-400 font-medium">Servicio de Bar & Parrilla:</span>
                                    <span className="font-black text-white">Abierto al público</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/${negocioId}/reservas`)}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                            >
                                <Calendar size={16} />
                                Reservar Turno Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Estadísticas de Impacto en Choya ── */}
            <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { val: '+10.000', label: 'Partidos Jugados', icon: Trophy, color: 'text-amber-400' },
                        { val: '100%', label: 'Pasión Santiagueña', icon: Heart, color: 'text-rose-400' },
                        { val: '+45', label: 'Torneos Organizados', icon: Award, color: 'text-emerald-400' },
                        { val: 'Choya', label: 'Cuna del Complejo', icon: Compass, color: 'text-indigo-400' },
                    ].map((st, i) => (
                        <div key={i} className="bg-slate-900/90 border border-white/10 p-6 rounded-[28px] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center group hover:border-amber-500/40 transition-all">
                            <st.icon size={22} className={`${st.color} mb-2 group-hover:scale-110 transition-transform`} />
                            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">{st.val}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{st.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Nuestra Historia / Identidad Choyana ── */}
            <section className="max-w-6xl mx-auto px-6 pt-20 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-[0.3em]">
                            <Flame size={16} /> Raíces y Tradición
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">
                            Un sueño que nació en el corazón de <span className="text-amber-500">Choya</span>
                        </h2>
                        
                        <div className="space-y-4 text-slate-300 font-normal leading-relaxed text-sm sm:text-base">
                            <p>
                                <strong className="text-white font-bold">Complejo Giovanni</strong> nació con un propósito claro y apasionado: brindarle a la comunidad de <strong className="text-amber-400">Choya, Santiago del Estero</strong>, y a todos los pueblos vecinos un predio deportivo de máxima categoría, donde cada encuentro sea una verdadera fiesta.
                            </p>
                            <p>
                                En nuestra tierra santiagueña el fútbol y el deporte no son solo una disciplina: son motivo de encuentro, risas, familia, anécdotas y un <strong className="text-emerald-400">tercer tiempo inolvidable</strong>. Levantamos este complejo con esfuerzo, dedicación y el compromiso de ofrecer instalaciones modernas, canchas de césped sintético de alta tecnología, iluminación LED profesional y la calidez humana que nos caracteriza.
                            </p>
                            <p>
                                Ya sea para disputar un picado entre amigos después del trabajo, competir en nuestros torneos nocturnos, aprender en las escuelas formativas o compartir unas empanadas y bebidas heladas en el bar, en <strong className="text-white">Giovanni</strong> siempre tenés tu lugar reservado.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-white">Instalaciones Seguras</p>
                                    <p className="text-[10px] text-slate-500">Ambiente 100% familiar</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase text-white">Césped Sintético Pro</p>
                                    <p className="text-[10px] text-slate-500">Iluminación LED Nocturna</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 relative">
                        <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-indigo-950 border border-white/10 rounded-[44px] p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Nuestro Lema</span>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                                    "El deporte nos une, el tercer tiempo nos hace amigos."
                                </h3>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10 text-xs text-slate-300">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Canchas de Fútbol 5 / 7 reglamentarias y cuidadas al detalle.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Pádel de cristal para entrenamiento y torneos locales.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Bar completo con minutas, pizzas, lomos y bebidas heladas.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Sistema digital de turnos y pedidos desde la mesa.</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Contacto Directo</p>
                                    <p className="text-sm font-black text-amber-400">{telefonoFormatted}</p>
                                </div>
                                <a 
                                    href={wspUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl bg-emerald-500 text-slate-950 hover:scale-110 active:scale-95 transition-all shadow-lg"
                                >
                                    <Send size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Servicios y Experiencias ── */}
                <div className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">¿Qué ofrecemos?</span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-white">
                            Servicios de Primera en Choya
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            Todo lo que necesitás para tu partido, tu evento o tu salida de fin de semana en un solo lugar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Servicio 1 */}
                        <div className="bg-slate-900/60 border border-white/5 hover:border-amber-500/30 p-8 rounded-[36px] transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Trophy size={26} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                                    Alquiler de Canchas & Torneos
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Turnos de 60 y 90 minutos con iluminación LED de alta potencia. Organización de ligas comerciales, empresariales y copas relámpago con trofeos y premios.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <button 
                                    onClick={() => navigate(`/${negocioId}/reservas`)}
                                    className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-white flex items-center gap-2"
                                >
                                    Ver Disponibilidad de Canchas →
                                </button>
                            </div>
                        </div>

                        {/* Servicio 2 */}
                        <div className="bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 p-8 rounded-[36px] transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Utensils size={26} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                                    Bar, Restaurante & Tercer Tiempo
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Menú completo con pizzas caseras, lomitos completos, empanadas santiagueñas, hamburguesas, picadas y cerveza tirada bien fría para coronar el partido.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <button 
                                    onClick={() => navigate(`/${negocioId}/menu`)}
                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white flex items-center gap-2"
                                >
                                    Explorar la Carta del Bar →
                                </button>
                            </div>
                        </div>

                        {/* Servicio 3 */}
                        <div className="bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 p-8 rounded-[36px] transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <Users size={26} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                                    Cumpleaños & Eventos Privados
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Celebrá tu cumpleaños, festejo de egresados o evento corporativo en el complejo con atención exclusiva, sonido y servicio gastronómico a medida.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <a 
                                    href={`https://wa.me/5493855374835?text=Hola,%20quisiera%20consultar%20por%20un%20evento%20en%20Complejo%20Giovanni`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white flex items-center gap-2"
                                >
                                    Consultar por Eventos →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Banner de Contacto Directo / Cómo Llegar ── */}
                <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-[44px] p-8 sm:p-14 shadow-2xl relative overflow-hidden text-slate-950 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <MapPin size={14} /> Choya, Santiago del Estero
                        </div>
                        <h3 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                            ¿Listo para jugar o reservar tu mesa?
                        </h3>
                        <p className="text-slate-900 font-bold text-xs sm:text-sm max-w-xl">
                            Escribinos o llamanos directamente al <strong className="font-black text-black">3855374835</strong> y te aseguramos el mejor turno y la mejor atención de la región.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <a 
                            href={wspUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                        >
                            <MessageCircle size={18} className="text-emerald-400" />
                            Enviar WhatsApp
                        </a>

                        <a 
                            href={`tel:${telefono}`}
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white/20 hover:bg-white/30 border border-black/10 text-slate-950 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            <Phone size={18} />
                            Llamar al 3855374835
                        </a>
                    </div>
                </div>

            </section>
        </div>
    );
}
