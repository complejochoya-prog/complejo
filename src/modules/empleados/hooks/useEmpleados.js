import { useState, useEffect, useCallback } from 'react';
import {
    fetchEmpleados,
    fetchEmpleado,
    createEmpleado as serviceCreate,
    updateEmpleado as serviceUpdate,
    deleteEmpleado as serviceDelete,
    fetchStats,
} from '../services/empleadosService';

export default function useEmpleados(filters = {}) {
    const [empleados, setEmpleados] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [list, st] = await Promise.all([fetchEmpleados(filters), fetchStats()]);
            setEmpleados(list);
            setStats(st);
        } catch (err) {
            console.error('Error loading empleados:', err);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => { load(); }, [load]);

    const getById = async (id) => fetchEmpleado(id);

    const create = async (data) => {
        const res = await serviceCreate(data);
        if (res.success) await load();
        return res;
    };

    const update = async (id, data) => {
        const res = await serviceUpdate(id, data);
        if (res.success) await load();
        return res;
    };

    const remove = async (id) => {
        const res = await serviceDelete(id);
        if (res.success) await load();
        return res;
    };

    return { empleados, stats, loading, getById, create, update, remove, refresh: load };
}
