import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const EmpleadosContext = createContext({});

export function useEmpleados() {
    return useContext(EmpleadosContext);
}

export default function EmpleadosProvider({ children }) {
    const { negocioId } = useConfig();
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        getDocs(collection(db, 'negocios', negocioId, 'usuarios')).then((snapshot) => {
            const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setEmployees(list);
        });
    }, [negocioId]);

    const addEmployee = async (data) => {
        const id = 'emp-' + Date.now();
        const newEmployee = { ...data, id, negocio_id: negocioId };
        setEmployees(prev => [...prev, newEmployee]);
        await setDoc(doc(db, 'negocios', negocioId, 'usuarios', id), newEmployee);
    };

    const updateEmployee = async (id, updates) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        await updateDoc(doc(db, 'negocios', negocioId, 'usuarios', id), updates);
    };

    const removeEmployee = async (id) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
        await deleteDoc(doc(db, 'negocios', negocioId, 'usuarios', id));
    };

    const value = {
        employees,
        addEmployee,
        updateEmployee,
        removeEmployee
    };

    return (
        <EmpleadosContext.Provider value={value}>
            {children}
        </EmpleadosContext.Provider>
    );
}
