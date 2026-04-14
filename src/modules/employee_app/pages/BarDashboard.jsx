import React, { useEffect, useState } from 'react';
import { Coffee, RotateCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { useEmployeeAuth } from '../hooks/useEmployeeAuth';
import EmployeeNavbar from '../components/EmployeeNavbar';
import OrderCard from '../components/OrderCard';
import { fetchEmployeeOrders, updateOrderStatus } from '../services/employeeService';

export default function BarDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { employeeUser, logout } = useEmployeeAuth(negocioId);
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!employeeUser) return navigate(`/${negocioId}/empleados`);
        if (employeeUser.role !== 'bar' && employeeUser.role !== 'admin') {
            return navigate(`/${negocioId}/empleados/${employeeUser.role}`);
        }

        const init = async () => {
            const data = await fetchEmployeeOrders(negocioId, 'bar');
            setOrders(data);
            setLoading(false);
        };
        init();
    }, [employeeUser, negocioId, navigate]);

    const handleChangeStatus = async (id, newStatus) => {
        const res = await updateOrderStatus(negocioId, id, newStatus);
        if (res.success) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: newStatus } : o));
        }
    };

    if (loading) return null;

    const preparing = orders.filter(o => o.estado === 'preparando');
    const pending = orders.filter(o => o.estado === 'pendiente');

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in slide-in-from-right-8 duration-500">
            <EmployeeNavbar roleName={employeeUser.name} onLogout={logout} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-emerald-400">
                            Estación Bar
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Tickets Abiertos: {pending.length + preparing.length}
                        </p>
                    </div>
                </header>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Columna Pendientes */}
                    <div className="flex-1 bg-slate-900/30 border border-amber-500/10 rounded-[32px] p-6">
                        <h3 className="text-sm text-amber-500 font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            Bandeja de Entrada 
                            <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">{pending.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {pending.map(o => (
                                <OrderCard key={o.id} order={o} onChangeStatus={handleChangeStatus} />
                            ))}
                        </div>
                    </div>

                    {/* Columna Preparando */}
                    <div className="flex-1 bg-slate-900/30 border border-emerald-500/10 rounded-[32px] p-6">
                        <h3 className="text-sm text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                            En Preparación
                            <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">{preparing.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {preparing.map(o => (
                                <OrderCard key={o.id} order={o} onChangeStatus={handleChangeStatus} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
