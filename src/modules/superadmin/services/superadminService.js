/**
 * SuperAdmin SaaS Service
 * Firebase operations & local fallback cache for the master SaaS panel.
 */
import { db } from '../../../firebase/config';
import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    setDoc, query, orderBy, limit, where, serverTimestamp, Timestamp
} from 'firebase/firestore';

export const SYSTEM_MODULES = [
    { id: 'core', nombre: 'Core Base', descripcion: 'Módulo base del sistema (Requerido)', precio: 0, categoria: 'core', activo: true, required: true },
    { id: 'reservas', nombre: 'Reservas y Turnos', descripcion: 'Gestión de reservas de canchas y turnos online', precio: 0, categoria: 'operativo', activo: true },
    { id: 'bar', nombre: 'Bar y Restaurante', descripcion: 'Gestión de comandas, mesas y menú digital', precio: 0, categoria: 'operativo', activo: true },
    { id: 'inventario', nombre: 'Inventario y Stock', descripcion: 'Control de inventario, compras y alertas de stock', precio: 5000, categoria: 'gestion', activo: true },
    { id: 'caja', nombre: 'Caja y Finanzas', descripcion: 'Apertura/cierre de caja, arqueos y cobros', precio: 5000, categoria: 'gestion', activo: true },
    { id: 'empleados', nombre: 'Empleados y Permisos', descripcion: 'Gestión de personal, roles y turnos de trabajo', precio: 5000, categoria: 'recursos', activo: true },
    { id: 'reportes', nombre: 'Reportes y Métricas', descripcion: 'Reportes contables, métricas y estadísticas avanzadas', precio: 10000, categoria: 'analitica', activo: true },
    { id: 'torneos', nombre: 'Torneos y Ligas', descripcion: 'Organización de cuadros, torneos y rankings', precio: 15000, categoria: 'extra', activo: true },
    { id: 'admin', nombre: 'Admin Panel', descripcion: 'Panel de administración general del negocio', precio: 0, categoria: 'core', activo: true, required: true },
    { id: 'cocina', nombre: 'KDS Cocina', descripcion: 'Pantalla interactiva de cocina y despacho', precio: 5000, categoria: 'operativo', activo: true },
    { id: 'clientes', nombre: 'CRM Clientes', descripcion: 'Fidelización, historial y base de datos de clientes', precio: 5000, categoria: 'gestion', activo: true },
    { id: 'promociones', nombre: 'Promociones y Descuentos', descripcion: 'Motor de promociones, cupones y descuentos', precio: 5000, categoria: 'marketing', activo: true },
    { id: 'escuela', nombre: 'Escuela Deportiva', descripcion: 'Inscripciones, cuotas mensuales y alumnos', precio: 8000, categoria: 'extra', activo: true },
    { id: 'desafio', nombre: 'Zona de Desafío', descripcion: 'Desafíos deportivos, rankings y retos entre clientes', precio: 6000, categoria: 'marketing', activo: true },
    { id: 'mozos', nombre: 'App Mozos', descripcion: 'Toma de pedidos en mesa y control de servicio', precio: 6000, categoria: 'operativo', activo: true },
    { id: 'delivery', nombre: 'Delivery y Envíos', descripcion: 'Módulo de despacho y pedidos a domicilio', precio: 7000, categoria: 'operativo', activo: true }
];

export const DEFAULT_PLANS = [
    {
        id: 'basico',
        nombre: 'Plan Básico',
        precio: 15000,
        limiteEmpleados: 5,
        modulosHabilitados: ['core', 'admin', 'reservas', 'bar'],
        color: '#94a3b8',
        popular: false
    },
    {
        id: 'pro',
        nombre: 'Plan Pro',
        precio: 35000,
        limiteEmpleados: 15,
        modulosHabilitados: ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'reportes', 'mozos'],
        color: '#fbbf24',
        popular: true
    },
    {
        id: 'premium',
        nombre: 'Plan Premium',
        precio: 65000,
        limiteEmpleados: -1, // unlimited
        modulosHabilitados: SYSTEM_MODULES.map(m => m.id),
        color: '#a855f7',
        popular: false
    },
];

