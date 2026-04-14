import React from 'react';
import { CalendarRange, Trophy, Beer, CalendarDays, ChevronRight, User } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ClienteApp() {
    const { config, negocioId } = useConfig();
    const { user, logout } = useAuth();
    
    return (
        <div className="min-h-screen bg-slate-950 font-inter text-white pb-24">
            {/* Header Cliente */}
            <header className="px-6 py-8 pb-12 bg-gradient-to-b from-violet-600/20 to-transparent sticky top-0 backdrop-blur-md z-40 border-b border-white/5">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                            {config?.nombre || 'COMPLEJO'}
                        </h1>
                        <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mt-1">App de Clientes</p>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase hidden sm:block">Hola, {user.name}</span>
                            <button onClick={logout} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 hover:bg-slate-700">
                                <User size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link to={`/${negocioId}/login`} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/30 hover:bg-violet-500">
                            Ingresar
                        </Link>
                    )}
                </div>

                {/* Promo Card Principal */}
                <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-violet-500/20">
                    <div className="absolute -right-10 -top-10 text-white/10 rotate-12">
                        <Trophy size={160} />
                    </div>
                    <div className="relative z-10 w-2/3">
                        <span className="bg-white text-violet-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 inline-block">Promo Verano</span>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase italic leading-none mb-2">20% OFF CANCHAS</h2>
                        <p className="text-[10px] sm:text-xs font-bold uppercase hidden sm:block">Reservando de Lunes a Viernes de 10hs a 17hs</p>
                        <button className="mt-6 bg-slate-950 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black">
                            Reservar Ahora <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Accesos Rápidos */}
            <div className="px-6 -mt-6 relative z-30">
                <div className="grid grid-cols-2 gap-4">
                    <Link to={`/${negocioId}/reservas`} className="bg-slate-900 border border-white/10 rounded-[32px] p-6 hover:bg-white/5 transition flex flex-col gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                            <CalendarRange className="text-emerald-400 group-hover:scale-110 transition" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Reservar</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Canchas y turnos</p>
                        </div>
                    </Link>

                    <Link to={`/${negocioId}/menu`} className="bg-slate-900 border border-white/10 rounded-[32px] p-6 hover:bg-white/5 transition flex flex-col gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                            <Beer className="text-amber-400 group-hover:scale-110 transition" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Pedir al Bar</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Desde la mesa</p>
                        </div>
                    </Link>

                    <Link to={`/${negocioId}/torneos`} className="bg-slate-900 border border-white/10 rounded-[32px] p-6 hover:bg-white/5 transition flex flex-col gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <Trophy className="text-blue-400 group-hover:scale-110 transition" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Torneos</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Inscripciones</p>
                        </div>
                    </Link>

                    <Link to={`/${negocioId}/mis-turnos`} className="bg-slate-900 border border-white/10 rounded-[32px] p-6 hover:bg-white/5 transition flex flex-col gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center">
                            <CalendarDays className="text-fuchsia-400 group-hover:scale-110 transition" size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Mis Turnos</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Historial</p>
                        </div>
                    </Link>
                </div>
            </div>
            
            <div className="px-6 mt-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Próximos Torneos</h3>
                <div className="p-6 rounded-[32px] border border-white/5 bg-slate-900/50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 py-12 text-center">
                    No hay inscripciones abiertas
                </div>
            </div>
        </div>
    );
}
