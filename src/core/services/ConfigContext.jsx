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

    const loadOrders = useCallback(() => {
        try {
            const data = JSON.parse(localStorage.getItem(`${negocioId}_orders`)) || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            setOrders([]);
        }
    }, [negocioId]);

    const loadUsers = useCallback(async () => {
        try {
            const key = `${negocioId}_empleados`;
            let data = JSON.parse(localStorage.getItem(key));
            
            if (!data || data.length === 0) {
                try {
                    const configRef = doc(db, 'negocios', negocioId);
                    const configSnap = await getDoc(configRef);
                    
                    if (configSnap.exists()) {
                        const businessData = configSnap.data();
                        const adminUser = {
                            id: 'admin',
                            nombre: businessData.dueno || businessData.nombre || 'Administrador',
                            usuario: 'admin',
                            password: businessData.password || 'admin123',
                            rol: 'admin',
                            email: businessData.email || '',
                            createdAt: new Date().toISOString()
                        };
                        data = [adminUser];
                        localStorage.setItem(key, JSON.stringify(data));
                    } else {
                        data = [];
                    }
                } catch (err) {
                    data = [];
                }
            }
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setUsers([]);
        }
    }, [negocioId]);

    const loadBarProducts = useCallback(async () => {
        try {
            const { fetchBarMenu } = await import('../../modules/bar/services/barService');
            const products = await fetchBarMenu(negocioId);
            setBarProducts(Array.isArray(products) ? products : []);
        } catch (e) {
            console.error("Error loading products:", e);
        }
    }, [negocioId]);

    const loadTables = useCallback(() => {
        try {
            const key = `${negocioId}_tables`;
            const raw = localStorage.getItem(key);
            if (raw) {
                const data = JSON.parse(raw);
                setTables(Array.isArray(data) ? data : []);
            } else {
                const initial = Array.from({ length: 12 }, (_, i) => ({
                    tableNumber: i + 1,
                    status: 'disponible',
                    mozoId: null,
                    mozoName: null,
                    openedAt: null
                }));
                localStorage.setItem(key, JSON.stringify(initial));
                setTables(initial);
            }
        } catch (e) {
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

        const handleStorage = (e) => {
            if (e.key && e.key.startsWith(`${negocioId}_`)) {
                loadOrders();
                loadUsers();
                loadTables();
                loadBarProducts();
            }
        };

        window.addEventListener('storage', handleStorage);
        const interval = setInterval(() => {
            if (negocioId) {
                loadOrders();
                loadUsers();
                loadTables();
                loadBarProducts();
            }
        }, 5000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [negocioId, loadOrders, loadUsers, loadTables, loadBarProducts]);

    const addOrder = (newOrder) => {
        try {
            const key = `${negocioId}_orders`;
            const prevOrders = JSON.parse(localStorage.getItem(key)) || [];
            const nextOrders = [newOrder, ...prevOrders];
            localStorage.setItem(key, JSON.stringify(nextOrders));
            loadOrders();
            window.dispatchEvent(new Event('storage'));
        } catch(e) {}
    };

    const updateOrder = (orderId, updates) => {
        try {
            const key = `${negocioId}_orders`;
            const prevOrders = JSON.parse(localStorage.getItem(key)) || [];
            const nextOrders = prevOrders.map(o => o.id === orderId ? { ...o, ...updates } : o);
            localStorage.setItem(key, JSON.stringify(nextOrders));
            loadOrders();
            window.dispatchEvent(new Event('storage'));
        } catch(e) {}
    };

    const updateTable = (tableNumber, updates) => {
        try {
            const key = `${negocioId}_tables`;
            const prevTables = JSON.parse(localStorage.getItem(key)) || [];
            const nextTables = prevTables.map(t => t.tableNumber === tableNumber ? { ...t, ...updates } : t);
            localStorage.setItem(key, JSON.stringify(nextTables));
            loadTables();
            window.dispatchEvent(new Event('storage'));
        } catch(e) {}
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