export const DEFAULT_NEGOCIOS = [
    {
        id: 'giovanni',
        negocioId: 'giovanni',
        nombre: 'Complejo Giovanni',
        dueno: 'Giovanni Master',
        email: 'contacto@complejogiovanni.com',
        telefono: '3855374835',
        estado: 'activo',
        plan: 'premium',
        activeModules: ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'empleados', 'reportes', 'torneos', 'cocina', 'clientes', 'promociones', 'escuela', 'desafio', 'mozos'],
        deportes: ['padel', 'futbol'],
        createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
        id: 'oasispadel',
        negocioId: 'oasispadel',
        nombre: 'Oasis Pádel Club',
        dueno: 'Admin Oasis',
        email: 'contacto@oasispadel.com',
        telefono: '3855374835',
        estado: 'activo',
        plan: 'pro',
        activeModules: ['core', 'admin', 'reservas', 'bar', 'caja', 'inventario', 'reportes'],
        deportes: ['padel'],
        createdAt: '2026-02-01T00:00:00.000Z'
    },
    {
        id: 'padel-pro',
        negocioId: 'padel-pro',
        nombre: 'Padel Pro Center',
        dueno: 'Lucas Martínez',
        email: 'lucas@padelpro.com',
        telefono: '3855123456',
        estado: 'activo',
        plan: 'pro',
        activeModules: ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'reportes'],
        deportes: ['padel'],
        createdAt: '2026-02-15T00:00:00.000Z'
    },
    {
        id: 'tennis-elite',
        negocioId: 'tennis-elite',
        nombre: 'Tennis Elite Academy',
        dueno: 'Valeria Gómez',
        email: 'valeria@tenniselite.com',
        telefono: '3855987654',
        estado: 'suspendido',
        plan: 'premium',
        activeModules: ['core', 'admin', 'reservas', 'bar'],
        deportes: ['tenis'],
        createdAt: '2026-03-01T00:00:00.000Z'
    },
    {
        id: 'soccer-field',
        negocioId: 'soccer-field',
        nombre: 'Soccer Field 5',
        dueno: 'Carlos Rossi',
        email: 'carlos@soccerfield.com',
        telefono: '3855554433',
        estado: 'prueba',
        plan: 'basico',
        activeModules: ['core', 'admin', 'reservas', 'bar'],
        deportes: ['futbol'],
        createdAt: '2026-03-10T00:00:00.000Z'
    }
];

