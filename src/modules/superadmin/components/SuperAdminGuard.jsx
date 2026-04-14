/**
 * SuperAdmin Guard
 * Protects routes by checking for a valid SuperAdmin session.
 * Redirects to /superadmin/login if not authenticated.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '../services/SuperAdminAuthContext';

export default function SuperAdminGuard({ children }) {
    const { isAuthenticated, loading } = useSuperAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-inter">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="font-bold italic uppercase tracking-tighter text-violet-400 opacity-50">GIOVANNI SaaS</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Store the attempted URL to redirect back after login
        return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
    }

    return children;
}
