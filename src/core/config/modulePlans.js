export const PLANS = {
    FREE: {
        id: 'Free',
        name: 'Plan Gratuito',
        modules: ['reservas', 'clientes', 'espacios', 'horarios'],
        price: 0
    },
    BASIC: {
        id: 'Basic',
        name: 'Plan Inicial',
        modules: ['reservas', 'bar', 'caja', 'marketing', 'clientes', 'espacios', 'horarios', 'promociones'],
        price: 15000
    },
    PRO: {
        id: 'Pro',
        name: 'Plan Profesional',
        modules: ['reservas', 'bar', 'caja', 'marketing', 'torneos', 'inventario', 'empleados', 'clientes', 'analytics', 'espacios', 'horarios', 'promociones'],
        price: 35000
    },
    PREMIUM: {
        id: 'Premium',
        name: 'Plan Master',
        modules: ['reservas', 'bar', 'caja', 'marketing', 'torneos', 'inventario', 'empleados', 'clientes', 'finanzas', 'smart_center', 'analytics_ai', 'access_control', 'analytics', 'espacios', 'horarios', 'promociones', 'pantallas'],
        price: 65000
    }
};

export function getCurrentPlans() {
    // Check for overrides in localStorage (for development/demo)
    try {
        const overrides = localStorage.getItem('saas_dynamic_plans');
        if (overrides) return JSON.parse(overrides);
    } catch (e) {
        console.error('Error reading plans override', e);
    }
    return PLANS;
}

export const ALL_MODULES = [
    { 
        id: 'reservas', 
        name: 'Reservas y Turnos', 
        icon: '📅', 
        category: 'operaciones',
        desc: 'Sistema de turnos online, gestión de señas y recordatorios.',
        price: 0,
        required: true
    },
    { 
        id: 'bar', 
        name: 'Bar y Buffet', 
        icon: '🍺', 
        category: 'operaciones',
        desc: 'Gestión de comandas, menú digital y control de stock de barra.',
        price: 2500 
    },
    { 
        id: 'torneos', 
        name: 'Gestión de Torneos', 
        icon: '🏆', 
        category: 'eventos',
        desc: 'Crea ligas, fixtures automáticos y tablas de posiciones.',
        price: 4500 
    },
    { 
        id: 'caja', 
        name: 'Control de Caja', 
        icon: '💰', 
        category: 'administracion',
        desc: 'Control de ingresos, egresos y arqueo diario de caja.',
        price: 2000 
    },
    { 
        id: 'inventario', 
        name: 'Inventario Pro', 
        icon: '📦', 
        category: 'administracion',
        desc: 'Stock centralizado para bar, cocina y materiales del complejo.',
        price: 3000 
    },
    { 
        id: 'empleados', 
        name: 'Gestión de Staff', 
        icon: 'Users', 
        category: 'administracion',
        desc: 'Control de asistencia, roles y liquidación de comisiones.',
        price: 2500 
    },
    { 
        id: 'clientes', 
        name: 'Clientes Pro', 
        icon: '👥', 
        category: 'administracion',
        desc: 'CRM avanzado, historial de deuda y fidelización de socios.',
        price: 0 
    },
    { 
        id: 'espacios', 
        name: 'Gestión de Espacios', 
        icon: '🏗️', 
        category: 'operaciones',
        desc: 'Configuración de canchas, salones y áreas del establecimiento.',
        price: 0,
        required: true
    },
    { 
        id: 'horarios', 
        name: 'Horarios y Turnos', 
        icon: '⏰', 
        category: 'operaciones',
        desc: 'Configuración de calendarios, feriados y franjas horarias.',
        price: 0,
        required: true
    },
    { 
        id: 'promociones', 
        name: 'Promociones Flash', 
        icon: '🏷️', 
        category: 'ventas',
        desc: 'Generador de descuentos temporales y happy hours.',
        price: 1500 
    },
    { 
        id: 'pantallas', 
        name: 'Pantallas TV', 
        icon: '📺', 
        category: 'automatizacion',
        desc: 'Sistema de broadcasting para mostrar turnos y publicidad en TVs.',
        price: 3500 
    },
    { 
        id: 'finanzas', 
        name: 'Finanzas y Gastos', 
        icon: '📈', 
        category: 'administracion',
        desc: 'Reportes avanzados, facturación y gestión de proveedores.',
        price: 5000 
    },
    { 
        id: 'smart_center', 
        name: 'Smart Center IoT', 
        icon: '⚡', 
        category: 'automatizacion',
        desc: 'Control IoT de luces, aires e integración de domótica.',
        price: 8500 
    },
    { 
        id: 'analytics_ai', 
        name: 'Analytics IA', 
        icon: '🧠', 
        category: 'automatizacion',
        desc: 'IA aplicada para predecir demanda y optimizar precios.',
        price: 6000 
    },
    { 
        id: 'marketing', 
        name: 'Marketing Digital', 
        icon: '📣', 
        category: 'ventas',
        desc: 'Campañas de email y fidelización automática.',
        price: 2000 
    },
    { 
        id: 'access_control', 
        name: 'Control de Accesos', 
        icon: '🔍', 
        category: 'seguridad',
        desc: 'Validación por QR para ingresos al establecimiento.',
        price: 4000 
    }
];

export function getModulesByPlan(planId) {
    const currentPlans = getCurrentPlans();
    const plan = Object.values(currentPlans).find(p => p.id === planId);
    return plan ? plan.modules : currentPlans.FREE.modules;
}