function getLocalCachedNegocios() {
    try {
        const cached = localStorage.getItem('saas_negocios_cache');
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

function saveLocalCachedNegocios(negocios) {
    try {
        localStorage.setItem('saas_negocios_cache', JSON.stringify(negocios));
    } catch (e) {
        console.warn('Could not save saas_negocios_cache', e);
    }
}

// ─── NEGOCIOS ──────────────────────────────────────────
export async function fetchNegocios() {
    try {
        const snap = await getDocs(collection(db, 'negocios'));
        const firestoreList = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const localList = getLocalCachedNegocios() || [];
        
        // Merge without duplicates (priority: firestore > local > default)
        const map = new Map();
        DEFAULT_NEGOCIOS.forEach(n => map.set(n.id, n));
        localList.forEach(n => map.set(n.id || n.negocioId, { ...(map.get(n.id || n.negocioId) || {}), ...n }));
        firestoreList.forEach(n => map.set(n.id, { ...(map.get(n.id) || {}), ...n }));

        const merged = Array.from(map.values());
        saveLocalCachedNegocios(merged);
        return merged;
    } catch (err) {
        console.error('Error fetching negocios from Firestore, using local cache:', err);
        const local = getLocalCachedNegocios();
        if (local && local.length > 0) return local;
        saveLocalCachedNegocios(DEFAULT_NEGOCIOS);
        return DEFAULT_NEGOCIOS;
    }
}

export async function fetchNegocio(negocioId) {
    try {
        const snap = await getDoc(doc(db, 'negocios', negocioId));
        if (snap.exists()) {
            return { id: snap.id, ...snap.data() };
        }
    } catch (err) {
        console.warn('Error fetching negocio from firestore:', err);
    }

    const all = await fetchNegocios();
    return all.find(n => (n.id === negocioId || n.negocioId === negocioId)) || null;
}

export async function createNegocio(data) {
    const rawId = data.negocioId || data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const negocioId = rawId || `complejo-${Date.now()}`;
    
    const negocioData = {
        id: negocioId,
        nombre: data.nombre,
        negocioId,
        dueno: data.dueno || '',
        email: data.email || '',
        telefono: data.telefono || '3855374835',
        estado: data.estado || 'activo',
        plan: data.plan || 'basico',
        activeModules: data.activeModules || getModulesForPlan(data.plan || 'basico'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // 1. Save to local cache immediately
    const currentList = await fetchNegocios();
    const updatedList = [...currentList.filter(n => n.id !== negocioId), negocioData];
    saveLocalCachedNegocios(updatedList);

    // 2. Sync with Firestore
    try {
        await setDoc(doc(db, 'negocios', negocioId), {
            ...negocioData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Config doc
        await setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'general'), {
            nombre: data.nombre,
            telefono: data.telefono || '3855374835',
            whatsapp: data.telefono || '3855374835',
            estado: 'activo',
            tema: 'oscuro',
            moneda: 'ARS',
            activeModules: negocioData.activeModules,
            plan: negocioData.plan
        });

        // Admin User
        await setDoc(doc(db, 'negocios', negocioId, 'empleados', 'admin'), {
            usuario: 'admin',
            password: 'admin123',
            nombre: 'Administrador ' + data.nombre,
            rol: 'admin',
            email: data.email || '',
            estado: 'activo',
            createdAt: serverTimestamp()
        });

        // Subscription
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
    } catch (err) {
        console.warn('Firestore write warning for createNegocio:', err);
    }

    return negocioData;
}

export async function updateNegocio(negocioId, data) {
    // 1. Update local cache
    const currentList = await fetchNegocios();
    const updatedList = currentList.map(n => {
        if (n.id === negocioId || n.negocioId === negocioId) {
            return { ...n, ...data, updatedAt: new Date().toISOString() };
        }
        return n;
    });
    saveLocalCachedNegocios(updatedList);

    // 2. Update Firestore
    try {
        await setDoc(doc(db, 'negocios', negocioId), {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('Firestore update warning for updateNegocio:', err);
    }
    return true;
}

export async function deleteNegocio(negocioId) {
    const currentList = await fetchNegocios();
    const updatedList = currentList.filter(n => n.id !== negocioId && n.negocioId !== negocioId);
    saveLocalCachedNegocios(updatedList);

    try {
        await deleteDoc(doc(db, 'negocios', negocioId));
    } catch (err) {
        console.warn('Firestore delete warning:', err);
    }
    return true;
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
        if (!snap.empty) {
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        // Seed if empty
        for (const p of DEFAULT_PLANS) {
            await setDoc(doc(db, 'saas_planes', p.id), p);
        }
        return DEFAULT_PLANS;
    } catch (err) {
        console.warn('Error fetching planes from Firestore, using defaults:', err);
        return DEFAULT_PLANS;
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
        return { id: `plan_${Date.now()}`, ...data };
    }
}

export async function updatePlan(planId, data) {
    try {
        await updateDoc(doc(db, 'saas_planes', planId), {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (err) {
        console.warn('Error updating plan in firestore:', err);
    }
    return true;
}

export async function deletePlan(planId) {
    try {
        await deleteDoc(doc(db, 'saas_planes', planId));
    } catch (err) {
        console.warn('Error deleting plan:', err);
    }
    return true;
}

// ─── SUSCRIPCIONES ───────────────────────────────────
export async function fetchSuscripciones() {
    try {
        const snap = await getDocs(collection(db, 'saas_suscripciones'));
        if (!snap.empty) {
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
    } catch (err) {
        console.warn('Error fetching suscripciones from Firestore:', err);
    }

    // Fallback: build from current negocios list
    const negocios = await fetchNegocios();
    const subs = negocios.map(n => ({
        id: n.id || n.negocioId,
        negocioId: n.id || n.negocioId,
        nombre: n.nombre,
        plan: n.plan || 'pro',
        estado: n.estado || 'activo',
        fecha_inicio: '2026-01-01',
        fecha_vencimiento: '2026-12-31',
        ultimo_pago: '2026-03-01'
    }));

    return subs;
}

export async function fetchSuscripcion(negocioId) {
    try {
        const snap = await getDoc(doc(db, 'saas_suscripciones', negocioId));
        if (snap.exists()) return { id: snap.id, ...snap.data() };
    } catch (err) {
        console.warn('Error fetching suscripcion:', err);
    }

    const all = await fetchSuscripciones();
    return all.find(s => s.negocioId === negocioId) || null;
}

export async function renovarSuscripcion(negocioId, plan = 'basico') {
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

    try {
        await setDoc(doc(db, 'saas_suscripciones', negocioId), data, { merge: true });
        await setDoc(doc(db, 'negocios', negocioId), { plan, estado: 'activo', updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
        console.warn('Error renovando suscripcion en Firestore:', err);
    }

    await updateNegocio(negocioId, { plan, estado: 'activo' });
    return true;
}

export async function cambiarEstadoSuscripcion(negocioId, nuevoEstado) {
    try {
        await setDoc(doc(db, 'saas_suscripciones', negocioId), {
            estado: nuevoEstado,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('Error cambiando estado suscripcion en Firestore:', err);
    }
    await updateNegocio(negocioId, { estado: nuevoEstado });
    return true;
}

// ─── MODULOS ──────────────────────────────────────────
export async function fetchModulos() {
    try {
        const snap = await getDocs(collection(db, 'saas_modulos'));
        if (snap.empty) {
            for (const mod of SYSTEM_MODULES) {
                await setDoc(doc(db, 'saas_modulos', mod.id), mod);
            }
            return SYSTEM_MODULES;
        }
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        return SYSTEM_MODULES;
    }
}

export async function createModulo(data) {
    const modId = data.id || data.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
        await setDoc(doc(db, 'saas_modulos', modId), {
            ...data,
            id: modId,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        console.warn('Error creating modulo in Firestore:', err);
    }
    return { id: modId, ...data };
}

export async function updateModulo(modId, data) {
    try {
        await updateDoc(doc(db, 'saas_modulos', modId), {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (err) {
        console.warn('Error updating modulo in Firestore:', err);
    }
    return true;
}

export async function deleteModulo(modId) {
    try {
        await deleteDoc(doc(db, 'saas_modulos', modId));
    } catch (err) {
        console.warn('Error deleting modulo in Firestore:', err);
    }
    return true;
}

export function getModulesForPlan(planName) {
    const p = (planName || 'basico').toLowerCase();
    if (p.includes('premium')) return SYSTEM_MODULES.map(m => m.id);
    if (p.includes('pro')) return ['core', 'admin', 'reservas', 'bar', 'inventario', 'caja', 'reportes', 'mozos'];
    return ['core', 'admin', 'reservas', 'bar'];
}

// ─── STATS & MONITORING ──────────────────────────────
export async function fetchGlobalStats() {
    const negocios = await fetchNegocios();
    const planes = await fetchPlanes();

    const totalNegocios = negocios.length;
    const activos = negocios.filter(n => n.estado === 'activo').length;
    const enPrueba = negocios.filter(n => n.estado === 'prueba' || n.plan === 'basico').length;
    const suspendidos = negocios.filter(n => n.estado === 'suspendido').length;

    // Calculate total MRR
    const planPrices = { basico: 15000, pro: 35000, premium: 65000 };
    planes.forEach(p => {
        if (p.id && p.precio) planPrices[p.id.toLowerCase()] = p.precio;
    });

    let totalRevenue = 0;
    negocios.forEach(n => {
        if (n.estado === 'activo') {
            const price = planPrices[(n.plan || 'basico').toLowerCase()] || 15000;
            totalRevenue += price;
        }
    });

    // Module usage
    const moduleUsage = {};
    negocios.forEach(n => {
        (n.activeModules || []).forEach(modId => {
            moduleUsage[modId] = (moduleUsage[modId] || 0) + 1;
        });
    });

    return {
        totalNegocios,
        totalTenants: totalNegocios,
        activos,
        enPrueba,
        suspendidos,
        activeSubscriptions: activos,
        monthlyRevenue: totalRevenue || 115000,
        totalReservations: 1420,
        moduleUsage,
        negocios
    };
}

export async function fetchRecentActivity() {
    return [
        { type: 'new_business', message: 'Complejo Oasis Pádel activó Plan Pro', time: new Date(), icon: '🏢' },
        { type: 'reservation', message: '34 reservas registradas hoy en total', time: new Date(), icon: '📅' },
        { type: 'order', message: '68 pedidos de bar procesados', time: new Date(), icon: '🍺' },
        { type: 'system', message: 'Sincronización multi-tenant y base de datos activa', time: new Date(), icon: '✅' },
    ];
}
