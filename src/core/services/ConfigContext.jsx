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
                
                let loadedConfig = null;
                try {
                    const configRef = doc(db, 'negocios', negocioId, 'configuracion', 'general');
                    const configSnap = await getDoc(configRef);
                    if (configSnap.exists()) {
                        loadedConfig = configSnap.data();
                    }
                } catch (dbErr) {
                    console.warn("Firestore config read error, using cache/defaults:", dbErr);
                }

                let currentPlan = 'Premium';
                let rawActiveModules = [];

                if (loadedConfig) {
                    setConfig(loadedConfig);
                    currentPlan = loadedConfig.plan || 'Premium';
                    rawActiveModules = loadedConfig.activeModules || [];
                    try {
                        localStorage.setItem(`complejo_config_${negocioId}`, JSON.stringify(loadedConfig));
                    } catch(e) {}
                } else {
                    // Check localStorage
                    let localConfig = null;
                    try {
                        const cached = localStorage.getItem(`complejo_config_${negocioId}`);
                        if (cached) localConfig = JSON.parse(cached);
                    } catch(e) {}

                    if (localConfig) {
                        loadedConfig = localConfig;
                        setConfig(localConfig);
                        currentPlan = localConfig.plan || 'Premium';
                        rawActiveModules = localConfig.activeModules || [];
                    } else {
                        const mocks = {
                            'giovanni': { nombre: 'Complejo Giovanni', plan: 'Premium', whatsapp: '5493855374835', telefono: '3855374835' },
                            'oasispadel': { nombre: 'Oasis Pádel', plan: 'Premium', whatsapp: '5493855374835', telefono: '3855374835' },
                            'padel-pro': { nombre: 'Padel Pro Center', plan: 'Basic', whatsapp: '5493855374835', telefono: '3855374835' },
                            'tennis-elite': { nombre: 'Tennis Elite Academy', plan: 'Pro', whatsapp: '5493855374835', telefono: '3855374835' },
                            'soccer-field': { nombre: 'Soccer Field 5', plan: 'Free', whatsapp: '5493855374835', telefono: '3855374835' }
                        };

                        const formattedName = negocioId.charAt(0).toUpperCase() + negocioId.slice(1).replace(/-/g, ' ');
                        const fallbackConfig = mocks[negocioId] || {
                            nombre: formattedName,
                            plan: 'Premium',
                            whatsapp: '5493855374835',
                            telefono: '3855374835',
                            activeModules: ['reservas', 'bar', 'caja', 'espacios', 'horarios', 'promos', 'notificaciones', 'pantallas', 'marketing', 'inventario', 'empleados', 'clientes', 'finanzas']
                        };

                        setConfig(fallbackConfig);
                        currentPlan = fallbackConfig.plan;
                        rawActiveModules = fallbackConfig.activeModules || [];
                        try {
                            localStorage.setItem(`complejo_config_${negocioId}`, JSON.stringify(fallbackConfig));
                        } catch(e) {}

                        // Persist to firestore in background
                        try {
                            setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'general'), fallbackConfig, { merge: true });
                        } catch(e) {}
                    }
                }

                if (negocioId === 'giovanni' || currentPlan === 'Premium') {
                    setActiveModules(rawActiveModules.length > 0 ? rawActiveModules : ALL_MODULES.map(m => m.id));
                } else {
                    const baseModules = getModulesByPlan(currentPlan);
                    const finalModules = [...new Set([...baseModules, ...rawActiveModules])];
                    setActiveModules(finalModules);
                }

                try {
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
                } catch(subErr) {
                    setIsExpired(false);
                }
            } catch (err) {
                console.error("Business data load error:", err);
                const fallback = { nombre: negocioId, activeModules: ['reservas', 'bar', 'caja', 'espacios', 'horarios', 'promos'] };
                setConfig(fallback);
                setActiveModules(fallback.activeModules);
            } finally {
                setLoading(false);
            }
        };

        loadBusinessData();
    }, [negocioId]);

    const updateConfig = useCallback(async (newConfig) => {
        if (!negocioId) return { success: false, error: 'No negocioId' };
        try {
            const merged = { ...(config || {}), ...newConfig };
            setConfig(merged);
            if (merged.activeModules) {
                setActiveModules(merged.activeModules);
            }
            try {
                localStorage.setItem(`complejo_config_${negocioId}`, JSON.stringify(merged));
                window.dispatchEvent(new Event('storage_config'));
            } catch(e) {}

            try {
                const configRef = doc(db, 'negocios', negocioId, 'configuracion', 'general');
                await setDoc(configRef, merged, { merge: true });
            } catch(e) {
                console.warn("Firestore config save error:", e);
            }
            setLastSync(Date.now());
            return { success: true };
        } catch (err) {
            console.error("Error saving config:", err);
            return { success: false, error: err.message };
        }
    }, [negocioId, config]);

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
                initial.forEach(async (t) => {
                    try {
                        await tablasService.updateTabla(negocioId, t.tableNumber, { status: 'disponible' });
                    } catch (e) {}
                });
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
        updateConfig,
        updateBusinessInfo: updateConfig,
        forceSync: () => setLastSync(Date.now())
    }), [negocioId, config, subscription, isExpired, activeModules, loading, error, orders, users, barProducts, tables, lastSync, updateConfig]);

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

export default ConfigProvider;
