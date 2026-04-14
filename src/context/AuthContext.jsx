import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('admin_session');
        if (session) {
            try {
                setUser(JSON.parse(session));
            } catch (e) {
                localStorage.removeItem('admin_session');
            }
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // 1. Try to find in localStorage employees
        const storedEmployees = JSON.parse(localStorage.getItem('complejo_empleados')) || [];
        const employee = storedEmployees.find(emp => 
            (emp.usuario === username || emp.dni === username) && 
            (emp.password === password || (!emp.password && username === password))
        );

        if (employee) {
            const userData = {
                id: employee.id,
                username: employee.usuario || employee.dni,
                role: employee.rol,
                name: `${employee.nombre} ${employee.apellido}`
            };
            setUser(userData);
            localStorage.setItem('admin_session', JSON.stringify(userData));
            return { success: true, user: userData };
        }

        // 2. Fallback to mock roles (backward compatibility)
        const validRoles = ['admin', 'encargado', 'mozo', 'cocina', 'cliente'];
        if (validRoles.includes(username) && username === password) {
            const roleNames = {
                admin: 'Administrador',
                encargado: 'Encargado',
                mozo: 'Mozo',
                cocina: 'Cocina',
                cliente: 'Cliente'
            };
            
            const userData = { 
                username: username, 
                role: username, 
                name: roleNames[username] 
            };
            
            setUser(userData);
            localStorage.setItem('admin_session', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        return { success: false, message: 'Credenciales inválidas' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('admin_session');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
