import { useState, useEffect } from 'react';
import { loginClient, saveUser } from '../services/userService';

export function useClientAuth() {
    const [clientUser, setClientUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('giovanni_client') || sessionStorage.getItem('giovanni_client');
        if (stored) {
            try {
                setClientUser(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (usernameOrEmail, password, negocioId, remember = false) => {
        const user = loginClient(usernameOrEmail, password, negocioId);
        if (user) {
            setClientUser(user);
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('giovanni_client', JSON.stringify(user));
            return { success: true };
        }
        return { success: false, error: 'Usuario o contraseña incorrectos' };
    };

    const register = async (userData, negocioId, remember = false) => {
        try {
            const newUser = saveUser(userData, negocioId);
            setClientUser(newUser);
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem('giovanni_client', JSON.stringify(newUser));
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al registrar usuario' };
        }
    };

    const logout = () => {
        setClientUser(null);
        localStorage.removeItem('giovanni_client');
        sessionStorage.removeItem('giovanni_client');
    };

    return { clientUser, loading, login, register, logout };
}
