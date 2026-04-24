/**
 * App.jsx — Complejo Giovanni SaaS Platform
 * Multi-tenant routing: /:negocioId/*
 * FASE 7: Internal Apps by Role
 */
import React from 'react';
import { Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider, useConfig } from './core/services/ConfigContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import AppLayout from './layouts/AppLayout';

// Guards
import AdminGuard from './components/AdminGuard';
import RoleGuard from './core/guards/RoleGuard';

// Core guards
import ModuleGuard from './core/guards/ModuleGuard';

// SuperAdmin Module
import { 
    SuperAdminAuthProvider, 
    SuperAdminLayout, 
    SuperAdminGuard 
} from './modules/superadmin';

// Pages (directly imported for stability)
import Home from './modules/core/pages/Home';
import LoginPage from './modules/admin/pages/LoginPage';
import Dashboard from './modules/admin/pages/Dashboard';
import PantallasPage from './modules/admin/pages/PantallasPage';
import AnalyticsPage from './modules/admin/pages/AnalyticsPage';
import PagosPage from './modules/admin/pages/PagosPage';
import ClientesPage from './modules/admin/pages/ClientesPage';
import EspaciosPage from './modules/admin/pages/EspaciosPage';
import AdminPromosPage from './modules/admin/pages/PromosPage';
import PromosPage from './modules/core/pages/PromosPage';
import ReservasPage from './modules/admin/pages/ReservasPage';
import HorariosPage from './modules/admin/pages/HorariosPage';
import EventsPage from './modules/core/pages/EventsPage';
import MenuBoard from './modules/menu/pages/MenuBoard';
import MissingPage from './components/MissingPage';

// AI Analytics (FASE 12)
import AIAnalyticsDashboard from './modules/analytics_ai/pages/AIAnalyticsDashboard';

// Internal Apps (FASE 7)
import BarDashboard from './modules/bar/pages/BarDashboard';
import CocinaApp from './apps/cocina/pages/CocinaApp';
import ClienteApp from './apps/cliente/pages/ClienteApp';
import EmpleadoApp from './apps/empleado/pages/EmpleadoApp';

// TV Apps (FASE 8)
import TVLayout from './apps/tv/layouts/TVLayout';
import TVTurnos from './apps/tv/pages/TVTurnos';
import TVBar from './apps/tv/pages/TVBar';
import TVPromos from './apps/tv/pages/TVPromos';
import TVRanking from './apps/tv/pages/TVRanking';

// PWA App (FASE 10 / 13)
import PWALayout from './apps/pwa/layouts/PWALayout';
import ClientHome from './modules/client_app/pages/ClientHome';
import ClientReservations from './modules/client_app/pages/ClientReservations';
import ClientProfile from './modules/client_app/pages/ClientProfile';
import ReservationSuccess from './modules/client_app/pages/ReservationSuccess';

// Bar Module (FASE 7 - Refined)
import { CartProvider } from './modules/bar/hooks/useCart.jsx';
import BarMenu from './modules/bar/pages/BarMenu';
import CartPage from './modules/bar/pages/CartPage';
import OrderConfirmation from './modules/bar/pages/OrderConfirmation';
import KitchenBarScreen from './modules/bar/pages/KitchenBarScreen';
import KitchenOrderHistory from './modules/bar/pages/KitchenOrderHistory';
import PedidosProvider from './modules/bar/services/PedidosContext';
import MesasProvider from './modules/bar/services/MesasContext';
import ReservasProvider from './modules/reservas/services/ReservasContext';
import BookingFlow from './modules/reservas/components/BookingFlow';


// Employee App (FASE 14)
import ReceptionDashboard from './modules/employee_app/pages/ReceptionDashboard';
import EmployeeBarDashboard from './modules/employee_app/pages/BarDashboard';
import KitchenDashboard from './modules/employee_app/pages/KitchenDashboard';
import EmployeeProfile from './modules/employee_app/pages/EmployeeProfile';

