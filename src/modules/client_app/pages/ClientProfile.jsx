import React from 'react';
import { User, LogOut, Shield, Settings, Activity } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useClientAuth } from '../hooks/useClientAuth';
import { useNavigate } from 'react-router-dom';

export default function ClientProfile() {
    const { config, negocioId } = useConfig();
    const { clientUser, logout } = useClientAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(`/${negocioId}/app`);
    };

    if (!clientUser) return null;

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300 min-h-screen bg-slate-950 px-5 pt-8 pb-32">
            
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-indigo-400 leading-none mb-1">Tu Perfil</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{config?.nombre || 'Complejo'} / App Cliente</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                    <User size={24} />
                </div>
            </header>

            {/* Profile Card */}
            <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] shadow-lg mb-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                
                <div className="flex items-center gap-4 z-10 w-full">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xl">
                        <User size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white truncate w-40 sm:w-64">{clientUser.name}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{clientUser.email}</p>
                    </div>
                </div>

                <div className="bg-slate-950 px-4 py-3 rounded-2xl flex justify-between items-center border border-white/5 mt-2 z-10">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Activity size={12}/> Jugador Activo</p>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Nivel 12
                    </span>
                </div>
            </div>

            {/* Settings Options */}
            <div className="space-y-4">
                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl flex items-center justify-between text-slate-400 hover:text-white transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-slate-700 transition-colors"><Settings size={16} /></div>
                        <span className="text-sm font-black uppercase tracking-tight">Preferencias</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-5 rounded-3xl flex items-center justify-between text-slate-400 hover:text-white transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors"><Shield size={16} /></div>
                        <span className="text-sm font-black uppercase tracking-tight">Privacidad PWA</span>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-red-500/20 active:scale-95 transition-all outline-none"
                >
                    <LogOut size={16} />
                    <span className="text-sm font-black uppercase tracking-widest">Cerrar Sesión</span>
                </button>
            </div>
            
        </div>
    );
}
