import React from 'react';
import { User } from 'lucide-react';

export default function MozoBadge({ name, active = true }) {
    if (!name) return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/5">
            Sin asignar
        </div>
    );

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${active ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
            <User size={10} />
            {name}
        </div>
    );
}
