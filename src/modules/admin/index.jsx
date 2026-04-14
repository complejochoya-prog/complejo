import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import PantallasPage from './pages/PantallasPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PagosPage from './pages/PagosPage';
import AIAnalyticsDashboard from '../analytics_ai/pages/AIAnalyticsDashboard';
import TournamentsDashboard from '../tournaments/pages/TournamentsDashboard';
import TournamentDetail from '../tournaments/pages/TournamentDetail';
import RegisterTeam from '../tournaments/pages/RegisterTeam';

export const AdminModule = {
    id: 'admin',
    name: 'Administración',
    routes: [
        { path: 'login', element: LoginPage, layout: 'none' },
        { path: 'dashboard', element: Dashboard, layout: 'admin', roles: ['admin'] },
        { path: 'pagos', element: PagosPage, layout: 'admin', roles: ['admin'] },
        { path: 'analytics', element: AnalyticsPage, layout: 'admin', roles: ['admin'] },
        { path: 'analytics-ai', element: AIAnalyticsDashboard, layout: 'admin', roles: ['admin'] },
        { path: 'torneos', element: TournamentsDashboard, layout: 'admin', roles: ['admin'] },
        { path: 'torneos/:tournamentId', element: TournamentDetail, layout: 'admin', roles: ['admin'] },
        { path: 'torneos/equipos', element: RegisterTeam, layout: 'admin', roles: ['admin'] },
        { path: 'modulos', element: MarketplacePage, layout: 'admin', roles: ['admin'] },
        { path: 'pantallas', element: PantallasPage, layout: 'admin', roles: ['admin'] },
        // Podemos mapear 'admin' a dashboard también
        { path: 'admin', element: Dashboard, layout: 'admin', roles: ['admin'] },
    ]
};

