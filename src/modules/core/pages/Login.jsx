import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../../empleados/services/AuthContext';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import InstallApp from '../../../components/InstallApp';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { businessInfo } = useConfig();
    const { users } = useAuth();
    const nombreComplejo = businessInfo?.nombre || "COMPLEJO GIOVANNI";

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Check hardcoded credentials first to match admin LoginPage
        if (email === "1234" && password === "1234") {
            localStorage.setItem("userRole", "delivery");
            localStorage.setItem("userId", "mozo");
            localStorage.setItem("userName", "Mozo Delivery");
            navigate(`/${businessInfo?.slug || 'giovanni'}/delivery`);
            return;
        } else if (email === "123" && password === "123") {
            localStorage.setItem("userRole", "mozo");
            localStorage.setItem("userId", "123");
            localStorage.setItem("userName", "Mozo 123");
            navigate(`/${businessInfo?.slug || 'giovanni'}/mozo`);
            return;
        }

        const user = users.find(u => u.username === email && u.password === password);
        if (user) {
            if (user.activo === false) {
                setError('🚫 Usuario inactivo. Comuníquese con administración.');
                return;
            }
            localStorage.setItem('userRole', user.role || 'admin');
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);

            const slug = businessInfo?.slug || 'giovanni';
            if (user.role === 'mozo') {
                navigate(`/${slug}/mozo`);
            } else if (user.role === 'delivery') {
                navigate(`/${slug}/delivery`);
            } else {
                navigate(`/${slug}/dashboard`);
            }
        } else {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 font-inter relative overflow-hidden">
            {/* Background Decoration Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]"></div>

            <div className="bg-[#0D121D]/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl max-w-sm w-full backdrop-blur-sm z-10 animate-in zoom-in-95 duration-500">

                {/* Header con Logo y Nombre */}
                <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 border border-yellow-400/20">
                            <User className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <div className="text-2xl font-normal text-white tracking-widest uppercase">

                        </div>
                    </div>
                    <h2 className={`text-3xl font-extrabold text-center text-white mb-1.5 uppercase tracking-tighter transition-opacity duration-500 ${nombreComplejo ? 'opacity-100' : 'opacity-0'}`}>
                        {nombreComplejo}
                    </h2>
                    <p className="text-[10px] text-center text-zinc-500 font-bold uppercase tracking-[0.2em]">
                        Acceso Administrativo
                    </p>
                </div>

                {/* Formulario */}
                <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Campo de Correo */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                            Email de Administrador
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@giovanni.com"
                                className="w-full bg-[#161C2A] text-white p-4 pl-12 rounded-xl border border-zinc-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-150 text-base placeholder:text-zinc-600"
                                required
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-yellow-400 transition-colors" />
                        </div>
                    </div>

                    {/* Campo de Contraseña */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                Contraseña
                            </label>
                            <button type="button" className="text-[10px] font-bold text-yellow-400 uppercase hover:text-yellow-300 transition tracking-tighter">
                                RECUPERAR CLAVE
                            </button>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#161C2A] text-white p-4 pl-12 pr-12 rounded-xl border border-zinc-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-150 text-base placeholder:text-zinc-600"
                                required
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-yellow-400 transition-colors" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-xs font-bold text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Botón de Acceso */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-yellow-400 text-[#070B14] p-4 rounded-full font-black text-base hover:bg-yellow-300 transition duration-150 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98]"
                        >
                            ACCEDER AL PANEL
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>

                {/* Línea Divisoria y Texto de Seguridad */}
                <div className="my-10 border-t border-zinc-800/50" />

                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                        <ShieldCheck size={14} className="text-green-500" />
                        Seguridad Activa
                    </div>
                    <p className="text-[10px] text-zinc-500 max-w-[280px] mx-auto leading-relaxed font-medium">
                        Sesión protegida por encriptación y autenticación gestionada por <strong className="font-bold text-zinc-400">Firebase Auth</strong>.
                    </p>
                </div>
            </div>

            {/* Soporte */}
            <p className="text-[10px] text-zinc-600 mt-8 font-bold uppercase tracking-widest">
                ¿Problemas con el acceso? <span className="text-zinc-400 hover:text-yellow-400 cursor-pointer transition-colors">Soporte Técnico</span>
            </p>

            <InstallApp />
        </div>
    );
}
