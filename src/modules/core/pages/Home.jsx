import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Utensils, Zap, Tag, PartyPopper, ChevronRight, Swords, Clock, MapPin, Star, ShieldCheck, Trophy, CloudSun, Thermometer, Droplets } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchEspacios } from '../../admin/services/espaciosService';
import { fetchPromos } from '../../admin/services/promosService';

export default function Home() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [animate, setAnimate] = useState(false);
    const [espacios, setEspacios] = useState([]);
    const [promos, setPromos] = useState([]);
    const [weather, setWeather] = useState({ temp: '--', condition: 'Cargando...', icon: CloudSun });

    useEffect(() => { 
        // Initial delay for smooth entrance
        setTimeout(() => setAnimate(true), 100);
        const load = async () => {
            const dataEsp = await fetchEspacios(negocioId);
            const dataPromo = await fetchPromos(negocioId);
            setEspacios(dataEsp.filter(e => e.active !== false));
            setPromos(dataPromo.filter(p => p.active !== false));
        };
        load();

        // Fetch Weather
        const fetchWeather = async (lat, lon) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`);
                const data = await res.json();
                const code = data.current.weather_code;
                let condition = 'Despejado';
                if (code > 0 && code < 4) condition = 'Parcialmente Nublado';
                if (code >= 45 && code <= 48) condition = 'Niebla';
                if (code >= 51 && code <= 67) condition = 'Lluvia';
                if (code >= 71 && code <= 77) condition = 'Nieve';
                if (code >= 80 && code <= 82) condition = 'Chubascos';
                if (code >= 95) condition = 'Tormenta';

                setWeather({
                    temp: Math.round(data.current.temperature_2m),
                    humidity: data.current.relative_humidity_2m,
                    condition
                });
            } catch (error) {
                console.error("Weather error:", error);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(-34.6037, -58.3816) // Default to BA if denied
            );
        } else {
            fetchWeather(-34.6037, -58.3816);
        }

        window.addEventListener('storage_espacios', load);
        window.addEventListener('storage_promos', load);
        return () => {
            window.removeEventListener('storage_espacios', load);
            window.removeEventListener('storage_promos', load);
        };
    }, [negocioId]);

    const activePromo = promos.find(p => p.type === 'promo') || { title: 'PROMOCIÓN SEMANAL', desc: 'Consultá nuestras ofertas exclusivas y ahorrá en tu próxima reserva.' };
    
    const basePath = `/${negocioId}`;
    const businessName = config?.nombre || negocioId?.toUpperCase() || 'GIOVANNI SPORTS';

    return (
        <div className={`relative min-h-screen bg-[#030303] text-white overflow-hidden transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/10 rounded-full blur-[150px]" />
                {/* Removed noise.svg to prevent 404 */}
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-12 pt-8 pb-32 space-y-16 lg:space-y-24">
                
                {/* Hero Section */}
                <section className="relative min-h-[75vh] lg:min-h-[85vh] flex flex-col justify-center rounded-[40px] overflow-hidden group">
                    <div className="absolute inset-0 bg-black">
                        <img
                            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
                            className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out"
                            alt="Hero Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/50" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-20 p-6 lg:p-16 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 lg:gap-12 mt-auto">
                        <div className="space-y-6 w-full lg:w-2/3">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Complejo Deportivo Premium</span>
                            </div>
                            
                            <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] text-white">
                                <span className="block opacity-90">{businessName}</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 italic block mt-2">TU LUGAR</span>
                            </h1>
                            
                            <p className="text-sm lg:text-lg font-medium text-white/60 max-w-xl leading-relaxed">
                                Instalaciones de primer nivel. Reservas instantáneas. 
                                Gastronomía excepcional. Elevamos tu juego dentro y fuera de la cancha.
                            </p>
                        </div>

                        {/* Weather Widget Glass Card */}
                        <div className="w-full lg:w-1/3 glass-premium p-6 lg:p-8 rounded-[32px] border border-white/10 relative overflow-hidden group/card hover:border-blue-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                                        <CloudSun size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estado del tiempo</p>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter mt-0.5">{weather.condition}</p>
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <div className="flex items-start">
                                        <span className="text-6xl font-black tracking-tighter text-white">{weather.temp}</span>
                                        <span className="text-2xl font-black text-blue-500 mt-2">°C</span>
                                    </div>
                                    <div className="pb-2 space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            <Droplets size={12} className="text-blue-500" />
                                            <span>{weather.humidity || 0}% Hum.</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            <Thermometer size={12} className="text-amber-500" />
                                            <span>Sensación Real</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`${basePath}/reservas`} className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10">
                                    RESERVAR <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Facilities (Arenas) Grid */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">
                                NUESTROS <span className="text-amber-500">ESPACIOS</span>
                            </h2>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Campos homologados para alta competición</p>
                        </div>
                        <Link to={`${basePath}/reservas`} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-white transition-colors">
                            Ver Disponibilidad <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {espacios.map((espacio, i) => {
                            const isBar = (espacio.name || '').toLowerCase().includes('bar') || 
                                        (espacio.desc || '').toLowerCase().includes('bar') ||
                                        (espacio.tipo || '').toLowerCase().includes('bar');
                            const targetPath = isBar ? `${basePath}/menu` : `${basePath}/app/reservar/${espacio.id}`;

                            return (
                                <Link key={espacio.id || i} to={targetPath} className="group relative h-[400px] lg:h-[480px] rounded-[32px] overflow-hidden bg-white/5 border border-white/5 hover:border-amber-500/50 transition-all duration-500">
                                    <img src={espacio.img || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800'} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" alt={espacio.name} />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                    
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                            {espacio.category || 'Deportes'}
                                        </span>
                                    </div>

                                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black group-hover:border-transparent transition-all">
                                        {isBar ? <Utensils size={18} /> : <Zap size={18} />}
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="h-1 w-12 bg-amber-500 mb-4 rounded-full" />
                                        <h4 className="text-3xl font-black uppercase tracking-tight text-white leading-none mb-2">{espacio.name}</h4>
                                        <p className="text-sm font-medium text-white/60 line-clamp-2">{espacio.desc}</p>
                                        
                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                            {isBar ? 'Ver Menú' : 'RESERVAR'} <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Experiences / Promo Bento Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Main Promo Box */}
                    <div className="col-span-1 lg:col-span-8 relative rounded-[40px] overflow-hidden bg-gradient-to-br from-indigo-900 to-black p-8 lg:p-14 group border border-white/5">
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                            <div className="absolute top-[-50%] right-[-20%] w-[100%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.4)_0%,transparent_70%)] rotate-12" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-md border border-white/20">
                                    <Tag size={12} className="text-amber-400" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">Destacado</span>
                                </div>
                                <h3 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                                    {activePromo.title}
                                </h3>
                                <p className="text-base lg:text-lg font-medium text-indigo-100/70 max-w-lg">
                                    {activePromo.desc}
                                </p>
                            </div>
                            <div className="mt-12">
                                <Link to={`${basePath}/promos`} className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/10">
                                    Ver Ofertas
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Events / Social Box */}
                    <div className="col-span-1 lg:col-span-4 relative rounded-[40px] overflow-hidden bg-[#0a0a0a] border border-white/10 p-8 lg:p-10 group hover:border-amber-500/30 transition-colors">
                        <PartyPopper className="absolute -bottom-10 -right-10 text-white/[0.02] w-64 h-64 group-hover:rotate-12 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black mb-8 shadow-lg shadow-amber-500/20">
                                <Star size={24} fill="currentColor" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">
                                EVENTOS <br/><span className="text-white/40 italic">ÚNICOS</span>
                            </h3>
                            <p className="text-sm text-white/50 font-medium mb-12">
                                Celebra cumpleaños, eventos corporativos o torneos privados con nosotros.
                            </p>
                            <a 
                                href={`https://wa.me/${config?.telefono || '5493834555555'}?text=Hola! Quiero planificar un evento en ${businessName}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-white transition-colors"
                            >
                                Contactar por WhatsApp <ChevronRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Desafío Box */}
                    <div className="col-span-1 lg:col-span-12 relative rounded-[40px] overflow-hidden p-8 lg:p-14 group flex flex-col lg:flex-row items-center gap-8 lg:gap-10 bg-gradient-to-r from-red-950 to-black border border-red-900/50">
                        {/* Removed noise.svg to prevent 404 */}
                        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                            <Swords size={48} className="text-red-500" />
                        </div>
                        
                        <div className="relative z-10 flex-1 text-center lg:text-left">
                            <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-white mb-2">
                                ZONA DE DESAFÍO
                            </h3>
                            <p className="text-sm lg:text-base font-medium text-red-200/60 max-w-2xl mx-auto lg:mx-0">
                                ¿Te falta uno para el partido? ¿Querés medirte contra otros equipos? Entrá a la bolsa de jugadores y encontrá tu próximo reto.
                            </p>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <Link to={`${basePath}/desafio`} className="inline-flex items-center justify-center px-10 py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg shadow-red-900/50">
                                Ingresar al Desafío
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Escuela de Fútbol Bento Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <div className="col-span-1 lg:col-span-12 relative rounded-[40px] overflow-hidden p-8 lg:p-14 group flex flex-col lg:flex-row items-center gap-8 lg:gap-10 bg-gradient-to-r from-blue-950 to-black border border-blue-900/50">
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 relative z-10 shadow-inner">
                            <Trophy size={48} className="text-blue-500" />
                        </div>
                        
                        <div className="relative z-10 flex-1 text-center lg:text-left">
                            <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-white mb-2">
                                ESCUELA DE FÚTBOL
                            </h3>
                            <p className="text-sm lg:text-base font-medium text-blue-200/60 max-w-2xl mx-auto lg:mx-0">
                                Formación integral para los futuros cracks. Entrenamientos dinámicos, valores deportivos y la mejor infraestructura para que aprendan jugando.
                            </p>
                        </div>

                        <div className="relative z-10 shrink-0">
                            <Link to={`${basePath}/escuela`} className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50">
                                Info e Inscripciones
                            </Link>
                        </div>
                    </div>
                </section>

                {/* The Bar Section - Full Width Image CTA */}
                <section className="relative h-[500px] lg:h-[600px] rounded-[40px] lg:rounded-[48px] overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[10s]" alt="Bar and Restaurant" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-500 mb-8 shadow-2xl">
                            <Utensils size={32} />
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white mb-6">
                            EL TERCER <br/><span className="italic text-amber-500">TIEMPO</span>
                        </h2>
                        <p className="text-base lg:text-lg font-medium text-white/70 max-w-xl mb-10">
                            La experiencia no termina en la cancha. Disfrutá de nuestra gastronomía premium, cervezas tiradas y el mejor ambiente para compartir la victoria.
                        </p>
                        <Link to={`${basePath}/menu`} className="inline-flex items-center gap-3 px-10 py-5 bg-amber-500 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-xl shadow-amber-500/20">
                            Ver Menú del Bar <ChevronRight size={18} />
                        </Link>
                    </div>
                </section>
                
            </div>
        </div>
    );
}

