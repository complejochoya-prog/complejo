import React from 'react';
import { Trophy } from 'lucide-react';
import { useConfig } from "../services/ConfigContext";
import SubscriptionExpired from "../../modules/core/pages/SubscriptionExpired";

export default function ModuleGuard({ children, moduleId }) {
    const { config, isExpired, loading } = useConfig();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest text-[10px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    Cargando módulo...
                </div>
            </div>
        );
    }

    // BLOCKER: Subscription Expired
    // Only allow "core" (home) and background stuff. Administrative modules are blocked.
    if (isExpired && moduleId !== "core") {
        return <SubscriptionExpired />;
    }

    const activeModules = config?.activeModules || [];

    // If no activeModules configured at all, allow everything (dev/setup mode)
    if (activeModules.length === 0 || moduleId === "core") {
        return children;
    }

    if (!activeModules.includes(moduleId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-10 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
                    <Trophy size={48} className="mx-auto mb-4 text-red-400" />
                    <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Acceso Restringido</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Módulo no disponible en tu plan.
                    </p>
                    <button 
                        className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
                        onClick={() => window.history.back()}
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }

    return children;
}