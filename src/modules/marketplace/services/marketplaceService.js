import { db } from '../../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export async function fetchAvailableModules() {
    const { ALL_MODULES } = await import('../../../core/config/modulePlans');
    return ALL_MODULES.map(m => ({ ...m, installed: false }));
}

export async function installModule(negocioId, moduleId) {
    if (!negocioId) return { success: false };
    try {
        const ref = doc(db, 'negocios', negocioId, 'configuracion', 'general');
        await updateDoc(ref, {
            activeModules: arrayUnion(moduleId)
        });
        return { success: true };
    } catch (e) {
        console.error("Error installing module:", e);
        return { success: false };
    }
}

export async function uninstallModule(negocioId, moduleId) {
    if (!negocioId) return { success: false };
    try {
        const ref = doc(db, 'negocios', negocioId, 'configuracion', 'general');
        await updateDoc(ref, {
            activeModules: arrayRemove(moduleId)
        });
        return { success: true };
    } catch (e) {
        console.error("Error uninstalling module:", e);
        return { success: false };
    }
}
