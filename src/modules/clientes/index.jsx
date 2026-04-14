// Módulo clientes
import Home from './components/Home';
import Progress from './components/Progress';
import School from './components/School';
import DailyChallenges from './components/DailyChallenges';
import ChallengeConfirmation from './components/ChallengeConfirmation';
import PlayerBoard from './components/PlayerBoard';
import Membership from './components/Membership';
import PublicGallery from './components/PublicGallery';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import ScorersAndSanctions from './components/ScorersAndSanctions';
import HomeEditor from './components/HomeEditor';
import UIProvider from './services/UIContext';

export const ClientesModule = {
    id: 'clientes',
    name: 'Clientes',
    providers: [UIProvider],
    routes: [
        { path: '/:negocioId?', element: Home, layout: 'client' },
        { path: '/:negocioId/home', element: Home, layout: 'client' },
        { path: '/:negocioId/avances', element: Progress, layout: 'client' },
        { path: '/:negocioId/school', element: School, layout: 'client' },
        { path: '/:negocioId/challenges', element: DailyChallenges, layout: 'client' },
        { path: '/:negocioId/challenge-confirm', element: ChallengeConfirmation, layout: 'client' },
        { path: '/:negocioId/players', element: PlayerBoard, layout: 'client' },
        { path: '/:negocioId/membership', element: Membership, layout: 'client' },
        { path: '/:negocioId/public-gallery', element: PublicGallery, layout: 'client' },
        { path: '/:negocioId/gallery', element: Gallery, layout: 'admin' },
        { path: '/:negocioId/profile', element: Profile, layout: 'admin' },
        { path: '/:negocioId/scorers', element: ScorersAndSanctions, layout: 'admin' },
        { path: '/:negocioId/home-editor', element: HomeEditor, layout: 'admin' },
    ]
};
