import React, { useState, useEffect, useMemo } from 'react';
import { 
    Clock, 
    Trophy, 
    Users, 
    Info, 
    Calendar, 
    Zap, 
    QrCode, 
    Phone,
    MapPin,
    ArrowRightCircle,
    Star,
    Crown
} from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchCanchasDisponibles } from '../../../modules/client_app/services/clientService';

export default function TVTurnos() {
    const { negocioId, config } = useConfig();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [canchasData, setCanchasData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const timeStr = currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateStr = currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    const loadRealData = async () => {
        try {
            const espacios = await fetchCanchasDisponibles(negocioId);
            const hoy = new Date().toISOString().split('T')[0];
            const resList = JSON.parse(localStorage.getItem('complejo_reservas') || '[]');
            const hoyReservas = resList.filter(r => r.fecha === hoy);

            const horaActual = new Date().getHours();
            const bloques = [];
            for (let i = horaActual; i <= 23; i++) {
                bloques.push(`${i.toString().padStart(2, '0')}:00`);
            }

            const result = espacios.map(esp => {
                const turnos = bloques.map(hora => {
                    const res = hoyReservas.find(r => r.canchaId === esp.id && r.hora === hora);
                    return {
                        hora,
                        usuario: res ? `${res.cliente.nombre} ${res.cliente.apellido.charAt(0)}.` : 'Disponible',
                        estado: res ? 'ocupado' : 'libre'
                    };
                });
                return { 
                    id: esp.id, 
                    nombre: esp.nombre.toUpperCase(), 
                    tipo: esp.tipo || 'Fútbol 5',
                    color: esp.color || (esp.id === 1 ? 'emerald' : esp.id === 2 ? 'blue' : 'amber'),
                    turnos 
                };
            });

            setCanchasData(result);
            setLoading(false);
        } catch (e) { 
            console.error(e); 
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRealData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const rotationInterval = setInterval(() => {
            if (canchasData.length > 0) {
                setActiveIndex(prev => (prev + 1) % canchasData.length);
            }
        }, 10000);

        window.addEventListener('storage_reservas', loadRealData);
        window.addEventListener('storage', (e) => {
            if (e.key === 'complejo_reservas') loadRealData();
        });

        return () => {
            clearInterval(timer);
            clearInterval(rotationInterval);
            window.removeEventListener('storage_reservas', loadRealData);
            window.removeEventListener('storage', loadRealData);
        };
    }, [negocioId, canchasData.length]);

    // Calcular próxima cancha destacada para previsualización
    const nextIndex = (activeIndex + 1) % (canchasData.length || 1);
    const activeCancha = canchasData[activeIndex];

    if (loading) return (
        <div className="h-screen bg-[#020202] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-emerald-500 font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Sistema Stadium...</p>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-[#020202] text-white flex flex-col p-8 overflow-hidden font-inter relative selection:bg-emerald-500 selection:text-black">
            
            {/* 🌌 FONDO DINÁMICO DE LUJO */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-600/5 blur-[120px] rounded-full animate-bounce-slow" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
            </div>

            {/* 🛰️ HEADER TV STATION STYLE */}
            <div className="relative z-10 flex justify-between items-end mb-12">
                <div className="flex gap-8 items-end">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[28px] flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                            <Zap size={48} className="text-black fill-black" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-1 w-8 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Live Core Stream</p>
                        </div>
                        <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none m-0 flex items-center gap-4">
                            {config?.nombre?.toUpperCase() || 'STADIUM'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-blue-500 drop-shadow-sm">HUB</span>
                        </h1>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                            <MapPin size={12} className="text-emerald-500" /> Complejo Deportivo & Social • Terminal 01
                        </p>
                    </div>
                </div>

                <div className="flex gap-10 items-end">
                    {/* Widget Tiempo */}
                    <div className="text-right border-l border-white/10 pl-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{dateStr}</p>
                        <div className="flex items-center gap-5 justify-end">
                            <Clock size={42} className="text-emerald-400" />
                            <span className="text-7xl font-black italic tracking-tighter tabular-nums text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                {timeStr}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🧊 MAIN DASHBOARD GRID */}
            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0 relative z-10">
                
                {/* COL IZQUIERDA: LISTADO COMPLETO */}
                <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 flex items-center gap-3">
                            <Calendar size={14} className="text-emerald-500" /> Disponibilidad Hoy
                        </h3>
                        <div className="flex gap-1.5">
                            {canchasData.map((_, i) => (
                                <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-emerald-500 w-12 shadow-[0_0_10px_#10b981]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4 overflow-y-auto pr-4 hide-scrollbar">
                        {canchasData.map((c, i) => (
                            <div 
                                key={c.id}
                                className={`group relative p-6 rounded-[32px] border transition-all duration-700 cursor-pointer ${
                                    i === activeIndex 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_20px_40px_rgba(16,185,129,0.1)]' 
                                    : 'bg-white/[0.02] border-white/5 opacity-40 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                                }`}
                                onClick={() => setActiveIndex(i)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-xl ${
                                            i === activeIndex ? 'bg-emerald-500 text-black border-transparent' : 'bg-white/5 text-emerald-500 border-white/10'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{c.nombre}</h4>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">{c.tipo}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                            c.turnos.some(t => t.estado === 'libre')
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {c.turnos.some(t => t.estado === 'libre') ? 'Disponible' : 'Completo'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Mini línea de tiempo */}
                                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-white/5 border border-white/5">
                                    {c.turnos.slice(0, 12).map((t, ti) => (
                                        <div 
                                            key={ti} 
                                            className={`flex-1 transition-all ${
                                                t.estado === 'libre' ? 'bg-emerald-500/20' : 'bg-emerald-500'
                                            } ${i === activeIndex ? 'animate-pulse' : ''}`}
                                            style={{ animationDelay: `${ti * 100}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* QR SCAN CARD */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-4 bg-white rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <QrCode size={64} className="text-black" />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-xl font-black italic uppercase tracking-tighter leading-tight text-white mb-2">Reserva Digital</h5>
                                <p className="text-[10px] font-bold text-white/70 uppercase leading-relaxed">Escaneá para reservar desde tu celular de forma inmediata.</p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-white px-3 py-1.5 bg-black/20 rounded-full w-fit border border-white/10 uppercase tracking-widest">
                                    <Users size={12} /> giovanni.app
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL CENTRAL/DERECHA: DETALLE ENORME (ENFOQUE TV) */}
                <div className="col-span-8 flex flex-col gap-8">
                    <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[60px] p-12 relative flex flex-col overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-emerald-500/[0.03] to-transparent pointer-events-none" />
                        
                        {/* Status Float */}
                        <div className="absolute top-12 right-12 flex items-center gap-3 bg-emerald-500 text-black px-6 py-2.5 rounded-full font-black text-sm uppercase italic tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse">
                            <Crown size={16} /> Featured Arena
                        </div>

                        {/* Title Large */}
                        <div className="flex items-center gap-8 mb-16">
                            <div className="w-32 h-32 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] flex items-center justify-center text-emerald-400">
                                <Trophy size={64} strokeWidth={1} />
                            </div>
                            <div>
                                <h3 className="text-7xl font-black uppercase italic tracking-tighter m-0 leading-none glow-text">
                                    {activeCancha?.nombre}
                                </h3>
                                <div className="flex items-center gap-6 mt-4">
                                    <span className="text-lg font-black text-slate-500 uppercase tracking-[0.4em] italic">{activeCancha?.tipo}</span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                                    <span className="text-lg font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" /> Live Status
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Huge */}
                        <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-6 overflow-y-auto pr-6 custom-scrollbar">
                            {activeCancha?.turnos.map((t, idx) => (
                                <div 
                                    key={idx} 
                                    className={`relative p-8 rounded-[40px] border flex items-center justify-between transition-all duration-500 overflow-hidden ${
                                        t.estado === 'libre' 
                                        ? 'bg-white/[0.03] border-white/5 hover:border-emerald-500/30' 
                                        : 'bg-emerald-500 text-black border-transparent shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-8">
                                        <div className={`text-center py-2 px-6 rounded-3xl border-2 ${
                                            t.estado === 'libre' ? 'border-emerald-500/20 text-emerald-400' : 'border-black/20 text-black'
                                        }`}>
                                            <p className="text-[10px] font-black uppercase opacity-60 m-0">HS</p>
                                            <p className="text-4xl font-black italic tracking-tighter m-0 leading-tight">{t.hora}</p>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${
                                                t.estado === 'libre' ? 'text-slate-500' : 'text-black/50'
                                            }`}>
                                                {t.estado === 'libre' ? 'Disponible' : 'Reservado por'}
                                            </p>
                                            <p className={`text-4xl font-black uppercase tracking-tighter m-0 italic ${
                                                t.estado === 'libre' ? 'text-emerald-500' : 'text-black'
                                            }`}>
                                                {t.usuario}
                                            </p>
                                        </div>
                                    </div>
                                    {t.estado === 'libre' && (
                                        <div className="flex flex-col items-center gap-1 opacity-20">
                                            <ArrowRightCircle size={32} strokeWidth={1.5} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Book Now</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🎞️ TICKER / MARQUEE DE LAS VEGAS STYLE */}
            <div className="fixed bottom-0 left-0 right-0 h-28 bg-[#000] border-t border-white/10 flex items-center overflow-hidden z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                <div className="bg-emerald-500 h-full px-12 flex items-center justify-center shrink-0 border-r border-black/20 relative">
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-emerald-600 to-transparent" />
                    <Star size={32} className="text-black mr-4 fill-black animate-spin-slow" />
                    <span className="text-2xl font-black italic text-black uppercase tracking-tighter">INFO LIVE</span>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex whitespace-nowrap animate-marquee">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center">
                                <span className="text-white font-black text-4xl italic mx-24 flex items-center gap-8 group">
                                    <Users size={40} className="text-emerald-500 group-hover:scale-125 transition-transform" /> 
                                    ¿QUERÉS JUGAR? RESERVÁ POR <span className="text-emerald-500 shadow-emerald-500/20 text-glow">WHATSAPP: +54 9 264 456-7890</span>
                                </span>
                                <div className="h-4 w-4 rounded-full bg-white/10 mx-10" />
                                <span className="text-white font-black text-4xl italic mx-24 flex items-center gap-8">
                                    <Star size={32} className="text-amber-400" /> 
                                    PROMO HAPPY HOUR: 2X1 EN PINTE DE 18 A 21HS
                                </span>
                                <div className="h-4 w-4 rounded-full bg-white/10 mx-10" />
                                <span className="text-white font-black text-4xl italic mx-24 flex items-center gap-8">
                                    <Phone size={32} className="text-blue-400" /> 
                                    LLAMÁ DIRECTO A LA RECEPCIÓN PARA CUALQUIER CONSULTA
                                </span>
                                <div className="h-4 w-4 rounded-full bg-white/10 mx-10" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 h-full px-16 flex flex-col items-center justify-center border-l border-white/10 shrink-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest m-0 leading-none">Powered by</p>
                    <p className="text-3xl font-black italic text-white uppercase tracking-tighter mt-1">GIOVANNI</p>
                </div>
            </div>

            {/* ✨ ESTILOS EXTRA */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                
                body { font-family: 'Inter', sans-serif; background: #000; }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 50s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 10s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 6s ease-in-out infinite;
                }

                .glow-text {
                    text-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
                }
                .text-glow {
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                }

                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }

                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}
