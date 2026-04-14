/**
 * Backup Manager
 * Handles exporting and importing all localStorage data.
 */

/**
 * Exports all localStorage data to a JSON file.
 */
export function exportBackup() {
    const backup = {};
    
    // Collect all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        backup[key] = localStorage.getItem(key);
    }

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `erp-backup-${timestamp}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("[Backup] System backup exported successfully.");
}

/**
 * Imports system data from a backup JSON file.
 * @param {File} file 
 */
export function importBackup(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            // Clear current storage before importing
            localStorage.clear();

            // Restore all items
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
            });

            console.log("[Backup] System data restored. Reloading...");
            
            // Reload the application to apply changes
            window.location.reload();
        } catch (error) {
            console.error("[Backup] Error parsing backup file:", error);
            alert("Error al importar el backup: El archivo no tiene un formato válido.");
        }
    };

    reader.onerror = () => {
        console.error("[Backup] Error reading file.");
    };

    reader.readAsText(file);
}
