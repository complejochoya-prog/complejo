// Módulo torneos
import Tournaments from './components/Tournaments';
import TournamentStandings from './components/TournamentStandings';
import TournamentAdmin from './components/TournamentAdmin';

import TorneosProvider from './services/TorneosContext';

export const TorneosModule = {
    id: 'torneos',
    name: 'Torneos',
    providers: [TorneosProvider],
    routes: [
        { path: '/:negocioId/tournaments', element: Tournaments, layout: 'client' },
        { path: '/:negocioId/tournament-standings/:id?', element: TournamentStandings, layout: 'client' },
        { path: '/:negocioId/tournament-admin', element: TournamentAdmin, layout: 'admin' },
    ]
};
