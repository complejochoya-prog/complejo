import React from 'react';
import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function InstallButton({ isInstalled, isInstalling, onClick }) {
    if (isInstalling) {
        return (
            <button disabled className="w-full bg-slate-800 text-slate-500 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5">
                <Loader2 size={14} className="animate-spin" />
                Procesando
            </button>
        );
    }

    if (isInstalled) {
        return (
            <div className="flex gap-2">
                <button 
                    disabled
                    className="flex-1 bg-emerald-500/10 text-emerald-400 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
                >
                    <CheckCircle2 size={14} />
                    Instalado
                </button>
                <button 
                    onClick={onClick}
                    className="w-12 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-3.5 rounded-2xl flex items-center justify-center transition-colors border border-red-500/20"
                    title="Desinstalar"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <button 
            onClick={onClick}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
            <Plus size={14} />
            Obtener Módulo
        </button>
    );
}
