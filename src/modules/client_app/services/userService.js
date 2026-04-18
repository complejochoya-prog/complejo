import { clientesService } from '../../../core/services/clientesService';

export const getUsers = async (negocioId) => {
    return clientesService.getClientes(negocioId);
};

export const saveUser = async (user, negocioId) => {
    console.log('Saving user to DB:', user, negocioId);
    return clientesService.saveCliente(negocioId, {
        ...user,
        negocioId
    });
};

export const checkAvailability = async (username, negocioId) => {
    const users = await getUsers(negocioId);
    return !users.some(u => u.username?.toLowerCase() === username?.toLowerCase());
};

export const loginClient = async (usernameOrEmail, password, negocioId) => {
    const users = await getUsers(negocioId);
    const user = users.find(u => 
        (u.username?.toLowerCase() === usernameOrEmail?.toLowerCase() || u.email?.toLowerCase() === usernameOrEmail?.toLowerCase()) && 
        u.password === password
    );
    return user || null;
};

export const clearAllUsers = async (negocioId) => {
    // Note: We usually don't clear all users in DB like this easily,
    // but for the "Reset Base" button in admin, we could loop or just ignore if it's too risky.
    // For now, let's keep it empty or implement a per-user delete later.
    console.warn("clearAllUsers called - not fully implemented for DB security");
};

export const updateUser = async (userId, updates, negocioId) => {
    return clientesService.updateCliente(negocioId, userId, updates);
};
