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
        const role = localStorage.getItem('userRole');
        if (session) {
            try {
                setUser(JSON.parse(session));
            } catch (e) {
                console.error("Invalid session", e);
                localStorage.removeItem('superadmin_session');
            }
        } else if (role === 'superadmin') {
            const fallbackUser = {
                name: "Giovanni Owner",
                role: "superadmin",
                lastLogin: new Date().toISOString()
            };
            setUser(fallbackUser);
            localStorage.setItem('superadmin_session', JSON.stringify(fallbackUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const u = (username || '').trim().toLowerCase();
        const p = (password || '').trim();

        const validCredentials = [
            { u: 'gio', p: 'gio' },
            { u: 'admin', p: 'admin' },
            { u: 'superadmin', p: 'admin' },
            { u: 'superadmin', p: 'superadmin' },
            { u: 'giovanni', p: 'giovanni' },
            { u: 'master', p: 'master123' }
        ];

        const match = validCredentials.some(c => c.u === u && c.p === p);

        if (match) {
            const userData = {
                name: u === 'gio' || u === 'giovanni' ? "Giovanni Owner" : "Master Admin",
                role: "superadmin",
                lastLogin: new Date().toISOString()
            };
            setUser(userData);
            localStorage.setItem('superadmin_session', JSON.stringify(userData));
            localStorage.setItem('userRole', 'superadmin');
            
            return { success: true };
        }
        return { success: false, message: 'Credenciales inválidas. Usa gio/gio o admin/admin' };
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
