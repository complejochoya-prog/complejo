/**
 * Reservas Plugin Stub
 */
export const ReservasPlugin = {
    id: "reservas",
    name: "Sistema de Reservas",
    routes: [
        {
            path: "/admin/reservas",
            element: () => <div style={{ padding: 40 }}><h1>Módulo de Reservas</h1><p>Funcionalidad instalada vía Marketplace.</p></div>,
            layout: "admin",
            roles: ["admin"]
        }
    ]
};
