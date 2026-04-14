// Módulo promociones
import AdminPromotions from './components/AdminPromotions';
import AdminCombos from './components/AdminCombos';

export const PromocionesModule = {
    id: 'promociones',
    name: 'Promociones',
    providers: [],
    routes: [
        { path: '/:negocioId/promotions', element: AdminPromotions, layout: 'admin' },
        { path: '/:negocioId/combos', element: AdminCombos, layout: 'admin' },
    ]
};
