/**
 * ModuleGuard — Checks if a module is active for the current business.
 * Shows a "not enabled" screen if the module is inactive.
 */
import React from 'react';
import { useConfig } from '../services/ConfigContext';
import { ShieldOff } from 'lucide-react';

export default function ModuleGuard({ moduleId, children }) {
    const { activeModules, loading, negocioId } = useConfig();

    if (loading) return null;

    // 'giovanni' (owner) and core modules always pass
    if (negocioId === 'giovanni' || moduleId === 'core' || moduleId === 'admin') {
        return children;
    }

    if (!activeModules.includes(moduleId)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <ShieldOff size={36} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-2">
                    Módulo No Habilitado
                </h2>
                <p className="text-sm text-slate-500 font-medium max-w-xs">
                    Este módulo no está habilitado para este negocio. Contacte al administrador de la plataforma.
                </p>
            </div>
        );
    }

    return children;
}
