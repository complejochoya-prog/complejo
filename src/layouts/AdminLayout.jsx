import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Beer, Calculator, Package,
    Users, FileText, Clock, Settings, LogOut, Shield, Menu, X, ChevronRight, ShoppingBag, Monitor, BrainCircuit, CreditCard, Sparkles, Trophy, Lock, QrCode, Zap, Tag, Calendar, Home, Bell, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../core/services/ConfigContext';

const menuGroups = [
    {
        id: 'gestion',
        label: 'Gestión Diaria',
        icon: Zap,
        items: [
            { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: 'bar', label: 'Gestión Bar', icon: Beer },
            { path: 'admin/reservas', label: 'Reservas', icon: Calendar },
            { path: 'caja', label: 'Caja Registradora', icon: Calculator },
        ]
    },
    {
        id: 'administracion',
        label: 'Administración',
        icon: Shield,
        items: [
            { path: 'reportes', label: 'Reportes & Stats', icon: FileText },
            { path: 'finanzas', label: 'Finanzas', icon: CreditCard },
            { path: 'inventario', label: 'Inventario', icon: Package },
            { path: 'empleados', label: 'Empleados', icon: Users },
            { path: 'clientes', label: 'Base Clientes', icon: Users },
        ]
    },
    {
        id: 'configuracion',
        label: 'Configuración',
        icon: Settings,
        items: [
            { path: 'espacios', label: 'Espacios', icon: LayoutDashboard },
            { path: 'horarios', label: 'Horarios & Bloqueos', icon: Clock },
            { path: 'admin/promos', label: 'Ofertas & Promos', icon: Tag },
            { path: 'pantallas', label: 'Pantallas TVs', icon: Monitor },
        ]
    },
    {
        id: 'adicionales',
        label: 'Ecosistema',
        icon: Sparkles,
        items: [
            { path: 'admin/torneos', label: 'Torneos', icon: Trophy },
            { path: 'admin/escuela', label: 'Escuela de Fútbol', icon: Users },
            { path: 'smart-center', label: 'Smart Center', icon: Zap },
            { path: 'analytics-ai', label: 'Motor C-IA', icon: Sparkles },
            { path: 'accesos', label: 'Accesos QR', icon: Lock },
            { path: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
        ]
    }
];

export default function AdminLayout() {
    const { negocioId } = useParams();
    const { config } = useConfig();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Group expansion state
    const [expandedGroups, setExpandedGroups] = useState(() => {
        // Find which group contains the current path to start expanded
        const activeGroup = menuGroups.find(group => 
            group.items.some(item => location.pathname.includes(item.path))
        );
        return activeGroup ? [activeGroup.id] : ['gestion'];
    });

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId) 
                : [...prev, groupId]
        );
    };

    const basePath = `/${negocioId}`;
    const businessName = config?.nombre || negocioId?.toUpperCase() || 'NEGOCIO';

    const handleLogout = () => {
        logout();
        navigate(`${basePath}/login`);
    };

    const NavItem = ({ item, onClick }) => {
        const Icon = item.icon;
        const to = `${basePath}/${item.path}`;
        const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
        
        return (
            <Link
                to={to}
                onClick={onClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                    ${isActive
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 font-bold'
                    }
                `}
            >
                <Icon size={16} className={isActive ? 'text-black' : 'group-hover:text-amber-500 transition-colors'} />
                <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 w-80 lg:w-72">
            {/* Logo Area */}
            <div className="p-8 border-b border-white/5 bg-slate-900/20">
                <Link to={basePath} className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 group-hover:rotate-6 transition-transform relative z-10">
                            <Shield className="text-black" size={24} />
                        </div>
                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-base font-black italic uppercase tracking-tighter leading-none text-white">CENTRAL</h2>
                        <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em] mt-1.5">{businessName}</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto scrollbar-hide">
                {menuGroups.map(group => {
                    const isExpanded = expandedGroups.includes(group.id);
                    const GroupIcon = group.icon;
                    return (
                        <div key={group.id} className="space-y-1">
                            <button 
                                onClick={() => toggleGroup(group.id)}
                                className="w-full flex items-center justify-between px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <GroupIcon size={14} className="opacity-50 group-hover:opacity-100" />
                                    {group.label}
                                </div>
                                <ChevronRight 
                                    size={12} 
                                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-amber-500' : ''}`} 
                                />
                            </button>
                            
                            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                <div className="pl-4 border-l border-white/5 ml-2 space-y-1">
                                    {group.items.map(item => (
                                        <NavItem 
                                            key={item.path} 
                                            item={item} 
                                            onClick={() => {
                                                if (window.innerWidth < 1024) setSidebarOpen(false);
                                            }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-900/10">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[12px] font-black text-amber-500 border border-white/10 shadow-lg">
                            {(user?.name || 'A')[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate text-white">{user?.name || 'Administrador'}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase truncate">{user?.role || 'Full Access'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans flex relative overflow-hidden selection:bg-amber-500 selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-150" />
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed h-full z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between safe-area-top shadow-2xl">
                <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-95 transition-all">
                    <Menu size={22} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                        <Shield size={18} className="text-black" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic text-white flex flex-col leading-none">
                        GIOVANNI <span>ADMIN</span>
                    </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Bell size={20} />
                </div>
            </div>

            {/* Mobile Sidebar Overslide */}
            <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${sidebarOpen ? 'visible' : 'invisible'}`}>
                <div 
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onClick={() => setSidebarOpen(false)} 
                />
                <div className={`absolute left-0 top-0 bottom-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </div>
                {sidebarOpen && (
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all font-black"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Main Content Viewport */}
            <main className="relative z-10 flex-1 lg:ml-72 p-4 lg:p-12 pt-24 lg:pt-12 min-h-screen">
                <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
