/**
 * Custom hooks for the SuperAdmin module.
 */
import { useState, useEffect, useCallback } from 'react';
import {
    fetchNegocios,
    fetchPlanes,
    fetchGlobalStats,
    fetchRecentActivity,
    createNegocio,
    updateNegocio,
    deleteNegocio,
    suspendNegocio,
    activateNegocio,
    createPlan,
    updatePlan,
    deletePlan,
    SYSTEM_MODULES,
    DEFAULT_PLANS
} from '../services/superadminService';

// ─── useNegocios ──────────────────────────────────────
export function useNegocios() {
    const [negocios, setNegocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNegocios();
            setNegocios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const create = async (data) => {
        const result = await createNegocio(data);
        await load();
        return result;
    };

    const update = async (id, data) => {
        await updateNegocio(id, data);
        await load();
    };

    const remove = async (id) => {
        await deleteNegocio(id);
        await load();
    };

    const suspend = async (id) => {
        await suspendNegocio(id);
        await load();
    };

    const activate = async (id) => {
        await activateNegocio(id);
        await load();
    };

    return { negocios, loading, error, reload: load, create, update, remove, suspend, activate };
}

// ─── usePlanes ──────────────────────────────────────
export function usePlanes() {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPlanes();
            setPlanes(data.length > 0 ? data : DEFAULT_PLANS.map((p, i) => ({ ...p, id: `default_${i}` })));
        } catch (err) {
            setPlanes(DEFAULT_PLANS.map((p, i) => ({ ...p, id: `default_${i}` })));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const create = async (data) => {
        await createPlan(data);
        await load();
    };

    const update = async (id, data) => {
        await updatePlan(id, data);
        await load();
    };

    const remove = async (id) => {
        await deletePlan(id);
        await load();
    };

    return { planes, loading, reload: load, create, update, remove };
}

// ─── useGlobalStats ──────────────────────────────────
export function useGlobalStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchGlobalStats();
            setStats(data);
        } catch (err) {
            console.error('Stats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { stats, loading, reload: load };
}

// ─── useRecentActivity ──────────────────────────────
export function useRecentActivity() {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchRecentActivity();
            setActivity(data);
        } catch (err) {
            console.error('Activity error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { activity, loading, reload: load };
}

export { SYSTEM_MODULES };
