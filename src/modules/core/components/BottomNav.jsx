import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Calendar,
    Trophy,
    UtensilsCrossed,
    MoreHorizontal,
    X,
    GraduationCap,
    Users,
    CreditCard,
    Image,
    Swords,
    HelpCircle,
    ChevronRight
} from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const path = location.pathname;
    const [menuOpen, setMenuOpen] = useState(false);

    // Primary nav items (always visible)
    const primaryItems = [
        { name: 'Inicio', path: '/home', icon: Home },
        { name: 'Reservar', path: '/booking-flow', icon: Calendar },
        { name: 'Torneos', path: '/tournaments', icon: Trophy },
        { name: 'Bar', path: '/menu', icon: UtensilsCrossed },
    ];

    // Secondary items (in "Más" menu)
    const secondaryItems = [
        { name: 'Escuela Deportiva', path: '/school', icon: GraduationCap },
        { name: 'Desafíos Diarios', path: '/challenges', icon: Swords },
        { name: 'Bolsa de Jugadores', path: '/players', icon: Users },
        { name: 'Membresía Club', path: '/membership', icon: CreditCard },
        { name: 'Galería de Fotos', path: '/public-gallery', icon: Image },
        { name: 'Posiciones Liga', path: '/tournament-standings', icon: Trophy },
        { name: 'Ayuda / Contacto', path: '/help', icon: HelpCircle },
    ];

    const isSecondaryActive = secondaryItems.some(item => item.path === path);

    return (
        <>
            {/* Overlay + "Más" Expanded Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-[200]" onClick={() => setMenuOpen(false)}>
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                    <div
                        className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900 border border-white/10 rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 z-[201]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Más Secciones</h3>
                            <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            {secondaryItems.map(item => {
                                const Icon = item.icon;
                                const isActive = path === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                                ? 'bg-gold/10 text-gold'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon size={18} />
                                            <span className="text-xs font-black uppercase tracking-wider italic">{item.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md">
                <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-[28px] p-1.5 flex items-center justify-around shadow-2xl shadow-black/60">
                    {primaryItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = path === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 py-2 px-3 transition-all duration-300 rounded-2xl ${isActive
                                        ? 'text-gold bg-gold/10'
                                        : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                                <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* "Más" button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`flex flex-col items-center gap-1 py-2 px-3 transition-all duration-300 rounded-2xl ${menuOpen || isSecondaryActive
                                ? 'text-gold bg-gold/10'
                                : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        <MoreHorizontal size={20} strokeWidth={menuOpen || isSecondaryActive ? 2.5 : 1.5} />
                        <span className={`text-[9px] font-bold uppercase tracking-tight ${menuOpen || isSecondaryActive ? 'opacity-100' : 'opacity-50'}`}>
                            Más
                        </span>
                    </button>
                </div>
            </nav>
        </>
    );
}
