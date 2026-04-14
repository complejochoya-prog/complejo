import React, { useEffect, useState } from 'react';
import { CalendarRange, Trophy, Flame } from 'lucide-react';
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

    useEffect(() => {
        const loadHome = async () => {
            const data = await fetchCanchasDisponibles(negocioId, new Date().toISOString());
            setCanchas(data);
        };
        loadHome();
    }, [negocioId]);

    const handleUsernameBlur = () => {
        if (authMode === 'register' && formData.username) {
            setIsCheckingUsername(true);
            const isAvailable = checkAvailability(formData.username, negocioId);
            setUsernameError(isAvailable ? '' : 'Usuario no disponible');
            setIsCheckingUsername(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simular pequeño retraso para feedback visual
        setTimeout(async () => {
            if (authMode === 'login') {
                const res = await login(formData.email, formData.password, negocioId, remember);
                if (res.success) {
                    setShowLogin(false);
                } else {
                    alert(res.error || 'Error al entrar');
                }
            } else {
                if (usernameError) return;
                const res = await register(formData, negocioId, remember);
                if (res.success) {
                    setShowLogin(false);
                } else {
                    alert(res.error || 'Error al registrarse');
                }
            }
            setIsLoading(false);
        }, 1000);
    };

    if (!clientUser) {
        return (
            <div className="min-h-full flex flex-col p-6 bg-[#020617] relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-violet-600/10 rounded-full blur-[100px]" />

                <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative z-10 animate-in fade-in duration-700">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <CalendarRange size={36} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic leading-tight">
                                {config?.nombre || 'GIOVANNI'}<br/>
                                <span className="text-indigo-500">RESERVAS</span>
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                                Tu pasión, a un click de distancia
                            </p>
                        </div>
                    </div>

                    {!showLogin ? (
                        <div className="w-full space-y-4 animate-in slide-in-from-bottom-8 duration-500">
                            <button 
                                onClick={() => { setShowLogin(true); setAuthMode('login'); }}
                                className="w-full bg-white text-indigo-950 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Iniciar Sesión
                            </button>
                            <button 
                                onClick={() => { setShowLogin(true); setAuthMode('register'); }}
                                className="w-full bg-slate-900 text-white border border-white/10 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Crear Cuenta Nueva
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="w-full space-y-4 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-5 shadow-2xl">
                                <div className="flex justify-center gap-6 mb-2">
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${authMode === 'login' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}
                                    >
                                        Login
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('register')}
                                        className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${authMode === 'register' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500'}`}
                                    >
                                        Registro
                                    </button>
                                </div>

                                {authMode === 'register' ? (
                                    <>
                                        <input 
                                            type="text" 
                                            placeholder="NOMBRE COMPLETO" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                                            required 
                                        />
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="NOMBRE DE USUARIO" 
                                                value={formData.username}
                                                onBlur={handleUsernameBlur}
                                                onChange={(e) => {
                                                    setFormData({...formData, username: e.target.value.toLowerCase()});
                                                    if (usernameError) setUsernameError('');
                                                }}
                                                className={`w-full bg-white/[0.03] border ${usernameError ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all`}
                                                required 
                                            />
                                            {usernameError && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4 absolute">{usernameError}</p>}
                                            {isCheckingUsername && <div className="absolute right-4 top-4 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                                        </div>
                                        <input 
                                            type="tel" 
                                            placeholder="WHATSAPP (+54...)" 
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                                            required 
                                        />
                                        <input 
                                            type="email" 
                                            placeholder="CORREO ELECTRÓNICO" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                                            required 
                                        />
                                    </>
                                ) : (
                                    <input 
                                        type="text" 
                                        placeholder="USUARIO O CORREO" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                )}

                                <input 
                                    type="password" 
                                    placeholder="CONTRASEÑA" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    required 
                                />

                                <label className="flex items-center gap-3 px-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${remember ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 group-hover:border-white/30'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={remember} 
                                            onChange={() => setRemember(!remember)} 
                                        />
                                        {remember && <div className="w-2.5 h-2.5 bg-white rounded-sm scale-in" />}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Recordarme en este dispositivo</span>
                                </label>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-indigo-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        authMode === 'login' ? 'ENTRAR A MI CUENTA' : 'CONFIRMAR REGISTRO'
                                    )}
                                </button>
                            </div>

                            <button 
                                type="button"
                                disabled={isLoading}
                                onClick={() => setShowLogin(false)}
                                className="w-full text-[9px] font-black text-slate-500 uppercase tracking-widest text-center py-2 hover:text-slate-300 transition-colors"
                            >
                                Volver atrás
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
            <ClientNavbar config={config} user={clientUser} />
            
            <div className="p-5 space-y-6 relative z-10">
                {/* Hero Greeting PWA style */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-[32px] shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute -top-10 -right-10 bg-white/10 w-40 h-40 rounded-full blur-2xl" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-2">¡Hola, {clientUser.name.split(' ')[0]}!</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">¿Qué jugamos hoy?</p>
                </div>

                {/* Section: Canchas Available */}
                <div>
                    <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-3 px-2 flex gap-2">
                        <Flame size={14} className="text-orange-500" /> Reserva Inmediata
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {canchas.map(c => (
                            <FieldCard key={c.id} field={c} />
                        ))}
                    </div>
                </div>

                {/* Promociones Widget */}
                <div>
                    <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-3 px-2 flex gap-2">
                        <Trophy size={14} className="text-amber-500" /> Novedades
                    </h3>
                    <div className="space-y-3">
                        <PromotionCard 
                            title="Descuento Estudiantes" 
                            subtitle="15% Off presentando libreta de 10hs a 14hs"
                            badgeText="PROMO HORARIO VALLE"
                            colorClass="emerald"
                        />
                        <PromotionCard 
                            title="Torneo Amateur Padel" 
                            subtitle="Inscripciones Abiertas / $15000 parejera"
                            badgeText="NUEVO TORNEO"
                            colorClass="violet"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
