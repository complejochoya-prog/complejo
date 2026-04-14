import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { loginMozo } from '../services/mozoService';
import { fetchEmpleados } from '../../empleados/services/empleadosService';
import { User, Lock, Loader2, LogIn, ShieldAlert } from 'lucide-react';

export default function MozoLogin() {
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Buscamos en la base de datos de empleados unificada
            const empleados = await fetchEmpleados();
            await loginMozo(usuario, password, empleados);
            navigate(`/${negocioId}/app/mozos`);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (error?.type === 'locked') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-[40px] flex items-center justify-center mx-auto text-rose-500 ring-4 ring-rose-500/5">
                        <ShieldAlert size={48} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">USUARIO BLOQUEADO</h1>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                            Tu cuenta de mozo ha sido desactivada por el administrador. Contacta con soporte para recuperarla.
                        </p>
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        className="text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400"
                    >
                        Volver al Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center p-6">
            <div className="max-w-md w-full mx-auto space-y-10">
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 rotate-3">
                        <LogIn className="text-slate-950" size={32} />
                    </div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">APP MOZOS</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        Complejo Giovanni // Staff
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">DNI (Usuario)</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input
                                type="text"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                placeholder="Tu número de DNI"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-bold text-rose-500 uppercase text-center tracking-widest">
                            {error.message}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-indigo-500 text-slate-950 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <LogIn size={20} /> Entrar a Mozos
                            </>
                        )}
                    </button>
                </form>

                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
                    Solo personal autorizado. Todas las acciones son registradas.
                </p>
            </div>
        </div>
    );
}
