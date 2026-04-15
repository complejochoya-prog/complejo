import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, ClipboardList, Wallet } from 'lucide-react';

export default function MozoBottomNav({ negocioId }) {
    const navItems = [
        { icon: Home, label: 'Inicio', path: `/${negocioId}/app/mozos` },
        { icon: LayoutGrid, label: 'Mesas', path: `/${negocioId}/app/mozos/mesas` },
        { icon: ClipboardList, label: 'Órdenes', path: `/${negocioId}/app/mozos/pedidos` },
        { icon: Wallet, label: 'Cobrar', path: `/${negocioId}/app/mozos/cobrar` },
    ];

    const triggerHaptic = () => {
        if ('vibrate' in navigator) navigator.vibrate(30);
    };

    return (
        <nav className="fixed bottom-0 inset-x-0 z-[100] bg-[#0c0a09]/90 backdrop-blur-2xl border-t border-white/5 pb-safe-bottom pt-2 px-2 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-md mx-auto flex items-center justify-between pb-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={triggerHaptic}
                        end={item.path === `/${negocioId}/app/mozos`}
                        className={({ isActive }) => `
                            relative flex flex-col items-center justify-center p-3 rounded-2xl w-full transition-all duration-300
                            ${isActive ? 'text-amber-400 -translate-y-2' : 'text-slate-500 hover:text-white'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`
                                    relative p-2.5 rounded-[18px] transition-all duration-500
                                    ${isActive ? 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/20' : 'bg-transparent'}
                                `}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-md' : ''} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
            `}} />
        </nav>
    );
}
