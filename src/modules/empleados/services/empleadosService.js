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

// ── Seed (solo si la colección está vacía) ───────────────
export async function seedIfEmpty(negocioId) {
    if (!negocioId) return;
    const snap = await getDocs(getRef(negocioId));
    if (!snap.empty) return; // Ya tiene datos

    const today = new Date().toISOString().split('T')[0];
    const seed = [
        {
            id: genId(), nombre: 'Carlos', apellido: 'González',
            dni: '34567890', telefono: '1155667788', email: 'carlos@complejo.com',
            rol: 'admin', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2024-01-15', salario: 450000,
            permisos: PERMISOS.map(p => p.id),
            notas: 'Administrador general del complejo', actividad: []
        },
        {
            id: genId(), nombre: 'María', apellido: 'López',
            dni: '38901234', telefono: '1144332211', email: 'maria@complejo.com',
            rol: 'encargado', estado: 'activo', horario: 'tarde',
            fecha_ingreso: '2024-03-01', salario: 380000,
            permisos: ['ver_caja', 'operar_caja', 'ver_reservas', 'gestionar_reservas', 'ver_bar', 'gestionar_bar', 'ver_empleados', 'ver_reportes'],
            notas: 'Encargada turno tarde', actividad: []
        },
        {
            id: 'admin-1', nombre: 'Admin', apellido: 'Prueba',
            dni: '00000000', usuario: 'admin', password: 'admin',
            rol: 'admin', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2024-01-01', salario: 500000,
            permisos: PERMISOS.map(p => p.id), notas: 'Admin de prueba', actividad: []
        },
        {
            id: 'mozo-1', nombre: 'Mozo', apellido: 'Prueba',
            dni: '44332211', usuario: 'mozo1', password: '123',
            rol: 'mozo', estado: 'activo', horario: 'completo',
            fecha_ingreso: '2025-02-01', salario: 280000,
            permisos: [], notas: 'Mozo de prueba', actividad: [], activo: true
        },
        {
            id: 'rider-1', nombre: 'Repartidor', apellido: 'Prueba',
            dni: '45678901', telefono: '1122334466', email: 'repartidor@complejo.com',
            usuario: 'rider', password: '123', rol: 'DELIVERY', estado: 'activo',
            horario: 'completo', fecha_ingreso: '2025-01-01', salario: 250000,
            permisos: [], notas: 'Repartidor de prueba', actividad: []
        },
    ];

    for (const emp of seed) {
        await setDoc(doc(db, 'negocios', negocioId, 'empleados', emp.id), {
            ...emp,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    console.log(`[Empleados] Seed completado para ${negocioId}`);
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
