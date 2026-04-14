import React from 'react';

export default function ModuleCategory({ label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border whitespace-nowrap ${
                active 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
            }`}
        >
            {label}
        </button>
    );
}
