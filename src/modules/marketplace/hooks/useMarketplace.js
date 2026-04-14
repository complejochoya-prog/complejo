import { useState, useEffect } from 'react';
import { fetchAvailableModules, installModule, uninstallModule } from '../services/marketplaceService';
import { useConfig } from '../../../core/services/ConfigContext';

export function useMarketplace(negocioId) {
    const { activeModules } = useConfig();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState(null);

    useEffect(() => {
        loadModules();
    }, [negocioId, activeModules]);

    const loadModules = async () => {
        setLoading(true);
        const data = await fetchAvailableModules();
        
        // Mark as installed if in activeModules state
        const syncData = data.map(m => ({
            ...m,
            installed: activeModules.includes(m.id)
        }));

        setModules(syncData);
        setLoading(false);
    };

    const handleInstall = async (moduleId) => {
        setInstalling(moduleId);
        const res = await installModule(negocioId, moduleId);
        if (res.success) {
            setModules(prev => prev.map(m => m.id === moduleId ? { ...m, installed: true } : m));
        }
        setInstalling(null);
        return res;
    };

    const handleUninstall = async (moduleId) => {
        setInstalling(moduleId);
        const res = await uninstallModule(negocioId, moduleId);
        if (res.success) {
            setModules(prev => prev.map(m => m.id === moduleId ? { ...m, installed: false } : m));
        }
        setInstalling(null);
        return res;
    };

    return {
        modules,
        loading,
        installing,
        handleInstall,
        handleUninstall
    };
}
