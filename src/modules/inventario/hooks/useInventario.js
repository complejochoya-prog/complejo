import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    fetchProductos, fetchProducto, saveProducto, deleteProducto, 
    registrarMovimiento, fetchMovimientos, getInventarioStats 
} from '../services/inventarioService';

export default function useInventario(filters = {}) {
    const { negocioId } = useParams();
    const [productos, setProductos] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [list, dataStats] = await Promise.all([
                fetchProductos(negocioId, filters),
                getInventarioStats(negocioId)
            ]);
            setProductos(list);
            setStats(dataStats);
        } catch (err) {
            console.error('Error loading inventario:', err);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => { load(); }, [load]);

    const getById = async (id) => fetchProducto(negocioId, id);

    const save = async (data) => {
        const res = await saveProducto(negocioId, data);
        if (res.success) await load();
        return res;
    };

    const remove = async (id) => {
        const res = await deleteProducto(negocioId, id);
        if (res.success) await load();
        return res;
    };

    const addStockMovement = async (movData) => {
        const res = await registrarMovimiento(negocioId, movData);
        if (res.success) await load();
        return res;
    };

    const getMovements = async (productoId) => fetchMovimientos(negocioId, productoId);

    return { 
        productos, 
        stats, 
        loading, 
        getById, 
        save, 
        remove, 
        addStockMovement,
        getMovements,
        refresh: load 
    };
}
