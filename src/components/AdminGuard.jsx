import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminGuard({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const { negocioId } = useParams();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to the business-specific login page
        return <Navigate to={`/${negocioId}/login`} state={{ from: location }} replace />;
    }

    return children;
}
