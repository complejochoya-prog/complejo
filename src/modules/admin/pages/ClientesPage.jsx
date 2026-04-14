import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUsers, clearAllUsers, updateUser } from '../../client_app/services/userService';
import { Users, Search, Mail, Phone, Calendar, UserCheck, ShieldCheck, MoreVertical, Trash2, RotateCcw, Eye, Edit2, Lock, Shield, X, Save } from 'lucide-react';

export default function ClientesPage() {
    const { negocioId } = useParams();
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [adminCreds, setAdminCreds] = useState({ user: '', password: '' });
    const [editData, setEditData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = () => {
            const data = getUsers(negocioId);
            setClientes(data);
        };
        
        load();

        // Escuchar cambios en tiempo real
        window.addEventListener('storage', load);
        
        // Polling de seguridad cada 2 segundos por si el evento no dispara en la misma pestaña
        const interval = setInterval(load, 2000);

        return () => {
            window.removeEventListener('storage', load);
            clearInterval(interval);
        };
    }, [negocioId]);

    const filteredClientes = clientes.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAuthAdmin = (e) => {
        e.preventDefault();
        // Consultar directamente la base de datos de empleados
        const empleados = JSON.parse(localStorage.getItem('complejo_empleados') || '[]');
        
        // Buscar un empleado con función de administrador que coincida con las credenciales
        const isAdmin = empleados.find(emp => 
            (emp.usuario === adminCreds.user || emp.email === adminCreds.user) && 
            emp.password === adminCreds.password && 
            (emp.rol === 'admin' || emp.rol === 'administrador' || emp.rol?.toLowerCase() === 'admin')
        );

        if (isAdmin) {
            setShowAuthModal(false);
            setEditData({ ...selectedClient });
            setShowEditModal(true);
            setAdminCreds({ user: '', password: '' });
            setError('');
        } else {
            setError('Credenciales de administrador inválidas');
        }
    };

    const handleSaveClient = (e) => {
        e.preventDefault();
        updateUser(selectedClient.id, editData);
        setShowEditModal(false);
        setSelectedClient(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        BASE DE <span className="text-amber-500">CLIENTES</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        Gestión centralizada de usuarios PWA
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if(window.confirm('¿Estás seguro de borrar TODOS los clientes? Esta acción es irreversible.')) {
                                clearAllUsers();
                            }
                        }}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
                    >
                        <RotateCcw size={14} /> Reiniciar Base
                    </button>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="BUSCAR CLIENTE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold w-full lg:w-[300px] focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-5">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Users size={20} className="text-black" />
                    </div>
                    <div>
                        <p className="text-2xl font-black italic tracking-tighter">{clientes.length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Clientes</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-black italic tracking-tighter">{clientes.filter(c => c.username).length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cuentas Activas</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-black italic tracking-tighter">{clientes.filter(c => new Date(c.createdAt) > new Date(Date.now() - 86400000)).length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nuevos hoy</p>
                    </div>
                </div>
            </div>

            {/* Main Table / List */}
            <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Contacto</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Registro</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredClientes.length > 0 ? filteredClientes.map((c) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black border border-white/5">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">{c.name}</p>
                                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">@{c.username || 'sin_usuario'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                                                <Mail size={12} /> {c.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <Phone size={12} /> {c.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                            <Calendar size={12} />
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedClient(c);
                                                    setShowAuthModal(true);
                                                }}
                                                className="p-2 hover:bg-amber-500/10 rounded-lg text-slate-500 hover:text-amber-500 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
                                            >
                                                <Eye size={16} /> Ver/Editar
                                            </button>
                                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Users size={48} />
                                            <p className="text-xs font-black uppercase tracking-widest">No hay clientes registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Verificación Admin */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Acceso Restringido</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Se requiere perfil administrador</p>
                                </div>
                            </div>

                            <form onSubmit={handleAuthAdmin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuario Admin</label>
                                    <input 
                                        type="text" 
                                        value={adminCreds.user}
                                        onChange={(e) => setAdminCreds({...adminCreds, user: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                        placeholder="Ej: admin_giovanni"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Pin secreto</label>
                                    <input 
                                        type="password" 
                                        value={adminCreds.password}
                                        onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {error && <p className="text-[9px] text-red-500 font-black uppercase text-center">{error}</p>}
                                
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => { setShowAuthModal(false); setAdminCreds({user:'', password:''}); setError(''); }}
                                        className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                                    >
                                        Verificar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Cliente */}
            {showEditModal && editData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-amber-500 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-black">
                                <Edit2 size={24} />
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">Modificar Cliente</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">ID: {selectedClient.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="bg-black/10 p-2 rounded-xl hover:bg-black/20 transition-all">
                                <X size={20} className="text-black" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveClient} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuario (@)</label>
                                <input 
                                    type="text" 
                                    value={editData.username}
                                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                <input 
                                    type="email" 
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                                <input 
                                    type="text" 
                                    value={editData.phone}
                                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2 bg-amber-500/5 p-6 rounded-[24px] border border-amber-500/10">
                                <div className="flex items-center gap-3 mb-3 text-amber-500">
                                    <Lock size={16} />
                                    <label className="text-[10px] font-black uppercase tracking-widest">Seguridad: Contraseña de Acceso</label>
                                </div>
                                <input 
                                    type="text" 
                                    value={editData.password}
                                    onChange={(e) => setEditData({...editData, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-amber-500 transition-all text-amber-500"
                                />
                                <p className="text-[8px] text-slate-500 font-bold mt-2 uppercase tracking-tight italic">* Solo modificar si el cliente olvidó su clave</p>
                            </div>

                            <div className="md:col-span-2 flex justify-end pt-4">
                                <button 
                                    type="submit"
                                    className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-black rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Save size={18} /> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
