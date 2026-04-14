/**
 * userService.js
 * Centralized user management using localStorage as a "database"
 */

const DB_KEY = 'giovanni_users_db';

export const getUsers = (negocioId) => {
    const allUsers = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    // Filter by negocioId if stored, or just return all for this demo
    return allUsers.filter(u => u.negocioId === negocioId);
};

export const saveUser = (user, negocioId) => {
    console.log('Saving user to DB:', user, negocioId);
    const allUsers = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const newUser = { 
        ...user, 
        negocioId, 
        id: `c_${Date.now()}`,
        createdAt: new Date().toISOString() 
    };
    allUsers.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(allUsers));
    
    // Notificar a otras partes de la app (como el panel admin)
    window.dispatchEvent(new Event('storage'));
    
    return newUser;
};

export const checkAvailability = (username, negocioId) => {
    const users = getUsers(negocioId);
    return !users.some(u => u.username?.toLowerCase() === username?.toLowerCase());
};

export const loginClient = (usernameOrEmail, password, negocioId) => {
    const users = getUsers(negocioId);
    const user = users.find(u => 
        (u.username?.toLowerCase() === usernameOrEmail?.toLowerCase() || u.email?.toLowerCase() === usernameOrEmail?.toLowerCase()) && 
        u.password === password
    );
    return user || null;
};

export const clearAllUsers = () => {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem('giovanni_client');
    sessionStorage.removeItem('giovanni_client');
    window.dispatchEvent(new Event('storage'));
};

export const updateUser = (userId, updates) => {
    const allUsers = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const nextUsers = allUsers.map(u => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem(DB_KEY, JSON.stringify(nextUsers));
    window.dispatchEvent(new Event('storage'));
    return true;
};
