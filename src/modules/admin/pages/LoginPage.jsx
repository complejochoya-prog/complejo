import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle, Zap, Star } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || `/${negocioId}/dashboard`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        setTimeout(() => {
            const result = login(credentials.username, credentials.password);
            if (result.success) {
                const userRole = result.user?.role;
                let redirectPath = `/${negocioId}/dashboard`;

                if (userRole === 'mozo') redirectPath = `/${negocioId}/bar`;
                else if (userRole === 'cocina') redirectPath = `/${negocioId}/cocina`;
                else if (userRole === 'cliente') redirectPath = `/${negocioId}/home`;
                else if (userRole === 'empleado') redirectPath = `/${negocioId}/empleado`;
                else if (userRole === 'DELIVERY') redirectPath = `/${negocioId}/app/delivery`;

                navigate(redirectPath, { replace: true });
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-6 font-inter relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 animate-mesh opacity-20" />
            <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
            <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

            <div className="w-full max-w-sm lg:max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-8 lg:mb-10 text-center">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[24px] lg:rounded-[32px] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-5 lg:mb-6 group transition-transform hover:scale-105 hover:rotate-3 duration-500 relative">
                        <Shield size={32} className="text-black group-hover:rotate-12 transition-transform relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-[24px] lg:rounded-[32px] animate-pulse" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                        {negocioId?.toUpperCase() || 'COMPLEJO'}
                    </h1>
                    <div className="flex items-center gap-2 mt-3">
                        <Star size={8} className="text-amber-500" fill="currentColor" />
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                            Panel de Administración
                        </p>
                        <Star size={8} className="text-amber-500" fill="currentColor" />
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-premium rounded-[32px] lg:rounded-[40px] p-7 lg:p-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl lg:rounded-2xl p-3 lg:p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Usuario</label>
                                <div className="relative group/field">
                                    <div className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-amber-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        autoComplete="username"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl lg:rounded-2xl pl-12 lg:pl-14 pr-5 lg:pr-6 py-3.5 lg:py-4 text-sm font-bold placeholder-slate-700 focus:border-amber-500/50 focus:bg-white/[0.05] outline-none transition-all"
                                        placeholder="ADMIN"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Contraseña</label>
                                <div className="relative group/field">
                                    <div className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-amber-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        autoComplete="current-password"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl lg:rounded-2xl pl-12 lg:pl-14 pr-5 lg:pr-6 py-3.5 lg:py-4 text-sm font-bold placeholder-slate-700 focus:border-amber-500/50 focus:bg-white/[0.05] outline-none transition-all"
                                        placeholder="••••••••"
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
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 py-4 lg:py-5 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest text-black shadow-2xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Zap size={16} className="relative z-10" />
                                    <span className="relative z-10">Acceder al Panel</span>
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-700 mt-6">
                    Complejo Giovanni • v2.0 Premium
                </p>
            </div>
        </div>
    );
}
