import React from 'react';
import MissingPage from '../../components/MissingPage';

const BarPage = () => <MissingPage name="Módulo de Bar" />;
const MenuPage = () => <MissingPage name="Menú Digital" />;
const MozoPage = () => <MissingPage name="App Mozos" />;
const CocinaPage = () => <MissingPage name="Gestión de Cocina" />;

export const BarModule = {
    id: 'bar',
    name: 'Bar & Restaurante',
    routes: [
        { path: 'bar', element: BarPage, layout: 'admin', roles: ['admin'] },
        { path: 'menu', element: MenuPage, layout: 'client' },
        { path: 'mozo', element: MozoPage, layout: 'app' }, // layout 'app' is basically 'none' with header
        { path: 'cocina', element: CocinaPage, layout: 'app' }
    ]
};
