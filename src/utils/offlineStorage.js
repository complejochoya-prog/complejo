/**
 * Saves data to local storage for offline capabilities.
 * 
 * @param {string} key - The storage key
 * @param {any} data - The data to store
 */
export function saveOffline(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`[Offline Storage] Error saving key ${key}:`, error);
    }
}

/**
 * Retrieves data from local storage.
 * 
 * @param {string} key - The storage key
 * @returns {any|null} The parsed data or null if not found
 */
export function getOffline(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error(`[Offline Storage] Error retrieving key ${key}:`, error);
        return null;
    }
}

/**
 * Appends an item to an existing array in local storage, or creates it if it doesn't exist.
 * 
 * @param {string} key - The storage key
 * @param {any} item - The new item to append
 */
export function appendOfflineArray(key, item) {
    try {
        const existing = getOffline(key) || [];
        existing.push(item);
        saveOffline(key, existing);
    } catch (error) {
        console.error(`[Offline Storage] Error appending to array key ${key}:`, error);
    }
}

/**
 * Removes a specific key from local storage.
 * 
 * @param {string} key - The storage key to remove
 */
export function removeOffline(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[Offline Storage] Error removing key ${key}:`, error);
    }
}
