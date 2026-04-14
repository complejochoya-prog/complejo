import React from 'react';
import { School, Trophy, Users, Clock, ArrowRight, MessageCircle, Star } from 'lucide-react';
import { useConfig } from '../../core/services/ConfigContext';
import { useTorneos } from '../../torneos/services/TorneosContext';

const ICON_MAP = {
    Trophy: Trophy,
    Users: Users,
    Clock: Clock,
    School: School
};

export default function SchoolPage() {
    const { businessInfo } = useConfig();
    const { schoolClasses } = useTorneos();

    const handleWhatsAppInscribe = (className) => {
        const message = encodeURIComponent(`Hola! Quiero inscribirme a ${className} en Complejo Giovanni.`);
        window.open(`https://wa.me/${businessInfo.whatsappContact}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-40 font-inter">
            <header className="px-6 py-10 space-y-2 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">ESCUELA DE <span className="text-gold">DEPORTES</span></h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Iniciación y Alto Rendimiento</p>
            </header>

            <main className="p-6 max-w-4xl mx-auto space-y-12">
                {/* Featured Section */}
                <section className="relative w-full bg-gold/10 border border-gold/30 rounded-[32px] p-8 md:p-12 overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gold italic">
                                <Star size={10} fill="currentColor" /> Cupos 2026 Abiertos
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-[0.9]">FORMA PARTE DE <br /> LA LEYENDA</h2>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider max-w-sm">
                                Nuestra escuela cuenta con profesores certificados y un ambiente formativo de primer nivel para todas las edades.
                            </p>
                        </div>
                        <button
                            onClick={() => handleWhatsAppInscribe("la Escuela de Deportes")}
                            className="flex items-center gap-2 bg-gold text-slate-950 px-8 py-5 rounded-2xl font-black uppercase tracking-widest italic transition-all hover:scale-105 shadow-xl shadow-gold/20"
                        >
                            <MessageCircle size={20} />
                            Inscribirme
                        </button>
                    </div>
                    <School className="absolute -right-20 -bottom-20 size-80 text-gold/5 -rotate-12" />
                </section>

                {/* Classes Catalog */}
                <section className="space-y-6">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter border-l-4 border-gold pl-4 leading-none">Nuestras Disciplinas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {schoolClasses.map((cls, idx) => {
                            const Icon = ICON_MAP[cls.icon] || Trophy;
                            return (
                                <div key={cls.id || idx} className="group bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-300">
                                    <div className="relative h-48 overflow-hidden">
                                        <img src={cls.img || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500&auto=format&fit=crop'} alt={cls.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                                        <div className="absolute top-4 left-4 p-3 bg-gold rounded-2xl text-slate-950">
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none">{cls.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cls.ageRange || cls.age}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} className="text-gold" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{cls.schedule}</span>
                                        </div>
                                        <button
                                            onClick={() => handleWhatsAppInscribe(cls.name)}
                                            className="w-full py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 hover:bg-white/5 hover:border-gold/30 transition-all"
                                        >
                                            Ver Detalles <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        {schoolClasses.length === 0 && (
                            <p className="col-span-full text-center py-20 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic border border-white/5 rounded-[32px]">Próximamente más disciplinas...</p>
                        )}
                    </div>
                </section>
            </main>

            <footer className="mt-10 px-6 max-w-4xl mx-auto">
                <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h5 className="text-lg font-black italic uppercase tracking-tighter mb-1">Membresía Escolar</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Beneficios exclusivos para grupos familiares</p>
                    </div>
                    <button
                        onClick={() => handleWhatsAppInscribe("Membresía Escolar")}
                        className="px-8 py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest italic hover:bg-gold hover:text-slate-950 transition-all"
                    >
                        Más Información
                    </button>
                </div>
            </footer>
        </div>
    );
}
