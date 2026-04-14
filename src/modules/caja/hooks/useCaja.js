import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    fetchCajaStatus,
    addMovement as serviceAddMovement,
    deleteMovement as serviceDeleteMovement,
    openCaja as serviceOpenCaja,
    closeCaja as serviceCloseCaja,
    fetchSessionsHistory,
    fetchAllMovements,
} from '../services/cajaService';

export default function useCaja() {
    const { negocioId } = useParams();
    const [session, setSession] = useState(null);
    const [stats, setStats] = useState({
        totalBalance: 0,
        ingresosHoy: 0,
        egresosHoy: 0,
        gananciaHoy: 0,
        barVentas: 0,
        reservasVentas: 0,
        deliveryVentas: 0,
        porEfectivo: 0,
        porTransferencia: 0,
        porMercadopago: 0,
    });
    const [movements, setMovements] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCaja = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchCajaStatus();
            setSession(data.session);
            setStats(data.stats);
            setMovements(data.movements);
        } catch (error) {
            console.error('Error loading caja:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const data = await fetchSessionsHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }, []);

    useEffect(() => {
        loadCaja();
        loadHistory();
    }, [loadCaja, loadHistory]);

    const recordMovement = async (data) => {
        const res = await serviceAddMovement(data);
        if (res.success) await loadCaja();
        return res;
    };

    const removeMovement = async (movementId) => {
        const res = await serviceDeleteMovement(movementId);
        if (res.success) await loadCaja();
        return res;
    };

    const startSession = async (initialBalance) => {
        const res = await serviceOpenCaja(initialBalance);
        if (res.success) await loadCaja();
        return res;
    };

    const endSession = async () => {
        const res = await serviceCloseCaja();
        if (res.success) {
            await loadCaja();
            await loadHistory();
        }
        return res;
    };

    const getFilteredMovements = async (filters) => {
        return fetchAllMovements(filters);
    };

    return {
        session,
        stats,
        movements,
        history,
        loading,
        recordMovement,
        removeMovement,
        startSession,
        endSession,
        getFilteredMovements,
        refresh: loadCaja,
        refreshHistory: loadHistory,
    };
}
