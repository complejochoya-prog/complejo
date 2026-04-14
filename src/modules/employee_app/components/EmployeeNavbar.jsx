import React from 'react';
import { UserCircle, LogOut, Menu } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function EmployeeNavbar({ roleName, onLogout }) {
    const { config } = useConfig();
    
    return (
        <header className="px-6 py-4 flex items-center justify-between shrink-0 bg-slate-900 border-b border-white/5 sticky top-0 z-40 w-full backdrop-blur-xl">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Estación: {roleName}
                </span>
                <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    {config?.nombre || 'Complejo System'}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-xl transition-colors">
                    <UserCircle size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:block text-slate-300">
                        Perfil
                    </span>
                </div>
                
                <button 
                    onClick={onLogout}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20 hover:scale-105 active:scale-95"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
