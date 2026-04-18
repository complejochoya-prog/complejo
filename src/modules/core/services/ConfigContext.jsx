import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { ConfigContext, useConfig } from '../hooks/useConfig';

// Re-export so existing imports from this file keep working
export { useConfig, ConfigContext };

export default function ConfigProvider({ children }) {
    const location = useLocation();
    const [negocioId, setNegocioId] = useState(() => {
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[1];
        const reserved = ['home', 'login', 'superadmin', 'help', 'admin', 'giovanni'];
        return (id && id.length > 0 && !reserved.includes(id)) ? id : 'giovanni';
    });
    const [businessData, setBusinessData] = useState(null);
    const [businessInfo, setBusinessInfo] = useState({});
    const [activeModules, setActiveModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const id = pathParts[1];
        const reserved = ['home', 'login', 'superadmin', 'help', 'admin', 'giovanni'];
        console.log("ConfigProvider: Path change detected", { id, currentNegocioId: negocioId });
        if (id && id.length > 0 && !reserved.includes(id) && id !== negocioId) {
            console.log("ConfigProvider: Updating negocioId to", id);
            setNegocioId(id);
        }
    }, [location.pathname, negocioId]);

    useEffect(() => {
        if (!negocioId) return;

        const configRef = doc(db, 'negocios', negocioId, 'configuracion', 'general');
        getDoc(configRef).then((docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.businessInfo) setBusinessInfo(data.businessInfo);
                if (data.activeModules) setActiveModules(data.activeModules);
                if (data.modulesConfig) setBusinessData(prev => ({ ...prev, modulesConfig: data.modulesConfig }));
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error loading config:", err);
            setLoading(false);
        });

        const negocioRef = doc(db, 'negocios', negocioId);
        getDoc(negocioRef).then(snap => {
            if (snap.exists()) {
                const data = snap.data();
                setBusinessData(data);
                // If not in config/general, check main negocio doc
                if (data.activeModules) setActiveModules(data.activeModules);
            }
        });
    }, [negocioId]);

    const syncSettings = async (updates) => {
        const configRef = doc(db, 'negocios', negocioId, 'configuracion', 'general');
        await setDoc(configRef, updates, { merge: true });

        // Update local state immediately
        if (updates.businessInfo) setBusinessInfo(updates.businessInfo);
        if (updates.activeModules) setActiveModules(updates.activeModules);
    };

    const value = {
        negocioId,
        businessData: { ...businessData, activeModules },
        businessInfo,
        loading,
        syncSettings,
        updateBusinessInfo: (info) => syncSettings({ businessInfo: info }),
        updateActiveModules: (modules) => syncSettings({ activeModules: modules }),
        modulesConfig: businessData?.modulesConfig || {}
    };

    return (
        <ConfigContext.Provider value={value}>
            {!loading && children}
        </ConfigContext.Provider>
    );
}
