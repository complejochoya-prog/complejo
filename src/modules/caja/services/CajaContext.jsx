import { db } from '../../../firebase/config';
import { 
    collection, onSnapshot, query, orderBy, where, doc, setDoc, updateDoc, 
    getDocs, getDoc, serverTimestamp, limit, deleteDoc, addDoc 
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConfig } from '../../core/services/ConfigContext';

/**
 * CAJA CONTEXT (FIRESTORE REALTIME)
 * This is the HEART of the business financials, now in Real-Time.
 */
const CajaContext = createContext({});

export function useCaja() {
    return useContext(CajaContext);
}

export default function CajaProvider({ children }) {
    const { negocioId } = useConfig();
    const [currentCaja, setCurrentCaja] = useState(null);
    const [cajaHistory, setCajaHistory] = useState([]);
    const [cajaMovements, setCajaMovements] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        // 1. OPEN CAJA: Real-time listener
        const cajaRef = collection(db, 'negocios', negocioId, 'caja_sesiones');
        const openCajaQuery = query(cajaRef, where('status', '==', 'open'), limit(1));
        
        const unsubscribeCaja = onSnapshot(openCajaQuery, (snapshot) => {
            if (!snapshot.empty) {
                const openCajaDoc = snapshot.docs[0];
                const data = openCajaDoc.data();
                setCurrentCaja({
                    id: openCajaDoc.id,
                    ...data,
                    openedAt: data.openedAt?.toDate() || new Date(),
                    timestamp: data.timestamp?.toDate() || new Date()
                });
            } else {
                setCurrentCaja(null);
            }
        });

        // 2. CAJA HISTORY: Fetch on demand or periodic (Snapshot for now)
        const historyQuery = query(cajaRef, where('status', '==', 'closed'), orderBy('closedAt', 'desc'), limit(20));
        const unsubscribeHistory = onSnapshot(historyQuery, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                openedAt: d.data().openedAt?.toDate(),
                closedAt: d.data().closedAt?.toDate()
            }));
            setCajaHistory(list);
        });

        // 3. MOVEMENTS: Real-time for global stats
        const today = new Date().toISOString().split('T')[0];
        const movementsQuery = query(
            collection(db, 'negocios', negocioId, 'caja_movements'), 
            where('fecha', '==', today),
            orderBy('timestamp', 'desc')
        );
        
        const unsubscribeMovements = onSnapshot(movementsQuery, (snapshot) => {
            const list = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate() || new Date()
            }));
            setCajaMovements(list);
        });

        return () => {
            unsubscribeCaja();
            unsubscribeHistory();
            unsubscribeMovements();
        };
    }, [negocioId]);

    const openCaja = useCallback(async (initialAmount, userId, userName) => {
        const id = `ses-${Date.now()}`;
        const payload = {
            id,
            negocio_id: negocioId,
            status: 'open',
            openedAt: serverTimestamp(),
            openedBy: { id: userId, name: userName },
            initialAmount: Number(initialAmount),
            timestamp: serverTimestamp()
        };
        await setDoc(doc(db, 'negocios', negocioId, 'caja_sesiones', id), payload);
    }, [negocioId]);

    const closeCaja = useCallback(async (cajaId, closingData) => {
        const ref = doc(db, 'negocios', negocioId, 'caja_sesiones', cajaId);
        await updateDoc(ref, {
            status: 'closed',
            closedAt: serverTimestamp(),
            ...closingData
        });
    }, [negocioId]);

    const addMovement = useCallback(async (movementData) => {
        if (!currentCaja) {
            console.error("No active session to add movement");
            return;
        }
        const id = `mov-${Date.now()}`;
        const payload = {
            ...movementData,
            id,
            negocio_id: negocioId,
            cajaId: currentCaja.id,
            timestamp: serverTimestamp(),
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };
        await setDoc(doc(db, 'negocios', negocioId, 'caja_movements', id), payload);
    }, [negocioId, currentCaja]);

    const deleteMovement = useCallback(async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'caja_movements', id));
    }, [negocioId]);

    const value = {
        currentCaja,
        cajaHistory,
        cajaMovements,
        openCaja,
        closeCaja,
        addMovement,
        deleteMovement
    };

    return (
        <CajaContext.Provider value={value}>
            {children}
        </CajaContext.Provider>
    );
}
