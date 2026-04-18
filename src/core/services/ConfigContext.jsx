import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { migrateLocalStorageToFirestore } from './firestoreService';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
    const { negocioId } = useParams();
    const [config, setConfig] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [activeModules, setActiveModules] = useState([]);
    const [lastSync, setLastSync] = useState(Date.now());

    // --- FIREBASE MIGRATION & REALTIME SYNC ---
    useEffect(() => {
        if (negocioId) {
            // 1. Run migration if needed
            migrateLocalStorageToFirestore(negocioId);

            // 2. Setup a global "pulse" for state updates cross-component
            const unsub = onSnapshot(collection(db, 'negocios', negocioId, 'configuracion'), () => {
                setLastSync(Date.now());
            });
            return () => unsub();
        }
    }, [negocioId]);

    const [isExpired, setIsExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [barProducts, setBarProducts] = useState([]);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        if (!negocioId) {
            setLoading(false);
            return;
        }

        const loadBusinessData = async () => {
            setLoading(true);
            try {
                const { ALL_MODULES, getModulesByPlan } = await import('../config/modulePlans');
                
                // 1. Load Config
                const configRef = doc(db, 'negocios', negocioId, 'configuracion', 'general');
                const configSnap = await getDoc(configRef);

                let currentPlan = 'Free';
                let rawActiveModules = [];

                if (configSnap.exists()) {
                    const configData = configSnap.data();
                    setConfig(configData);
                    currentPlan = configData.plan || 'Free';
                    rawActiveModules = configData.activeModules || [];
                } else {
                    // MOCK FALLBACK FOR DEVELOPMENT / DEMONSTRATION
                    const mocks = {
                        'giovanni': { nombre: 'Complejo Giovanni', plan: 'Premium' },
                        'padel-pro': { nombre: 'Padel Pro Center', plan: 'Basic' },
                        'tennis-elite': { nombre: 'Tennis Elite Academy', plan: 'Pro' },
                        'soccer-field': { nombre: 'Soccer Field 5', plan: 'Free' }
                    };

                    if (mocks[negocioId]) {
                        currentPlan = mocks[negocioId].plan;
                        setConfig(mocks[negocioId]);
                    } else {
                        throw new Error("Negocio no encontrado");
                    }
                }

                // Calculate final active modules
                if (negocioId === 'giovanni') {
                    setActiveModules(ALL_MODULES.map(m => m.id));
                } else {
                    const baseModules = getModulesByPlan(currentPlan);
                    const finalModules = [...new Set([...baseModules, ...rawActiveModules])];
                    setActiveModules(finalModules);
                }

                // 2. Load Subscription
                const subRef = doc(db, 'saas_suscripciones', negocioId);
                const subSnap = await getDoc(subRef);

                if (subSnap.exists()) {
                    const subData = subSnap.data();
                    setSubscription(subData);
                    const today = new Date().toISOString().split('T')[0];
                    const expired = subData.estado === 'vencido' || subData.estado === 'suspendido' || (subData.fecha_vencimiento < today);
                    setIsExpired(expired);
                } else {
                    setIsExpired(false);
                }
            } catch (err) {
                console.error("Business data load error:", err);
                if (negocioId === 'giovanni') {
                    setConfig({ nombre: 'Complejo Giovanni', activeModules: ['reservas', 'bar', 'torneos'] });
                    setActiveModules(['reservas', 'bar', 'torneos']);
                    setError(null);
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        loadBusinessData();
    }, [negocioId]);

    const loadOrders = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { getDocs, collection, query, orderBy, limit } = await import('firebase/firestore');
            const q = query(collection(db, 'negocios', negocioId, 'pedidos'), orderBy('timestamp', 'desc'), limit(50));
            const snap = await getDocs(q);
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Error loading orders from DB:", e);
            setOrders([]);
        }
    }, [negocioId]);

    const loadUsers = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { fetchEmpleados } = await import('../../modules/empleados/services/empleadosService');
            const data = await fetchEmpleados(negocioId);
            setUsers(data || []);
        } catch (e) {
            console.error("Error loading employees from DB:", e);
            setUsers([]);
        }
    }, [negocioId]);

    const loadBarProducts = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { fetchBarMenu } = await import('../../modules/bar/services/barService');
            const products = await fetchBarMenu(negocioId);
            setBarProducts(Array.isArray(products) ? products : []);
        } catch (e) {
            console.error("Error loading products:", e);
        }
    }, [negocioId]);

    const loadTables = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { tablasService } = await import('./tablasService');
            const data = await tablasService.getTablas(negocioId);
            
            if (data && data.length > 0) {
                setTables(data.sort((a,b) => a.tableNumber - b.tableNumber));
            } else {
                // Initialize default tables if none exist in DB
                const initial = Array.from({ length: 12 }, (_, i) => ({
                    tableNumber: i + 1,
                    status: 'disponible',
                    id: `table-${i+1}`
                }));
                setTables(initial);
            }
        } catch (e) {
            console.error("Error loading tables from DB:", e);
            setTables([]);
        }
    }, [negocioId]);

    useEffect(() => {
        if (negocioId) {
            loadOrders();
            loadUsers();
            loadTables();
            loadBarProducts();
        }

        // Subscripciones en tiempo real para cambios críticos (Tablas y Empleados)
        const unsubTabs = onSnapshot(collection(db, 'negocios', negocioId, 'tablas'), () => loadTables());
        const unsubEmps = onSnapshot(collection(db, 'negocios', negocioId, 'empleados'), () => loadUsers());

        return () => {
            unsubTabs();
            unsubEmps();
        };
    }, [negocioId, loadOrders, loadUsers, loadTables, loadBarProducts]);

    const addOrder = async (newOrder) => {
        if (!negocioId) return;
        try {
            const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
            await setDoc(doc(db, 'negocios', negocioId, 'pedidos', newOrder.id), {
                ...newOrder,
                timestamp: serverTimestamp()
            });
            loadOrders();
        } catch(e) {
            console.error("Error adding order to DB:", e);
        }
    };

    const updateOrder = async (orderId, updates) => {
        if (!negocioId) return;
        try {
            const { updateDoc, doc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'negocios', negocioId, 'pedidos', orderId), updates);
            loadOrders();
        } catch(e) {
            console.error("Error updating order in DB:", e);
        }
    };

    const updateTable = async (tableNumber, updates) => {
        if (!negocioId) return;
        try {
            const { tablasService } = await import('./tablasService');
            await tablasService.updateTable(negocioId, tableNumber, updates);
            loadTables();
        } catch(e) {
            console.error("Error updating table in DB:", e);
        }
    };

    return (
        <ConfigContext.Provider value={{ 
            negocioId, config, subscription, isExpired, activeModules, 
            loading, error, orders, addOrder, updateOrder, users, barProducts,
            tables, updateTable, lastSync, forceSync: () => setLastSync(Date.now())
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export const useConfig = () => useContext(ConfigContext);
