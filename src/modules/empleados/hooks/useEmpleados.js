import { useState, useEffect, useCallback, useRef } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';
import {
    subscribeEmpleados,
    fetchEmpleado,
    createEmpleado as serviceCreate,
    updateEmpleado as serviceUpdate,
    deleteEmpleado as serviceDelete,
    fetchStats,
    seedIfEmpty,
} from '../services/empleadosService';

/**
 * useEmpleados — Hook con subscripción en tiempo real via Firestore.
 * Cualquier cambio (desde otra PC, celular, etc.) se refleja al instante.
 */
export default function useEmpleados(filters = {}) {
    const { negocioId } = useConfig();
    const [empleados, setEmpleados] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const filtersKey = JSON.stringify(filters);
    const seeded = useRef(false);

    // ── Real-time subscription ─────────────────────────────
    useEffect(() => {
        if (!negocioId) return;

        setLoading(true);

        // Run seed once if collection is empty
        if (!seeded.current) {
            seeded.current = true;
            seedIfEmpty(negocioId).catch(console.error);
        }

        const unsub = subscribeEmpleados(negocioId, (list) => {
            setEmpleados(list);
            setLoading(false);
        }, filters);

        return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [negocioId, filtersKey]);

    // Stats se recalculan cuando la lista cambia
    useEffect(() => {
        if (!negocioId) return;
        fetchStats(negocioId).then(setStats).catch(console.error);
    }, [negocioId, empleados.length]);

    const refresh = useCallback(() => {
        if (negocioId) fetchStats(negocioId).then(setStats);
    }, [negocioId]);

    const getById = async (id) => fetchEmpleado(negocioId, id);

    const create = async (data) => {
        return serviceCreate(negocioId, data);
        // No need to call refresh — onSnapshot auto-updates
    };

    const update = async (id, data) => {
        return serviceUpdate(negocioId, id, data);
    };

    const remove = async (id) => {
        return serviceDelete(negocioId, id);
    };

    return { empleados, stats, loading, getById, create, update, remove, refresh };
}
