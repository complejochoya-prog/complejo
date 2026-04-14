import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Trophy, User, Lock, ArrowRight, XCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [nombreComplejo, setNombreComplejo] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const docRef = doc(db, "configuraciones", "home");
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setNombreComplejo(snap.data().nombre || "COMPLEJO GIOVANNI");
            }
        }, () => {
            setNombreComplejo("COMPLEJO GIOVANNI");
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulación de delay para feedback visual premium
        setTimeout(() => {
            if (user === "gio" && password === "gio") {
                localStorage.setItem("userRole", "superadmin");
                localStorage.setItem("userId", "superadmin");
                localStorage.setItem("userName", "Super Admin");
                navigate("/superadmin");
            } else if (user === "admin" && password === "admin") {
                localStorage.setItem("userRole", "admin");
                localStorage.setItem("userId", "admin");
                localStorage.setItem("userName", "Administrador");
                navigate("/giovanni/dashboard");
            } else if (user === "123" && password === "123") {
                localStorage.setItem("userRole", "mozo");
                localStorage.setItem("userId", "123");
                localStorage.setItem("userName", "Mozo 123");
                navigate("/giovanni/mozo");
            } else {
                setError("Usuario o contraseña incorrectos");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden font-inter">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-gold p-4 rounded-3xl rotate-3 shadow-[0_0_50px_rgba(242,185,13,0.2)] mb-8">
                        <Trophy size={40} className="text-slate-950 fill-slate-950" />
                    </div>
                    <h2 className="text-4xl font-black italic text-center text-white uppercase tracking-tighter leading-none mb-2">
                        {nombreComplejo.split(' ')[0]}
                        <span className="text-gold"> {nombreComplejo.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                        Sistema de Gestión Maestra
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-10 text-center">
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Acceso Restringido</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Ingrese sus credenciales autorizadas</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Identificación</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="USUARIO"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-white font-black placeholder-zinc-700 focus:border-gold/50 focus:bg-white/[0.05] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-4">Clave de Seguridad</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 pl-14 rounded-2xl text-white font-black placeholder-zinc-700 focus:border-gold/50 focus:bg-white/[0.05] outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-bold animate-shake">
                                <XCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gold text-slate-950 font-black italic uppercase tracking-tighter py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(242,185,13,0.2)] disabled:opacity-50 disabled:grayscale"
                        >
                            {isLoading ? (
                                <div className="size-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Ingresar al Sistema <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <p className="mt-12 text-center text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
                    © 2026 GIOVANNI COMPLEJO · TERMINAL DE CONTROL
                </p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}} />
        </div>
    );
}
