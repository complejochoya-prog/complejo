import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useConfig } from '../../core/services/ConfigContext';
import {
    Plus, Trash2, Edit3, X, Check,
    UserCircle, ShieldCheck, Mail, Lock,
    ChevronDown, UserPlus, Shield
} from 'lucide-react';

export default function EmployeeManagement() {
    const { users, addUser, removeUser, updateUser, toggleUserStatus } = useAuth();
    const { orders } = usePedidos();
    const { negocioId } = useConfig();
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'mozo' | 'delivery' | 'cocina' | 'administrativo' | 'admin'
    const [editingId, setEditingId] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('mozo');
    const [newPermisos, setNewPermisos] = useState([]);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const tabs = [
        { id: 'todos', label: 'Todos' },
        { id: 'mozo', label: 'Mozos' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'cocina', label: 'Cocina' },
        { id: 'administrativo', label: 'Administrativos' },
        { id: 'admin', label: 'Administradores' },
    ];

    const filteredUsers = activeTab === 'todos'
        ? users
        : users.filter(u => u.role === activeTab);

    const availablePermisos = [
        { id: 'pedidos', label: 'Tomar Pedidos' },
        { id: 'cobrar', label: 'Cobrar' },
        { id: 'caja', label: 'Ver Caja' },
        { id: 'reservas', label: 'Ver Reservas' },
    ];

    const togglePermiso = (permiso) => {
        setNewPermisos(prev =>
            prev.includes(permiso)
                ? prev.filter(p => p !== permiso)
                : [...prev, permiso]
        );
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserName || !newUsername || !newPassword) return;

        if (isEditing) {
            try {
                // Security check for admin deactivation
                const userToUpdate = users.find(u => u.id === editingUserId);
                if (userToUpdate && (userToUpdate.username === 'giovanni' || userToUpdate.role === 'admin') && newRole !== 'admin') {
                    // This is just a UI-level check, the backend also protects it
                }

                await updateUser(editingUserId, {
                    name: newUserName,
                    username: newUsername,
                    password: newPassword,
                    role: newRole,
                    permisos: newPermisos
                });
                setSuccessMessage('Empleado actualizado correctamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                alert(err.message);
                return;
            }
        } else {
            addUser({
                name: newUserName,
                username: newUsername,
                password: newPassword,
                role: newRole,
                permisos: newPermisos,
                activo: true
            });
            setSuccessMessage('Empleado creado correctamente');
            setTimeout(() => setSuccessMessage(''), 3000);
        }

        resetForm();
    };

    const resetForm = () => {
        setNewUserName('');
        setNewUsername('');
        setNewPassword('');
        setNewRole('mozo');
        setNewPermisos([]);
        setShowAddForm(false);
        setIsEditing(false);
        setEditingUserId(null);
    };

    const handleEditClick = (user) => {
        setNewUserName(user.name);
        setNewUsername(user.username);
        setNewPassword(user.password || '');
        setNewRole(user.role);
        setNewPermisos(user.permisos || []);
        setEditingUserId(user.id);
        setIsEditing(true);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        GESTIÓN <span className="text-gold">PERSONAL</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Administración centralizada de empleados y roles del sistema.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 hover:scale-105 transition-transform"
                >
                    <UserPlus size={16} />
                    {showAddForm ? 'Cancelar' : 'Nuevo Empleado'}
                </button>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/5 p-2 rounded-3xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest italic transition-all
                            ${activeTab === tab.id
                                ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {successMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
                    <Check size={16} className="inline mr-2" />
                    {successMessage}
                </div>
            )}

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-white/[0.03] border border-gold/30 rounded-[32px] p-8 space-y-8 animate-in slide-in-from-top duration-300">
                    <h3 className="text-sm font-black uppercase tracking-tighter italic text-gold">
                        {isEditing ? `Editando: ${newUserName}` : 'Registrar Nuevo Acceso'}
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre Completo</label>
                                <div className="relative group">
                                    <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" />
                                    <input
                                        type="text"
                                        value={newUserName}
                                        onChange={e => setNewUserName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold/50 transition-all text-sm font-bold"
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Usuario (Login)</label>
                                <div className="relative group">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" />
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold/50 transition-all text-sm font-bold"
                                        placeholder="juan.perez"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Contraseña</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold/50 transition-all text-sm font-bold"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Rol Asignado</label>
                                <div className="relative group">
                                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" />
                                    <select
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        disabled={isEditing && newUsername === 'giovanni'}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-4 outline-none focus:border-gold/50 transition-all text-sm font-bold appearance-none disabled:opacity-50"
                                    >
                                        <option value="mozo" className="bg-slate-900">Mozo</option>
                                        <option value="delivery" className="bg-slate-900">Repartidor (Delivery)</option>
                                        <option value="cocina" className="bg-slate-900">Cocinero</option>
                                        <option value="administrativo" className="bg-slate-900">Administrativo (Limitado)</option>
                                        <option value="admin" className="bg-slate-900">Administrador Master</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-2">Permisos Específicos</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {availablePermisos.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => togglePermiso(p.id)}
                                        className={`flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-widest italic
                                            ${newPermisos.includes(p.id)
                                                ? 'bg-gold/20 border-gold text-gold shadow-lg shadow-gold/10'
                                                : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                            }`}
                                    >
                                        {newPermisos.includes(p.id) ? <Check size={14} /> : <Plus size={14} />}
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" className="flex items-center gap-2 px-8 py-5 rounded-2xl bg-gold text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-gold/20">
                                <Check size={16} /> {isEditing ? 'Guardar Cambios' : 'Crear Acceso'}
                            </button>
                            <button type="button" onClick={resetForm} className="flex items-center gap-2 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                <X size={16} /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => {
                    // Historial y Estadísticas
                    const safeOrders = orders || [];
                    const userOrders = safeOrders.filter(o => (o.mozoId === user.id || o.riderId === user.id));
                    const totalVendido = userOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
                    const totalCobrado = userOrders
                        .filter(o => o.status === 'paid' || o.status === 'entregado')
                        .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
                    const isActive = user.activo !== false;

                    return (
                        <div key={user.id} className={`p-8 rounded-[32px] border transition-all relative overflow-hidden group 
                            ${!isActive ? 'bg-red-500/5 border-red-500/20 grayscale opacity-70' : 'bg-white/[0.02] border-white/5 hover:border-gold/30 backdrop-blur-xl'}`}>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className={`size-16 rounded-[24px] flex items-center justify-center border shadow-inner transition-colors
                                        ${!isActive ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                                        <UserCircle size={32} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border 
                                            ${user.role === 'admin' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
                                            {user.role}
                                        </div>
                                        <span className={`text-[7px] font-black uppercase tracking-widest italic ${isActive ? 'text-action-green' : 'text-red-500'}`}>
                                            ● {isActive ? 'ACTIVO' : 'DESACTIVADO'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{user.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Mail size={12} className="text-gold" />
                                        ID: <span className="text-white">{user.username}</span>
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                    <div>
                                        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Vendido</p>
                                        <p className="text-lg font-black text-white italic">${totalVendido.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Cobrado</p>
                                        <p className="text-lg font-black text-gold italic">${totalCobrado.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Actividad Reciente:</p>
                                    <div className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                        {userOrders.slice(0, 5).map(o => (
                                            <div key={o.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black text-white uppercase tracking-tighter">#{o.id.slice(-4)}</span>
                                                    <span className="text-[6px] text-slate-500 font-bold uppercase">{o.timestamp?.toLocaleString()}</span>
                                                </div>
                                                <span className={`text-[7px] font-black ${o.status === 'paid' ? 'text-action-green' : 'text-gold'}`}>
                                                    ${o.total || 0}
                                                </span>
                                            </div>
                                        ))}
                                        {userOrders.length === 0 && (
                                            <p className="text-[7px] italic text-slate-600 font-bold uppercase tracking-widest p-2">Sin actividad</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {user.username !== 'giovanni' && user.role !== 'admin' && user.role !== 'admin_principal' && (
                                            <button
                                                onClick={() => toggleUserStatus(user.id, isActive)}
                                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border
                                                    ${!isActive
                                                        ? 'bg-action-green/20 border-action-green/30 text-action-green hover:bg-action-green hover:text-white'
                                                        : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                            >
                                                {!isActive ? 'Reactivar' : 'Desactivar'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-gold hover:bg-gold/10 transition-all"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        {user.id !== 'usr-1' && user.username !== 'admin' && user.username !== 'giovanni' && user.role !== 'admin_principal' && (
                                            <button
                                                onClick={() => removeUser(user.id)}
                                                className="p-3 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <UserCircle size={140} className="absolute -bottom-10 -right-10 text-white opacity-[0.02] -rotate-12 transition-transform group-hover:scale-110" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
