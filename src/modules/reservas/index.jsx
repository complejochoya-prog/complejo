import React from 'react';
import MissingPage from '../../components/MissingPage';

const ReservasPage = () => <MissingPage name="Módulo de Reservas" />;

export const ReservasModule = {
    id: 'reservas',
    name: 'Reservas',
    routes: [
        { path: 'reservas', element: ReservasPage, layout: 'client' }
    ]
};
