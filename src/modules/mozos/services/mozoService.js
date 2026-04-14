/**
 * mozoService.js - Manejo de sesión y lógica de mozos
 */

export const loginMozo = async (usuario, password, empleados) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Buscamos en la lista de empleados (o usuarios) usando el DNI como usuario principal
            const mozo = empleados.find(u => 
                u.dni === usuario && 
                u.password === password && 
                (u.rol?.toLowerCase() === "mozo" || u.rol?.toLowerCase() === "admin" || u.rol?.toLowerCase() === "encargado")
            );

            if (mozo) {
                const isActive = mozo.estado === 'activo' || mozo.activo === true;
                if (!isActive) {
                    reject({ message: "Usuario desactivado", type: "locked" });
                } else {
                    // Guardar sesión
                    localStorage.setItem('mozoId', mozo.id);
                    localStorage.setItem('mozoName', mozo.nombre + (mozo.apellido ? ` ${mozo.apellido}` : ''));
                    localStorage.setItem('mozoRole', mozo.rol);
                    localStorage.setItem('mozoShiftStart', new Date().toISOString());
                    resolve(mozo);
                }
            } else {
                reject({ message: "Credenciales inválidas o no tienes permisos de acceso" });
            }
        }, 500);
    });
};

export const logoutMozo = () => {
    localStorage.removeItem('mozoId');
    localStorage.removeItem('mozoName');
    localStorage.removeItem('mozoRole');
    localStorage.removeItem('mozoShiftStart');
};

export const getMozoSession = () => {
    return {
        id: localStorage.getItem('mozoId'),
        name: localStorage.getItem('mozoName'),
        role: localStorage.getItem('mozoRole'),
        shiftStart: localStorage.getItem('mozoShiftStart')
    };
};
