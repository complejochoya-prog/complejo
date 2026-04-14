/**
 * SuperAdmin Layout — Dedicated layout for the SaaS master panel.
 * Separate from the business admin layout.
 */
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, CreditCard, Puzzle,
    Activity, BarChart3, LogOut, Shield, ChevronRight,
    Menu, X, Globe, Zap, Bell
} from 'lucide-react';

const navItems = [
    { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/superadmin/complejos', label: 'Complejos', icon: Globe },
    { to: '/superadmin/planes', label: 'Planes', icon: CreditCard },
    { to: '/superadmin/suscripciones', label: 'Suscripciones', icon: Zap },
    { to: '/superadmin/modulos', label: 'Módulos', icon: Puzzle },
    { to: '/superadmin/sistema', label: 'Sistema', icon: Activity },
    { to: '/superadmin/stats', label: 'Estadísticas', icon: BarChart3 },
];

import { useSuperAdminAuth } from '../services/SuperAdminAuthContext';

export default function SuperAdminLayout() {
    const { user, logout } = useSuperAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.to;
        return location.pathname.startsWith(item.to);
    };

    const handleLogout = () => {
        logout();
        navigate('/superadmin/login');
    };

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className={`p-6 ${collapsed ? 'px-4' : 'px-8'}`}>
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <h2 className="text-sm font-black uppercase tracking-tight leading-none text-white">
                                GIOVANNI
                            </h2>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400 mt-1">
                                SaaS Control
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-3' : 'px-5'} space-y-1.5`}>
                {!collapsed && (
                    <p className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">
                        Panel Maestro
                    </p>
                )}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                ${active
                                    ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'
                                }
                                ${collapsed ? 'justify-center px-3' : ''}
                            `}
                            title={collapsed ? item.label : ''}
                        >
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-400 rounded-r-full" />
                            )}
                            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-violet-400' : ''} />
                            {!collapsed && (
                                <>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                    {active && <ChevronRight size={14} className="ml-auto text-violet-400" />}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Status Card */}
            {!collapsed && (
                <div className="p-5 mx-5 mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-violet-400" />
                        <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Sistema Online</p>
                    </div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                        Plataforma SaaS activa. Todos los servicios operativos.
                    </p>
                </div>
            )}

            {/* Logout */}
            <div className={`p-4 border-t border-white/5 ${collapsed ? 'px-3' : 'px-5'}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center px-3' : ''}`}
                >
                    <LogOut size={18} />
                    {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Salir</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-inter">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight">SaaS Control</span>
                </div>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl bg-white/5">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-72 h-full bg-slate-950 border-r border-white/5 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-xl fixed h-full z-40 transition-all duration-500 ${collapsed ? 'w-20' : 'w-72'}`}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-violet-500 transition-all z-50"
                >
                    <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </button>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-500 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'} min-h-screen`}>
                {/* Top Bar */}
                <header className="hidden lg:flex sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
                            <Globe size={12} className="text-violet-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">Panel Maestro SaaS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all relative">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-violet-500 rounded-full border-2 border-slate-950" />
                        </button>
                        <div className="h-6 w-px bg-white/10 mx-1" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{user?.name || 'Super Admin'}</p>
                                <p className="text-[8px] text-violet-400/60 font-bold uppercase tracking-widest leading-none mt-0.5">Plataforma Global</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                                <Shield size={16} className="text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
