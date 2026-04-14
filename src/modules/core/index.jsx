import Home from './pages/Home';

export const CoreModule = {
    id: 'core',
    name: 'Núcleo del Sistema',
    routes: [
        { path: '', element: Home, layout: 'client' },
        { path: 'home', element: Home, layout: 'client' }
    ]
};
