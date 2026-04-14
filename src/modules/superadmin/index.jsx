/**
 * SuperAdmin Module — SaaS Master Panel
 * Controls the entire platform: businesses, plans, modules, monitoring.
 */
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NegociosPage from './pages/NegociosPage';
import PlanesPage from './pages/PlanesPage';
import ModulosPage from './pages/ModulosPage';
import SistemaPage from './pages/SistemaPage';
import StatsPage from './pages/StatsPage';
import SuscripcionesPage from './pages/SuscripcionesPage';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminGuard from './components/SuperAdminGuard';
import { SuperAdminAuthProvider } from './services/SuperAdminAuthContext';

export const SuperAdminModule = {
    id: 'superadmin',
    name: 'Super Admin',
    providers: [SuperAdminAuthProvider],
    routes: [
        // Public Auth Route
        { path: '/superadmin/login', element: SuperAdminLogin, layout: 'none' },

        // Protected Master Panel Routes
        { path: '/superadmin', element: () => <SuperAdminGuard><SuperAdminDashboard /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/negocios', element: () => <SuperAdminGuard><NegociosPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/planes', element: () => <SuperAdminGuard><PlanesPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/modulos', element: () => <SuperAdminGuard><ModulosPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/sistema', element: () => <SuperAdminGuard><SistemaPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/suscripciones', element: () => <SuperAdminGuard><SuscripcionesPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
        { path: '/superadmin/stats', element: () => <SuperAdminGuard><StatsPage /></SuperAdminGuard>, layout: 'superadmin', roles: ['superadmin'] },
    ]
};


export { SuperAdminLayout, SuperAdminGuard };
export { SuperAdminAuthProvider, useSuperAdminAuth } from './services/SuperAdminAuthContext';
