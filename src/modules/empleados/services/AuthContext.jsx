import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const AuthContext = createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
    const { negocioId } = useConfig();
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist session on load
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            // Legacy session recovery (Maintenance fallback)
            const legacyRole = localStorage.getItem('userRole');
            const legacyId = localStorage.getItem('userId');
            const legacyName = localStorage.getItem('userName');
            
            if (legacyRole === 'admin' || legacyRole === 'superadmin' || legacyRole === 'admin_principal' || legacyRole === 'administrativo') {
                const recoveredUser = {
                    id: legacyId || 'legacy-admin',
                    name: legacyName || 'Administrator',
                    username: legacyId || 'admin',
                    role: legacyRole === 'superadmin' ? 'admin' : legacyRole,
                    permisos: ['pedidos', 'cobrar', 'caja', 'reservas', 'config', 'reports', 'admin'],
                    activo: true
                };
                setCurrentUser(recoveredUser);
                localStorage.setItem('currentUser', JSON.stringify(recoveredUser));
            }
        }
    }, []);

    // Listen to current user changes for real-time permissions
    useEffect(() => {
        if (!negocioId || !currentUser?.id) return;

        const unsub = onSnapshot(doc(db, 'negocios', negocioId, 'usuarios', currentUser.id), (docSnap) => {
            if (docSnap.exists()) {
                const userData = { id: docSnap.id, ...docSnap.data() };
                setCurrentUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        });

        return () => unsub();
    }, [negocioId, currentUser?.id]);

    useEffect(() => {
        if (!negocioId) return;

        getDocs(collection(db, 'negocios', negocioId, 'usuarios')).then((snapshot) => {
            const usersList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setUsers(usersList);
        });
    }, [negocioId]);

    const addUser = async (user) => {
        const id = 'usr-' + Date.now();
        const newUser = {
            ...user,
            id,
            negocio_id: negocioId,
            role: user.role || 'mozo',
            permisos: user.permisos || [],
            activo: user.activo ?? true,
            timestamp: new Date()
        };
        setUsers(prev => [...prev, newUser]);
        await setDoc(doc(db, 'negocios', negocioId, 'usuarios', id), newUser);
    };

    const removeUser = async (id) => {
        const userToRemove = users.find(u => u.id === id);
        if (id === '1' || (userToRemove && userToRemove.username === 'giovanni')) {
            throw new Error("No se puede desactivar el administrador principal del sistema");
        }
        setUsers(prev => prev.filter(u => u.id !== id));
        await deleteDoc(doc(db, 'negocios', negocioId, 'usuarios', id));
    };

    const updateUser = async (id, updates) => {
        const userToUpdate = users.find(u => u.id === id);

        if (userToUpdate && (userToUpdate.username === 'giovanni' || id === '1')) {
            if (updates.activo === false) {
                throw new Error("No se puede desactivar el administrador principal del sistema");
            }
            if (updates.role && updates.role !== 'admin' && userToUpdate.username === 'giovanni') {
                throw new Error("No se puede cambiar el rol del administrador principal");
            }
        }

        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
        await updateDoc(doc(db, 'negocios', negocioId, 'usuarios', id), updates);
    };

    const toggleUserStatus = async (id, currentStatus) => {
        await updateUser(id, { activo: !currentStatus });
    };

    const loginAdmin = async (username, password) => {
        // Special case for Master Admin (hardcoded for initial setup if no DB users exist)
        if (username === 'giovanni' && password === 'admin') {
            const masterUser = {
                id: 'master',
                name: 'Master Giovanni',
                username: 'giovanni',
                role: 'admin',
                permisos: ['pedidos', 'cobrar', 'caja', 'reservas', 'config', 'reports'],
                activo: true
            };
            setCurrentUser(masterUser);
            localStorage.setItem('currentUser', JSON.stringify(masterUser));
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('userId', 'master');
            localStorage.setItem('userName', 'Master Giovanni');
            return masterUser;
        }

        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            await addAdminLog({
                type: 'LOGIN_FAILURE',
                user: username,
                details: 'Intento de login con credenciales incorrectas'
            });
            throw new Error("Usuario o contraseña incorrectos");
        }

        if (user.activo === false) {
            await addAdminLog({
                type: 'LOGIN_FAILURE',
                user: username,
                details: 'Intento de login con cuenta desactivada'
            });
            throw new Error("Su cuenta está desactivada. Contacte al administrador.");
        }

        const finalUser = { ...user };
        setCurrentUser(finalUser);
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
        localStorage.setItem('userRole', finalUser.role);
        localStorage.setItem('userId', finalUser.id);
        localStorage.setItem('userName', finalUser.name);

        await addAdminLog({
            type: 'LOGIN_SUCCESS',
            userId: finalUser.id,
            userName: finalUser.name,
            details: `Login exitoso - Rol: ${finalUser.role}`
        });

        return finalUser;
    };

    const logoutAdmin = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    };

    const addAdminLog = async (logData) => {
        const id = 'log-' + Date.now();
        await setDoc(doc(db, 'negocios', negocioId, 'admin_logs', id), {
            ...logData,
            negocio_id: negocioId,
            timestamp: new Date()
        });
    };

    const value = {
        users,
        currentUser,
        addUser,
        removeUser,
        updateUser,
        toggleUserStatus,
        addAdminLog,
        loginAdmin,
        logoutAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
