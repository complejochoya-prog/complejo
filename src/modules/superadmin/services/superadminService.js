/**
 * SuperAdmin SaaS Service
 * Firebase operations for the master SaaS panel.
 */
import { db } from '../../../firebase/config';
import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    setDoc, query, orderBy, limit, where, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ─── NEGOCIOS ──────────────────────────────────────────
export async function fetchNegocios() {
    try {
        const snap = await getDocs(collection(db, 'negocios'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('Error fetching negocios:', err);
        return [];
    }
}

export async function fetchNegocio(negocioId) {
    try {
        const snap = await getDoc(doc(db, 'negocios', negocioId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
        console.error('Error fetching negocio:', err);
        return null;
    }
}

export async function createNegocio(data) {
    try {
        const negocioId = data.negocioId || data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // 1. Root Business Document
        const negocioData = {
            nombre: data.nombre,
            negocioId,
            dueno: data.dueno || '',
            email: data.email || '',
            telefono: data.telefono || '',
            estado: 'activo',
            plan: data.plan || 'basico',
            activeModules: getModulesForPlan(data.plan || 'basico'),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'negocios', negocioId), negocioData);

        // 2. Initial Configuration (negocios/{id}/configuracion/general)
        await setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'general'), {
            nombre: data.nombre,
            estado: 'activo',
            tema: 'oscuro',
            moneda: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires',
            activeModules: negocioData.activeModules,
            plan: negocioData.plan,
            logo: '',
            colores: {
                primary: '#8b5cf6', // violet-500
                secondary: '#d946ef' // fuchsia-500
            }
        });

        // 3. Initial Admin User (negocios/{id}/empleados/admin)
        await setDoc(doc(db, 'negocios', negocioId, 'empleados', 'admin'), {
            usuario: 'admin',
            password: 'admin123',
            nombre: 'Administrador Inicial',
            rol: 'admin',
            email: data.email || '',
            estado: 'activo',
            createdAt: serverTimestamp()
        });

        // 4. Create Subscription Entry (saas_suscripciones/{negocioId})
        const today = new Date();
        const duration = data.estado === 'prueba' ? 14 : 30;
        const expirationDate = new Date();
        expirationDate.setDate(today.getDate() + duration);

        await setDoc(doc(db, 'saas_suscripciones', negocioId), {
            negocioId,
            plan: negocioData.plan,
            estado: data.estado || 'activo',
            fecha_inicio: today.toISOString().split('T')[0],
            fecha_vencimiento: expirationDate.toISOString().split('T')[0],
            ultimo_pago: today.toISOString().split('T')[0],
            updatedAt: serverTimestamp()
        });

        // 5. Create Placeholders for key modules to initialize collections
        const placeholders = ['reservas', 'pedidos', 'inventario', 'caja'];
        for (const coll of placeholders) {
            await setDoc(doc(db, 'negocios', negocioId, coll, '_init'), {
                initialized: true,
                createdAt: serverTimestamp()
            });
        }

        return { id: negocioId, ...negocioData };
    } catch (err) {
        console.error('Error creating negocio:', err);
        throw err;
    }
}

export async function updateNegocio(negocioId, data) {
    try {
        await updateDoc(doc(db, 'negocios', negocioId), {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (err) {
        console.error('Error updating negocio:', err);
        throw err;
    }
}

export async function deleteNegocio(negocioId) {
    try {
        await deleteDoc(doc(db, 'negocios', negocioId));
        return true;
    } catch (err) {
        console.error('Error deleting negocio:', err);
        throw err;
    }
}

export async function suspendNegocio(negocioId) {
    return updateNegocio(negocioId, { estado: 'suspendido' });
}

export async function activateNegocio(negocioId) {
    return updateNegocio(negocioId, { estado: 'activo' });
}

// ─── PLANES ──────────────────────────────────────────
export async function fetchPlanes() {
    try {
        const snap = await getDocs(collection(db, 'saas_planes'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('Error fetching planes:', err);
        return [];
    }
}

export async function createPlan(data) {
    try {
        const ref = await addDoc(collection(db, 'saas_planes'), {
            ...data,
            createdAt: serverTimestamp()
        });
        return { id: ref.id, ...data };
    } catch (err) {
        console.error('Error creating plan:', err);
        throw err;
    }
}

export async function updatePlan(planId, data) {
    try {
        await updateDoc(doc(db, 'saas_planes', planId), {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (err) {
        console.error('Error updating plan:', err);
        throw err;
    }
}

export async function deletePlan(planId) {
    try {
        await deleteDoc(doc(db, 'saas_planes', planId));
        return true;
    } catch (err) {
        console.error('Error deleting plan:', err);
        throw err;
    }
}

// ─── SUSCRIPCIONES ───────────────────────────────────
export async function fetchSuscripciones() {
    try {
        const snap = await getDocs(collection(db, 'saas_suscripciones'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('Error fetching suscripciones:', err);
        return [];
    }
}

export async function fetchSuscripcion(negocioId) {
    try {
        const snap = await getDoc(doc(db, 'saas_suscripciones', negocioId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
        console.error('Error fetching suscripcion:', err);
        return null;
    }
}

export async function renovarSuscripcion(negocioId, plan = 'basico') {
    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        const data = {
            estado: 'activo',
            plan,
            fecha_inicio: today.toISOString().split('T')[0],
            fecha_vencimiento: nextMonth.toISOString().split('T')[0],
            ultimo_pago: today.toISOString().split('T')[0],
            updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'saas_suscripciones', negocioId), data);

        // Also update the business doc to reflect plan change if necessary
        await updateDoc(doc(db, 'negocios', negocioId), { plan, updatedAt: serverTimestamp() });
        
        return true;
    } catch (err) {
        console.error('Error renovando suscripcion:', err);
        throw err;
    }
}

export async function cambiarEstadoSuscripcion(negocioId, nuevoEstado) {
    try {
        await updateDoc(doc(db, 'saas_suscripciones', negocioId), {
            estado: nuevoEstado,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (err) {
        console.error('Error cambiando estado suscripcion:', err);
        throw err;
    }
}

// ─── MODULOS ──────────────────────────────────────────
export const SYSTEM_MODULES = [
    { id: 'core', nombre: 'Core', descripcion: 'Módulo base del sistema (Requerido)', precio: 0, categoria: 'core', activo: true, required: true },
    { id: 'reservas', nombre: 'Reservas', descripcion: 'Gestión de reservas de canchas', precio: 0, categoria: 'operativo', activo: true },
    { id: 'bar', nombre: 'Bar', descripcion: 'Gestión de bar y menú digital', precio: 0, categoria: 'operativo', activo: true },
    { id: 'inventario', nombre: 'Inventario', descripcion: 'Control de inventario y stock', precio: 5, categoria: 'gestion', activo: true },
    { id: 'caja', nombre: 'Caja', descripcion: 'Caja registradora y cobros', precio: 5, categoria: 'gestion', activo: true },
    { id: 'empleados', nombre: 'Empleados', descripcion: 'Gestión de personal y turnos', precio: 5, categoria: 'recursos', activo: true },
    { id: 'reportes', nombre: 'Reportes', descripcion: 'Reportes y estadísticas avanzadas', precio: 10, categoria: 'analitica', activo: true },
    { id: 'torneos', nombre: 'Torneos', descripcion: 'Organización de torneos y ligas', precio: 15, categoria: 'extra', activo: true },
    { id: 'admin', nombre: 'Admin', descripcion: 'Panel de administración general', precio: 0, categoria: 'core', activo: true, required: true },
    { id: 'cocina', nombre: 'Cocina', descripcion: 'Pantalla interactiva de cocina', precio: 5, categoria: 'operativo', activo: true },
    { id: 'clientes', nombre: 'Clientes', descripcion: 'Gestión CRM de clientes', precio: 5, categoria: 'gestion', activo: true },
    { id: 'promociones', nombre: 'Promociones', descripcion: 'Motor de descuentos y promociones', precio: 5, categoria: 'marketing', activo: true },
];

export async function fetchModulos() {
    try {
        const snap = await getDocs(collection(db, 'saas_modulos'));
        if (snap.empty) {
            // Seed initial modules
            const modules = [];
            for (const mod of SYSTEM_MODULES) {
                await setDoc(doc(db, 'saas_modulos', mod.id), mod);
                modules.push(mod);
            }
            return modules;
        }
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('Error fetching modulos:', err);
        return SYSTEM_MODULES; // fallback
    }
}

export async function createModulo(data) {
    try {
        const modId = data.id || data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const docRef = doc(db, 'saas_modulos', modId);
        await setDoc(docRef, {
            ...data,
            id: modId,
            createdAt: serverTimestamp()
        });
        return { id: modId, ...data };
    } catch (err) {
        console.error('Error creating modulo:', err);
        throw err;
    }
}

export async function updateModulo(modId, data) {
    try {
        await updateDoc(doc(db, 'saas_modulos', modId), {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (err) {
        console.error('Error updating modulo:', err);
        throw err;
    }
}

export async function deleteModulo(modId) {
    try {
        await deleteDoc(doc(db, 'saas_modulos', modId));
        return true;
    } catch (err) {
        console.error('Error deleting modulo:', err);
        throw err;
    }
}

export function getModulesForPlan(planName) {
    const planMap = {
        basico: ['core', 'admin', 'reservas', 'bar'],
        pro: ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'reportes'],
        premium: SYSTEM_MODULES.map(m => m.id),
    };
    return planMap[planName] || planMap.basico;
}

// ─── DEFAULT PLANS ──────────────────────────────────────
export const DEFAULT_PLANS = [
    {
        nombre: 'Plan Básico',
        precio: 15000,
        limiteEmpleados: 5,
        modulosHabilitados: ['core', 'admin', 'reservas', 'bar'],
        color: '#94a3b8',
        popular: false
    },
    {
        nombre: 'Plan Pro',
        precio: 35000,
        limiteEmpleados: 15,
        modulosHabilitados: ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'reportes'],
        color: '#fbbf24',
        popular: true
    },
    {
        nombre: 'Plan Premium',
        precio: 65000,
        limiteEmpleados: -1, // unlimited
        modulosHabilitados: SYSTEM_MODULES.map(m => m.id),
        color: '#a855f7',
        popular: false
    },
];

// ─── STATS & MONITORING ──────────────────────────────
export async function fetchGlobalStats() {
    try {
        const negociosSnap = await getDocs(collection(db, 'negocios'));
        const negocios = negociosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const totalNegocios = negocios.length;
        const activos = negocios.filter(n => n.estado === 'activo').length;
        const enPrueba = negocios.filter(n => n.plan === 'basico' || n.estado === 'prueba').length;
        const suspendidos = negocios.filter(n => n.estado === 'suspendido').length;

        // Count module usage
        const moduleUsage = {};
        negocios.forEach(n => {
            (n.activeModules || []).forEach(modId => {
                moduleUsage[modId] = (moduleUsage[modId] || 0) + 1;
            });
        });

        return {
            totalNegocios,
            activos,
            enPrueba,
            suspendidos,
            moduleUsage,
            negocios
        };
    } catch (err) {
        console.error('Error fetching global stats:', err);
        return {
            totalNegocios: 0,
            activos: 0,
            enPrueba: 0,
            suspendidos: 0,
            moduleUsage: {},
            negocios: []
        };
    }
}

export async function fetchRecentActivity() {
    // Simulated activity - in production, aggregate from all businesses
    return [
        { type: 'new_business', message: 'Nuevo negocio registrado', time: new Date(), icon: '🏢' },
        { type: 'reservation', message: '15 reservas hoy en total', time: new Date(), icon: '📅' },
        { type: 'order', message: '42 pedidos procesados', time: new Date(), icon: '🍺' },
        { type: 'system', message: 'Sistema operando normalmente', time: new Date(), icon: '✅' },
    ];
}
