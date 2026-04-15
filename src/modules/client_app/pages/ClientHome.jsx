import React, { useEffect, useState } from 'react';
import { CalendarRange, Trophy, Flame, Check } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';
import { useClientAuth } from '../hooks/useClientAuth';
import ClientNavbar from '../components/ClientNavbar';
import FieldCard from '../components/FieldCard';
import PromotionCard from '../components/PromotionCard';
import { fetchCanchasDisponibles } from '../services/clientService';
import { checkAvailability } from '../services/userService';
import { useNavigate } from 'react-router-dom';

export default function ClientHome() {
    const { config, negocioId } = useConfig();
    const { clientUser, login, register, logout } = useClientAuth();
    const [canchas, setCanchas] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', username: '' });
    const [remember, setRemember] = useState(true);
    const [usernameError, setUsernameError] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    // ✅ FIX: inline error messages instead of alert()
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const loadHome = async () => {
            const data = await fetchCanchasDisponibles(negocioId, new Date().toISOString());
            setCanchas(data);
        };
        loadHome();
    }, [negocioId]);

    // ✅ FIX: properly awaited checkAvailability
    const handleUsernameBlur = async () => {
        if (authMode === 'register' && formData.username) {
            setIsCheckingUsername(true);
            try {
                const isAvailable = await checkAvailability(formData.username, negocioId);
                setUsernameError(isAvailable ? '' : 'Usuario no disponible');
            } catch {
                setUsernameError('');
            } finally {
                setIsCheckingUsername(false);
            }
        }
    };

    // ✅ FIX: no setTimeout wrapper (so finally runs reliably), no alert()
    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        if (authMode === 'register' && usernameError) return;

        setIsLoading(true);
        try {
            if (authMode === 'login') {
                const res = await login(formData.email, formData.password, negocioId, remember);
                if (res.success) {
                    setShowLogin(false);
                } else {
                    setAuthError(res.error || 'Error al iniciar sesión');
                }
            } else {
                const res = await register(formData, negocioId, remember);
                if (res.success) {
                    setShowLogin(false);
                } else {
                    setAuthError(res.error || 'Error al registrarse');
                }
            }
        } catch (err) {
            setAuthError('Error inesperado. Intente nuevamente.');
        } finally {
            // ✅ FIX: always runs — button never stays blocked
            setIsLoading(false);
        }
    };

    if (!clientUser) {
        return (
            <div className="min-h-[100dvh] flex flex-col p-6 bg-[#020617] relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                <div className="flex-1 flex flex-col items-center justify-center space-y-10 relative z-10 animate-in fade-in zoom-in duration-700">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[32px] shadow-2xl flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform duration-500 relative z-10">
                                <CalendarRange size={40} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter text-white italic leading-[0.8]">
                                {config?.nombre || 'GIOVANNI'}<br/>
                                <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">RESERVAS</span>
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-4 px-6 py-2 border-y border-white/5">
                                Experiencia Deportiva Premium
                            </p>
                        </div>
                    </div>

                    {!showLogin ? (
                        <div className="w-full space-y-4 max-w-sm animate-in slide-in-from-bottom-12 duration-700 delay-200">
                            <button 
                                onClick={() => { setShowLogin(true); setAuthMode('login'); setAuthError(''); }}
                                className="w-full bg-white text-indigo-950 py-6 rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Iniciar Sesión
                            </button>
                            <button 
                                onClick={() => { setShowLogin(true); setAuthMode('register'); setAuthError(''); }}
                                className="w-full bg-slate-900/50 backdrop-blur-md text-white border border-white/10 py-6 rounded-[28px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
                            >
                                Crear Cuenta
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4 animate-in slide-in-from-bottom-12 duration-700">
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] space-y-5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                                
                                <div className="flex justify-center gap-8 mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => { setAuthMode('login'); setAuthError(''); }}
                                        className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${authMode === 'login' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-600'}`}
                                    >
                                        Entrar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setAuthMode('register'); setAuthError(''); }}
                                        className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${authMode === 'register' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-600'}`}
                                    >
                                        Registrarme
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {authMode === 'register' ? (
                                        <>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="NOMBRE COMPLETO" 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                                                    required 
                                                />
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="USUARIO" 
                                                    value={formData.username}
                                                    onBlur={handleUsernameBlur}
                                                    onChange={(e) => {
                                                        setFormData({...formData, username: e.target.value.toLowerCase()});
                                                        if (usernameError) setUsernameError('');
                                                    }}
                                                    className={`w-full bg-white/[0.03] border ${usernameError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all`}
                                                    required 
                                                />
                                                {usernameError && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{usernameError}</p>}
                                                {isCheckingUsername && <div className="absolute right-4 top-4 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                                            </div>
                                            <input 
                                                type="tel" 
                                                placeholder="WHATSAPP (+54...)" 
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                                                required 
                                            />
                                            <input 
                                                type="email" 
                                                placeholder="EMAIL" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                                                required 
                                            />
                                        </>
                                    ) : (
                                        <input 
                                            type="text" 
                                            placeholder="USUARIO O EMAIL" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                                            required 
                                        />
                                    )}

                                    <input 
                                        type="password" 
                                        placeholder="CONTRASEÑA" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                                        required 
                                    />
                                </div>

                                {/* ✅ FIX: inline error display instead of alert() */}
                                {authError && (
                                    <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">{authError}</p>
                                    </div>
                                )}

                                {/* ✅ FIX: Check is now properly imported at top */}
                                <label className="flex items-center gap-3 px-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${remember ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 group-hover:border-white/20'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={remember} 
                                            onChange={() => setRemember(!remember)} 
                                        />
                                        {remember && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Recordarme</span>
                                </label>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        authMode === 'login' ? 'ENTRAR' : 'REGISTRARME'
                                    )}
                                </button>
                            </div>

                            <button 
                                type="button"
                                disabled={isLoading}
                                onClick={() => { setShowLogin(false); setAuthError(''); }}
                                className="w-full text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-center py-2 hover:text-white transition-colors"
                            >
                                ← Volver
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 animate-in fade-in duration-500">
            <ClientNavbar config={config} user={clientUser} />
            
            <div className="p-6 space-y-10 relative z-10 max-w-lg mx-auto pb-32">
                {/* Hero Greeting PWA style */}
                <div className="relative group perspective-1000">
                    <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white transform hover:rotate-x-2 transition-transform duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CalendarRange size={120} />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200/60 block mb-2">Panel del Jugador</span>
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none mb-1">¡Hola, {clientUser.name.split(' ')[0]}!</h2>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-100/60">¿En qué cancha jugamos hoy?</p>
                        </div>
                    </div>
                </div>

                {/* Section: Canchas Available */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-[11px] items-center text-slate-400 font-black uppercase tracking-[0.3em] flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Flame size={16} className="text-orange-500 animate-pulse" />
                            </div>
                            Elegir Espacio
                        </h3>
                        {canchas.length > 0 && (
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{canchas.length} disponibles</span>
                        )}
                    </div>
                    
                    {canchas.length === 0 ? (
                        <div className="bg-white/5 rounded-[40px] p-10 text-center border border-white/5 border-dashed">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No hay espacios disponibles en este momento</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {canchas.map((c, idx) => (
                                <div key={c.id} className="animate-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <FieldCard field={c} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Promociones Widget */}
                <section>
                    <h3 className="text-[11px] items-center text-slate-400 font-black uppercase tracking-[0.3em] mb-6 px-2 flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Trophy size={16} className="text-amber-500" />
                        </div>
                        Novedades
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="animate-in slide-in-from-bottom-8 delay-300 fill-mode-both">
                            <PromotionCard 
                                title="Descuento Estudiantes" 
                                subtitle="15% Off presentando libreta de 10hs a 14hs"
                                badgeText="PROMO HORARIO VALLE"
                                colorClass="emerald"
                            />
                        </div>
                        <div className="animate-in slide-in-from-bottom-8 delay-500 fill-mode-both">
                            <PromotionCard 
                                title="Torneo Amateur Padel" 
                                subtitle="Inscripciones Abiertas / $15000 pareja"
                                badgeText="NUEVO TORNEO"
                                colorClass="violet"
                            />
                        </div>
                    </div>
                </section>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-2 { transform: rotateX(2deg); }
            ` }} />
        </div>
    );
}