// Tournaments (FASE 15)
import TournamentsDashboard from './modules/tournaments/pages/TournamentsDashboard';
import TournamentDetail from './modules/tournaments/pages/TournamentDetail';
import RegisterTeam from './modules/tournaments/pages/RegisterTeam';
import ClientTournaments from './modules/tournaments/pages/ClientTournaments';

// Desafío Module (Bolsa de Jugadores)
import DesafioProvider from './modules/desafio/services/DesafioContext';
import DesafioPage from './modules/desafio/pages/DesafioPage';

// Access Control (FASE 16)
import AccessDashboard from './modules/access_control/pages/AccessDashboard';
import QRCheckInPage from './modules/access_control/pages/QRCheckInPage';

// Smart Center Module (FASE 18)
import SmartCenterDashboard from './modules/smart_center/pages/SmartCenterDashboard';
import DevicesManager from './modules/smart_center/pages/DevicesManager';

// Finance Module (FASE 19)
import FinanceDashboard from './modules/finance/pages/FinanceDashboard';
import ExpensesManager from './modules/finance/pages/ExpensesManager';
import InvoicesManager from './modules/finance/pages/InvoicesManager';

// Empleados Module
import { EmpleadosDashboard, ListaEmpleados, EmpleadoDetalle } from './modules/empleados';

// Inventario Module
import { InventarioDashboard, InventarioBar, InventarioCocina, InventarioAlmacen } from './modules/inventario';

// Caja Module
import { CajaDashboard, CajaMovimientos, CajaHistorial } from './modules/caja';

// SuperAdmin Pages
import SuperAdminDashboard from './modules/superadmin/pages/SuperAdminDashboard';
import NegociosPage from './modules/superadmin/pages/NegociosPage';
import PlanesPage from './modules/superadmin/pages/PlanesPage';
import ModulosPage from './modules/superadmin/pages/ModulosPage';
import SistemaPage from './modules/superadmin/pages/SistemaPage';
import StatsPage from './modules/superadmin/pages/StatsPage';
import SuscripcionesPage from './modules/superadmin/pages/SuscripcionesPage';
import SuperAdminLogin from './modules/superadmin/pages/SuperAdminLogin';
import SaasAdminDashboard from './modules/saas/pages/SaasAdminDashboard';

// Marketplace Module (FASE 20)
import MarketplaceHome from './modules/marketplace/pages/MarketplaceHome';
import ModuleDetail from './modules/marketplace/pages/ModuleDetail';
import InstalledModules from './modules/marketplace/pages/InstalledModules';
import ApiManagement from './modules/marketplace/pages/ApiManagement';

// Multitenant Module (FASE 17)
import SuperAdminTenants from './modules/multitenant/pages/SuperAdminTenants';
import TenantDetail from './modules/multitenant/pages/TenantDetail';
import CreateTenant from './modules/multitenant/pages/CreateTenant';

// Delivery Module (FASE 21)
import DeliveryRoutes from './modules/delivery/routes/deliveryRoutes';

// Mozos Module (FASE 22)
import MozoRoutes from './modules/mozos/routes/mozoRoutes';

// Escuela Module (New)
import EscuelaHome from './modules/escuela/pages/EscuelaHome';
import EscuelaAdmin from './modules/escuela/pages/EscuelaAdmin';

// Landing page (when no negocioId is specified)
function LandingRedirect() {
    return <Navigate to="/giovanni" replace />;
}

/**
 * BusinessApp — Handles all routes under /:negocioId
 * FASE 7: Role-based internal apps
 */
