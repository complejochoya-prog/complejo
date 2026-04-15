import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';
import MozoBottomNav from '../components/MozoBottomNav';
import { Users, LogOut, Bell, UtensilsCrossed } from 'lucide-react';

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const location = useLocation();
    const { orders, config } = useConfig();
    const [mozo, setMozo] = useState(null);

    // Validate Session
    useEffect(() => {
        const session = getMozoSession();
        if (!session.id) {
            navigate(`/${negocioId}/app/mozos/login`);
        } else {
            setMozo(session);
        }
    }, [negocioId, navigate]);

    const handleLogout = () => {
        if ('vibrate' in navigator) navigator.vibrate(50);
        logoutMozo();
        navigate(`/${negocioId}/app/mozos/login`);
    };

    const lastNotifiedRef = React.useRef(new Set());

    // Notification Logic
    useEffect(() => {
        if (!mozo?.id) return;

        const readyOrders = orders?.filter(o => 
            (o.estado === 'listo' || o.estado === 'listo_para_salir') && 
            o.mozoId === mozo.id && 
            !lastNotifiedRef.current.has(o.id)
        ) || [];

        if (readyOrders.length > 0) {
            readyOrders.forEach(o => {
                try {
                    const audio = new Audio('/sounds/notification.wav'); 
                    audio.play().catch(() => {});
                } catch(e) {}
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                lastNotifiedRef.current.add(o.id);
            });
        }
    }, [orders, mozo]);

    if (!mozo) return (
        <div className="fixed inset-0 bg-[#0c0a09] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">Cargando App...</p>
            </div>
        </div>
    );

    const getPageTitle = () => {
        if (location.pathname.endsWith('/mesas')) return 'Mapa de Mesas';
        if (location.pathname.endsWith('/pedidos')) return 'Órdenes Activas';
        if (location.pathname.endsWith('/cobrar')) return 'Caja Remota';
        return 'Panel Principal';
    };

    const notifCount = orders?.filter(o => (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.mozoId === mozo.id).length || 0;

    return (
        <div className="fixed inset-0 bg-[#0c0a09] text-white font-inter flex flex-col overflow-hidden selection:bg-amber-500/30">
            {/* Ambient Lighting Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Glass Shell */}
            <header className="relative z-50 bg-[#0c0a09]/80 backdrop-blur-2xl border-b border-white/5 pt-safe-top">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-[18px] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-white/10">
                                <UtensilsCrossed size={22} className="text-amber-950 drop-shadow-sm" strokeWidth={2.5} />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#0c0a09] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        </div>
                        <div>
                            <h1 className="text-[13px] font-black uppercase tracking-widest text-white shadow-sm leading-none pt-1">
                                {getPageTitle()}
                            </h1>
                            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                                <Users size={10} className="text-amber-400" /> {mozo.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 border border-white/5 active:scale-90 transition-transform">
                             <Bell size={18} />
                             {notifCount > 0 && (
                                 <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] font-black items-center justify-center text-white border-2 border-[#0c0a09]">
                                        {notifCount}
                                    </span>
                                </span>
                             )}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20 active:scale-90 hover:bg-rose-500 hover:text-white transition-all"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth select-none">
                <div className="pb-32 min-h-full">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Nav */}
            <MozoBottomNav negocioId={negocioId} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                * { scrollbar-width: none; -ms-overflow-style: none; }
                *::-webkit-scrollbar { display: none; }
                .pt-safe-top { padding-top: env(safe-area-inset-top, 0px); }
            `}} />
        </div>
    );
}
