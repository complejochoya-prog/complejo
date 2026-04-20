import React, { useEffect, useState } from 'react';
import { 
    Calendar, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    User, 
    Phone, 
    CreditCard, 
    Timer, 
    MapPin,
    ChevronRight,
    MoreHorizontal,
    XCircle,
    Download
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useReservas } from '../../reservas/services/ReservasContext';
import { db } from '../../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { addMovement } from '../../../core/services/cajaService'; // Import integration

export default function ReservasPage() {
    const { negocioId } = useParams();
    const { bookings: reservas, resources: listEspacios } = useReservas();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const canchas = {};
    listEspacios.forEach(c => canchas[c.id || c.id] = c.name || c.nombre || c.id);

    const updateReservaStatus = async (id, newStatus) => {
        try {
            const resData = reservas.find(r => r.id === id);
            
            const ref = doc(db, 'negocios', negocioId, 'reservas', id);
            await updateDoc(ref, { 
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            // 🔥 INTEGRACIÓN CAJA MÁGICA: Record income if confirmed
            if (newStatus === 'confirmada' && resData) {
                await addMovement(negocioId, {
                    monto: parseFloat(resData.precio) || 0,
                    tipo: 'entrada',
                    categoria: 'Reserva Cancha',
                    metodoPago: resData.metodoPago || resData.pago?.toLowerCase() || 'efectivo',
                    descripcion: `Reserva: ${resData.cliente?.nombre || ''} - ${canchas[resData.canchaId] || 'Cancha'}`,
                    origen: 'reservas',
                    usuario: 'Admin', // In a real app, get current user
                    metadata: {
                        reservaId: id,
                        cliente: resData.cliente?.nombre,
                        fecha: resData.fecha
                    }
                });
            }
        } catch (e) {
            console.error("Error updating status/caja:", e);
        }
    };

    const filtered = reservas.filter(res => {
        const matchSearch = ((res.cliente?.nombre || '') + ' ' + (res.cliente?.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (res.cliente?.telefono || '').includes(searchTerm);
        const matchDate = filterDate ? res.fecha === filterDate : true;
        return matchSearch && matchDate;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'confirmada': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelada': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    // Logic for Visual Grid
    const diurnos = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const nocturnos = ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'];
    const allHours = [...diurnos, ...nocturnos];
    const targetDate = filterDate || new Date().toISOString().split('T')[0];

    const isSlotOccupied = (canchaId, hora) => {
        return reservas.some(res => 
            res.canchaId === canchaId && 
            res.fecha === targetDate && 
            res.status !== 'cancelada' && 
            res.hora.split(' - ').includes(hora)
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        GESTIÓN DE <span className="text-indigo-500">RESERVAS</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                        Control total de turnos y reservas de clientes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Download size={16} /> Exportar
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Calendar size={18} /> Nuevo Turno
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all uppercase"
                    />
                </div>
                <div className="relative group">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <select className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all appearance-none uppercase tracking-widest">
                        <option>Todos los Estados</option>
                        <option>Confirmadas</option>
                        <option>Pendientes</option>
                        <option>Completadas</option>
                        <option>Canceladas</option>
                    </select>
                </div>
            </div>

            {/* Visual Grid */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Estado de Ocupación</h3>
                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{targetDate} {targetDate === new Date().toISOString().split('T')[0] ? '(HOY)' : ''}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Ocupado</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar pb-4">
                    <div className="inline-flex flex-col gap-4 min-w-full">
                        {/* Hours Header */}
                        <div className="flex gap-2 mb-2">
                            <div className="w-32 flex-none italic text-[10px] uppercase font-black text-slate-600 flex items-center justify-center">ESPACIO</div>
                            {allHours.map(h => (
                                <div key={h} className="w-12 flex-none text-[9px] font-black italic text-slate-500 flex items-center justify-center">
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* Space Rows */}
                        {Object.keys(canchas).map(cId => (
                            <div key={cId} className="flex gap-2 items-center group">
                                <div className="w-32 flex-none px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase truncate tracking-tight text-slate-300 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all text-center">
                                    {canchas[cId]}
                                </div>
                                {allHours.map(h => {
                                    const occupied = isSlotOccupied(cId, h);
                                    return (
                                        <div 
                                            key={h} 
                                            title={`${canchas[cId]} - ${h} hs: ${occupied ? 'OCUPADO' : 'DISPONIBLE'}`}
                                            className={`w-12 h-10 flex-none rounded-xl border transition-all ${
                                                occupied 
                                                ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)] z-10' 
                                                : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Espacio</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha y Hora</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Pago</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length > 0 ? filtered.map((res) => (
                                <tr key={res.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic uppercase tracking-tighter text-white">
                                                    {res.cliente?.nombre} {res.cliente?.apellido}
                                                </p>
                                                <p className="text-[10px] flex items-center gap-1 text-slate-500 font-bold uppercase tracking-widest">
                                                    <Phone size={10} className="text-slate-600" /> {res.cliente?.telefono}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-500" />
                                            <span className="text-xs font-black uppercase italic tracking-tight text-slate-300">
                                                {canchas[res.canchaId] || 'Cargando...'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <Calendar size={14} />
                                                <span className="text-xs font-black uppercase italic tracking-tight">{res.fecha}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock size={14} />
                                                <span className="text-xs font-black uppercase italic tracking-tight">{res.hora} hs</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <CreditCard size={14} />
                                                <span className="text-sm font-black italic tracking-tighter">${parseInt(res.precio || 0).toLocaleString()}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{res.pago}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(res.status)}`}>
                                            <Timer size={12} /> {res.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => updateReservaStatus(res.id, 'confirmada')}
                                                className={`p-2 bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 rounded-xl border border-white/5 transition-all ${res.status === 'confirmada' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => updateReservaStatus(res.id, 'cancelada')}
                                                className={`p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl border border-white/5 transition-all ${res.status === 'cancelada' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                            <button className="p-2 bg-white/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 rounded-xl border border-white/5 transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-600">
                                            <Calendar size={48} className="opacity-20" />
                                            <p className="text-xs font-black uppercase tracking-widest">No hay reservas registradas</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
