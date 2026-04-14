import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc, addDoc, increment, getDoc, getDocs, limit, serverTimestamp, where
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConfig } from '../../core/services/ConfigContext';

/**
 * INVENTARIO CONTEXT (FIRESTORE REALTIME)
 * Handles stock, recipes, and movements for the entire business.
 */
const InventarioContext = createContext({});

export function useInventario() {
    return useContext(InventarioContext);
}

export default function InventarioProvider({ children }) {
    const { negocioId } = useConfig();
    const [kitchenSupplies, setKitchenSupplies] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [supplierOrders, setSupplierOrders] = useState([]);
    const [inventoryMovements, setInventoryMovements] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        // 1. KITCHEN SUPPLIES (Realtime)
        const unsubSupplies = onSnapshot(collection(db, 'negocios', negocioId, 'kitchen_supplies'), (snap) => {
            setKitchenSupplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 2. RECIPES
        const unsubRecipes = onSnapshot(collection(db, 'negocios', negocioId, 'recipes'), (snap) => {
            setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 3. SUPPLIER ORDERS
        const qSupp = query(collection(db, 'negocios', negocioId, 'supplier_orders'), orderBy('timestamp', 'desc'), limit(50));
        const unsubSupp = onSnapshot(qSupp, (snap) => {
            setSupplierOrders(snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate(),
                date: d.data().date?.toDate()
            })));
        });

        // 4. MOVEMENTS (Global stats)
        const qMov = query(collection(db, 'negocios', negocioId, 'inventory_movements'), orderBy('timestamp', 'desc'), limit(100));
        const unsubMov = onSnapshot(qMov, (snap) => {
            setInventoryMovements(snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate()
            })));
        });

        return () => {
            unsubSupplies();
            unsubRecipes();
            unsubSupp();
            unsubMov();
        };
    }, [negocioId]);

    const addKitchenSupply = async (supply) => {
        const id = `sup-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'kitchen_supplies', id), { ...supply, id, negocio_id: negocioId });
    };

    const updateKitchenSupply = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'kitchen_supplies', id), updates);
    };

    const removeKitchenSupply = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'kitchen_supplies', id));
    };

    const addRecipe = async (recipe) => {
        const id = `rec-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'recipes', id), { ...recipe, id, negocio_id: negocioId });
    };

    const updateRecipe = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'recipes', id), updates);
    };

    const removeRecipe = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'recipes', id));
    };

    const addSupplierOrder = async (order) => {
        const id = `supp-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'supplier_orders', id), {
            ...order,
            id,
            negocio_id: negocioId,
            status: 'pendiente',
            timestamp: serverTimestamp(),
            date: new Date(order.date || new Date())
        });
    };

    const updateSupplierOrderStatus = async (id, status) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'supplier_orders', id), { status });
    };

    const value = {
        kitchenSupplies,
        recipes,
        supplierOrders,
        inventoryMovements,
        addKitchenSupply,
        updateKitchenSupply,
        removeKitchenSupply,
        addRecipe,
        updateRecipe,
        removeRecipe,
        addSupplierOrder,
        updateSupplierOrderStatus
    };

    return (
        <InventarioContext.Provider value={value}>
            {children}
        </InventarioContext.Provider>
    );
}
