import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';
import { UtensilsCrossed, Bell, LogOut, LayoutGrid, ClipboardList, Plus, Moon } from 'lucide-react';

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { orders } = useConfig();
    const [mozo, setMozo] = useState(() => {
        const s = getMozoSession();
        return s?.id ? s : null;
    });

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
        <div className="fixed inset-0 bg-slate-100 dark:bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Cargando...</p>
            </div>
        </div>
    );

    const notifCount = orders?.filter(o =>
        (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.mozoId === mozo.id
    ).length || 0;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col max-w-lg mx-auto">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 bg-emerald-600 text-white px-4 h-14 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <UtensilsCrossed size={20} className="text-white/90" />
                    <div>
                        <p className="font-bold text-sm leading-tight">Mozos</p>
                        <p className="text-[10px] opacity-80">{mozo?.name || 'Acceso libre'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {/* Bell / Notificaciones */}
                    <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                        <Bell size={18} />
                        {notifCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {notifCount}
                            </span>
                        )}
                    </button>
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => document.documentElement.classList.toggle('dark')}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Moon size={18} />
                    </button>
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex z-30">
                {/* Mesas */}
                <NavLink
                    to={`/${negocioId}/app/mozos/mesas`}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                            isActive ? 'text-emerald-600' : 'text-slate-500'
                        }`
                    }
                >
                    <LayoutGrid size={22} />
                    Mesas
                </NavLink>

                {/* FAB central — Nuevo pedido */}
                <NavLink
                    to={`/${negocioId}/app/mozos/dashboard`}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                            isActive ? 'text-emerald-600' : 'text-slate-500'
                        }`
                    }
                >
                    <div className="w-10 h-10 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                        <Plus size={24} />
                    </div>
                    Nuevo
                </NavLink>

                {/* Órdenes */}
                <NavLink
                    to={`/${negocioId}/app/mozos/pedidos`}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                            isActive ? 'text-emerald-600' : 'text-slate-500'
                        }`
                    }
                >
                    <span className="relative">
                        <ClipboardList size={22} />
                        {notifCount > 0 && (
                            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {notifCount}
                            </span>
                        )}
                    </span>
                    Órdenes
                </NavLink>
            </nav>

            <style dangerouslySetInnerHTML={{ __html: `
                * { scrollbar-width: none; -ms-overflow-style: none; }
                *::-webkit-scrollbar { display: none; }
            `}} />
        </div>
    );
}
