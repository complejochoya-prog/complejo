import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../core/api/apiClient';
import { 
    Users, 
    TrendingUp, 
    DollarSign, 
    AlertCircle, 
    ShieldCheck, 
    Loader2,
    Settings,
    UserPlus
} from 'lucide-react';

/**
 * SUPERADMIN DASHBOARD - FRONTEND v5.0
 * Vista exclusiva para el dueño del SaaS para gestionar clientes y métricas de negocio.
 */
export default function SaasAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            // PETICIÓN REAL AL BACKEND SAAS
            const response = await apiRequest('/saas/metrics', {
                method: 'GET',
                headers: {
                    'X-User-Role': 'superadmin' // Bypass local storage for demo
                }
            });
            setStats(response.data);
        } catch (err) {
            console.error("Error loading SaaS metrics:", err);
            setError("No se pudo conectar con el motor SaaS. Verifica que el servidor esté prendido.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Conectando al Motor SaaS...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
            {/* Header SaaS */}
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
                        <ShieldCheck size={36} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">SaaS Power Panel</h1>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 italic">Mando Central de Negocios Giovanni</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <UserPlus size={16} />
                        Nuevo Cliente
                    </button>
                    <button onClick={loadData} className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10">
                        <TrendingUp size={18} />
                    </button>
                </div>
            </div>

            {error ? (
                <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center space-y-4">
                    <AlertCircle className="mx-auto text-red-500" size={48} />
                    <p className="text-sm font-bold text-red-100">{error}</p>
                    <button onClick={loadData} className="px-6 py-2 bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest">Reintentar</button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard 
                            title="MRR TOTAL" 
                            value={`$${stats?.mrr?.toLocaleString('es-AR')}`} 
                            sub="Ingreso Recurrente" 
                            icon={DollarSign} 
                            color="text-emerald-500" 
                        />
                        <MetricCard 
                            title="CLIENTES VIVOS" 
                            value={stats?.activos} 
                            sub={`Total: ${stats?.total_clientes}`} 
                            icon={Users} 
                            color="text-blue-500" 
                        />
                        <MetricCard 
                            title="CHURN RATE" 
                            value={stats?.churn_rate} 
                            sub="Clientes perdidos" 
                            icon={AlertCircle} 
                            color="text-rose-500" 
                        />
                        <MetricCard 
                            title="EXPANSIÓN" 
                            value="+15%" 
                            sub="Este mes" 
                            icon={TrendingUp} 
                            color="text-cyan-500" 
                        />
                    </div>

                    {/* Plans Distribution & Growth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Uso de Planes</h3>
                            <div className="space-y-6">
                                <PlanProgress label="PLAN BASIC" count={stats?.planes?.BASIC} total={stats?.total_clientes} color="bg-slate-500" />
                                <PlanProgress label="PLAN PRO" count={stats?.planes?.PRO} total={stats?.total_clientes} color="bg-blue-500" />
                                <PlanProgress label="PLAN PREMIUM" count={stats?.planes?.PREMIUM} total={stats?.total_clientes} color="bg-emerald-500" />
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] flex flex-col justify-center">
                             <div className="text-center space-y-2">
                                <h3 className="text-4xl font-black italic tracking-tighter text-blue-500">SISTEMA OK</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Motor de Facturación v5.0 Activo</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ title, value, sub, icon: Icon, color }) {
    return (
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] hover:border-white/10 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
            </div>
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">{title}</p>
            <h4 className="text-3xl font-black italic tracking-tighter mb-1">{value}</h4>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{sub}</p>
        </div>
    );
}

function PlanProgress({ label, count, total, color }) {
    const percent = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
                <span className="text-xs font-black text-white">{count}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000`} 
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
