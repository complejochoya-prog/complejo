import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/config';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    limit 
} from 'firebase/firestore';
import {
    fetchCajaStatus,
    addMovement as serviceAddMovement,
    deleteMovement as serviceDeleteMovement,
    openCaja as serviceOpenCaja,
    closeCaja as serviceCloseCaja,
    fetchSessionsHistory,
    fetchAllMovements,
    calculateStats,
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

    // 1. Listen to active session
    useEffect(() => {
        if (!negocioId) return;
        const q = query(collection(db, 'negocios', negocioId, 'caja_sesiones'), where('status', '==', 'open'), limit(1));
        return onSnapshot(q, (snap) => {
            const data = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
            setSession(data ? { ...data, isOpen: true } : null);
        });
    }, [negocioId]);

    useEffect(() => {
        if (!negocioId) return;
        const today = new Date().toISOString().split('T')[0];
        const q = query(
            collection(db, 'negocios', negocioId, 'caja_movements'),
            where('fecha', '==', today)
        );

        return onSnapshot(q, (snap) => {
            const movs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort manually in frontend to avoid needing a composite index
            const sortedMovs = movs.sort((a, b) => {
                const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
                return timeB - timeA;
            });
            setMovements(sortedMovs);
            setLoading(false);
        }, (err) => {
            console.error("Movements listener error:", err);
            setLoading(false);
        });
    }, [negocioId]);

    const [processedMovements, setProcessedMovements] = useState([]);

    // 3. Recalculate stats whenever session or movements change
    useEffect(() => {
        const newStats = calculateStats(movements, session);
        setStats(newStats);
        setProcessedMovements(newStats.processedMovements || []);
    }, [movements, session]);

    const [lastClosedSession, setLastClosedSession] = useState(null);

    // 4. History (static & last closed session)
    useEffect(() => {
        if (negocioId) {
            fetchSessionsHistory(negocioId).then(data => {
                setHistory(data);
                if (data && data.length > 0) {
                    setLastClosedSession(data[0]);
                }
            });
        }
    }, [negocioId]);

    const recordMovement = async (data) => {
        return await serviceAddMovement(negocioId, {
            ...data,
            sessionId: session?.id || null
        });
    };

    const removeMovement = async (movementId) => {
        return await serviceDeleteMovement(negocioId, movementId);
    };

    const startSession = async (initialBalance, user) => {
        return await serviceOpenCaja(negocioId, initialBalance, user);
    };

    const endSession = async (closeDetails = {}) => {
        const res = await serviceCloseCaja(negocioId, closeDetails.user || 'Administrador', closeDetails);
        if (res.success) {
            fetchSessionsHistory(negocioId).then(data => {
                setHistory(data);
                if (data && data.length > 0) {
                    setLastClosedSession(data[0]);
                }
            });
        }
        return res;
    };

    const getFilteredMovements = async (filters) => {
        return fetchAllMovements(negocioId, filters);
    };

    const refreshHistory = () => {
        if (negocioId) {
            fetchSessionsHistory(negocioId).then(data => {
                setHistory(data);
                if (data && data.length > 0) {
                    setLastClosedSession(data[0]);
                }
            });
        }
    };

    return {
        session,
        stats,
        movements: processedMovements,
        allMovements: movements,
        history,
        lastClosedSession,
        loading,
        recordMovement,
        removeMovement,
        startSession,
        endSession,
        getFilteredMovements,
        refresh: () => {},
        refreshHistory,
    };
}
