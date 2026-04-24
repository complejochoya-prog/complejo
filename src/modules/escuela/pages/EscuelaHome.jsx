import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Calendar, Phone, MessageCircle, ShieldCheck, Star, Trophy, ArrowRight, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function EscuelaHome() {
    const { negocioId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const categories = [
        { id: 1, name: 'Mini-Cracks', age: '4-6 años', days: 'Mar y Jue', time: '17:00 - 18:30', price: '$15.000' },
        { id: 2, name: 'Pre-Infantil', age: '7-9 años', days: 'Lun, Mie y Vie', time: '18:00 - 19:30', price: '$18.000' },
        { id: 3, name: 'Infantil', age: '10-12 años', days: 'Lun, Mie y Vie', time: '18:30 - 20:00', price: '$18.000' },
        { id: 4, name: 'Juveniles', age: '13-15 años', days: 'Mar y Jue', time: '19:00 - 21:00', price: '$20.000' },
    ];

    return (
        <div className="min-h-screen bg-[#030303] text-white pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
                
                {/* Hero Section */}
                <section className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-blue-900 to-black p-8 lg:p-16 border border-blue-500/20">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
                        <img 
                            src="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000" 
                            className="w-full h-full object-cover"
                            alt="Fútbol Base"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-900" />
                    </div>

                    <div className="relative z-10 space-y-8 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                            <Star size={14} className="text-blue-400 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Inscripciones Abiertas 2026</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                            Escuela de Fútbol <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 italic">GIOVANNI KIDS</span>
                        </h1>
                        
                        <p className="text-lg text-blue-100/60 font-medium leading-relaxed">
                            Formamos futbolistas, educamos personas. Entrenamientos especializados con profesionales de primer nivel en las mejores instalaciones del país.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 bg-white text-blue-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 hover:text-white transition-all shadow-xl"
                            >
                                Inscribirse Ahora
                            </button>
                            <a 
                                href={`https://wa.me/5491122334455?text=Hola! Quiero info sobre la escuela de fútbol`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                            >
                                <MessageCircle size={18} /> Contactar Admin
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-premium p-8 rounded-[32px] border border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 border border-blue-500/30">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Seguridad Total</h3>
                        <p className="text-sm text-white/50 leading-relaxed">Predio cerrado, servicio de emergencias médicas y coordinación permanente durante toda la jornada.</p>
                    </div>
                    <div className="glass-premium p-8 rounded-[32px] border border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/30">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Grupos Reducidos</h3>
                        <p className="text-sm text-white/50 leading-relaxed">Atención personalizada para cada niño, asegurando un aprendizaje técnico y táctico efectivo.</p>
                    </div>
                    <div className="glass-premium p-8 rounded-[32px] border border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                            <Trophy size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Competición</h3>
                        <p className="text-sm text-white/50 leading-relaxed">Participación en ligas inter-complejos y torneos regionales para fomentar el espíritu deportivo.</p>
                    </div>
                </section>

                {/* Categories / Schedules */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Nuestras <span className="text-blue-500 italic">Categorías</span></h2>
                        <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-bold">Horarios y Precios Mensuales</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                                
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black uppercase tracking-tight text-white">{cat.name}</h4>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{cat.age}</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3 text-white/60">
                                            <Calendar size={16} className="text-blue-500" />
                                            <span className="text-xs font-medium uppercase tracking-wider">{cat.days}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/60">
                                            <Users size={16} className="text-blue-500" />
                                            <span className="text-xs font-medium uppercase tracking-wider">{cat.time}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <div className="text-3xl font-black text-white italic tracking-tighter">{cat.price}</div>
                                        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">por mes</p>
                                    </div>

                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                    >
                                        Solicitar Vacante
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="rounded-[40px] bg-white p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center lg:text-left">
                        <h2 className="text-3xl lg:text-5xl font-black text-black uppercase tracking-tighter leading-none">
                            ¿Tenés <span className="italic text-blue-600">dudas?</span>
                        </h2>
                        <p className="text-black/60 font-medium max-w-md">
                            Nuestro equipo de administración está listo para asesorarte sobre inscripciones, uniformes y planes familiares.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <a href="tel:+5491122334455" className="flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                            <Phone size={18} /> Llamar Ahora
                        </a>
                        <a href="https://wa.me/5491122334455" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-8 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">
                            <MessageCircle size={18} /> Chat WhatsApp
                        </a>
                    </div>
                </section>

            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-xl bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => { setIsModalOpen(false); setIsSuccess(false); }}
                            className="absolute top-6 right-6 p-2 bg-white/5 text-white/50 hover:text-white rounded-full transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        {!isSuccess ? (
                            <div className="p-8 lg:p-12 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">Inscripción <span className="text-blue-500">2026</span></h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Completa los datos para reservar tu lugar</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Alumno</label>
                                        <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" placeholder="Ej: Mateo Messi" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Edad</label>
                                        <input type="number" className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" placeholder="Ej: 8" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tutor / Responsable</label>
                                        <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" placeholder="Ej: Lionel Messi" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp de Contacto</label>
                                        <input type="tel" className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500/50 outline-none transition-colors" placeholder="Ej: 11 1234 5678" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoría de Interés</label>
                                        <select className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500/50 outline-none transition-colors appearance-none">
                                            <option>Mini-Cracks (4-6 años)</option>
                                            <option>Pre-Infantil (7-9 años)</option>
                                            <option>Infantil (10-12 años)</option>
                                            <option>Juveniles (13-15 años)</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setIsSubmitting(true);
                                        setTimeout(() => {
                                            setIsSubmitting(false);
                                            setIsSuccess(true);
                                        }, 1500);
                                    }}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-[13px] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Pre-Inscripción'}
                                </button>
                            </div>
                        ) : (
                            <div className="p-12 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">¡Solicitud Enviada!</h3>
                                    <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">
                                        Recibimos tus datos correctamente. Un coordinador de la escuela se pondrá en contacto con vos vía WhatsApp en las próximas 24hs.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all"
                                >
                                    Entendido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
