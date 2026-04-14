/**
 * SuperAdmin Login — Exclusive login for the SaaS Master Panel.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useSuperAdminAuth } from '../services/SuperAdminAuthContext';

export default function SuperAdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useSuperAdminAuth();
    
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect path after login
    const from = location.state?.from?.pathname || "/superadmin";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Small delay to simulate network/system check for a better UX
        setTimeout(() => {
            const result = login(credentials.username, credentials.password);
            
            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-inter relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] mix-blend-overlay opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-500">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)] mb-6 group transition-transform hover:scale-105 duration-500">
                        <Shield size={36} className="text-white group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                        COMPLEJO <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">GIOVANNI</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400 mt-2">
                        Panel Maestro SaaS
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2 duration-300">
                                <AlertCircle size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Identificador Maestro</label>
                                <div className="relative group/field">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-violet-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 focus:bg-white/[0.05] outline-none transition-all"
                                        placeholder="USUARIO"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Clave de Acceso</label>
                                <div className="relative group/field">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-violet-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold placeholder-slate-700 focus:border-violet-500/50 focus:bg-white/[0.05] outline-none transition-all"
                                        placeholder="CONTRASEÑA"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group/btn overflow-hidden relative"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Ingresar a la Consola</span>
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                            
                            {/* Shiny effect on button */}
                            <div className="absolute top-0 -left-full bottom-0 w-1/2 bg-white/20 -skew-x-[30deg] group-hover/btn:left-[150%] transition-all duration-1000" />
                        </button>
                    </form>
                </div>

                {/* Footer labels */}
                <div className="mt-8 flex justify-center items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Security Protocol v4.0</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Restricted Access</span>
                </div>
            </div>
        </div>
    );
}
