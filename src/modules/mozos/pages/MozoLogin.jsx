import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { loginMozo } from '../services/mozoService';
import { fetchEmpleados } from '../../empleados/services/empleadosService';
import { User, Lock, Loader2, LogIn, ShieldAlert, UtensilsCrossed } from 'lucide-react';

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
            const empleados = await fetchEmpleados(negocioId);
            await loginMozo(usuario, password, empleados);
            // Si el login fue exitoso, guardamos el negocioId de paso
            navigate(`/${negocioId}/app/mozos`);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (error?.type === 'locked') {
        return (
            <div className="min-h-[100dvh] bg-[#0c0a09] flex flex-col items-center justify-center p-6 sm:p-8 font-inter">
                <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.15)] border border-rose-500/20">
                        <ShieldAlert size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Acceso Bloqueado</h1>
                        <p className="text-slate-400 text-[12px] leading-relaxed mx-4">
                            Tu cuenta de mozo ha sido suspendida. Por favor, comunícate con el administrador.
                        </p>
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        className="mt-8 px-6 py-3 bg-white/5 rounded-2xl text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#0c0a09] flex flex-col justify-center p-6 sm:p-10 font-inter relative overflow-hidden selection:bg-amber-500/30">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-sm mx-auto relative z-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header App Mozos */}
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[28px] flex items-center justify-center mx-auto shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] border border-amber-300/20">
                        <UtensilsCrossed className="text-amber-950" size={36} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-white shadow-sm mb-1">Mozos</h1>
                        <p className="text-amber-500/80 text-[11px] font-black uppercase tracking-[0.3em]">
                            {config?.nombre || 'Complejo'} • Staff
                        </p>
                    </div>
                </div>

                {/* Glass Form */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.02] p-6 sm:p-8 rounded-[40px] border border-white/5 backdrop-blur-2xl shadow-2xl">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Credencial (DNI)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-amber-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-[20px] py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all hover:bg-black/60"
                                    placeholder="Nro de Documento"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Código Secreto</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-amber-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-[20px] py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-all hover:bg-black/60"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[16px] text-[11px] font-bold text-rose-400 text-center flex items-center justify-center gap-2">
                            <ShieldAlert size={14} />
                            {error.message || 'Credenciales incorrectas'}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 rounded-[20px] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>Ingresar a Sala <LogIn size={18} /></>
                        )}
                    </button>
                </form>

                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mx-10">
                    Sincronización en tiempo real con caja central.
                </p>
            </div>
        </div>
    );
}
