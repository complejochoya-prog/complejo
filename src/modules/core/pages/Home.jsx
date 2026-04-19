import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Utensils, Award, Users, PartyPopper, ChevronRight, Star, Zap, Tag, Trophy, Flame, Music, Target, Swords } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchEspacios } from '../../admin/services/espaciosService';
import { fetchPromos } from '../../admin/services/promosService';

export default function Home() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [animate, setAnimate] = useState(false);
    const [espacios, setEspacios] = useState([]);
    const [promos, setPromos] = useState([]);

    useEffect(() => { 
        setAnimate(true); 
        const load = async () => {
            const dataEsp = await fetchEspacios(negocioId);
            const dataPromo = await fetchPromos(negocioId);
            setEspacios(dataEsp.filter(e => e.active));
            setPromos(dataPromo.filter(p => p.active));
        };
        load();
        window.addEventListener('storage_espacios', load);
        window.addEventListener('storage_promos', load);
        return () => {
            window.removeEventListener('storage_espacios', load);
            window.removeEventListener('storage_promos', load);
        };
    }, [negocioId]);

    const activePromo = promos.find(p => p.type === 'promo') || { title: 'PROMOCIÓN SEMANAL', desc: 'Consultá nuestras ofertas.' };
    const firstEvent = promos.find(p => p.type === 'evento') || { title: 'FESTEJÁ TU CUMPLE', desc: 'Armamos tu evento a medida.' };

    const basePath = `/${negocioId}`;
    const businessName = config?.nombre || negocioId?.toUpperCase() || 'COMPLEJO GIOVANNI';

    return (
        <div className={`relative min-h-screen overflow-hidden transition-all duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Animated Background Layers */}
            <div className="fixed inset-0 z-0 bg-slate-950">
                <div className="absolute inset-0 animate-mesh opacity-30" />
                <div className="absolute inset-0 bg-grid-white" />
                
                {/* Glowing Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 p-4 lg:p-10 space-y-12 pb-32 max-w-7xl mx-auto">
                
                {/* Header Welcome Section */}
                <header className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-[1px] w-8 bg-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Bienvenido a {businessName}</span>
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">
                        VIVÍ LA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 text-glow">EXPERIENCIA</span>
                    </h1>
                </header>

                {/* Moving Text Marquee (Letras con movimientos) */}
                <div className="relative w-full overflow-hidden py-4 border-y border-white/5 bg-white/5 backdrop-blur-sm -mx-4 lg:-mx-10 px-4 lg:px-10">
                    <div className="flex animate-marquee whitespace-nowrap">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center gap-12 mr-12">
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white/40 flex items-center gap-4">
                                    <Target className="text-amber-500" size={24} /> FÚTBOL 5 & 7
                                </span>
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white/40 flex items-center gap-4">
                                    <Trophy className="text-amber-500" size={24} /> TORNEOS RELÁMPAGO
                                </span>
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white/40 flex items-center gap-4">
                                    <Flame className="text-amber-500" size={24} /> PARRILLA & BAR
                                </span>
                                <span className="text-2xl font-black italic uppercase tracking-tighter text-white/40 flex items-center gap-4">
                                    <Music className="text-amber-500" size={24} /> EVENTOS SOCIALES
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Banner with enhanced depth */}
                <section className="relative h-[300px] lg:h-[500px] rounded-[48px] overflow-hidden group shadow-2xl shadow-black">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
                        className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s] ease-out"
                        alt="Cancha de Fútbol"
                    />

                    <div className="absolute inset-x-8 bottom-10 lg:bottom-16 lg:left-16 z-20 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl">
                            <Zap size={14} className="text-amber-500" fill="currentColor" />
                            <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-white">RESERVAS ONLINE 24/7</span>
                        </div>
                        <h2 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white max-w-2xl">
                            DOMINÁ EL <span className="text-amber-500 italic">CAMPO</span>
                        </h2>
                        <div className="flex gap-4">
                           <Link to={`${basePath}/reservas`} className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 shadow-xl shadow-amber-500/20">
                               Reservar Ahora
                           </Link>
                           <Link to={`${basePath}/menu`} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all transform hover:-translate-y-1">
                               Ver Bar
                           </Link>
                        </div>
                    </div>
                </section>

                {/* Main Action - Floating Style */}
                <section className="relative -mt-20 z-30 px-4 max-w-4xl mx-auto">
                    <div className="animate-float">
                        <Link to={`${basePath}/reservas`} className="flex items-center justify-between glass-premium p-8 lg:p-10 rounded-[40px] shadow-2xl group transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[28px] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:rotate-6 transition-transform">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <Calendar className="text-black relative z-10" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none text-white">PANEL DE JUEGO</h3>
                                    <p className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mt-2 text-white/50">Tu victoria comienza con una reserva</p>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                                <ChevronRight size={28} />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Espacios Deportivos - Modern Cards */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter italic text-white line-through decoration-amber-500 decoration-4">ARENAS</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Canchas homologadas para alta competición</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {espacios.map((espacio, i) => {
                             const isBar = (espacio.name || '').toLowerCase().includes('bar') || 
                                         (espacio.desc || '').toLowerCase().includes('bar') ||
                                         (espacio.tipo || '').toLowerCase().includes('bar');
                            const targetPath = isBar ? `${basePath}/menu` : `${basePath}/app/reservar/${espacio.id}`;

                            return (
                                <Link key={espacio.id || i} to={targetPath} className="group relative h-[450px] rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl transition-all hover:border-amber-500/30">
                                    <img src={espacio.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-40 group-hover:opacity-80" alt={espacio.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                    
                                    <div className="absolute top-8 right-8">
                                        <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                            {isBar ? <Utensils size={20} /> : <Zap size={20} />}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-10 left-10 right-10 space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                                                {espacio.category || 'Recreativo'}
                                            </span>
                                        </div>
                                        <div className="h-1 w-12 bg-amber-500 mb-4 group-hover:w-full transition-all duration-500" />
                                        <h4 className="text-2xl font-black uppercase tracking-tight text-white leading-none">{espacio.name}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-500/80 transition-colors">{espacio.desc}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Promociones y Eventos - Bento Grid Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-950 rounded-[56px] p-10 lg:p-14 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-white/10 blur-[100px] animate-pulse" />
                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                <Tag size={14} className="text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">OFERTA ACTIVA</span>
                            </div>
                            <h3 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
                                {activePromo.title.toUpperCase()}
                            </h3>
                            <p className="text-sm lg:text-lg text-blue-100/60 font-medium max-w-md">
                                {activePromo.desc}
                            </p>
                            <Link to={`${basePath}/eventos`} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-900 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-amber-500 hover:text-black transition-all transform hover:scale-105">
                                RECLAMAR PROMO <ChevronRight size={16} />
                            </Link>
                        </div>
                    </section>

                    <section className="bg-slate-900 border border-white/10 rounded-[56px] p-10 relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <PartyPopper className="text-amber-500" size={28} />
                                </div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                                    TÚ EVENTO, <br /> <span className="text-amber-500">NUESTRA</span> REGLA
                                </h3>
                            </div>
                            <Link to={`${basePath}/eventos`} className="mt-8 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all text-center">
                                Reservar Fecha
                            </Link>
                        </div>
                        <Users size={300} className="absolute -bottom-20 -right-20 text-white/[0.03] group-hover:scale-110 transition-transform duration-[2s]" />
                    </section>
                </div>

                {/* Desafío CTA Section */}
                <section className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-[56px] p-10 lg:p-14 overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 -mr-12 -mb-12 opacity-10 group-hover:scale-110 transition-transform duration-[2s]">
                        <Swords size={240} />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                        <div className="w-20 h-20 rounded-[28px] bg-white/20 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl shrink-0">
                            <Swords size={40} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
                                ZONA DE <span className="text-black/80">DESAFÍO</span>
                            </h3>
                            <p className="text-xs lg:text-sm font-bold text-white/60 uppercase tracking-[0.2em] max-w-lg">
                                ¿Buscás rival? ¿Necesitás completar equipo? Publicá tu disponibilidad y encontrá partido.
                            </p>
                            <Link to={`${basePath}/desafio`} className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-amber-900 bg-white px-10 py-5 rounded-3xl hover:bg-amber-100 transition-all transform hover:scale-105 shadow-xl">
                                Entrar al Desafío <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Final CTA - Social Experience */}
                <section className="glass-premium rounded-[56px] p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-12 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
                    <div className="relative z-10 w-32 h-32 lg:w-44 lg:h-44 rounded-[40px] bg-slate-800 flex items-center justify-center text-amber-500 shadow-2xl">
                        <Utensils size={64} className="group-hover:rotate-12 transition-transform" />
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl animate-pulse" />
                    </div>
                    <div className="relative z-10 flex-1 text-center lg:text-left space-y-4">
                        <h3 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                            EL TERCER <br /> <span className="text-amber-500">TIEMPO</span>
                        </h3>
                        <p className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] max-w-xl mx-auto lg:mx-0">
                            No es solo fútbol. Es la pizza que compartís después, la cerveza fría y las risas con tu equipo. Descubrí nuestro Bar & Grill.
                        </p>
                        <Link to={`${basePath}/menu`} className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-black bg-amber-500 px-10 py-5 rounded-3xl hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-amber-500/20">
                            Explorar Menú <ChevronRight size={18} />
                        </Link>
                    </div>
                    <div className="relative z-10 hidden xl:flex gap-6">
                        <div className="relative group/img">
                            <img src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=400" className="w-40 h-56 rounded-[40px] object-cover hover:scale-105 transition-all shadow-2xl" alt="Burger" />
                            <div className="absolute inset-0 rounded-[40px] ring-1 ring-white/20 inset-y-0" />
                        </div>
                        <div className="relative group/img pt-12">
                            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400" className="w-40 h-56 rounded-[40px] object-cover hover:scale-105 transition-all shadow-2xl" alt="Pizza" />
                            <div className="absolute inset-0 rounded-[40px] ring-1 ring-white/20 inset-y-0" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

