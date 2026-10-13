import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';
import { 
    QrCode, 
    BellRing, 
    Wifi, 
    BatteryCharging, 
    LogOut, 
    LayoutGrid, 
    Edit3, 
    ChefHat, 
    Wallet 
} from 'lucide-react';

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders } = useConfig();
    const [mozo] = useState(() => {
        const s = getMozoSession();
        return s?.id ? s : null;
    });

    // Validate Session
    useEffect(() => {
        const session = getMozoSession();
        if (!session?.id) {
            navigate(`/${negocioId}/app/mozos/login`);
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
                } catch {
                    /* ignore audio error */
                }
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                lastNotifiedRef.current.add(o.id);
            });
        }
    }, [orders, mozo]);

    if (!mozo) {
        return (
            <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">Cargando sesión...</p>
                </div>
            </div>
        );
    }

    const notifCount = orders?.filter(o =>
        (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.mozoId === mozo.id
    ).length || 0;

    const mozoInitials = (mozo?.name || 'Mozo')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(0, 2)
        .join('') || 'MZ';

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#e4e1e9] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
            {/* Top Bar Glass */}
            <header className="fixed top-0 inset-x-0 z-50 bg-[#121722]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                <div className="h-20 px-4 max-w-lg mx-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative flex items-center justify-center">
                            <div className="w-11 h-11 rounded-xl bg-[#1f1f25] border border-white/5 flex items-center justify-center shadow-inner">
                                <span className="text-xl">⚽</span>
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#0A0A0F] animate-pulse"></span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[9px] font-black uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>Online · Sync
                                </span>
                                <div className="flex items-center text-slate-500 gap-1">
                                    <Wifi size={12} />
                                    <BatteryCharging size={12} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <h1 className="text-base text-white font-extrabold truncate tracking-tight">Mis Mesas</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => {
                                alert("Escáner QR de Mesa listo para activación de cámara.");
                            }} 
                            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-[#1f1f25] hover:bg-white/10 text-amber-400 flex items-center gap-1.5 active:scale-95 transition-all border border-white/5" 
                            title="Escanear QR de Mesa"
                        >
                            <QrCode size={18} className="text-amber-400" />
                            <span className="text-[10px] font-black hidden sm:inline uppercase tracking-wider">Mesa</span>
                        </button>

                        <button 
                            className="relative min-w-[40px] min-h-[40px] rounded-xl bg-[#1f1f25] hover:bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all border border-white/5" 
                            title="Llamadas de Clientes"
                        >
                            <BellRing size={18} className="text-amber-400" />
                            {notifCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-[#0A0A0F] animate-bounce">
                                    {notifCount}
                                </span>
                            )}
                        </button>

                        <div className="w-9 h-9 rounded-xl bg-[#2a292f] border border-white/10 flex items-center justify-center ml-0.5" title={`Mozo: ${mozo?.name || 'Mozo'}`}>
                            <span className="text-[11px] text-amber-400 font-extrabold">{mozoInitials}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="min-w-[36px] min-h-[36px] rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center active:scale-95 transition-all border border-red-500/20"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Outlet */}
            <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-24 px-3">
                <Outlet />
            </main>

            {/* Bottom Nav Glass 4 Items */}
            <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#121722]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.45)]">
                <div className="grid grid-cols-4 items-center h-20 max-w-lg mx-auto px-2">
                    <NavLink
                        to={`/${negocioId}/app/mozos/mesas`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${
                                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        <div className="w-10 h-7 rounded-full flex items-center justify-center transition-colors">
                            <LayoutGrid size={22} />
                        </div>
                        <span className="text-[10px] tracking-wider uppercase font-black truncate">Mis Mesas</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/dashboard`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${
                                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        <div className="w-10 h-7 rounded-full flex items-center justify-center transition-colors">
                            <Edit3 size={22} />
                        </div>
                        <span className="text-[10px] tracking-wider uppercase font-black truncate">Comandero</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/pedidos`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all relative ${
                                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        <div className="w-10 h-7 rounded-full flex items-center justify-center transition-colors relative">
                            <ChefHat size={22} />
                            {notifCount > 0 && (
                                <span className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-2 ring-[#0A0A0F]" />
                            )}
                        </div>
                        <span className="text-[10px] tracking-wider uppercase font-black truncate">Despacho KDS</span>
                    </NavLink>

                    <NavLink
                        to={`/${negocioId}/app/mozos/cobrar`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 active:scale-95 transition-all ${
                                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        <div className="w-10 h-7 rounded-full flex items-center justify-center transition-colors">
                            <Wallet size={22} />
                        </div>
                        <span className="text-[10px] tracking-wider uppercase font-black truncate">Turno & Caja</span>
                    </NavLink>
                </div>
            </nav>

            <style dangerouslySetInnerHTML={{ __html: `
                ::-webkit-scrollbar { display: none; }
                * { scrollbar-width: none; -ms-overflow-style: none; }
            `}} />
        </div>
    );
}
