import React, { useEffect, useState } from 'react';
import { CalendarRange, Coins, Users } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../core/services/ConfigContext';
import { useEmployeeAuth } from '../hooks/useEmployeeAuth';
import EmployeeNavbar from '../components/EmployeeNavbar';
import ReservationList from '../components/ReservationList';
import TaskCard from '../components/TaskCard';
import { fetchEmployeeReservations, updateReservationStatus } from '../services/employeeService';

export default function ReceptionDashboard() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { employeeUser, logout } = useEmployeeAuth(negocioId);
    
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!employeeUser) return navigate(`/${negocioId}/empleados`);
        if (employeeUser.role !== 'recepcion' && employeeUser.role !== 'admin') {
            return navigate(`/${negocioId}/empleados/${employeeUser.role}`);
        }

        const init = async () => {
            const data = await fetchEmployeeReservations(negocioId, 'hoy');
            setReservas(data);
            setLoading(false);
        };
        init();
    }, [employeeUser, negocioId, navigate]);

    const handleChangeStatus = async (id, field, value) => {
        const res = await updateReservationStatus(negocioId, id, field, value);
        if (res.success) {
            setReservas(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in slide-in-from-left-8 duration-500">
            <EmployeeNavbar roleName={employeeUser.name} onLogout={logout} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex gap-6 lg:gap-10 flex-col lg:flex-row max-w-7xl mx-auto w-full">
                
                {/* Panel Central: Llegadas & Reservas */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-indigo-400">
                        Monitor de Llegadas
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-900 border border-indigo-500/20 p-5 rounded-3xl shadow-lg">
                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest"><Users size={12} className="inline mr-1" /> Jugando</span>
                            <div className="text-3xl font-black italic text-white mt-1">{reservas.filter(r => r.estado === 'jugando').length}</div>
                        </div>
                        <div className="bg-slate-900 border border-emerald-500/20 p-5 rounded-3xl shadow-lg">
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest"><Coins size={12} className="inline mr-1" /> Cobradas</span>
                            <div className="text-3xl font-black italic text-white mt-1">{reservas.filter(r => r.pago_estado === 'pagado').length}</div>
                        </div>
                        <div className="bg-slate-900 border border-amber-500/20 p-5 gap-1 rounded-3xl shadow-lg flex-col justify-center hidden md:flex cursor-pointer hover:bg-slate-800 transition-colors">
                            <CalendarRange className="text-amber-500" size={24} />
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">+ Crear Sobreturno</span>
                        </div>
                    </div>

                    <ReservationList 
                        reservas={reservas} 
                        onChangeStatus={handleChangeStatus} 
                    />
                </div>

                {/* Sidebar Izquierdo: Tareas de Turno */}
                <div className="w-full lg:w-80 space-y-6">
                    <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-900 p-2 rounded-lg inline-flex mb-2">Checklist Turno Tarde</h3>
                    <div className="space-y-3">
                        <TaskCard title="Caja Fuerte" desc="Verificar el fondo antes del partido de las 20hs." time="19:45" />
                        <TaskCard title="Limpieza Baños" desc="Supervisar vestuarios femeninos antes de la liga." time="21:00" />
                        <TaskCard title="Luces Principales" desc="Las canchas exteriores prenden 19:30 automágicas." time="19:30" isDone onToggle={() => {}} />
                    </div>
                </div>

            </div>
        </div>
    );
}
