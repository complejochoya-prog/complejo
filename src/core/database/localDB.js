/**
 * LocalDB Wrapper
 * Simple abstraction over localStorage for JSON persistence.
 */
export const LocalDB = {
    /**
     * Saves data to localStorage
     * @param {string} key 
     * @param {any} data 
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`[LocalDB] Error saving key "${key}":`, error);
        }
    },

    /**
     * Retrieves data from localStorage
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (error) {
            console.error(`[LocalDB] Error reading key "${key}":`, error);
            return null;
        }
    },

    /**
     * Removes an item from localStorage
     * @param {string} key 
     */
    remove(key) {
        localStorage.removeItem(key);
    }
};
