/**
 * Plugin Store
 * Simulated database of available plugins for the system.
 * In Phase 9, this will be persisted in a real database.
 */
export const pluginStore = [
    {
        id: "analytics",
        name: "Analytics",
        description: "Panel de métricas avanzadas y estadísticas de uso del sistema.",
        version: "1.0.0",
        installed: true,
        icon: "📊"
    },
    {
        id: "reservas",
        name: "Sistema de Reservas",
        description: "Gestión completa de reservas de mesas, salones y eventos.",
        version: "1.0.0",
        installed: false,
        icon: "📅"
    },
    {
        id: "marketing",
        name: "Marketing & Fidelización",
        description: "Sistema de campañas, newsletters y cupones de descuento.",
        version: "1.0.0",
        installed: false,
        icon: "📢"
    }
];
