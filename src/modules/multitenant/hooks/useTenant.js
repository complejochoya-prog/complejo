import { useState, useEffect } from 'react';
import { 
    fetchTenants, createTenant, updateTenantStatus, 
    updateTenantPlan, updateTenant, fetchGlobalStats 
} from '../services/tenantService';

export function useTenant() {
    const [tenants, setTenants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tenantsData, statsData] = await Promise.all([
                fetchTenants(),
                fetchGlobalStats()
            ]);
            setTenants(tenantsData);
            setStats(statsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTenant = async (data) => {
        setLoading(true);
        try {
            const res = await createTenant(data);
            await loadData();
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'activo' ? 'suspendido' : 'activo';
        try {
            await updateTenantStatus(id, newStatus);
            await loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const changePlan = async (id, newPlan) => {
        try {
            await updateTenantPlan(id, newPlan);
            await loadData();
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateComplex = async (id, data) => {
        try {
            await updateTenant(id, data);
            await loadData();
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        tenants,
        stats,
        loading,
        error,
        addTenant,
        toggleStatus,
        changePlan,
        updateComplex,
        refresh: loadData
    };
}