function BusinessAppWrapper({ children }) {
    const { loading, error, config } = useConfig();
    
    if (loading) {
        return (
            <div key="loading-screen" className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error && !config) return (
        <div key="error-screen" className="min-h-screen bg-rose-950 flex items-center justify-center p-6">
            <div className="max-w-md text-center space-y-4">
                <h1 className="text-2xl font-black text-rose-500 uppercase italic">Error</h1>
                <p className="text-sm text-rose-200/60 uppercase font-bold tracking-widest leading-tight">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-rose-950 rounded-xl font-black uppercase text-xs">Reintentar</button>
            </div>
        </div>
    );

    return <>{children}</>;
}


function RedirectToAppReservas() {
    const { negocioId } = useParams();
    return <Navigate to={`/${negocioId}/app`} replace />;
}

function BusinessApp() {
    return (
        <ConfigProvider>
            <AuthProvider>
                <CartProvider>
                    <PedidosProvider>
                        <MesasProvider>
                        <ReservasProvider>
                        <DesafioProvider>
                            <BusinessAppWrapper>

                        <Routes>
                        {/* ── CLIENT AREA (public) ── */}
                        {/* ── STANDALONE / DIGITAL BOARDS ── */}
                        <Route path="eventos" element={<EventsPage />} />

                        {/* ── CLIENT AREA (public) ── */}
                        <Route element={<ClientLayout />}>
                            <Route index element={<Home />} />
                            <Route path="/" element={<Home />} />
                            <Route path="menu" element={<BarMenu />} />
                            <Route path="reservas" element={<BookingFlow />} />
                            <Route path="app/reservar/:fieldId" element={<BookingFlow />} />
                            <Route path="torneos" element={<ClientTournaments />} />
                            <Route path="escuela" element={<EscuelaHome />} />
                            <Route path="torneos/:tournamentId" element={<TournamentDetail />} />
                            <Route path="desafio" element={<DesafioPage />} />
                            <Route path="jugadores" element={<MissingPage name="Ranking de Jugadores" />} />
                            <Route path="membresia" element={<MissingPage name="Membresía" />} />
                            <Route path="galeria" element={<MissingPage name="Galería" />} />
                            <Route path="perfil" element={<MissingPage name="Mi Perfil" />} />
                            
                            {/* Bar Module Routes (Requested URLs) */}
                            <Route path="carrito" element={<CartPage />} />
                            <Route path="pedido-confirmado" element={<OrderConfirmation />} />
                            <Route path="app/pedido-confirmado" element={<OrderConfirmation />} />
                            <Route path="promos" element={<PromosPage />} />
                        </Route>

                        {/* ── ADMIN AREA (admin + encargado) ── */}
                        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="analytics" element={<ModuleGuard moduleId="analytics"><AnalyticsPage /></ModuleGuard>} />
                            <Route path="analytics-ai" element={<ModuleGuard moduleId="analytics_ai"><AIAnalyticsDashboard /></ModuleGuard>} />
                            <Route path="accesos" element={<ModuleGuard moduleId="access_control"><AccessDashboard /></ModuleGuard>} />
                            <Route path="admin" element={<Dashboard />} />
                            
                            <Route path="admin/reservas" element={<ModuleGuard moduleId="reservas"><ReservasPage /></ModuleGuard>} />
                            <Route path="admin/torneos" element={<ModuleGuard moduleId="torneos"><TournamentsDashboard /></ModuleGuard>} />
                            <Route path="admin/torneos/:tournamentId" element={<ModuleGuard moduleId="torneos"><TournamentDetail /></ModuleGuard>} />
                            <Route path="pantallas" element={<PantallasPage />} />
                            
                            {/* Marketplace Routes (Always accessible) */}
                            <Route path="marketplace" element={<MarketplaceHome />} />
                            <Route path="marketplace/installed" element={<InstalledModules />} />
                            <Route path="marketplace/module/:moduleId" element={<ModuleDetail />} />
                            <Route path="marketplace/api" element={<ApiManagement />} />
                            
                            <Route path="caja" element={<ModuleGuard moduleId="caja"><CajaDashboard /></ModuleGuard>} />
                            <Route path="caja/movimientos" element={<ModuleGuard moduleId="caja"><CajaMovimientos /></ModuleGuard>} />
                            <Route path="caja/historial" element={<ModuleGuard moduleId="caja"><CajaHistorial /></ModuleGuard>} />
                            
                            {/* Inventario Management (Admin) */}
                            <Route path="inventario">
                                <Route index element={<ModuleGuard moduleId="inventario"><InventarioDashboard /></ModuleGuard>} />
                                <Route path="bar" element={<ModuleGuard moduleId="inventario"><InventarioBar /></ModuleGuard>} />
                                <Route path="cocina" element={<ModuleGuard moduleId="inventario"><InventarioCocina /></ModuleGuard>} />
                                <Route path="almacen" element={<ModuleGuard moduleId="inventario"><InventarioAlmacen /></ModuleGuard>} />
                                <Route path="limpieza" element={<ModuleGuard moduleId="inventario"><MissingPage name="Inventario Limpieza" /></ModuleGuard>} />
                                <Route path="otros" element={<ModuleGuard moduleId="inventario"><MissingPage name="Inventario Otros" /></ModuleGuard>} />
                            </Route>
                            
                            {/* Empleados Management (Admin) */}
                            <Route path="empleados" element={<ModuleGuard moduleId="empleados"><EmpleadosDashboard /></ModuleGuard>} />
                            <Route path="empleados/lista" element={<ModuleGuard moduleId="empleados"><ListaEmpleados /></ModuleGuard>} />
                            <Route path="empleados/:empleadoId" element={<ModuleGuard moduleId="empleados"><EmpleadoDetalle /></ModuleGuard>} />
                            
                            <Route path="clientes" element={<ModuleGuard moduleId="clientes"><ClientesPage /></ModuleGuard>} />
                            <Route path="espacios" element={<ModuleGuard moduleId="reservas"><EspaciosPage /></ModuleGuard>} />
                            <Route path="horarios" element={<ModuleGuard moduleId="reservas"><HorariosPage /></ModuleGuard>} />
                            <Route path="admin/promos" element={<ModuleGuard moduleId="marketing"><AdminPromosPage /></ModuleGuard>} />
                            <Route path="promos-admin" element={<Navigate to="admin/promos" replace />} />
                            
                            <Route path="reportes" element={<ModuleGuard moduleId="analytics"><MissingPage name="Reportes" /></ModuleGuard>} />
                            <Route path="editor-home" element={<MissingPage name="Editor de Home" />} />
                            <Route path="turnos" element={<Navigate to="admin/reservas" replace />} />
                            <Route path="reservas" element={<Navigate to="admin/reservas" replace />} />
                            
                            {/* Smart Center / IoT Routes */}
                            <Route path="smart-center" element={<ModuleGuard moduleId="smart_center"><SmartCenterDashboard /></ModuleGuard>} />
                            <Route path="smart-center/devices" element={<ModuleGuard moduleId="smart_center"><DevicesManager /></ModuleGuard>} />
                            
                            {/* Finance / Contabilidad Routes */}
                            <Route path="finanzas" element={<ModuleGuard moduleId="finanzas"><FinanceDashboard /></ModuleGuard>} />
                            <Route path="finanzas/gastos" element={<ModuleGuard moduleId="finanzas"><ExpensesManager /></ModuleGuard>} />
                            <Route path="finanzas/facturas" element={<ModuleGuard moduleId="finanzas"><InvoicesManager /></ModuleGuard>} />
                            <Route path="admin/escuela" element={<ModuleGuard moduleId="escuela"><EscuelaAdmin /></ModuleGuard>} />
                        </Route>

                        {/* ── INTERNAL APPS (FASE 7 — Role-specific) ── */}
                        <Route path="bar" element={
                            <RoleGuard allowedRoles={['admin', 'encargado', 'mozo']}>
                                <BarDashboard />
                            </RoleGuard>
                        } />

                        <Route path="cocina" element={
                            <RoleGuard allowedRoles={['admin', 'encargado', 'cocina']}>
                                <CocinaApp />
                            </RoleGuard>
                        } />

                        <Route path="empleado" element={
                            <RoleGuard allowedRoles={['admin', 'encargado', 'empleado']}>
                                <EmpleadoApp />
                            </RoleGuard>
                        } />

                        {/* ── TV / MONITORES (FASE 8) ── */}
                        <Route path="pantalla" element={<TVLayout />}>
                            <Route path="turnos" element={<TVTurnos />} />
                            <Route path="bar" element={<KitchenBarScreen />} />
                            <Route path="bar/historial" element={<KitchenOrderHistory />} />
                            <Route path="promos" element={<TVPromos />} />
                            <Route path="ranking" element={<TVRanking />} />
                        </Route>

                        {/* ── MOBILE PWA (FASE 10 / 13) ── */}
                        <Route path="app/mozos/*" element={<MozoRoutes />} />
                        <Route path="app" element={<PWALayout />}>
                            <Route index element={<ClientHome />} />
                            <Route path="reserva-confirmada" element={<ReservationSuccess />} />
                            <Route path="menu" element={<BarMenu />} />
                            <Route path="bar" element={<Navigate to="menu" replace />} />
                            <Route path="carrito" element={<CartPage />} />
                            <Route path="torneos" element={<ClientTournaments />} />
                            <Route path="perfil" element={<ClientProfile />} />
                        </Route>
                        
                        {/* Delivery App Routes (Standalone, without Client PWA Layout) */}
                        <Route path="app/delivery/*" element={<DeliveryRoutes />} />
                        <Route path="admin/app/delivery/*" element={<DeliveryRoutes />} />

                        {/* ── EMPLOYEE INTERNAL (FASE 14) ── */}
                        <Route path="staff" element={
                            <RoleGuard allowedRoles={['admin', 'encargado', 'recepcion', 'mozo', 'cocina', 'mantenimiento']}>
                                <Outlet />
                            </RoleGuard>
                        }>
                            <Route index element={<ReceptionDashboard />} />
                            <Route path="dashboard" element={<ReceptionDashboard />} />
                            <Route path="recepcion" element={<ReceptionDashboard />} />
                            <Route path="bar" element={<EmployeeBarDashboard />} />
                            <Route path="cocina" element={<KitchenDashboard />} />
                            <Route path="checkin" element={<QRCheckInPage />} />
                            <Route path="perfil" element={<EmployeeProfile />} />
                        </Route>

                        {/* ── NO LAYOUT (login) ── */}
                        <Route path="login" element={<LoginPage />} />

                        {/* Fallback within business context */}
                        <Route path="*" element={<Navigate to="" replace />} />
                    </Routes>
                            </BusinessAppWrapper>
                        </DesafioProvider>
                        </ReservasProvider>
                        </MesasProvider>
                    </PedidosProvider>

                </CartProvider>
            </AuthProvider>
        </ConfigProvider>
    );
}

/**
 * SuperAdminApp — Handles the SaaS master panel.
 * Independent from business IDs.
 */
function SuperAdminApp() {
    return (
        <SuperAdminAuthProvider>
            <Routes>
                <Route path="login" element={<SuperAdminLogin />} />
                <Route element={<SuperAdminGuard><SuperAdminLayout /></SuperAdminGuard>}>
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="negocios" element={<NegociosPage />} />
                    <Route path="planes" element={<PlanesPage />} />
                    <Route path="modulos" element={<ModulosPage />} />
                    <Route path="sistema" element={<SistemaPage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="suscripciones" element={<SuscripcionesPage />} />
                    
                    {/* Multitenant / SaaS Routes */}
                    <Route path="complejos" element={<SuperAdminTenants />} />
                    <Route path="complejo/:id" element={<TenantDetail />} />
                    <Route path="crear-complejo" element={<CreateTenant />} />
                    
                    {/* SaaS Engine Monetization Dashboard */}
                    <Route path="saas-engine" element={<SaasAdminDashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
        </SuperAdminAuthProvider>
    );
}

export default function App() {
    return (
        <Routes>
            {/* Root → redirect to default business */}
            <Route path="/" element={<LandingRedirect />} />

            {/* SuperAdmin Panel */}
            <Route path="/superadmin/*" element={<SuperAdminApp />} />

            {/* Multi-tenant: all business routes live under /:negocioId/* */}
            <Route path="/:negocioId/*" element={<BusinessApp />} />

            {/* Global fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
