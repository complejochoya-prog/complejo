import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function TaskCard({ title, desc, time, isDone, onToggle }) {
    return (
        <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex items-start gap-4 shadow-lg group hover:border-indigo-500/30 transition-colors">
            <button 
                onClick={onToggle}
                className={`mt-1 shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                    isDone ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800 border-white/10 text-slate-800 hover:text-white'
                }`}
            >
                {isDone && <CheckCircle2 size={14} />}
            </button>
            <div className="flex-1">
                <h4 className={`text-sm font-black uppercase tracking-tight transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 line-clamp-2 leading-relaxed">
                    {desc}
                </p>
                <span className="text-[8px] flex items-center gap-1 font-black text-slate-600 mt-2">
                    <Clock size={10}/> {time}
                </span>
            </div>
        </div>
    );
}
