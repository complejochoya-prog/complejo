import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Zap, Flame, Star, Timer as ClockIcon } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function TVPromos() {
    const { negocioId, config } = useConfig();
    const [promos, setPromos] = useState([
        {
            id: 1,
            titulo: 'PROMO VERANO',
            desc: '20% OFF en canchas de Fútbol 5 y 7. ¡Reservá ahora por la web!',
            badge: 'OFERTA LIMITADA',
            color: 'from-amber-500 to-orange-600',
            icon: <Zap size={80} />,
            bgImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"
        },
        {
            id: 2,
            titulo: 'TORNEO DE CAMPEONES',
            desc: 'Inscripciones abiertas para la Liga Giovanni. ¡Premios increíbles!',
            badge: 'INSCRIPCIÓN ABIERTA',
            color: 'from-blue-600 to-indigo-800',
            icon: <Trophy size={80} />,
            bgImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80"
        },
        {
            id: 3,
            titulo: 'HAPPY HOUR BAR',
            desc: '2x1 en Cerveza Tirada y Pizzas de 19hs a 21hs. ¡Vení a ver los partidos!',
            badge: 'AFTER OFFICE',
            color: 'from-emerald-600 to-emerald-900',
            icon: <Flame size={80} />,
            bgImage: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80"
        }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = 8000; // 8 seconds per promo
        const step = 100;
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setCurrentIndex((curr) => (curr + 1) >= promos.length ? 0 : curr + 1);
                    return 0;
                }
                return prev + (step / interval) * 100;
            });
        }, step);

        return () => clearInterval(progressInterval);
    }, [promos]);

    const currentPromo = promos[currentIndex];

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-inter">
            
            {/* STADIUM AMBIANCE BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-10" />
                <img 
                    src={currentPromo.bgImage} 
                    className="w-full h-full object-cover opacity-30 scale-105 animate-pulse" 
                    key={`bg-${currentPromo.id}`}
                    alt="Stadium Background"
                    style={{ transition: 'all 2s ease' }}
                />
            </div>

            {/* FIELD LINES OVERLAY */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[4px] border-white rounded-full" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[4px] bg-white translate-x-[-50%]" />
            </div>

            {/* SCANLINE / CRT EFFECT */}
            <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,254,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-20 h-full flex flex-col items-center justify-center p-20">
                
                {/* FLOATING BALLS & GLOWS */}
                <div className="absolute top-20 left-20 animate-float opacity-30">
                    <div className="w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </div>
                <div className="absolute bottom-20 right-20 animate-float opacity-30" style={{ animationDelay: '2s' }}>
                    <div className="w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
                </div>

                {/* PROMO CARD */}
                <div 
                    className="w-full max-w-7xl relative"
                    key={currentPromo.id}
                >
                    {/* CARD BORDER GLOW */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${currentPromo.color} rounded-[80px] blur-3xl opacity-20 animate-pulse`} />

                    <div className={`glass-premium h-[700px] rounded-[70px] border-white/10 overflow-hidden relative flex flex-col items-center justify-center text-center p-24 animate-in zoom-in-95 duration-700`}>
                        
                        {/* ICON DECORATION */}
                        <div className="absolute top-10 right-10 text-white/10 rotate-12 scale-150">
                            {currentPromo.icon}
                        </div>

                        {/* BADGE */}
                        <div className={`flex items-center gap-4 px-10 py-4 rounded-full bg-gradient-to-r ${currentPromo.color} text-white font-black uppercase tracking-[0.4em] text-2xl mb-12 shadow-2xl animate-in slide-in-from-top-10 duration-1000 delay-300`}>
                            <Sparkles size={32} />
                            {currentPromo.badge}
                        </div>

                        {/* TITLE */}
                        <h1 className="text-[180px] font-black uppercase italic tracking-tighter leading-[0.85] mb-12 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-20 duration-1000 delay-500">
                            {currentPromo.titulo.split(' ').map((word, i) => (
                                <span key={i} className={i % 2 !== 0 ? 'text-amber-500 text-glow block' : 'block'}>
                                    {word}
                                </span>
                            ))}
                        </h1>

                        {/* DESCRIPTION */}
                        <p className="text-5xl text-white/80 font-bold max-w-5xl mx-auto leading-tight drop-shadow-xl animate-in fade-in duration-1000 delay-700">
                            {currentPromo.desc}
                        </p>

                        {/* TIMER PROGRESS BAR */}
                        <div className="absolute bottom-0 left-0 w-full h-4 bg-white/5">
                            <div 
                                className={`h-full bg-gradient-to-r ${currentPromo.color} transition-all duration-100 ease-linear shadow-[0_0_20px_rgba(251,191,36,0.5)]`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* FOOTER BAR */}
                <div className="mt-16 w-full max-w-7xl flex items-center justify-between px-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-black rotate-3 shadow-2xl">
                           <Zap size={40} className="stroke-[3]" fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-4xl font-black uppercase text-white tracking-widest leading-none italic">COMPLEJO <span className="text-amber-500 text-glow">GIOVANNI</span></p>
                            <p className="text-xl font-bold uppercase text-white/40 tracking-[0.5em] mt-2 italic">Official Premium Partner</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {promos.map((p, i) => (
                            <div 
                                key={p.id} 
                                className={`h-4 rounded-full transition-all duration-700 border border-white/10 ${
                                    currentIndex === i 
                                    ? `w-40 bg-gradient-to-r ${currentPromo.color} shadow-lg shadow-white/10` 
                                    : 'w-6 bg-white/10'
                                }`} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* CORNER DECORATIONS */}
            <div className="absolute top-10 left-10 p-6 border-l-4 border-t-4 border-amber-500/50 w-32 h-32 rounded-tl-3xl z-30" />
            <div className="absolute bottom-10 right-10 p-6 border-r-4 border-b-4 border-amber-500/50 w-32 h-32 rounded-br-3xl z-30" />
            
        </div>
    );
}

