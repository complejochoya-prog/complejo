import React from 'react';
import MissingPage from '../../components/MissingPage';

const ReportesPage = () => <MissingPage name="Reportes" />;

export const ReportesModule = {
    id: 'reportes',
    name: 'Reportes',
    routes: [
        { path: 'reportes', element: ReportesPage, layout: 'admin', roles: ['admin'] }
    ]
};
