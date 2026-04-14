import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Beer, Calculator, Package,
    Users, FileText, Clock, Settings, LogOut, Shield, Menu, X, ChevronRight, ShoppingBag, Monitor, BrainCircuit, CreditCard, Sparkles, Trophy, Lock, QrCode, Zap, Tag, Calendar, Home, Bell, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../core/services/ConfigContext';

const menuTemplate = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'admin/torneos', label: 'Torneos', icon: Trophy },
    { path: 'finanzas', label: 'Finanzas', icon: CreditCard },
    { path: 'analytics', label: 'Inteligencia', icon: BrainCircuit },
    { path: 'analytics-ai', label: 'Motor C-IA', icon: Sparkles },
    { path: 'accesos', label: 'Accesos QR', icon: Lock },
    { path: 'smart-center', label: 'Smart Center', icon: Zap },
    { path: 'bar', label: 'Gestión Bar', icon: Beer },
    { path: 'caja', label: 'Caja Reg.', icon: Calculator },
    { path: 'inventario', label: 'Inventario', icon: Package },
    { path: 'empleados', label: 'Empleados', icon: Users },
    { path: 'clientes', label: 'Clientes', icon: Users },
    { path: 'espacios', label: 'Espacios', icon: LayoutDashboard },
    { path: 'horarios', label: 'Horarios', icon: Clock },
    { path: 'promos', label: 'Promos', icon: Tag },
    { path: 'reportes', label: 'Reportes', icon: FileText },
    { path: 'admin/reservas', label: 'Reservas', icon: Calendar },
    { path: 'pantallas', label: 'Pantallas TVs', icon: Monitor },
    { path: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export default function AdminLayout() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const basePath = `/${negocioId}`;
    const businessName = config?.nombre || negocioId?.toUpperCase() || 'NEGOCIO';

    const menuItems = menuTemplate.map(item => ({
        ...item,
        to: `${basePath}/${item.path}`,
    }));

    const handleLogout = () => {
        logout();
        navigate(`${basePath}/login`);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-950/95 backdrop-blur-2xl border-r border-white/5 w-72 lg:w-64">
            {/* Logo Area */}
            <div className="p-6 lg:p-8 border-b border-white/5">
                <Link to={basePath} className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                        <Shield className="text-black" size={22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black italic uppercase tracking-tighter leading-none text-white">ADMIN</h2>
                        <p className="text-[8px] text-amber-500 font-black uppercase tracking-[0.2em] mt-1">{businessName}</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 lg:px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                                ${isActive
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon size={18} className={isActive ? 'text-black' : 'group-hover:text-amber-500 transition-colors'} />
                            <span className="text-[10px] font-black uppercase tracking-widest flex-1">{item.label}</span>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 lg:p-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[11px] font-black text-amber-500 border border-white/10">
                        {(user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-tight truncate text-white">{user?.name || 'Admin'}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase truncate">{businessName}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter flex relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 animate-mesh opacity-10" />
                <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed h-full z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Header - Premium Glass */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 px-4 py-3 flex items-center justify-between safe-area-top">
                <button onClick={() => setSidebarOpen(true)} className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-transform">
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Shield size={16} className="text-black" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tighter italic text-white">ADMIN</span>
                </div>
                <button className="relative w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Bell size={18} />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-slate-950" />
                </button>
            </div>

            {/* Mobile Sidebar Modal */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-5 right-5 w-11 h-11 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="relative z-10 flex-1 lg:ml-64 p-4 lg:p-10 pt-20 lg:pt-10 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
