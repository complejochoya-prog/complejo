import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, User, Loader2, Bike } from 'lucide-react';
import { fetchEmpleados } from '../../empleados/services/empleadosService';
import { useConfig } from '../../../core/services/ConfigContext';

export default function DeliveryLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); // Simulated login currently
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
            // Simulated validation since DNI is often used as access or they have specific logic 
            // We'll search for first name or dni matches just for this mock system.
            const empleados = await fetchEmpleados();
            const riderMatch = empleados.find(emp => 
                (emp.rol === 'DELIVERY' || emp.rol === 'admin' || emp.rol === 'encargado' || emp.rol === 'MOZO') && 
                emp.dni === username &&
                emp.password === password
            );

            if (!riderMatch) {
                setError('Usuario no encontrado o no es repartidor');
            } else if (riderMatch.estado !== 'activo') {
                setError('Usuario inactivo o suspendido');
            } else {
                localStorage.setItem('delivery_userId', riderMatch.id);
                localStorage.setItem('delivery_userName', riderMatch.nombre + ' ' + riderMatch.apellido);
                localStorage.setItem('delivery_userRole', riderMatch.rol);
                navigate(`/${negocioId}/app/delivery`);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="w-full max-w-sm relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-500">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/10">
                        <Bike size={40} />
                    </div>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Delivery App</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{config?.nombre || 'Complejo Giovanni'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">DNI (Usuario)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <User size={18} />
                            </div>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Ingrese su DNI"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="******"
                                // Not strictly required for demo but good practice
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}
