import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Utensils, Award, Users, PartyPopper, ChevronRight, Star, MapPin, Zap } from 'lucide-react';

export default function Home() {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    return (
        <div className={`p-4 lg:p-10 space-y-10 pb-24 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Hero Banner */}
            <section className="relative h-[240px] lg:h-[400px] rounded-[40px] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                <img 
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" 
                    alt="Cancha de Fútbol" 
                />
                
                <div className="absolute inset-x-8 bottom-8 lg:bottom-12 lg:left-12 z-20 space-y-2 lg:space-y-4">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/20 px-3 py-1 rounded-full">
                        <Star size={10} className="text-amber-500" fill="currentColor" />
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-amber-500">Premium Sport Experience</span>
                    </div>
                    <h2 className="text-3xl lg:text-6xl font-black italic tracking-tighter uppercase leading-[0.85] text-white max-w-lg">
                        EL MEJOR <span className="text-amber-500">COMPLEJO</span> DE LA CIUDAD
                    </h2>
                    <p className="text-xs lg:text-sm text-slate-300 font-bold uppercase tracking-widest max-w-sm">
                        Deporte, Pasión y Amigos en un solo lugar.
                    </p>
                </div>
            </section>

            {/* Main Action - Reservar */}
            <section className="relative -mt-16 z-30 px-4">
                <Link to="/reservar" className="flex items-center justify-between bg-amber-500 text-black p-6 lg:p-8 rounded-[32px] shadow-2xl shadow-amber-500/20 group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                            <Calendar className="text-amber-500" size={24} lg:size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter leading-none">RESERVAR CANCHA</h3>
                            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-1 opacity-60 text-black">Asegura tu lugar ahora mismo</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-amber-500 transition-all">
                        <ChevronRight size={24} />
                    </div>
                </Link>
            </section>

            {/* Espacios Deportivos */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Nuestros <span className="text-amber-500 text-2xl lg:text-3xl">Espacios</span></h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Habilitados para juego profesional</p>
                    </div>
                    <Link to="/reservar" className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 group">
                        Ver todos <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { title: 'Fútbol 5 sintético', desc: 'Cesped PRO-FIFA', img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800' },
                        { title: 'Fútbol 7 profesional', desc: 'Iluminación LED', img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800' },
                        { title: 'Padel Glass Pro', desc: 'Canchas vidriadas', img: 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800' },
                    ].map((espacio, i) => (
                        <div key={i} className="group relative h-[300px] rounded-[32px] overflow-hidden border border-white/5 bg-slate-900 shadow-xl">
                            <img src={espacio.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" alt={espacio.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1 leading-none">{espacio.title}</h4>
                                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{espacio.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Promociones y Eventos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Promo Card */}
                <section className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <Zap className="text-white" size={24} />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
                            PROMOCIÓN <br /> DE LA <span className="text-amber-400">SEMANA</span>
                        </h3>
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-widest max-w-xs">
                            Reservando de Lunes a Jueves obtenés un 20% OFF + 1 Pack de cervezas de regalo.
                        </p>
                        <button className="px-6 py-3 bg-white text-blue-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all">
                            Aprovechar Promo
                        </button>
                    </div>
                    <Zap size={200} className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
                </section>

                {/* Eventos */}
                <section className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 lg:p-10 relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <PartyPopper className="text-amber-500" size={24} />
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
                            FESTEJÁ TU <br /> <span className="text-amber-500">CUMPLEAÑOS</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs">
                            Combo Fútbol + Parrilla + Bebidas. Nos encargamos de todo el evento.
                        </p>
                        <button className="px-6 py-3 bg-slate-800 text-white border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:border-amber-500/50 transition-all">
                            Consultar Eventos
                        </button>
                    </div>
                    <Users size={200} className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                </section>
            </div>

            {/* Bar & Restaurante Fast Access */}
            <section className="bg-slate-900 border border-white/5 rounded-[40px] p-8 flex flex-col lg:flex-row items-center gap-8 group">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-slate-800 flex items-center justify-center text-amber-500 shadow-2xl relative">
                    <Utensils size={40} className="relative z-10" />
                    <div className="absolute inset-0 bg-amber-500/10 animate-pulse rounded-3xl" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter">BAR & RESTO GIOVANNI</h3>
                    <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 mb-6 max-w-md mx-auto lg:mx-0">
                        Hamburgesas, pizzas, picadas y las mejores cervezas tiradas para después del partido.
                    </p>
                    <Link to="/menu" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 px-6 py-3 rounded-full hover:bg-amber-500 hover:text-black transition-all">
                        Ver Menú Digital <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="hidden lg:flex gap-4">
                    <img src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=400" className="w-32 h-32 rounded-3xl object-cover hover:rotate-2 transition-all" alt="Burger" />
                    <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400" className="w-32 h-32 rounded-3xl object-cover -rotate-2 transition-all" alt="Pizza" />
                </div>
            </section>

        </div>
    );
}
