/**
 * empleadosService.js — Servicio completo de Empleados
 * ✅ Persistencia en Firestore (tiempo real, multi-dispositivo)
 */

import { db } from '../../../firebase/config';
import {
    collection, doc, setDoc, getDocs, getDoc,
    updateDoc, deleteDoc, onSnapshot, query,
    orderBy, serverTimestamp, where
} from 'firebase/firestore';

// ── Roles & Config ──────────────────────────────────────
export const ROLES = [
    { id: 'admin',         label: 'Administrador',      color: 'amber'  },
    { id: 'encargado',     label: 'Encargado',           color: 'indigo' },
    { id: 'recepcion',     label: 'Recepción',           color: 'emerald'},
    { id: 'mozo',          label: 'Mozo / Barra',        color: 'sky'    },
    { id: 'cocina',        label: 'Cocina',              color: 'orange' },
    { id: 'mantenimiento', label: 'Mantenimiento',       color: 'slate'  },
    { id: 'limpieza',      label: 'Limpieza',            color: 'violet' },
    { id: 'DELIVERY',      label: 'Delivery / Repartidor', color: 'cyan' },
];

export const PERMISOS = [
    { id: 'ver_caja',             label: 'Ver Caja' },
    { id: 'operar_caja',          label: 'Operar Caja' },
    { id: 'ver_reservas',         label: 'Ver Reservas' },
    { id: 'gestionar_reservas',   label: 'Gestionar Reservas' },
    { id: 'ver_bar',              label: 'Ver Pedidos Bar' },
    { id: 'gestionar_bar',        label: 'Gestionar Bar' },
    { id: 'ver_empleados',        label: 'Ver Empleados' },
    { id: 'gestionar_empleados',  label: 'Gestionar Empleados' },
    { id: 'ver_reportes',         label: 'Ver Reportes' },
    { id: 'ver_inventario',       label: 'Ver Inventario' },
    { id: 'gestionar_inventario', label: 'Gestionar Inventario' },
    { id: 'acceso_config',        label: 'Acceso Configuración' },
];

export const HORARIOS = [
    { id: 'manana',   label: 'Mañana (8:00 - 14:00)'   },
    { id: 'tarde',    label: 'Tarde (14:00 - 20:00)'    },
    { id: 'noche',    label: 'Noche (20:00 - 02:00)'    },
    { id: 'completo', label: 'Jornada Completa'          },
    { id: 'rotativo', label: 'Rotativo'                  },
];

export const ESTADOS = [
    { id: 'activo',     label: 'Activo',     color: 'emerald' },
    { id: 'inactivo',   label: 'Inactivo',   color: 'slate'   },
    { id: 'suspendido', label: 'Suspendido', color: 'rose'    },
    { id: 'licencia',   label: 'Licencia',   color: 'amber'   },
];

// ── Helpers ──────────────────────────────────────────────
function getRef(negocioId) {
    return collection(db, 'negocios', negocioId, 'empleados');
}

