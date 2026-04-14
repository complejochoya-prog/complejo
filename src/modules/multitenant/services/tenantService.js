// tenantService.js - SaaS Multi-tenant Management
import { db } from '../../../firebase/config';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where,
    serverTimestamp 
} from 'firebase/firestore';

export async function fetchTenants() {
    // In a real app, this would fetch from 'negocios' collection
    // For development, we return mocks if Firebase is empty or for demo
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'giovanni', nombre: 'Complejo Giovanni', plan: 'Pro', estado: 'activo', inscritos: 120, ingresos: 45000 },
                { id: 'padel-pro', nombre: 'Padel Pro Center', plan: 'Basic', estado: 'activo', inscritos: 45, ingresos: 12000 },
                { id: 'tennis-elite', nombre: 'Tennis Elite Academy', plan: 'Premium', estado: 'suspendido', inscritos: 88, ingresos: 0 },
                { id: 'soccer-field', nombre: 'Soccer Field 5', plan: 'Free', estado: 'activo', inscritos: 12, ingresos: 2500 }
            ]);
        }, 500);
    });
}

export async function createTenant(tenantData) {
    const { id, nombre, plan, adminEmail } = tenantData;
    
    // 1. Create the main business document
    const businessRef = doc(db, 'negocios', id);
    await setDoc(businessRef, {
        nombre,
        email: adminEmail,
        plan,
        estado: 'activo',
        createdAt: serverTimestamp(),
        activeModules: ['reservas', 'bar'] // Default modules
    });

    // 2. Create the configuration document
    const configRef = doc(db, 'negocios', id, 'configuracion', 'general');
    await setDoc(configRef, {
        nombre,
        slug: id,
        moneda: 'ARS',
        timezone: 'GMT-3'
    });

    // 3. Create initial subscription
    const subRef = doc(db, 'saas_suscripciones', id);
    await setDoc(subRef, {
        plan,
        estado: 'activo',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '2027-01-01' // Mock expiration
    });

    return { id, success: true };
}

export async function updateTenantStatus(tenantId, newStatus) {
    const businessRef = doc(db, 'negocios', tenantId);
    await updateDoc(businessRef, { estado: newStatus });
    
    // Also update subscription status
    const subRef = doc(db, 'saas_suscripciones', tenantId);
    await updateDoc(subRef, { estado: newStatus });
    
    return { success: true };
}

export async function updateTenant(tenantId, data) {
    const businessRef = doc(db, 'negocios', tenantId);
    
    // Use setDoc with merge: true to support both updates and creates for demo mocks
    await setDoc(businessRef, { 
        ...data, 
        updatedAt: serverTimestamp() 
    }, { merge: true });
    
    // If updating config-critical fields, reflect in subcollection
    if (data.nombre || data.plan || data.activeModules) {
        const configRef = doc(db, 'negocios', tenantId, 'configuracion', 'general');
        await setDoc(configRef, {
            ...(data.nombre && { nombre: data.nombre }),
            ...(data.plan && { plan: data.plan }),
            ...(data.activeModules && { activeModules: data.activeModules }),
            updatedAt: serverTimestamp()
        }, { merge: true });
    }

    // If updating password, update the admin employee doc
    if (data.password) {
        const adminRef = doc(db, 'negocios', tenantId, 'empleados', 'admin');
        await setDoc(adminRef, {
            password: data.password,
            rol: 'admin',
            updatedAt: serverTimestamp()
        }, { merge: true });
    }
    
    return { success: true };
}

export async function updateTenantPlan(tenantId, newPlan) {
    // ... logic handled by updateTenant now, but keeping for compatibility
    return updateTenant(tenantId, { plan: newPlan });
}

export async function fetchGlobalStats() {
    return {
        totalTenants: 4,
        activeSubscriptions: 3,
        monthlyRevenue: 59500,
        totalReservations: 1240
    };
}
