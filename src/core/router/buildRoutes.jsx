/**
 * Dynamic Route Builder — Reads all modules and generates React Router routes.
 * Groups routes by layout type for proper wrapping.
 */
import React from 'react';
import { Route } from 'react-router-dom';
import { loadModules } from '../modules/loadModules';
import ModuleGuard from '../guards/ModuleGuard';
import RoleGuard from '../guards/RoleGuard';
import MissingPage from '../../components/MissingPage';

/**
 * Build routes from all active modules.
 * @param {string[]} activeModuleIds - IDs of active modules from config
 * @returns {{ clientRoutes, adminRoutes, appRoutes, noLayoutRoutes }}
 */
export function buildRoutes(activeModuleIds = []) {
    const modules = loadModules(activeModuleIds);

    const clientRoutes = [];
    const adminRoutes = [];
    const appRoutes = [];
    const noLayoutRoutes = [];

    modules.forEach(mod => {
        if (!mod.routes) return;

        mod.routes.forEach(route => {
            const Element = route.element || (() => <MissingPage name={route.path} />);

            const wrappedElement = (
                <ModuleGuard moduleId={mod.id}>
                    {route.roles ? (
                        <RoleGuard allowedRoles={route.roles}>
                            <Element />
                        </RoleGuard>
                    ) : (
                        <Element />
                    )}
                </ModuleGuard>
            );

            const routeEl = (
                <Route
                    key={`${mod.id}-${route.path}`}
                    path={route.path}
                    element={wrappedElement}
                />
            );

            switch (route.layout) {
                case 'client':
                    clientRoutes.push(routeEl);
                    break;
                case 'admin':
                    adminRoutes.push(routeEl);
                    break;
                case 'app':
                    appRoutes.push(routeEl);
                    break;
                default:
                    noLayoutRoutes.push(routeEl);
                    break;
            }
        });
    });

    return { clientRoutes, adminRoutes, appRoutes, noLayoutRoutes };
}
