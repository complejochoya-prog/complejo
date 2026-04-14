import React, { useState } from "react";
import { useConfig } from '../../core/services/ConfigContext';
import { useReservas } from '../services/ReservasContext';
import {
    Calendar, Clock, Shield, Trash2, Plus, Check, X,
    AlertTriangle, Wrench, CloudRain, PartyPopper, Ban
} from 'lucide-react';

const RESOURCE_OPTIONS = [
    { id: 'todos', label: 'TODOS LOS ESPACIOS', icon: '🏟️' },
    { id: 'futbol', label: 'FÚTBOL', icon: '⚽' },
    { id: 'voley', label: 'VÓLEY', icon: '🏐' },
    { id: 'piscina', label: 'PISCINA', icon: '🏊' },
    { id: 'quincho', label: 'QUINCHO', icon: '🍖' },
    { id: 'evento', label: 'EVENTO', icon: '🎪' },
];

const REASON_OPTIONS = [
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'clima', label: 'Clima Adverso', icon: CloudRain, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'evento', label: 'Evento Privado', icon: PartyPopper, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { id: 'otro', label: 'Otro', icon: Ban, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
];

export default function ScheduleBlock() {
    const { scheduleBlocks, addScheduleBlock, removeScheduleBlock, resources } = useReservas();

    // Form state
    const [selectedResource, setSelectedResource] = useState('todos');
    const [date, setDate] = useState('');
    const [timeFrom, setTimeFrom] = useState('08:00');
    const [timeTo, setTimeTo] = useState('22:00');
    const [reason, setReason] = useState('mantenimiento');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!date) {
            setError('Debe seleccionar una fecha.');
            return;
        }
        if (!timeFrom || !timeTo) {
            setError('Debe seleccionar hora desde y hasta.');
            return;
        }
        if (timeFrom >= timeTo) {
            setError('La hora "Desde" debe ser menor que "Hasta".');
            return;
        }

        setIsSaving(true);
        try {
            const resourceLabel = RESOURCE_OPTIONS.find(r => r.id === selectedResource)?.label || selectedResource;
            await addScheduleBlock({
                resourceId: selectedResource,
                resourceLabel,
                date,
                timeFrom,
                timeTo,
                reason,
            });
            setSuccessMessage('Bloqueo guardado correctamente');
            setTimeout(() => setSuccessMessage(''), 3000);
            // Reset form
            setDate('');
            setTimeFrom('08:00');
            setTimeTo('22:00');
            setReason('mantenimiento');
        } catch (err) {
            console.error('Error saving block:', err);
            setError('Error al guardar el bloqueo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (blockId) => {
        if (window.confirm('¿Eliminar este bloqueo? Los horarios volverán a estar disponibles.')) {
            try {
                await removeScheduleBlock(blockId);
            } catch (err) {
                console.error('Error deleting block:', err);
            }
        }
    };

    // Sort blocks: future first, then by date
    const sortedBlocks = [...scheduleBlocks].sort((a, b) => {
        if (a.date !== b.date) return a.date > b.date ? -1 : 1;
        return a.timeFrom > b.timeFrom ? -1 : 1;
    });

    const today = new Date().toISOString().split('T')[0];

    const getReasonConfig = (reasonId) => REASON_OPTIONS.find(r => r.id === reasonId) || REASON_OPTIONS[3];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
                    <Check size={16} className="inline mr-2" />
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        HORARIO & <span className="text-red-500">BLOQUEOS</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Gestión de disponibilidad de espacios y recursos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2">
                        <Shield size={16} className="text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                            {scheduleBlocks.length} Bloqueos Activos
                        </span>
                    </div>
                </div>
            </div>

            {/* Create Block Form */}
            <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-red-500/20 rounded-[32px] p-8 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-tighter italic text-red-500 flex items-center gap-2">
                    <AlertTriangle size={18} /> Crear Nuevo Bloqueo
                </h3>

                {/* Resource Selection */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Seleccionar Espacio</label>
                    <div className="flex flex-wrap gap-2">
                        {RESOURCE_OPTIONS.map(res => (
                            <button
                                key={res.id}
                                type="button"
                                onClick={() => setSelectedResource(res.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedResource === res.id
                                    ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-red-500/30 hover:text-white'
                                    }`}
                            >
                                <span>{res.icon}</span>
                                {res.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                            <Calendar size={12} className="text-red-500" /> Fecha
                        </label>
                        <input
                            type="date"
                            value={date}
                            min={today}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 transition-all text-sm font-bold text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                            <Clock size={12} className="text-green-500" /> Hora Desde
                        </label>
                        <input
                            type="time"
                            value={timeFrom}
                            onChange={e => setTimeFrom(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 transition-all text-sm font-bold text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                            <Clock size={12} className="text-red-500" /> Hora Hasta
                        </label>
                        <input
                            type="time"
                            value={timeTo}
                            onChange={e => setTimeTo(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 transition-all text-sm font-bold text-white"
                            required
                        />
                    </div>
                </div>

                {/* Reason */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Motivo del Bloqueo</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {REASON_OPTIONS.map(r => {
                            const Icon = r.icon;
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setReason(r.id)}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${reason === r.id
                                        ? r.color + ' shadow-lg'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {r.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm font-black text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                        {error}
                    </p>
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-5 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400 hover:scale-105 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : <><Ban size={16} /> Bloquear Horario</>}
                    </button>
                </div>
            </form>

            {/* Active Blocks List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                        <span className="text-red-500">●</span> Bloqueos Activos
                    </h2>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {sortedBlocks.length} registros
                    </span>
                </div>

                {sortedBlocks.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-16 flex flex-col items-center justify-center text-center opacity-50">
                        <Shield size={48} strokeWidth={1} className="text-slate-600 mb-4" />
                        <p className="text-xs font-black uppercase italic tracking-widest text-slate-500">
                            Sin bloqueos activos
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                            Todos los espacios están disponibles
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sortedBlocks.map(block => {
                            const reasonConfig = getReasonConfig(block.reason);
                            const ReasonIcon = reasonConfig.icon;
                            const isPast = block.date < today;

                            return (
                                <div
                                    key={block.id}
                                    className={`bg-white/[0.03] border rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isPast
                                        ? 'border-white/5 opacity-40'
                                        : 'border-red-500/20 hover:border-red-500/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`size-14 rounded-2xl flex items-center justify-center border ${reasonConfig.color}`}>
                                            <ReasonIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">
                                                {block.resourceLabel || block.resourceId}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                                    <Calendar size={12} className="text-red-500" />
                                                    {new Date(block.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                                                    <Clock size={12} className="text-red-500" />
                                                    {block.timeFrom} – {block.timeTo}
                                                </span>
                                                {isPast && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-2 py-0.5 rounded">
                                                        Pasado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${reasonConfig.color}`}>
                                            {reasonConfig.label}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(block.id)}
                                            className="p-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            title="Eliminar bloqueo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
