import React, { useState } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import { Home, Calendar, Utensils, Award, User, Menu, X, Bell, Zap, Swords } from 'lucide-react';
import { useConfig } from '../core/services/ConfigContext';

export default function ClientLayout() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const basePath = `/${negocioId}`;
    const businessName = config?.nombre || 'COMPLEJO GIOVANNI';

    const navItems = [
        { to: basePath, label: 'Inicio', icon: Home, exact: true },
        { to: `${basePath}/reservas`, label: 'Reservas', icon: Calendar },
        { to: `${basePath}/menu`, label: 'Bar', icon: Utensils },
        { to: `${basePath}/torneos`, label: 'Torneos', icon: Award },
        { to: `${basePath}/desafio`, label: 'Desafío', icon: Swords },
        { to: `${basePath}/perfil`, label: 'Perfil', icon: User },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.to || location.pathname === `${item.to}/`;
        return location.pathname.startsWith(item.to);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col pb-20 lg:pb-0">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                            <Zap size={20} className="text-black stroke-[3px]" fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg lg:text-xl font-black tracking-tighter uppercase italic leading-none text-white">
                                {businessName.split(' ').map((w, i) => (
                                    <span key={i} className={i === businessName.split(' ').length - 1 ? 'text-amber-500' : ''}>
                                        {w}{' '}
                                    </span>
                                ))}
                            </h1>
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Premium Sports Center</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {navItems.map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative py-2 group ${
                                    isActive(item) ? 'text-amber-500' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {item.label}
                                {isActive(item) && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all">
                            <Bell size={18} />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-slate-950" />
                        </button>
                        <button className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-white/10 p-8 flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-12">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                                <Zap size={16} className="text-black" />
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><X size={20} /></button>
                        </div>
                        <div className="flex flex-col gap-8">
                            {navItems.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-5 text-sm font-black uppercase tracking-[0.2em] transition-all ${
                                        isActive(item) ? 'text-amber-500 translate-x-2' : 'text-slate-500'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                        isActive(item) ? 'bg-amber-500 border-amber-500 text-black shadow-xl shadow-amber-500/20' : 'bg-white/5 border-white/5'
                                    }`}>
                                        <item.icon size={18} />
                                    </div>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-auto pt-8 border-t border-white/5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Complejo Giovanni v2.0</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <main className="flex-1 w-full max-w-7xl mx-auto relative">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile) - Ultra Premium Glass */}
            <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 h-20 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex justify-around items-center shadow-[0_25px_50px_rgba(0,0,0,0.5)] outline outline-8 outline-slate-950/40">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                                active ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/30 scale-110' : 'text-slate-500'
                            }`}
                        >
                            <Icon size={22} className={active ? 'stroke-[3px]' : 'stroke-[2px]'} />
                            {active && (
                                <div className="absolute -bottom-2 w-1 h-1 bg-black rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

