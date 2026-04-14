/**
 * Marketing Plugin Stub
 */
export const MarketingPlugin = {
    id: "marketing",
    name: "Marketing & Fidelización",
    routes: [
        {
            path: "/admin/marketing",
            element: () => <div style={{ padding: 40 }}><h1>Módulo de Marketing</h1><p>Funcionalidad instalada vía Marketplace.</p></div>,
            layout: "admin",
            roles: ["admin"]
        }
    ]
};
