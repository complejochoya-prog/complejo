import React from 'react';
import { User } from 'lucide-react';

export default function ClientNavbar({ config, user }) {
    return (
        <header className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-xl z-40">
            <h1 className="text-lg font-black uppercase italic tracking-tighter text-white">
                {config?.nombre || 'Complejo'}
            </h1>
            <div className="flex items-center gap-3">
                {user && (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.name.split(' ')[0]}</span>
                )}
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                    <User size={14} className="text-indigo-400" />
                </div>
            </div>
        </header>
    );
}
