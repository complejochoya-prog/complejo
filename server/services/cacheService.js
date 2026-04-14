const NodeCache = require("node-cache");

// Configurar caché con un TTL (Time To Live) estándar de 60 segundos por defecto
const cache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120 // Período en segundos para revisar y borrar claves expiradas
});

/**
 * Guarda un valor en la caché.
 * @param {string} key - Clave única.
 * @param {any} data - Datos a guardar.
 * @param {number} [ttl] - Tiempo de vida en segundos (opcional, sobreescribe stdTTL).
 */
function setCache(key, data, ttl) {
    if (ttl !== undefined) {
        cache.set(key, data, ttl);
    } else {
        cache.set(key, data);
    }
}

/**
 * Obtiene un valor de la caché.
 * @param {string} key - Clave única.
 * @returns {any|undefined} - Datos guardados o undefined si no existe/expiró.
 */
function getCache(key) {
    return cache.get(key);
}

/**
 * Elimina una clave o múltiples claves de la caché.
 * Útil para invalidar caché cuando los datos cambian.
 * @param {string|string[]} keys - Clave(s) a borrar.
 */
function deleteCache(keys) {
    cache.del(keys);
}

module.exports = {
    setCache,
    getCache,
    deleteCache
};
