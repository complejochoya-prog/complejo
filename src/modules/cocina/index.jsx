// Módulo cocina
import KitchenDisplay from './components/KitchenDisplay';
import Kitchen from './components/Kitchen';

export const CocinaModule = {
    id: 'cocina',
    name: 'Cocina',
    providers: [], // No providers for cocina
    routes: [
        { path: '/:negocioId/admin/comandas', element: KitchenDisplay, layout: 'admin' },
        { path: '/:negocioId/admin/cocina', element: Kitchen, layout: 'admin' },
    ]
};
