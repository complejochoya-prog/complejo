import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { migrateLocalStorageToFirestore } from './firestoreService';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

export const ConfigContext = createContext();

export function ConfigProvider({ children }) {
    const location = useLocation();
    const params = useParams();
    
    // 🔥 Robust NegocioId Detection
    const [negocioId, setNegocioId] = useState(() => {
        // 1. Try URL parameters (matched by React Router)
        if (params.negocioId) return params.negocioId;
        
        // 2. Try URL Path parsing (Fallback for direct access)
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[1];
        const reserved = ['home', 'login', 'superadmin', 'help', 'admin', 'giovanni'];
        return (id && id.length > 0 && !reserved.includes(id)) ? id : 'giovanni';
    });

    const [config, setConfig] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [activeModules, setActiveModules] = useState([]);
    const [lastSync, setLastSync] = useState(Date.now());

    // Sync negocioId when URL changes
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const id = pathParts[1];
        const reserved = ['home', 'login', 'superadmin', 'help', 'admin', 'giovanni'];
        if (id && id.length > 0 && !reserved.includes(id) && id !== negocioId) {
            setNegocioId(id);
        } else if (params.negocioId && params.negocioId !== negocioId) {
            setNegocioId(params.negocioId);
        }
    }, [location.pathname, params.negocioId, negocioId]);

    // --- FIREBASE MIGRATION & REALTIME SYNC ---
    useEffect(() => {
        if (negocioId) {
            migrateLocalStorageToFirestore(negocioId);
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
                        // Fallback generic
                        setConfig({ nombre: negocioId.toUpperCase(), plan: 'Free' });
                    }
                }

                if (negocioId === 'giovanni') {
                    setActiveModules(ALL_MODULES.map(m => m.id));
                } else {
                    const baseModules = getModulesByPlan(currentPlan);
                    const finalModules = [...new Set([...baseModules, ...rawActiveModules])];
                    setActiveModules(finalModules);
                }

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
            setUsers([]);
        }
    }, [negocioId]);

    const loadBarProducts = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { fetchBarMenu } = await import('../../modules/bar/services/barService');
            const products = await fetchBarMenu(negocioId);
            setBarProducts(Array.isArray(products) ? products : []);
        } catch (e) {}
    }, [negocioId]);

    const loadTables = useCallback(async () => {
        if (!negocioId) return;
        try {
            const { tablasService } = await import('./tablasService');
            const data = await tablasService.getTablas(negocioId);
            if (data && data.length > 0) {
                setTables(data.sort((a,b) => a.tableNumber - b.tableNumber));
            } else {
                const initial = Array.from({ length: 12 }, (_, i) => ({
                    tableNumber: i + 1,
                    status: 'disponible',
                    id: `table-${i+1}`
                }));
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
            
            const unsubTabs = onSnapshot(collection(db, 'negocios', negocioId, 'tablas'), () => loadTables());
            const unsubEmps = onSnapshot(collection(db, 'negocios', negocioId, 'empleados'), () => loadUsers());
            return () => {
                unsubTabs();
                unsubEmps();
            };
        }
    }, [negocioId, loadOrders, loadUsers, loadTables, loadBarProducts]);

    const value = React.useMemo(() => ({ 
        negocioId, 
        config,
        businessInfo: config || {}, // Alias para compatibilidad con módulos antiguos
        businessData: { ...config, activeModules }, // Alias para compatibilidad
        subscription, 
        isExpired, 
        activeModules, 
        loading, 
        error, 
        orders, 
        users, 
        barProducts,
        tables, 
        lastSync, 
        forceSync: () => setLastSync(Date.now())
    }), [negocioId, config, subscription, isExpired, activeModules, loading, error, orders, users, barProducts, tables, lastSync]);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        // Si no hay contexto, devolvemos un fallback con negocioId basado en URL
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[1];
        const reserved = ['home', 'login', 'superadmin', 'help', 'admin', 'giovanni'];
        const fallbackId = (id && id.length > 0 && !reserved.includes(id)) ? id : 'giovanni';
        return { negocioId: fallbackId, loading: false };
    }
    return context;
};
