/**
 * SuperAdmin Auth Context
 * Manages the exclusive session for the SaaS Master Panel.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const SuperAdminAuthContext = createContext();

export const SuperAdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('superadmin_session');
        if (session) {
            try {
                setUser(JSON.parse(session));
            } catch (e) {
                console.error("Invalid session", e);
                localStorage.removeItem('superadmin_session');
            }
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        if (username === 'gio' && password === 'gio') {
            const userData = {
                name: "Giovanni Owner",
                role: "superadmin",
                lastLogin: new Date().toISOString()
            };
            setUser(userData);
            localStorage.setItem('superadmin_session', JSON.stringify(userData));
            
            // Sync with global system role for consistency if needed by other guards
            localStorage.setItem('userRole', 'superadmin');
            
            return { success: true };
        }
        return { success: false, message: 'Credenciales inválidas' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('superadmin_session');
        localStorage.removeItem('userRole');
    };

    return (
        <SuperAdminAuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export const useSuperAdminAuth = () => {
    const context = useContext(SuperAdminAuthContext);
    if (!context) {
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
};