function genId() {
    return `emp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export const DEFAULT_ROLE_EMPLOYEES = [
    {
        id: 'emp-admin',
        nombre: 'Admin',
        apellido: 'General',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000001',
        email: 'admin@giovanni.com',
        rol: 'admin',
        estado: 'activo',
        horario: 'completo',
        fecha_ingreso: '2024-01-01',
        salario: 500000,
        permisos: PERMISOS.map(p => p.id),
        notas: 'Administrador general (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-encargado',
        nombre: 'Encargado',
        apellido: 'Turno',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000002',
        email: 'encargado@giovanni.com',
        rol: 'encargado',
        estado: 'activo',
        horario: 'tarde',
        fecha_ingreso: '2024-01-01',
        salario: 400000,
        permisos: ['ver_caja', 'operar_caja', 'ver_reservas', 'gestionar_reservas', 'ver_bar', 'gestionar_bar', 'ver_empleados', 'ver_reportes'],
        notas: 'Encargado de turno (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-recepcion',
        nombre: 'Recepción',
        apellido: 'Principal',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000003',
        email: 'recepcion@giovanni.com',
        rol: 'recepcion',
        estado: 'activo',
        horario: 'manana',
        fecha_ingreso: '2024-01-01',
        salario: 320000,
        permisos: ['ver_reservas', 'gestionar_reservas'],
        notas: 'Atención a recepción (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-mozo',
        nombre: 'Mozo',
        apellido: 'Salón',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000004',
        email: 'mozo@giovanni.com',
        rol: 'mozo',
        estado: 'activo',
        horario: 'noche',
        fecha_ingreso: '2024-01-01',
        salario: 300000,
        permisos: ['ver_bar', 'gestionar_bar'],
        notas: 'Atención de mesas y barra (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-cocina',
        nombre: 'Chef',
        apellido: 'Cocina',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000005',
        email: 'cocina@giovanni.com',
        rol: 'cocina',
        estado: 'activo',
        horario: 'rotativo',
        fecha_ingreso: '2024-01-01',
        salario: 350000,
        permisos: ['ver_bar'],
        notas: 'Personal de cocina (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-mantenimiento',
        nombre: 'Técnico',
        apellido: 'Mantenimiento',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000006',
        email: 'mantenimiento@giovanni.com',
        rol: 'mantenimiento',
        estado: 'activo',
        horario: 'rotativo',
        fecha_ingreso: '2024-01-01',
        salario: 320000,
        permisos: [],
        notas: 'Mantenimiento general (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-limpieza',
        nombre: 'Personal',
        apellido: 'Limpieza',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000007',
        email: 'limpieza@giovanni.com',
        rol: 'limpieza',
        estado: 'activo',
        horario: 'manana',
        fecha_ingreso: '2024-01-01',
        salario: 280000,
        permisos: [],
        notas: 'Higiene y maestranza (usuario: admin / pass: admin)',
        actividad: []
    },
    {
        id: 'emp-delivery',
        nombre: 'Repartidor',
        apellido: 'Delivery',
        dni: 'admin',
        usuario: 'admin',
        password: 'admin',
        telefono: '1100000008',
        email: 'delivery@giovanni.com',
        rol: 'DELIVERY',
        estado: 'activo',
        horario: 'noche',
        fecha_ingreso: '2024-01-01',
        salario: 310000,
        permisos: [],
        notas: 'Rider de despacho (usuario: admin / pass: admin)',
        actividad: []
    }
];

export async function resetAndSeedEmpleados(negocioId) {
    if (!negocioId) return;
    const ref = getRef(negocioId);
    const snap = await getDocs(ref);
    for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, 'negocios', negocioId, 'empleados', docSnap.id));
    }

    for (const emp of DEFAULT_ROLE_EMPLOYEES) {
        await setDoc(doc(db, 'negocios', negocioId, 'empleados', emp.id), {
            ...emp,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    console.log(`[Empleados] Reset & Seed completado para ${negocioId}: 8 empleados (uno por rol)`);
}

// ── Seed (solo si la colección está vacía) ───────────────
export async function seedIfEmpty(negocioId) {
    if (!negocioId) return;
    const snap = await getDocs(getRef(negocioId));
    if (!snap.empty) return; // Ya tiene datos

    await resetAndSeedEmpleados(negocioId);
}

// ── CRUD Firestore ───────────────────────────────────────

/**
 * Subscripción en tiempo real. Devuelve la función unsubscribe.
 */
export function subscribeEmpleados(negocioId, callback, filters = {}) {
    if (!negocioId) return () => {};
    let q = query(getRef(negocioId), orderBy('apellido', 'asc'));
    if (filters.estado) {
        q = query(getRef(negocioId), where('estado', '==', filters.estado), orderBy('apellido', 'asc'));
    }
    return onSnapshot(q, (snap) => {
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (filters.rol) list = list.filter(e => e.rol === filters.rol);
        if (filters.buscar) {
            const q2 = filters.buscar.toLowerCase();
            list = list.filter(e =>
                (e.nombre || '').toLowerCase().includes(q2) ||
                (e.apellido || '').toLowerCase().includes(q2) ||
                (e.dni || '').includes(q2) ||
                (e.email || '').toLowerCase().includes(q2) ||
                (e.usuario && e.usuario.toLowerCase().includes(q2))
            );
        }
        callback(list);
    }, (err) => {
        console.error('[Empleados] Firestore error:', err);
        callback([]);
    });
}

export const fetchEmpleados = async (negocioId, filters = {}) => {
    if (!negocioId) return [];
    const snap = await getDocs(getRef(negocioId));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (filters.estado) list = list.filter(e => e.estado === filters.estado);
    if (filters.rol) list = list.filter(e => e.rol === filters.rol);
    if (filters.buscar) {
        const q = filters.buscar.toLowerCase();
        list = list.filter(e =>
            (e.nombre || '').toLowerCase().includes(q) ||
            (e.apellido || '').toLowerCase().includes(q) ||
            (e.dni || '').includes(q)
        );
    }
    return list;
};

export const fetchEmpleado = async (negocioId, id) => {
    if (!negocioId || !id) return null;
    const snap = await getDoc(doc(db, 'negocios', negocioId, 'empleados', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createEmpleado = async (negocioId, data) => {
    if (!negocioId) return { success: false, message: 'negocioId requerido' };
    const id = data.id || genId();
    const nuevo = {
        id,
        ...data,
        salario: Number(data.salario) || 0,
        permisos: data.permisos || [],
        actividad: [],
        notas: data.notas || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'negocios', negocioId, 'empleados', id), nuevo);
    return { success: true, empleado: nuevo };
};

export const updateEmpleado = async (negocioId, id, data) => {
    if (!negocioId || !id) return { success: false };
    const ref = doc(db, 'negocios', negocioId, 'empleados', id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return { success: true };
};

export const deleteEmpleado = async (negocioId, id) => {
    if (!negocioId || !id) return { success: false };
    await deleteDoc(doc(db, 'negocios', negocioId, 'empleados', id));
    return { success: true };
};

// ── Stats ───────────────────────────────────────────────
export const fetchStats = async (negocioId) => {
    if (!negocioId) return {};
    const snap = await getDocs(getRef(negocioId));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
