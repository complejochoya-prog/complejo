import React from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

export default function LockScreen({ userType }) {
    const handleRetry = () => {
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 text-white font-inter">
            <div className="max-w-md w-full bg-slate-900/50 border border-white/10 rounded-[40px] p-10 space-y-8 text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                <div className="relative mx-auto size-24 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20">
                    <ShieldAlert size={48} />
                    <div className="absolute -top-2 -right-2 size-6 bg-red-500 rounded-full border-4 border-slate-950 animate-pulse"></div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        USUARIO <span className="text-red-500">INACTIVO</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">🚫 Comuníquese con administración</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase">
                        Usuario inactivo. Comuníquese con administración.
                    </p>
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Comunicarse con:</p>
                        <p className="text-xl font-black italic text-gold tracking-tight">ADMINISTRACIÓN</p>
                        <p className="text-xs font-bold text-white mt-1">📞 Tel: +54 385 537 4835</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={handleRetry}
                        className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest italic text-xs shadow-xl shadow-white/10 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <RefreshCw size={18} /> Reintentar Conexión
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:text-red-500 transition-all"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>

                <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.4em] italic">
                    Giovanni Night Bar & Grill • Sistema de Seguridad
                </p>
            </div>
        </div>
    );
}
