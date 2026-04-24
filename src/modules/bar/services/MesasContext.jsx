import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, doc, setDoc, updateDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useConfig } from '../../../core/services/ConfigContext';

const MesasContext = createContext({});

export function useMesas() {
    return useContext(MesasContext);
}

export default function MesasProvider({ children }) {
    const { negocioId } = useConfig();
    const [mesas, setMesas] = useState([]);
    const [loadingMesas, setLoadingMesas] = useState(true);

    useEffect(() => {
        if (!negocioId) {
            setLoadingMesas(false);
            return;
        }

        setLoadingMesas(true);

        const qMesas = query(collection(db, 'negocios', negocioId, 'mesas'));
        
        const unsubMesas = onSnapshot(qMesas, (snap) => {
            const list = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setMesas(list);
            setLoadingMesas(false);
        }, (err) => {
            console.error("Error subscribiendo a mesas:", err);
            setLoadingMesas(false);
        });

        return () => unsubMesas();
    }, [negocioId]);

    const marcarMesaOcupada = useCallback(async (numeroMesa) => {
        if (!negocioId || !numeroMesa) return;
        try {
            const mesaId = `mesa_${numeroMesa}`;
            const docRef = doc(db, 'negocios', negocioId, 'mesas', mesaId);
            await setDoc(docRef, {
                id: mesaId,
                numero: parseInt(numeroMesa),
                estado: 'ocupada',
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Error al ocupar mesa:", e);
        }
    }, [negocioId]);

    const marcarMesaDisponible = useCallback(async (numeroMesa) => {
        if (!negocioId || !numeroMesa) return;
        try {
            const mesaId = `mesa_${numeroMesa}`;
            const docRef = doc(db, 'negocios', negocioId, 'mesas', mesaId);
            await setDoc(docRef, {
                id: mesaId,
                numero: parseInt(numeroMesa),
                estado: 'disponible',
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error("Error al liberar mesa:", e);
        }
    }, [negocioId]);

    const value = useMemo(() => ({
        mesas,
        loadingMesas,
        marcarMesaOcupada,
        marcarMesaDisponible
    }), [mesas, loadingMesas, marcarMesaOcupada, marcarMesaDisponible]);

    return (
        <MesasContext.Provider value={value}>
            {children}
        </MesasContext.Provider>
    );
}
