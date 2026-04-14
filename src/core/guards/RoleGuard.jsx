/**
 * RoleGuard — Blocks access if user doesn't have the required role.
 * Roles: admin, mozo, superadmin, cliente
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleGuard({ allowedRoles, children }) {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // If no roles specified, allow anyone
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={`${location.pathname.split('/').slice(0, 2).join('/')}/login`} state={{ from: location }} replace />;
    }

    // Check role
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-2">
                    Acceso Restringido
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                    No tienes permisos para acceder a esta sección.
                </p>
            </div>
        );
    }

    return children;
}
