import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const TorneosContext = createContext({});

export function useTorneos() {
    return useContext(TorneosContext);
}

export default function TorneosProvider({ children }) {
    const { negocioId } = useConfig();
    const [tournaments, setTournaments] = useState([]);
    const [schoolClasses, setSchoolClasses] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        // Tournaments: Real-time
        const tournRef = collection(db, 'negocios', negocioId, 'tournaments');
        const unsubscribeTourn = onSnapshot(tournRef, (snapshot) => {
            const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setTournaments(list);
        });

        // School Classes: Real-time
        const schoolRef = collection(db, 'negocios', negocioId, 'school_classes');
        const unsubscribeSchool = onSnapshot(schoolRef, (snapshot) => {
            const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setSchoolClasses(list);
        });

        return () => {
            unsubscribeTourn();
            unsubscribeSchool();
        };
    }, [negocioId]);

    const addTournament = async (data) => {
        const id = 't-' + Date.now();
        await setDoc(doc(db, 'negocios', negocioId, 'tournaments', id), { ...data, id, negocio_id: negocioId });
    };

    const updateTournament = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'tournaments', id), updates);
    };

    const removeTournament = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'tournaments', id));
    };

    const addSchoolClass = async (data) => {
        const id = 'sc-' + Date.now();
        await setDoc(doc(db, 'negocios', negocioId, 'school_classes', id), { ...data, id, negocio_id: negocioId });
    };

    const updateSchoolClass = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'school_classes', id), updates);
    };

    const removeSchoolClass = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'school_classes', id));
    };

    const value = {
        tournaments,
        schoolClasses,
        addTournament,
        updateTournament,
        removeTournament,
        addSchoolClass,
        updateSchoolClass,
        removeSchoolClass
    };

    return (
        <TorneosContext.Provider value={value}>
            {children}
        </TorneosContext.Provider>
    );
}
