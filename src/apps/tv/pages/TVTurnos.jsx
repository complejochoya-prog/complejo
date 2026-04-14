import React, { useState, useEffect, useRef } from 'react';
import { Clock, Trophy, Users, Info } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { fetchCanchasDisponibles } from '../../../modules/client_app/services/clientService';

export default function TVTurnos() {
    const { negocioId } = useConfig();
    const [mockTime, setMockTime] = useState(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const [canchasData, setCanchasData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0); // Para rotación de destaque

    const loadRealData = async () => {
        try {
            const espacios = await fetchCanchasDisponibles(negocioId);
            const hoy = new Date().toISOString().split('T')[0];
            const resList = JSON.parse(localStorage.getItem('complejo_reservas') || '[]');
            const hoyReservas = resList.filter(r => r.fecha === hoy);

            // Generar bloques desde la hora actual hasta las 23:00
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
                        usuario: res ? `${res.cliente.nombre} ${res.cliente.apellido.charAt(0)}.` : 'DISPONIBLE',
                        estado: res ? 'ocupado' : 'libre'
                    };
                });
                return { id: esp.id, nombre: esp.nombre.toUpperCase(), turnos };
            });

            setCanchasData(result);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        loadRealData();
        const timer = setInterval(() => {
            const now = new Date();
            setMockTime(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            
            // Si cambia la hora, recargar bloques para que desaparezcan los pasados
            if (now.getMinutes() === 0 && now.getSeconds() === 0) {
                loadRealData();
            }
        }, 1000);

        const rotationInterval = setInterval(() => {
            if (canchasData.length > 0) {
                setActiveIndex(prev => (prev + 1) % canchasData.length);
            }
        }, 8000);

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

    return (
        <div className="h-screen flex flex-col p-10 bg-[#020203] text-white overflow-hidden font-sans">
            
            <div className="flex justify-between items-start mb-16 relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-[2px] w-12 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.8em]">Live Terminal</p>
                    </div>
                    <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">
                        GIOVANNI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">SPORTS</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-12 py-6 rounded-[40px] backdrop-blur-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="flex items-center gap-6">
                            <Clock size={54} className="text-emerald-500 animate-[pulse_2s_infinite]" />
                            <span className="text-8xl font-black tracking-tighter italic tabular-nums">{mockTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full max-h-[70vh]">
                {canchasData.map((c, idx) => (
                    <div 
                        key={c.id} 
                        className={`relative rounded-[60px] p-[2px] shadow-2xl transition-all duration-1000 ${
                            idx === activeIndex ? 'scale-105 z-20' : 'scale-95 opacity-40'
                        }`}
                    >
                        {/* Borde animado para la cancha activa */}
                        <div className={`absolute inset-0 rounded-[60px] transition-opacity duration-1000 ${
                            idx === activeIndex ? 'bg-gradient-to-br from-emerald-500 via-emerald-500/20 to-transparent animate-spin-slow opacity-100' : 'bg-white/5 opacity-0'
                        }`} />

                        <div className="relative h-full w-full bg-[#0a0a0c] rounded-[58px] p-10 flex flex-col overflow-hidden">
                            <Trophy className="absolute -right-10 -top-10 w-40 h-40 text-white/[0.03] -rotate-12" />
                            
                            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase">{c.nombre}</h2>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                                    c.turnos.some(t => t.estado === 'libre') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${c.turnos.some(t => t.estado === 'libre') ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                    {c.turnos.some(t => t.estado === 'libre') ? 'DISPONIBLE' : 'OCUPADO'}
                                </div>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar">
                                {c.turnos.length > 0 ? (
                                    c.turnos.map((t, tIdx) => (
                                        <div 
                                            key={tIdx} 
                                            className={`relative overflow-hidden rounded-[24px] p-[1px] transition-all duration-500 ${
                                                t.estado === 'libre' ? 'hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''
                                            }`}
                                        >
                                            <div className={`flex items-center justify-between p-5 rounded-[23px] border transition-all duration-500 ${
                                                t.estado === 'libre' 
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                                                : 'bg-white/[0.02] border-white/5 text-slate-500'
                                            }`}>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-600 tracking-[0.2em] mb-1">HORA</span>
                                                    <span className="text-3xl font-black italic tracking-tighter">{t.hora} <span className="text-sm font-bold not-italic ml-1">HS</span></span>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-slate-600 tracking-[0.2em] block mb-1">RESERVA</span>
                                                    <span className={`text-2xl font-black uppercase tracking-tighter transition-all ${
                                                        t.estado === 'libre' ? 'text-emerald-500' : 'text-white'
                                                    }`}>
                                                        {t.usuario}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-600 italic font-bold">
                                        No hay turnos disponibles por hoy
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/5 flex items-center overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
                
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center">
                            <span className="text-emerald-500 font-black text-4xl italic mx-20 flex items-center gap-6">
                                <Users size={40} /> ESCANEÁ EL QR EN TU MESA PARA RESERVAR
                            </span>
                            <span className="text-white font-black text-4xl italic mx-20 flex items-center gap-6">
                                <Info size={40} /> PROMO: 2X1 EN CERVEZA ARTESANAL DE 19 A 21HS
                            </span>
                            <span className="text-emerald-500 font-black text-4xl italic mx-20">
                                COMPLEJO GIOVANNI - EL MEJOR LUGAR PARA TU PASIÓN
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            ` }} />
        </div>
    );
}
