import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { getMozoSession, logoutMozo } from '../services/mozoService';
import MozoBottomNav from '../components/MozoBottomNav';
import { 
    Users, 
    LogOut, 
    Bell,
    Settings
} from 'lucide-react';

export default function MozoApp() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const location = useLocation();
    const { orders } = useConfig();
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
        logoutMozo();
        navigate(`/${negocioId}/app/mozos/login`);
    };

    const lastNotifiedRef = React.useRef(new Set());

    // Notification Logic
    useEffect(() => {
        if (!mozo?.id) return;

        const readyOrders = orders.filter(o => 
            (o.estado === 'listo' || o.estado === 'listo_para_salir') && 
            o.mozoId === mozo.id && 
            !lastNotifiedRef.current.has(o.id)
        );

        if (readyOrders.length > 0) {
            readyOrders.forEach(o => {
                const audio = new Audio('/sounds/notification.wav'); 
                audio.play().catch(() => {});
                if ('vibrate' in navigator) navigator.vibrate(200);
                lastNotifiedRef.current.add(o.id);
            });
        }
    }, [orders, mozo]);

    if (!mozo) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Cargando Sesión...</p>
            </div>
        </div>
    );

    // Head title based on current path
    const getPageTitle = () => {
        if (location.pathname.endsWith('/mesas')) return 'Mis Mesas';
        if (location.pathname.endsWith('/pedidos')) return 'Mis Pedidos';
        if (location.pathname.endsWith('/cobrar')) return 'Cobrar';
        return 'Mi Perfil';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
            {/* Header Shell */}
            <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Users size={18} className="text-slate-950" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none">
                                {getPageTitle()}
                            </h1>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                {mozo.name} // Estación Salon
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                             <Bell size={16} />
                             {orders.filter(o => (o.estado === 'listo' || o.estado === 'listo_para_salir') && o.mozoId === mozo.id).length > 0 && (
                                 <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                             )}
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/10"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 max-w-md mx-auto w-full pt-24 pb-32 px-4">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <MozoBottomNav negocioId={negocioId} />
        </div>
    );
}
