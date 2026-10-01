import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, doc, setDoc,
    updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const DesafioContext = createContext({});

export function useDesafio() {
    return useContext(DesafioContext);
}

/**
 * Un desafío está vencido si su fecha ya pasó (después de medianoche del día elegido).
 * Si no tiene fecha, nunca vence.
 */
function isExpired(desafio) {
    if (!desafio.fecha) return false;
    // Expira al terminar el día elegido: 23:59:59 de esa fecha
    const expiresAt = new Date(desafio.fecha + 'T23:59:59');
    return expiresAt < new Date();
}

export default function DesafioProvider({ children }) {
    const { negocioId } = useConfig();
    const [desafios, setDesafios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!negocioId) return;

        const ref = collection(db, 'negocios', negocioId, 'desafios');
        const q = query(ref, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const all = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

            // Separar vencidos de activos
            const expired = all.filter(d => isExpired(d));
            const active = all.filter(d => !isExpired(d));

            // Auto-borrar los vencidos de Firestore (silenciosamente)
            if (expired.length > 0) {
                expired.forEach(async (d) => {
                    try {
                        await deleteDoc(doc(db, 'negocios', negocioId, 'desafios', d.id));
                    } catch (e) {
                        console.warn('No se pudo auto-eliminar desafío vencido:', d.id, e);
                    }
                });
            }

            setDesafios(active);
            setLoading(false);
        }, (err) => {
            console.error('Error loading desafios:', err);
            setLoading(false);
        });

        // También revisamos expiración en tiempo real cada minuto
        // (por si el usuario deja la página abierta hasta medianoche)
        const interval = setInterval(() => {
            setDesafios(prev => prev.filter(d => !isExpired(d)));
        }, 60_000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [negocioId]);

    /**
     * Publicar un desafío. `fecha` es 'YYYY-MM-DD' y define cuándo vence.
     */
    const addDesafio = async (data) => {
        const id = 'des-' + Date.now();
        await setDoc(doc(db, 'negocios', negocioId, 'desafios', id), {
            ...data,
            id,
            negocio_id: negocioId,
            estado: 'disponible',
            // Guardamos expiresAt como string ISO para referencia visual
            expiresAt: data.fecha ? data.fecha + 'T23:59:59' : null,
            createdAt: serverTimestamp()
        });
    };

    const updateDesafio = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'desafios', id), updates);
    };

    const removeDesafio = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'desafios', id));
    };

    return (
        <DesafioContext.Provider value={{ desafios, loading, addDesafio, updateDesafio, removeDesafio }}>
            {children}
        </DesafioContext.Provider>
    );
}