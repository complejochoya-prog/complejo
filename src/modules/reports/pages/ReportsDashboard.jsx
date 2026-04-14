import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, TrendingUp, DollarSign, Package, ShoppingBag } from 'lucide-react';
import SalesChart from '../components/SalesChart';
import ProductsChart from '../components/ProductsChart';

export default function ReportsDashboard() {
    const { negocioId } = useParams();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [negocioId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Assuming this route will exist in the backend
            const res = await fetch(`/api/reports`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                throw new Error('Error al cargar reportes');
            }
            
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="animate-spin text-gold size-12" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center border border-red-500/20 bg-red-500/10 rounded-3xl">
                <p className="text-red-500 font-bold uppercase tracking-widest">{error}</p>
            </div>
        );
    }

    // Use fetched data or fallback to placeholders structure if empty for preview
    const ventasData = stats?.ventas?.length > 0 ? stats.ventas : [
        { date: "Lun", ventas: 0 },
        { date: "Mar", ventas: 0 },
        { date: "Mie", ventas: 0 },
        { date: "Jue", ventas: 0 },
        { date: "Vie", ventas: 0 }
    ];

    const productosData = stats?.productosTop?.length > 0 ? stats.productosTop : [
        { producto: "Sin datos", cantidad: 0 }
    ];

    return (
        <div className="p-4 md:p-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                        Analítica <span className="text-gold">Avanzada</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Inteligencia de Negocio en Tiempo Real
                    </p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Ingresos Totales" 
                    value={`$${stats?.resumen?.totalVentas || 0}`} 
                    icon={<DollarSign size={20} />} 
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                    border="border-emerald-500/20"
                />
                <StatCard 
                    title="Ventas Realizadas" 
                    value={stats?.resumen?.totalPedidos || 0} 
                    icon={<ShoppingBag size={20} />} 
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    border="border-blue-500/20"
                />
                <StatCard 
                    title="Productos Vendidos" 
                    value={stats?.resumen?.productosVendidos || 0} 
                    icon={<Package size={20} />} 
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                    border="border-purple-500/20"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart data={ventasData} />
                <ProductsChart data={productosData} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg, border }) {
    return (
        <div className={`p-6 rounded-3xl border bg-slate-900/50 backdrop-blur-sm ${border} flex flex-col justify-center`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{title}</p>
                    <h4 className={`text-3xl font-black tracking-tighter leading-none ${color}`}>{value}</h4>
                </div>
                <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
