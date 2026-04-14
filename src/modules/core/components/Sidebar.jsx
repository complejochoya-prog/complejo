import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Calendar,
    Trophy,
    Utensils,
    BarChart3,
    ShieldAlert,
    Activity,
    UserPlus,
    Users,
    ChefHat,
    Sparkles,
    CreditCard,
    Bell,
    Bike,
    Package,
    Banknote,
    ShoppingCart
} from 'lucide-react';
import { useConfig } from '../services/ConfigContext';
import { usePedidos } from '../../bar/services/PedidosContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../empleados/services/AuthContext';

export default function Sidebar() {
    const { logout, businessInfo } = useConfig();
    const { barProducts } = usePedidos();
    const { currentUser, logoutAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const pathSegments = location.pathname.split('/');
    const negocioId = pathSegments[1] && pathSegments[1] !== 'admin' ? pathSegments[1] : (businessInfo?.slug || 'giovanni');

    const lowStockCount = (barProducts || []).filter(p => p.activar_control_stock && p.stock_actual <= p.stock_minimo).length;

    const sections = [
        {
            title: 'BAR',
            links: [
                { to: '/bar-management', label: 'Gestión de Bar', icon: Utensils, permission: 'pedidos' },
                { to: '/admin/cocina', label: 'Cocina', icon: ChefHat, permission: 'pedidos' },
                { to: '/admin/comandas', label: 'Pantalla Cocina', icon: ChefHat, permission: 'pedidos' },
                { to: '/mozos', label: 'Mozos', icon: Users, permission: 'pedidos' },
                { to: '/delivery-admin', label: 'Delivery', icon: Bike, permission: 'pedidos' },
                { to: '/caja', label: 'Caja', icon: Banknote, permission: 'caja' },
                { to: '/inventory', label: 'Inventario', icon: Package, permission: 'pedidos', badge: lowStockCount > 0 ? lowStockCount : null },
                { to: '/supplier-orders', label: 'Pedidos Proveedor', icon: ShoppingCart, permission: 'pedidos' },
            ]
        },
        {
            title: 'RESERVAS',
            links: [
                { to: '/booking-history', label: 'Reservas Online', icon: Calendar, permission: 'reservas' },
                { to: '/registration-in-person', label: 'Reservas Presenciales', icon: UserPlus, permission: 'reservas' },
                { to: '/turnos', label: 'Turnos Activos', icon: Activity, permission: 'reservas' },
                { to: '/tournament-admin', label: 'Canchas y Torneos', icon: Trophy, permission: 'reservas' },
                { to: '/blocks', label: 'Horarios y Bloqueos', icon: ShieldAlert, permission: 'reservas' },
            ]
        },
        {
            title: 'EMPLEADOS',
            links: [
                { to: '/admin/employees', label: 'Gestión Personal', icon: Users, permission: 'admin' },
            ]
        },
        {
            title: 'CONFIGURACIÓN',
            links: [
                { to: '/home-editor', label: 'Edición Home', icon: Sparkles, permission: 'config' },
                { to: '/settings', label: 'Datos y WhatsApp', icon: Settings, permission: 'config' },
                { to: '/reports', label: 'Reportes Globales', icon: BarChart3, permission: 'reports' },
            ]
        }
    ];

    const userRole = currentUser?.role || localStorage.getItem('userRole') || 'mozo';
    const userPermisos = currentUser?.permisos || (userRole === 'admin' || userRole === 'admin_principal' ? ['pedidos', 'cobrar', 'caja', 'reservas', 'config', 'reports', 'admin'] : []);

    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-slate-950 fixed h-full z-[80] transition-all">
            <div className="p-8">
                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div className="size-10 rounded-xl bg-gold flex items-center justify-center text-slate-950">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <p className="font-black text-[10px] uppercase tracking-tighter text-white">ADMIN MASTER</p>
                        <p className="text-[8px] text-gold/60 font-bold uppercase tracking-widest">{userRole.toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-6 flex flex-col gap-6">
                {sections.map((section, sIdx) => {
                    const filteredLinks = section.links.filter(link => {
                        // Admins see everything
                        if (userRole === 'admin' || userRole === 'admin_principal') return true;

                        // Check specific permissions (mapped from EmployeeManagement availablePermisos)
                        // availablePermisos = 'pedidos', 'cobrar', 'caja', 'reservas'
                        if (link.permission && userPermisos.includes(link.permission)) return true;

                        // Legacy role-based fallbacks
                        if (userRole === 'administrativo' && (section.title === 'BAR' || section.title === 'RESERVAS')) return true;

                        if (userRole === 'cocina' && (link.to.includes('/admin/cocina') || link.to.includes('/admin/comandas'))) return true;
                        if (userRole === 'mozo' && link.to === '/mozos') return true;
                        if (userRole === 'delivery' && link.to === '/delivery-admin') return true;
                        return false;
                    });

                    if (filteredLinks.length === 0) return null;

                    return (
                        <div key={sIdx} className="space-y-2">
                            <p className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">{section.title}</p>
                            {filteredLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={`/${negocioId}${link.to}`}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                            ${location.pathname === `/${negocioId}${link.to}`
                                                ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20'
                                                : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[9px] font-black uppercase tracking-widest italic">{link.label}</span>
                                        {link.badge && (
                                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg shadow-red-500/20">
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* Quick Maintenance Lock */}
            <div className="p-4 mx-6 mb-6 rounded-[24px] bg-red-500/5 border border-red-500/20">
                <h3 className="text-[10px] font-black flex items-center gap-2 mb-3 text-red-500 uppercase tracking-widest italic leading-none">
                    <ShieldAlert size={14} />
                    Bloqueo Manual
                </h3>
                <p className="text-[8px] text-slate-500 mb-4 font-bold uppercase tracking-widest italic leading-relaxed">Cierre preventivo de canchas por lluvia/mantenimiento.</p>
                <div className="space-y-2">
                    <button className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[8px] font-black uppercase tracking-widest transition-all">Fútbol 5 (Cancha 1)</button>
                    <button className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[8px] font-black uppercase tracking-widest transition-all">Piscina Premium</button>
                </div>
            </div>

            <div className="p-6 border-t border-white/5">
                <button 
                    onClick={() => {
                        logoutAdmin();
                        navigate('/admin/login');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-4 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
