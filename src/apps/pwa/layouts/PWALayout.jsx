import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarRange, Coffee, Trophy, User, Download } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function PWALayout() {
    const { negocioId, config } = useConfig();
    const location = useLocation();

    // Lógica para interceptar el prompt de instalación PWA
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        });
        
        // PUSH Notifications mock request
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallBtn(false);
            }
            setDeferredPrompt(null);
        }
    };

    const navItems = [
        { path: '', label: 'Inicio', icon: Home },
        { path: 'reservas', label: 'Mis Turnos', icon: CalendarRange },
        { path: 'menu', label: 'Bar', icon: Coffee },
        { path: 'torneos', label: 'Torneos', icon: Trophy },
        { path: 'perfil', label: 'Perfil', icon: User },
    ];

    // Helper para comparar ruta actual exacta (incluyendo trailing)
    const isActive = (path) => {
        const fullPath = `/${negocioId}/app${path ? `/${path}` : ''}`;
        if (path === '') {
            return location.pathname === `/${negocioId}/app` || location.pathname === `/${negocioId}/app/`;
        }
        return location.pathname.includes(fullPath);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-950 text-white font-inter overflow-hidden relative selection:bg-indigo-500/30">
            
            {/* Header / Notificaciones (Banner Install) */}
            {showInstallBtn && (
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between shadow-lg z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Download size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight">Instalar App</p>
                            <p className="text-[9px] text-white/70 uppercase tracking-widest font-bold">Experiencia nativa</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md"
                    >
                        Instalar
                    </button>
                    <button 
                        onClick={() => setShowInstallBtn(false)} 
                        className="text-white/50 hover:text-white p-2"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Top Bar Simple */}
            <header className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-xl z-40">
                <h1 className="text-lg font-black uppercase italic tracking-tighter">
                    {config?.nombre || 'Complejo'}
                </h1>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                    <User size={14} className="text-slate-400" />
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative select-none">
                <Outlet />
            </main>

            {/* Bottom App Bar Shell */}
            <nav className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/5 pb-safe px-2 pt-2 pb-2 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
                <div className="flex justify-around items-center">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link 
                                key={item.path}
                                to={`/${negocioId}/app${item.path ? `/${item.path}` : ''}`}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl w-full transition-all duration-300 ${
                                    active ? 'text-indigo-400 -translate-y-2 relative' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                <div className={`relative ${active ? 'bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20' : ''}`}>
                                    <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''} />
                                    {/* Mock notification dot */}
                                    {item.path === 'menu' && !active && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                                    )}
                                </div>
                                <span className={`text-[9px] uppercase tracking-widest mt-1 font-bold ${active ? 'opacity-100' : 'opacity-0 h-0'} transition-all`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

        </div>
    );
}
