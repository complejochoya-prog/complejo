import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, User, Loader2, Bike, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchEmpleados } from '../../empleados/services/empleadosService';
import { useConfig } from '../../../core/services/ConfigContext';

export default function DeliveryLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { negocioId } = useParams();
    const { config } = useConfig();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const empleados = await fetchEmpleados(negocioId);
            const riderMatch = empleados.find(emp => 
                (emp.rol === 'DELIVERY' || emp.rol === 'admin' || emp.rol === 'encargado' || emp.rol === 'MOZO' || emp.rol === 'mozo') && 
                emp.dni === username &&
                emp.password === password
            );

            if (!riderMatch) {
                setError('Credenciales inválidas');
            } else if (riderMatch.estado !== 'activo') {
                setError('Usuario inactivo');
            } else {
                localStorage.setItem('delivery_userId', riderMatch.id);
                localStorage.setItem('delivery_userName', riderMatch.nombre + ' ' + riderMatch.apellido);
                localStorage.setItem('delivery_userRole', riderMatch.rol);
                navigate(`/${negocioId}/app/delivery`);
            }
        } catch (err) {
            console.error(err);
            setError('Fallo en la sincronización');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-inter">
            
            {/* Ambient Background Light System */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-blue-500/5 blur-[160px] rounded-full animate-bounce duration-[10s]" />
            </div>

            <main className="w-full max-w-md relative z-10 space-y-12 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Brand / Title */}
                <div className="text-center space-y-6">
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-cyan-500 to-cyan-600 text-slate-950 flex items-center justify-center relative z-10 shadow-2xl animate-in slide-in-from-top-12 duration-1000">
                            <Bike size={36} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">RIDER ACCESS</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-3">
                            {config?.nombre || 'Terminal de Despacho'}
                        </p>
                    </div>
                </div>

                {/* Login Form Card */}
                <form onSubmit={handleLogin} className="space-y-6 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-8 rounded-[40px] shadow-2xl relative">
                    
                    <div className="space-y-5">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Identificación (DNI)</label>
                             <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-cyan-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-[22px] py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all hover:bg-black/60"
                                    placeholder="DNI del personal"
                                    required
                                />
                             </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Clave Segura</label>
                             <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-cyan-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-[22px] py-5 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-cyan-500 transition-all hover:bg-black/60"
                                    placeholder="••••••••"
                                    required
                                />
                             </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
                             {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full relative group/btn"
                    >
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 invisible group-hover/btn:visible transition-all" />
                        <div className="relative z-10 flex items-center justify-center gap-3 w-full bg-cyan-500 text-slate-950 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Entrar al Panel <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
                            )}
                        </div>
                    </button>
                    
                </form>

                {/* Footer Security */}
                <div className="flex items-center justify-center gap-2.5 opacity-30">
                    <ShieldCheck size={14} className="text-cyan-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Dispatch Protocol v3.0</span>
                </div>

            </main>
        </div>
    );
}
