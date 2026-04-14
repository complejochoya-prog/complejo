/**
 * storageSync.js — Sincronización de localStorage entre navegadores
 * 
 * Este módulo intercepta las escrituras a localStorage y las envía
 * al servidor de Vite. Además, hace polling periódico para detectar
 * cambios hechos desde otros navegadores y actualizar localStorage local.
 * 
 * Uso: importar y llamar initStorageSync() en main.jsx
 */

// Keys del sistema que queremos sincronizar
const SYNC_KEYS = [
    'complejo_espacios',
    'complejo_reservas',
    'complejo_horarios',
    'complejo_empleados',
    'complejo_caja',
    'complejo_caja_movimientos',
    'complejo_inventario',
    'complejo_pedidos',
    'complejo_promos',
    'complejo_clientes',
    'complejo_config',
    'complejo_negocios',
    'complejo_users',
    'complejo_torneos',
];

const API_BASE = '/__shared_storage__';
let lastKnownTimestamp = 0;
let syncInterval = null;
let isSyncing = false;

// Variables globales al módulo para ignorar la recursión al hacer set
let originalSetItem = null;
let originalRemoveItem = null;

/**
 * Inicializa la sincronización.
 * 1. Sube los datos locales al servidor (si el servidor está vacío)
 * 2. Descarga los datos del servidor (si hay datos más recientes)
 * 3. Intercepta localStorage.setItem para sincronizar automáticamente
 * 4. Inicia polling cada 2 segundos
 */
export async function initStorageSync() {
    try {
        // 1. Obtener datos del servidor
        const serverResponse = await fetch(`${API_BASE}/all`);
        if (!serverResponse.ok) {
            console.warn('[Sync] Servidor no disponible, usando solo localStorage');
            return;
        }
        
        const { data: serverData, lastModified } = await serverResponse.json();
        lastKnownTimestamp = lastModified;

        const serverKeys = Object.keys(serverData || {});

        // Interceptar localStorage ANTES de pullear para que existan las refs
        interceptLocalStorage();

        if (serverKeys.length === 0) {
            // Servidor vacío → subir datos locales
            console.log('[Sync] 📤 Subiendo datos locales al servidor...');
            await pushAllToServer();
        } else {
            // Servidor tiene datos → descargar al localStorage
            console.log('[Sync] 📥 Descargando datos iniciales del servidor...');
            pullFromServer(serverData);
            lastKnownTimestamp = lastModified;
        }

        // 4. Iniciar Polling (cada 2 segundos)
        startPolling();

        console.log('[Sync] ✅ Sincronización activa entre navegadores');
    } catch (err) {
        console.warn('[Sync] No se pudo conectar al servidor de sync:', err.message);
    }
}

/**
 * Sube todos los datos locales al servidor
 */
async function pushAllToServer() {
    const items = {};
    
    // Iterar todo localStorage para agarrar SYNC_KEYS o multi-tenant keys (ej: giovanni_orders)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (SYNC_KEYS.includes(key) || key.endsWith('_orders')) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                items[key] = value;
            }
        }
    }

    if (Object.keys(items).length > 0) {
        try {
            const resp = await fetch(`${API_BASE}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
            const result = await resp.json();
            lastKnownTimestamp = result.lastModified;
        } catch (e) {
            console.warn('[Sync] Error al subir datos:', e.message);
        }
    }
}

/**
 * Descarga datos del servidor al localStorage
 */
function pullFromServer(serverData) {
    let updatedKeys = [];
    
    for (const [key, value] of Object.entries(serverData)) {
        if (SYNC_KEYS.includes(key) || key.endsWith('_orders')) {
            const localValue = localStorage.getItem(key);
            if (localValue !== value) {
                // USAR originalSetItem para no disparar recursión al servidor
                originalSetItem(key, value);
                updatedKeys.push(key);
            }
        }
    }

    if (updatedKeys.length > 0) {
        console.log('[Sync] 🔄 Keys actualizadas:', updatedKeys.join(', '));
        // Disparar eventos para que los componentes React se actualicen
        updatedKeys.forEach(key => {
            const eventName = getEventNameForKey(key);
            if (eventName) {
                window.dispatchEvent(new Event(eventName));
            }
            
            // 🔥 CRITICAL FIX: Disparar evento "storage" simulado con el key afectado
            // Esto permite que el multi-tenant (PedidosContext, etc.) lo reciba.
            const storageEvent = new Event('storage');
            storageEvent.key = key;
            window.dispatchEvent(storageEvent);
        });
        // Evento genérico para forzar re-renders
        window.dispatchEvent(new Event('storage_sync_update'));
    }
}

/**
 * Mapea keys de localStorage a nombres de eventos custom
 */
function getEventNameForKey(key) {
    const map = {
        'complejo_reservas': 'storage_reservas',
        'complejo_espacios': 'storage_espacios',
        'complejo_horarios': 'storage_horarios',
        'complejo_pedidos': 'storage_pedidos',
        'complejo_caja': 'storage_caja',
        'complejo_caja_movimientos': 'storage_caja_mov',
        'complejo_inventario': 'storage_inventario',
        'complejo_promos': 'storage_promos',
    };
    return map[key] || null;
}

/**
 * Intercepta localStorage.setItem para sincronizar automáticamente
 */
function interceptLocalStorage() {
    originalSetItem = localStorage.setItem.bind(localStorage);
    originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function (key, value) {
        originalSetItem(key, value);

        // Solo sincronizar keys del sistema o keys de ordenes multi-tenant
        if (SYNC_KEYS.includes(key) || key.endsWith('_orders')) {
            // Sincronizar al servidor en background (no bloquear)
            fetch(`${API_BASE}/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            }).then(r => r.json()).then(result => {
                lastKnownTimestamp = result.lastModified;
            }).catch(() => { /* silencio si falla */ });
        }
    };

    localStorage.removeItem = function (key) {
        originalRemoveItem(key);

        if (SYNC_KEYS.includes(key) || key.endsWith('_orders')) {
            fetch(`${API_BASE}/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            }).then(r => r.json()).then(result => {
                lastKnownTimestamp = result.lastModified;
            }).catch(() => {});
        }
    };
}

/**
 * Polling: cada 2 segundos chequea si el servidor tiene cambios nuevos
 */
function startPolling() {
    if (syncInterval) clearInterval(syncInterval);

    syncInterval = setInterval(async () => {
        try {
            const resp = await fetch(`${API_BASE}/timestamp`);
            if (!resp.ok) return;
            
            const { lastModified } = await resp.json();
            
            if (lastModified > lastKnownTimestamp) {
                lastKnownTimestamp = lastModified;
                
                // Hay cambios — descargar todo
                isSyncing = true;
                const allResp = await fetch(`${API_BASE}/all`);
                const { data } = await allResp.json();
                pullFromServer(data);
                isSyncing = false;
            }
        } catch {
            // Servidor no disponible, seguir con localStorage normal
        }
    }, 2000); // Cada 2 segundos
}

/**
 * Detiene la sincronización
 */
export function stopStorageSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    console.log('[Sync] ⏹ Sincronización detenida');
}
