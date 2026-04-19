import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const DesafioContext = createContext({});

export function useDesafio() {
    return useContext(DesafioContext);
}

export default function DesafioProvider({ children }) {
    const { negocioId } = useConfig();
    const [desafios, setDesafios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!negocioId) return;

        const ref = collection(db, 'negocios', negocioId, 'desafios');
        const q = query(ref, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setDesafios(list);
            setLoading(false);
        }, (err) => {
            console.error('Error loading desafios:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [negocioId]);

    /**
     * Publicar un desafío (ofrecerse como jugador o equipo)
     * @param {Object} data - { tipo: 'jugador'|'equipo', nombre, deporte, mensaje, fecha, horaDesde, horaHasta, contacto, cantJugadores? }
     */
    const addDesafio = async (data) => {
        const id = 'des-' + Date.now();
        await setDoc(doc(db, 'negocios', negocioId, 'desafios', id), {
            ...data,
            id,
            negocio_id: negocioId,
            estado: 'disponible', // disponible | cerrado
            createdAt: serverTimestamp()
        });
    };

    const updateDesafio = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'desafios', id), updates);
    };

    const removeDesafio = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'desafios', id));
    };

    const value = {
        desafios,
        loading,
        addDesafio,
        updateDesafio,
        removeDesafio
    };

    return (
        <DesafioContext.Provider value={value}>
            {children}
        </DesafioContext.Provider>
    );
}
