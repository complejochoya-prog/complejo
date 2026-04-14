export async function fetchAvailableModules() {
    return new Promise(async (resolve) => {
        const { ALL_MODULES } = await import('../../../core/config/modulePlans');
        
        // Modules are now fully defined in ALL_MODULES
        const marketModules = ALL_MODULES.map(m => ({
            ...m,
            installed: false // Initial status before sync with business config
        }));

        setTimeout(() => {
            resolve(marketModules);
        }, 500);
    });
}

export async function installModule(negocioId, moduleId) {
    console.log(`[Marketplace] Installing ${moduleId} for ${negocioId}`);
    
    // In a real environment, we would update Firestore here
    // For development, we'll try to update the mock/local state if possible
    // but the best way is to emit an event so ConfigContext can re-load or update
    
    return new Promise(resolve => {
        setTimeout(() => {
            window.dispatchEvent(new Event('storage')); // Trigger reload in ConfigContext
            resolve({ success: true });
        }, 1000);
    });
}

export async function uninstallModule(negocioId, moduleId) {
    console.log(`[Marketplace] Uninstalling ${moduleId} for ${negocioId}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            window.dispatchEvent(new Event('storage'));
            resolve({ success: true });
        }, 800);
    });
}
