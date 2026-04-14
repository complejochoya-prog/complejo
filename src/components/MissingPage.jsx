import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function MissingPage({ name }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Construction size={40} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 italic">
                {name || 'Sección'} en Construcción
            </h1>
            <p className="text-slate-500 text-sm max-w-xs mb-8 font-medium">
                Estamos trabajando duro para habilitar esta funcionalidad muy pronto. ¡Vuelve pronto!
            </p>
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
            >
                <ArrowLeft size={14} /> Volver atrás
            </button>
        </div>
    );
}
