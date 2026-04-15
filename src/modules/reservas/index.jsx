import React from 'react';
import BookingFlow from './components/BookingFlow';

export const ReservasModule = {
    id: 'reservas',
    name: 'Reservas',
    routes: [
        { path: 'reservas', element: <BookingFlow />, layout: 'client' }
    ]
};

