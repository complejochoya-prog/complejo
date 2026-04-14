import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, ClipboardList, Wallet } from 'lucide-react';

export default function MozoBottomNav({ negocioId }) {
    const navItems = [
        { icon: Home, label: 'Inicio', path: `/${negocioId}/app/mozos` },
        { icon: LayoutGrid, label: 'Mesas', path: `/${negocioId}/app/mozos/mesas` },
        { icon: ClipboardList, label: 'Pedidos', path: `/${negocioId}/app/mozos/pedidos` },
        { icon: Wallet, label: 'Cobrar', path: `/${negocioId}/app/mozos/cobrar` },
    ];

    return (
        <nav className="fixed bottom-0 inset-x-0 z-[100] bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pb-8 pt-3 px-6 h-24">
            <div className="max-w-md mx-auto flex items-center justify-between">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${negocioId}/app/mozos`}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1.5 transition-all duration-300
                            ${isActive ? 'text-indigo-400 opacity-100' : 'text-slate-500 opacity-60'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`
                                    p-2 rounded-xl transition-all
                                    ${isActive ? 'bg-indigo-500/10' : 'bg-transparent'}
                                `}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'visible' : 'hidden'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
