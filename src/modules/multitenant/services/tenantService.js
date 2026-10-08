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
import {
    fetchNegocios,
    createNegocio,
    updateNegocio,
    fetchGlobalStats as fetchSuperAdminStats
} from '../../superadmin/services/superadminService';

export async function fetchTenants() {
    try {
        const negocios = await fetchNegocios();
        return negocios.map(n => ({
            id: n.id || n.negocioId,
            nombre: n.nombre || n.id,
            plan: n.plan ? (n.plan.charAt(0).toUpperCase() + n.plan.slice(1)) : 'Pro',
            estado: n.estado || 'activo',
            inscritos: n.inscritos || (n.id === 'giovanni' ? 120 : n.id === 'oasispadel' ? 68 : 35),
            ingresos: n.ingresos || (n.plan === 'premium' ? 65000 : n.plan === 'pro' ? 35000 : 15000),
            dueno: n.dueno || 'Admin',
            email: n.email || '',
            telefono: n.telefono || '3855374835',
            activeModules: n.activeModules || []
        }));
    } catch (err) {
        console.error('Error in fetchTenants:', err);
        return [];
    }
}

export async function createTenant(tenantData) {
    const id = tenantData.id || tenantData.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = {
        id,
        negocioId: id,
        nombre: tenantData.nombre,
        plan: (tenantData.plan || 'pro').toLowerCase(),
        email: tenantData.adminEmail || tenantData.email || '',
        telefono: tenantData.telefono || '3855374835',
        estado: 'activo',
        activeModules: tenantData.activeModules || ['reservas', 'bar', 'caja', 'inventario']
    };

    const res = await createNegocio(data);
    return { id, success: true, ...res };
}

export async function updateTenantStatus(tenantId, newStatus) {
    await updateNegocio(tenantId, { estado: newStatus });
    return { success: true };
}

export async function updateTenant(tenantId, data) {
    await updateNegocio(tenantId, data);
    return { success: true };
}

export async function updateTenantPlan(tenantId, newPlan) {
    return updateTenant(tenantId, { plan: (newPlan || 'pro').toLowerCase() });
}

export async function fetchGlobalStats() {
    const stats = await fetchSuperAdminStats();
    return {
        totalTenants: stats.totalNegocios || stats.totalTenants || 5,
        activeSubscriptions: stats.activos || stats.activeSubscriptions || 4,
        monthlyRevenue: stats.monthlyRevenue || 115000,
        totalReservations: stats.totalReservations || 1420
    };
}

