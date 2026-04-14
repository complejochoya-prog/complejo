import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Utensils, Trophy, Star, ChevronRight, Zap, LayoutGrid, ArrowRight, Thermometer, Wind, Droplets, CloudSun, Clock, Cake, Wine, Music, Camera, Gift, Check } from 'lucide-react';
import { useConfig } from '../../core/services/ConfigContext';
import { useUI } from '../services/UIContext';
import { useReservas } from '../../reservas/services/ReservasContext';

// ── Weather Hook (Open-Meteo, sin API key) ──
function useWeather() {
    const [weather, setWeather] = useState(null);
    useEffect(() => {
        const LAT = -28.4944;
        const LNG = -64.8551;
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode&timezone=America/Argentina/Buenos_Aires`
        )
            .then(r => r.json())
            .then(data => {
                const c = data.current;
                const code = c.weathercode;
                // WMO weather icons
                const icon =
                    code === 0 ? '☀️' :
                        code <= 3 ? '⛅' :
                            code <= 49 ? '🌫️' :
                                code <= 69 ? '🌧️' :
                                    code <= 79 ? '🌨️' :
                                        code <= 99 ? '⛈️' : '🌡️';
                setWeather({
                    temp: Math.round(c.temperature_2m),
                    feels: Math.round(c.apparent_temperature),
                    humidity: c.relative_humidity_2m,
                    wind: Math.round(c.wind_speed_10m),
                    icon,
                });
            })
            .catch(() => setWeather(null));
    }, []);
    return weather;
}

// ── Clock Hook ──
function useCurrentTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 30000); // Actualiza cada 30 segundos
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('es-AR', options).replace(/^\w/, (c) => c.toUpperCase());
    };

    return {
        time: formatTime(time),
        date: formatDate(time)
    };
}

const SPACES = [
    {
        id: 'futbol',
        label: 'Cancha de Fútbol',
        tag: 'Fútbol',
        emoji: '⚽',
        description: 'Fútbol 5 con iluminación LED. Piso sintético profesional.',
        img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=900&auto=format&fit=crop',
        color: 'from-emerald-600/80',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
    },
    {
        id: 'voley',
        label: 'Cancha de Vóley',
        tag: 'Vóley',
        emoji: '🏐',
        description: 'Cancha de vóley de arena. Perfecta para competencia y recreación.',
        img: 'https://images.unsplash.com/photo-1593787467023-507ef4c6596e?q=80&w=900&auto=format&fit=crop',
        color: 'from-blue-600/80',
        accent: 'text-blue-400',
        border: 'border-blue-500/30',
    },
    {
        id: 'piscina',
        label: 'Piscina',
        tag: 'Piscina',
        emoji: '🏊',
        description: 'Pileta olímpica climatizada. Capacidad máxima 10 personas.',
        img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=900&auto=format&fit=crop',
        color: 'from-cyan-600/80',
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
    },
    {
        id: 'quincho',
        label: 'Quincho',
        tag: 'Quincho',
        emoji: '🔥',
        description: 'Quincho techado con parrilla incluida. Ideal para grupos y celebraciones.',
        img: 'https://images.unsplash.com/photo-1519690835782-4ee92fd5033b?q=80&w=900&auto=format&fit=crop',
        color: 'from-orange-600/80',
        accent: 'text-orange-400',
        border: 'border-orange-500/30',
    },
    {
        id: 'evento',
        label: 'Espacio para tu Evento',
        tag: 'Evento',
        emoji: '🎉',
        description: 'Salón multiusos para fiestas, cumpleaños y eventos corporativos.',
        img: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=900&auto=format&fit=crop',
        color: 'from-purple-600/80',
        accent: 'text-purple-400',
        border: 'border-purple-500/30',
    },
];

export default function Home() {
    const { businessInfo } = useConfig();
    const { homeContent } = useUI();
    const { resources } = useReservas();
    const navigate = useNavigate();
    const weather = useWeather();
    const { time, date } = useCurrentTime();

    const handleBookSpace = (space) => {
        const resource = resources.find(r =>
            r.name.toLowerCase().includes(space.tag.toLowerCase()) ||
            r.id === space.id
        ) || { id: space.id, name: space.label, price: 12000, category: 'Deportes' };
        navigate('/booking-flow', { state: { preselectedResource: resource } });
    };

    return (
        <div className="min-h-screen bg-slate-950 font-inter text-white overflow-x-hidden">

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 px-5 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="bg-gold p-1.5 rounded-xl rotate-3 shadow-lg shadow-gold/20">
                            <Trophy size={16} className="text-slate-950 fill-slate-950" />
                        </div>
                        <span className="text-lg font-black italic tracking-tighter uppercase leading-none hidden sm:block">
                            {businessInfo.businessName?.split(' ')[0] || 'GIOVANNI'}
                            <span className="text-gold ml-1 not-italic font-light opacity-70">
                                {businessInfo.businessName?.split(' ').slice(1).join(' ') || 'COMPLEJO'}
                            </span>
                        </span>
                    </div>

                    {/* ── Time & Date Widget ── */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-white/[0.05] border border-white/10 rounded-2xl px-3 sm:px-4 py-2">
                        <div className="bg-gold/10 p-1.5 rounded-lg border border-gold/20">
                            <Clock size={14} className="text-gold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black italic tracking-tighter text-white leading-none">
                                {time} HS
                            </span>
                            <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-500 leading-none mt-1">
                                {date}
                            </span>
                        </div>
                    </div>

                    {/* ── Weather Widget ── */}

                    {weather ? (
                        <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2 flex-1 max-w-sm mx-auto">
                            <span className="text-xl leading-none">{weather.icon}</span>
                            <div className="min-w-0">
                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 truncate">
                                    Choya · Sgo. del Estero
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-base font-black italic text-gold tracking-tight leading-none">{weather.temp}°C</span>
                                    <div className="flex items-center gap-2.5 text-[8px] font-bold text-slate-400">
                                        <span className="flex items-center gap-0.5">
                                            <Thermometer size={9} className="text-orange-400 shrink-0" />
                                            ST {weather.feels}°
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Droplets size={9} className="text-blue-400 shrink-0" />
                                            {weather.humidity}%
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Wind size={9} className="text-slate-400 shrink-0" />
                                            {weather.wind}km/h
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2 flex-1 max-w-sm mx-auto animate-pulse">
                            <CloudSun size={14} className="text-slate-600 shrink-0" />
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Cargando clima...</span>
                        </div>
                    )}

                    <Link to="/login" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-gold transition-colors px-3 py-2 border border-white/10 rounded-xl hover:border-gold/30 shrink-0">
                        Admin
                    </Link>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="relative h-[300px] md:h-[460px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1400&auto=format&fit=crop"
                    alt="Complejo Giovanni"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />

                <div className="absolute bottom-10 left-6 md:left-12 space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-[9px] font-black text-gold uppercase tracking-[0.3em]">Abierto ahora</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter">
                        {businessInfo.heroTitle || 'EL LUGAR DONDE'}
                        <br />
                        <span className="text-gold">{businessInfo.heroSubtitle || 'NACE LA PASIÓN'}</span>
                    </h1>
                    <Link
                        to="/booking-flow"
                        className="inline-flex items-center gap-3 bg-gold text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm hover:scale-105 transition-transform shadow-2xl shadow-gold/30"
                    >
                        Reservar Ahora <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Quick Nav ── */}
            <section className="px-6 py-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { to: '/booking-flow', icon: Calendar, label: 'Reservas' },
                        { to: '/menu', icon: Utensils, label: 'Bar' },
                        { to: '/tournaments', icon: Trophy, label: 'Torneos' },
                        { to: '/school', icon: LayoutGrid, label: 'Escuelas' },
                    ].map(({ to, icon: Icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-2 bg-white/[0.03] border border-white/8 rounded-[24px] py-5 hover:bg-gold/10 hover:border-gold/30 transition-all group"
                        >
                            <Icon size={24} className="text-gold transition-transform group-hover:scale-110" strokeWidth={1.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Spaces Grid ── */}
            <section className="px-6 pb-10 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter border-l-4 border-gold pl-4 leading-none">
                        Nuestros Espacios
                    </h2>
                    <Link to="/booking-flow" className="flex items-center gap-1 text-[9px] font-black text-gold uppercase tracking-widest hover:opacity-70 transition-opacity">
                        Ver todos <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Featured top row: 2 big cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SPACES.slice(0, 2).map((space) => (
                        <SpaceCard key={space.id} space={space} onBook={handleBookSpace} size="large" />
                    ))}
                </div>

                {/* Second row: 3 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SPACES.slice(2).map((space) => (
                        <SpaceCard key={space.id} space={space} onBook={handleBookSpace} size="medium" />
                    ))}
                </div>
            </section>

            {/* ── Birthday Section ── */}
            <section className="px-6 pb-20 max-w-7xl mx-auto space-y-12">
                <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-purple-900/20 to-slate-950 border border-purple-500/20 p-8 md:p-16">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-96 bg-purple-600/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-96 bg-gold/5 blur-[100px] rounded-full" />

                    <div className="relative z-10 space-y-12">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
                                <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Celebraciones GIOVANNI</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                                🎂 FESTEJÁ TU CUMPLE <br />
                                <span className="text-gold">CON NOSOTROS</span>
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-2xl mx-auto leading-relaxed">
                                Promos especiales para grupos con pizzas, tragos, brindis y música. <br />
                                Armá tu festejo y nosotros nos encargamos de todo.
                            </p>
                        </div>

                        {/* Promos Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Promo Premium */}
                            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:border-gold/50 transition-all duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="size-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                            <Star size={24} className="text-gold fill-gold" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-gold text-slate-950 px-3 py-1 rounded-lg">Premium</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cumpleaños 10 Personas Premium</h3>
                                    <ul className="space-y-3">
                                        {[
                                            '5 Pizzas a elección',
                                            '10 Tragos',
                                            'Bebidas inclusas',
                                            'Champagne para el brindis',
                                            'Música de cumpleaños'
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                                <div className="size-5 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                                                    <Check size={10} className="text-gold" strokeWidth={3} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link to="/menu" className="mt-8 flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm hover:bg-gold hover:text-slate-950 transition-all group">
                                    Ver Promo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Promo Clásica */}
                            <div className="bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:border-purple-500/50 transition-all duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                            <Zap size={24} className="text-purple-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500 text-white px-3 py-1 rounded-lg">Clásico</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cumpleaños 10 Personas Clásico</h3>
                                    <ul className="space-y-3">
                                        {[
                                            '3 Pizzas a elección',
                                            '12 Empanadas',
                                            '4 Papas fritas',
                                            'Bebidas inclusas',
                                            'Champagne de brindis'
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                                <div className="size-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                                    <Check size={10} className="text-purple-400" strokeWidth={3} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link to="/menu" className="mt-8 flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm hover:bg-purple-500 hover:text-white transition-all group">
                                    Ver Promo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Benefits Icons Section */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { icon: Cake, label: 'Canción de cumpleaños' },
                                { icon: Wine, label: 'Brindis con champagne' },
                                { icon: Utensils, label: 'Combos para grupos' },
                                { icon: Music, label: 'Ambiente festivo' },
                                { icon: Camera, label: 'Ideal para amigos' },
                                { icon: Gift, label: 'Atención exclusiva' }
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                                    <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <Icon size={20} className="text-purple-400" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 text-center leading-tight">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof & CTA */}
                        <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="size-8 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Más de 200 cumpleaños festejados este año 🎉</span>
                            </div>

                            <Link
                                to="/booking-flow?type=cumple"
                                className="w-full md:w-auto px-12 py-5 bg-gold text-slate-950 font-black italic uppercase tracking-tighter text-lg rounded-2xl hover:scale-105 hover:bg-white transition-all shadow-2xl shadow-gold/30 flex items-center justify-center gap-3"
                            >
                                Reservar Cumpleaños <ArrowRight size={24} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Promo Banner ── */}
            <section className="mx-6 mb-10 max-w-7xl md:mx-auto">
                <div className="relative bg-gold/10 border-2 border-dashed border-gold/30 rounded-[32px] p-8 overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left space-y-2">
                            <span className="text-gold text-[9px] font-black uppercase tracking-[0.3em]">
                                {homeContent?.offer?.badge || 'Promoción Especial'}
                            </span>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                                {homeContent?.offer?.title || '10% OFF EN TU PRIMERA RESERVA'}
                            </h3>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-slate-950 px-8 py-4 rounded-2xl border border-gold/40 text-2xl font-black tracking-widest text-gold italic">
                                {homeContent?.offer?.code || 'GIOVANNI10'}
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Usar al reservar</span>
                        </div>
                    </div>
                    <Star className="absolute -right-8 -bottom-8 size-48 text-gold/5 rotate-12" />
                    <Zap className="absolute -left-6 -top-6 size-32 text-gold/5 -rotate-12" />
                </div>
            </section>

            <footer className="border-t border-white/5 py-10 px-6 text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em]">
                © 2026 GIOVANNI COMPLEJO · SISTEMA DE GESTIÓN MAESTRA
            </footer>
        </div>
    );
}

// ── Space Card Component ──
function SpaceCard({ space, onBook, size }) {
    const isLarge = size === 'large';

    return (
        <div
            className={`relative overflow-hidden rounded-[28px] group cursor-pointer ${isLarge ? 'h-[300px] md:h-[380px]' : 'h-[240px]'}`}
            onClick={() => onBook(space)}
        >
            {/* Image */}
            <img
                src={space.img}
                alt={space.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${space.color} via-slate-950/60 to-transparent opacity-90`} />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6">
                {/* Top badge */}
                <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border ${space.border} ${space.accent}`}>
                        {space.emoji} {space.tag}
                    </span>
                    <div className="size-8 rounded-full bg-gold/20 backdrop-blur-md border border-gold/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <ArrowRight size={14} className="text-gold" />
                    </div>
                </div>

                {/* Bottom info */}
                <div className="space-y-3">
                    <div>
                        <h3 className={`font-black italic uppercase tracking-tighter leading-none ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                            {space.label}
                        </h3>
                        {isLarge && (
                            <p className="text-[10px] font-medium text-white/70 mt-1.5 uppercase tracking-wider">
                                {space.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBook(space); }}
                        className="flex items-center gap-2 bg-gold text-slate-950 font-black uppercase tracking-tighter text-[10px] px-5 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gold/20 w-fit"
                    >
                        Reservar ahora <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}
