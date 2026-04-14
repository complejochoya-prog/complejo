/**
 * empleadosService.js — Servicio completo de Empleados
 * Persistencia en localStorage
 */

const STORAGE_KEY = 'complejo_empleados';

// ── Helpers ──────────────────────────────────────────────
function getAll() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
}

function saveAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function genId() {
    return `emp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

// ── Roles & Config ──────────────────────────────────────
export const ROLES = [
    { id: 'admin', label: 'Administrador', color: 'amber' },
    { id: 'encargado', label: 'Encargado', color: 'indigo' },
    { id: 'recepcion', label: 'Recepción', color: 'emerald' },
    { id: 'mozo', label: 'Mozo / Barra', color: 'sky' },
    { id: 'cocina', label: 'Cocina', color: 'orange' },
    { id: 'mantenimiento', label: 'Mantenimiento', color: 'slate' },
    { id: 'limpieza', label: 'Limpieza', color: 'violet' },
    { id: 'DELIVERY', label: 'Delivery / Repartidor', color: 'cyan' },
];

export const PERMISOS = [
    { id: 'ver_caja', label: 'Ver Caja' },
    { id: 'operar_caja', label: 'Operar Caja' },
    { id: 'ver_reservas', label: 'Ver Reservas' },
    { id: 'gestionar_reservas', label: 'Gestionar Reservas' },
    { id: 'ver_bar', label: 'Ver Pedidos Bar' },
    { id: 'gestionar_bar', label: 'Gestionar Bar' },
    { id: 'ver_empleados', label: 'Ver Empleados' },
    { id: 'gestionar_empleados', label: 'Gestionar Empleados' },
    { id: 'ver_reportes', label: 'Ver Reportes' },
    { id: 'ver_inventario', label: 'Ver Inventario' },
    { id: 'gestionar_inventario', label: 'Gestionar Inventario' },
    { id: 'acceso_config', label: 'Acceso Configuración' },
];

export const HORARIOS = [
    { id: 'manana', label: 'Mañana (8:00 - 14:00)' },
    { id: 'tarde', label: 'Tarde (14:00 - 20:00)' },
    { id: 'noche', label: 'Noche (20:00 - 02:00)' },
    { id: 'completo', label: 'Jornada Completa' },
    { id: 'rotativo', label: 'Rotativo' },
];

export const ESTADOS = [
    { id: 'activo', label: 'Activo', color: 'emerald' },
    { id: 'inactivo', label: 'Inactivo', color: 'slate' },
    { id: 'suspendido', label: 'Suspendido', color: 'rose' },
    { id: 'licencia', label: 'Licencia', color: 'amber' },
];

// ── Seed Data ───────────────────────────────────────────
function seedIfEmpty() {
    if (getAll()) return;

    const today = new Date().toISOString().split('T')[0];
    const seed = [
        {
            id: genId(), nombre: 'Carlos', apellido: 'González',
            dni: '34567890', telefono: '1155667788', email: 'carlos@complejo.com',
            rol: 'admin', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2024-01-15', salario: 450000,
            permisos: PERMISOS.map(p => p.id),
            notas: 'Administrador general del complejo',
            actividad: [
                { fecha: today, hora: '09:00', accion: 'Inicio de sesión' },
                { fecha: today, hora: '09:15', accion: 'Abrió caja' },
            ]
        },
        {
            id: genId(), nombre: 'María', apellido: 'López',
            dni: '38901234', telefono: '1144332211', email: 'maria@complejo.com',
            rol: 'encargado', estado: 'activo', horario: 'tarde',
            fecha_ingreso: '2024-03-01', salario: 380000,
            permisos: ['ver_caja', 'operar_caja', 'ver_reservas', 'gestionar_reservas', 'ver_bar', 'gestionar_bar', 'ver_empleados', 'ver_reportes'],
            notas: 'Encargada turno tarde',
            actividad: [
                { fecha: today, hora: '14:00', accion: 'Inicio de sesión' },
            ]
        },
        {
            id: genId(), nombre: 'Lucas', apellido: 'Martínez',
            dni: '40123456', telefono: '1166778899', email: 'lucas@complejo.com',
            rol: 'recepcion', estado: 'activo', horario: 'manana',
            fecha_ingreso: '2024-06-15', salario: 300000,
            permisos: ['ver_reservas', 'gestionar_reservas', 'ver_caja'],
            notas: '', actividad: []
        },
        {
            id: genId(), nombre: 'Sofía', apellido: 'Ramírez',
            dni: '41234567', telefono: '1177889900', email: 'sofia@complejo.com',
            rol: 'mozo', estado: 'activo', horario: 'noche',
            fecha_ingreso: '2024-09-01', salario: 280000,
            permisos: ['ver_bar', 'gestionar_bar', 'ver_caja'],
            notas: 'Turno noche fines de semana', actividad: []
        },
        {
            id: genId(), nombre: 'Diego', apellido: 'Fernández',
            dni: '39876543', telefono: '1133221100', email: 'diego@complejo.com',
            rol: 'cocina', estado: 'activo', horario: 'noche',
            fecha_ingreso: '2024-07-10', salario: 320000,
            permisos: ['ver_bar', 'gestionar_bar'],
            notas: 'Chef principal', actividad: []
        },
        {
            id: genId(), nombre: 'Ana', apellido: 'Torres',
            dni: '42345678', telefono: '1199887766', email: 'ana@complejo.com',
            rol: 'mantenimiento', estado: 'licencia', horario: 'manana',
            fecha_ingreso: '2025-01-20', salario: 260000,
            permisos: ['ver_inventario'],
            notas: 'Licencia por maternidad hasta abril 2026', actividad: []
        },
        {
            id: genId(), nombre: 'Pablo', apellido: 'Sánchez',
            dni: '36789012', telefono: '1122334455', email: 'pablo@complejo.com',
            rol: 'recepcion', estado: 'inactivo', horario: 'tarde',
            fecha_ingreso: '2023-11-10', salario: 0,
            permisos: [],
            notas: 'Dejó de trabajar en febrero 2026', actividad: []
        },
        {
            id: 'mozo-1', nombre: 'Mozo', apellido: 'Prueba',
            dni: '44332211', usuario: 'mozo1', password: '123',
            rol: 'MOZO', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2025-02-01', salario: 280000,
            permisos: [], notas: 'Mozo de prueba', actividad: [],
            activo: true
        },
        {
            id: 'rider-1', nombre: 'Repartidor', apellido: 'Prueba',
            dni: '45678901', telefono: '1122334466', email: 'repartidor@complejo.com',
            usuario: 'rider', password: '123',
            rol: 'DELIVERY', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2025-01-01', salario: 250000,
            permisos: [], notas: 'Repartidor de prueba', actividad: []
        },
        {
            id: 'admin-1', nombre: 'Admin', apellido: 'Prueba',
            dni: '00000000', usuario: 'admin', password: 'admin',
            rol: 'admin', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2024-01-01', salario: 500000,
            permisos: PERMISOS.map(p => p.id),
            notas: 'Admin de prueba', actividad: []
        }
    ];
    saveAll(seed);
}
seedIfEmpty();

// ── CRUD ────────────────────────────────────────────────
export const fetchEmpleados = async (filters = {}) => {
    let list = getAll() || [];

    if (filters.estado) list = list.filter(e => e.estado === filters.estado);
    if (filters.rol) list = list.filter(e => e.rol === filters.rol);
    if (filters.horario) list = list.filter(e => e.horario === filters.horario);
    if (filters.buscar) {
        const q = filters.buscar.toLowerCase();
        list = list.filter(e =>
            e.nombre.toLowerCase().includes(q) ||
            e.apellido.toLowerCase().includes(q) ||
            e.dni.includes(q) ||
            e.email.toLowerCase().includes(q) ||
            (e.usuario && e.usuario.toLowerCase().includes(q))
        );
    }

    return list;
};

export const fetchEmpleado = async (id) => {
    const list = getAll() || [];
    return list.find(e => e.id === id) || null;
};

export const createEmpleado = async (data) => {
    const list = getAll() || [];
    const nuevo = {
        id: genId(),
        ...data,
        salario: Number(data.salario) || 0,
        permisos: data.permisos || [],
        actividad: [],
        notas: data.notas || '',
    };
    list.unshift(nuevo);
    saveAll(list);
    return { success: true, empleado: nuevo };
};

export const updateEmpleado = async (id, data) => {
    const list = getAll() || [];
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return { success: false, message: 'No encontrado' };

    list[idx] = { ...list[idx], ...data, salario: Number(data.salario) || list[idx].salario };
    saveAll(list);
    return { success: true, empleado: list[idx] };
};

export const deleteEmpleado = async (id) => {
    let list = getAll() || [];
    list = list.filter(e => e.id !== id);
    saveAll(list);
    return { success: true };
};

// ── Stats ───────────────────────────────────────────────
export const fetchStats = async () => {
    const list = getAll() || [];
    const activos = list.filter(e => e.estado === 'activo');
    const totalSalarios = activos.reduce((a, b) => a + (b.salario || 0), 0);

    const porRol = {};
    ROLES.forEach(r => { porRol[r.id] = list.filter(e => e.rol === r.id && e.estado === 'activo').length; });

    const porHorario = {};
    HORARIOS.forEach(h => { porHorario[h.id] = activos.filter(e => e.horario === h.id).length; });

    return {
        total: list.length,
        activos: activos.length,
        inactivos: list.filter(e => e.estado === 'inactivo').length,
        licencia: list.filter(e => e.estado === 'licencia').length,
        suspendidos: list.filter(e => e.estado === 'suspendido').length,
        totalSalarios,
        porRol,
        porHorario,
    };
};
