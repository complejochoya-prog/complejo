import React, { useState, useMemo } from 'react';
import {
    Calendar, Phone, MessageCircle, Search,
    ChevronRight, MapPin, Clock, CreditCard,
    Filter, Download, ArrowUpDown, MoreVertical,
    CheckCircle2, AlertCircle, Clock3
} from 'lucide-react';
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';

export default function BookingHistory() {
    const { historicalBookings } = useReservas();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterResource, setFilterResource] = useState('All');

    const filteredHistory = useMemo(() => {
        return historicalBookings.filter(b => {
            const matchesSearch =
                b.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.clientPhone?.includes(searchTerm);

            const matchesResource = filterResource === 'All' || b.resource?.name === filterResource;

            return matchesSearch && matchesResource;
        });
    }, [historicalBookings, searchTerm, filterResource]);

    const resources = ['All', ...new Set(historicalBookings.map(b => b.resource?.name).filter(Boolean))];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completo': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Parcial': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Sin Pagar': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const handleWhatsApp = (phone) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        HISTORIAL DE <span className="text-gold">RESERVAS</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Registro permanente de todas las operaciones del complejo.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest italic hover:bg-white/10 transition-all flex items-center gap-2">
                        <Download size={16} /> Exportar
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-[32px]">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-gold/50 transition-all font-bold text-sm"
                    />
                </div>
                <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    {resources.map(res => (
                        <button
                            key={res}
                            onClick={() => setFilterResource(res)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterResource === res ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                        >
                            {res}
                        </button>
                    ))}
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                {filteredHistory.map((booking) => (
                    <div key={booking.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all group overflow-hidden relative">
                        <div className="flex flex-col xl:flex-row gap-8 items-center">
                            {/* Date & Time Column */}
                            <div className="flex flex-row xl:flex-col gap-4 items-center xl:border-r border-white/5 pr-8 shrink-0 min-w-[140px]">
                                <div className="size-16 rounded-[24px] bg-gold/10 flex flex-col items-center justify-center text-gold border border-gold/20">
                                    <span className="text-xl font-black italic leading-none">{booking.timestamp.getDate()}</span>
                                    <span className="text-[8px] uppercase font-bold tracking-tighter">{booking.timestamp.toLocaleString('es-AR', { month: 'short' })}</span>
                                </div>
                                <div className="text-center xl:text-left">
                                    <div className="flex items-center gap-2 text-white font-black italic text-sm">
                                        <Clock size={14} className="text-gold" />
                                        {booking.time || '--:--'}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{booking.timestamp.getFullYear()}</p>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Cliente</p>
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none">{booking.clientName || 'Sin Nombre'}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gold">
                                        <Phone size={10} />
                                        {booking.clientPhone || '---'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Recurso & Detalles</p>
                                    <h4 className="text-sm font-black italic text-white uppercase">{booking.resource?.name || 'Recurso'}</h4>
                                    <p className="text-[10px] font-medium text-slate-500">{booking.notes ? `"${booking.notes}"` : 'Sin observaciones'}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Monto & Pago</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black italic text-gold">${(booking.price || 0).toLocaleString()}</span>
                                        {booking.paymentMethod && (
                                            <span className="text-[8px] font-black text-slate-400 border border-white/10 px-2 py-0.5 rounded-full uppercase">{booking.paymentMethod}</span>
                                        )}
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current text-[8px] font-black uppercase tracking-widest ${getStatusColor(booking.paymentStatus || 'Sin Pagar')}`}>
                                        <CheckCircle2 size={10} /> {booking.paymentStatus || 'Sin Pagar'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end md:col-start-2 lg:col-start-4 gap-3">
                                    <button
                                        onClick={() => handleWhatsApp(booking.clientPhone)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-transform shadow-xl shadow-green-500/20"
                                    >
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                    <button className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-gold transition-colors border border-white/10">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
                            <Calendar size={180} className="text-white" />
                        </div>
                    </div>
                ))}

                {filteredHistory.length === 0 && (
                    <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-500">No se encontraron reservas</h3>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Probá ajustando los filtros o el término de búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
