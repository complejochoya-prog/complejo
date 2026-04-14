import React, { useState, useEffect } from 'react';
import { usePedidos } from '../services/PedidosContext';
import {
    Clock,
    Save,
    CheckCircle2,
    Power,
    PowerOff,
    ChefHat,
    Beer,
    AlertTriangle,
    Sun,
    Moon,
    XCircle
} from 'lucide-react';

const DAY_LABELS = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
};

const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function BarSchedule() {
    const { barSchedule, updateBarSchedule, toggleKitchenClosed, isBarOpen, isKitchenOpen } = usePedidos();
    const [localSchedule, setLocalSchedule] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [barOpen, setBarOpen] = useState(false);
    const [kitchenOpen, setKitchenOpen] = useState(false);

    // Init local copy from context
    useEffect(() => {
        if (barSchedule) {
            setLocalSchedule(JSON.parse(JSON.stringify(barSchedule)));
        }
    }, [barSchedule]);

    // Live status refresh every 30 seconds
    useEffect(() => {
        const update = () => {
            setBarOpen(isBarOpen());
            setKitchenOpen(isKitchenOpen());
        };
        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [barSchedule]);

    if (!localSchedule) return null;

    const updateDay = (dayKey, field, value) => {
        setLocalSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [dayKey]: {
                    ...prev.days[dayKey],
                    ...(typeof field === 'string' ? { [field]: value } : field)
                }
            }
        }));
    };

    const updateBarHour = (dayKey, which, value) => {
        setLocalSchedule(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [dayKey]: {
                    ...prev.days[dayKey],
                    bar: { ...prev.days[dayKey].bar, [which]: value }
                }
            }
        }));
    };

    const updateKitchenShift = (dayKey, shiftIdx, which, value) => {
        setLocalSchedule(prev => {
            const newShifts = [...prev.days[dayKey].kitchen.shifts];
            newShifts[shiftIdx] = { ...newShifts[shiftIdx], [which]: value };
            return {
                ...prev,
                days: {
                    ...prev.days,
                    [dayKey]: {
                        ...prev.days[dayKey],
                        kitchen: { shifts: newShifts }
                    }
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateBarSchedule(localSchedule);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Error saving bar schedule:', err);
            alert('Error al guardar. Intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleKitchen = async () => {
        await toggleKitchenClosed();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                        HORARIOS DEL <span className="text-gold">BAR</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        Configuración de horarios de Bar y Cocina • Impacto en Bar Online, Mozo y Delivery
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 rounded-2xl bg-gold text-slate-950 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-gold/20 flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {saving ? (
                        <span className="animate-spin"><Clock size={16} /></span>
                    ) : saved ? (
                        <><CheckCircle2 size={16} /> Guardado</>
                    ) : (
                        <><Save size={16} /> Guardar Configuración</>
                    )}
                </button>
            </div>

            {/* Live Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-[24px] border transition-all ${barOpen ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${barOpen ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            <Beer size={20} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Estado Bar</p>
                            <p className={`text-lg font-black uppercase italic tracking-tighter ${barOpen ? 'text-green-500' : 'text-red-500'}`}>
                                {barOpen ? 'ABIERTO' : 'CERRADO'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-[24px] border transition-all ${kitchenOpen ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${kitchenOpen ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                            <ChefHat size={20} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Estado Cocina</p>
                            <p className={`text-lg font-black uppercase italic tracking-tighter ${kitchenOpen ? 'text-green-500' : 'text-orange-500'}`}>
                                {kitchenOpen ? 'ABIERTA' : (barSchedule.kitchenTemporarilyClosed ? 'CERRADA (TEMP)' : 'CERRADA')}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Kitchen Temporary Close Toggle */}
                <button
                    onClick={handleToggleKitchen}
                    className={`p-6 rounded-[24px] border transition-all text-left hover:scale-[1.02] active:scale-95 ${barSchedule.kitchenTemporarilyClosed
                        ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-orange-500/30'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${barSchedule.kitchenTemporarilyClosed ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                            {barSchedule.kitchenTemporarilyClosed ? <XCircle size={20} /> : <PowerOff size={20} />}
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Acción Rápida</p>
                            <p className={`text-sm font-black uppercase italic tracking-tighter ${barSchedule.kitchenTemporarilyClosed ? 'text-red-500' : 'text-white'}`}>
                                {barSchedule.kitchenTemporarilyClosed ? '🔴 Cocina Cerrada — Reabrir' : 'Cerrar Cocina Temporalmente'}
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Kitchen Closed Warning */}
            {barSchedule.kitchenTemporarilyClosed && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-6 flex items-center gap-4 animate-in slide-in-from-top-4">
                    <AlertTriangle size={24} className="text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-red-500 uppercase italic tracking-tighter">Cocina cerrada temporalmente</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            No se aceptarán pedidos de Platos y Postres hasta que se reactive. Bebidas y Tragos siguen disponibles.
                        </p>
                    </div>
                </div>
            )}

            {/* Days Grid */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Configuración por Día</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {DAY_ORDER.map(dayKey => {
                        const day = localSchedule.days[dayKey];
                        return (
                            <div
                                key={dayKey}
                                className={`rounded-[28px] border transition-all duration-300 overflow-hidden ${day.enabled
                                    ? 'bg-white/[0.02] border-white/10 hover:border-gold/20'
                                    : 'bg-red-500/[0.03] border-red-500/10 opacity-60'
                                    }`}
                            >
                                {/* Day Header */}
                                <div className="flex items-center justify-between p-5 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-xl flex items-center justify-center ${day.enabled ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
                                            {day.enabled ? <Power size={18} /> : <PowerOff size={18} />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{DAY_LABELS[dayKey]}</h3>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                {day.enabled ? 'Activo' : 'Desactivado — No se aceptan pedidos'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateDay(dayKey, 'enabled', !day.enabled)}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${day.enabled ? 'bg-gold shadow-md shadow-gold/30' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 size-5 rounded-full bg-white shadow-md transition-all duration-300 ${day.enabled ? 'left-8' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* Day Config */}
                                {day.enabled && (
                                    <div className="p-5 space-y-5">
                                        {/* BAR Hours */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Beer size={14} className="text-gold" />
                                                <span className="text-[9px] font-black text-gold uppercase tracking-widest">Horario Bar</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Sun size={10} /> Apertura
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={day.bar.open}
                                                        onChange={(e) => updateBarHour(dayKey, 'open', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-gold/40 transition-all [color-scheme:dark]"
                                                    />
                                                </div>
                                                <div className="text-slate-600 font-black mt-5">→</div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Moon size={10} /> Cierre
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={day.bar.close}
                                                        onChange={(e) => updateBarHour(dayKey, 'close', e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-gold/40 transition-all [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* KITCHEN Hours */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <ChefHat size={14} className="text-orange-400" />
                                                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Horario Cocina</span>
                                            </div>
                                            {day.kitchen.shifts.map((shift, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest shrink-0 w-16">
                                                        Turno {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <input
                                                            type="time"
                                                            value={shift.open}
                                                            onChange={(e) => updateKitchenShift(dayKey, idx, 'open', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs font-black text-white outline-none focus:border-orange-400/40 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                    <span className="text-slate-600 font-black">→</span>
                                                    <div className="flex-1">
                                                        <input
                                                            type="time"
                                                            value={shift.close}
                                                            onChange={(e) => updateKitchenShift(dayKey, idx, 'close', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/5 rounded-lg p-2 text-xs font-black text-white outline-none focus:border-orange-400/40 transition-all [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Impact Info Footer */}
            <footer className="bg-gold/10 border border-gold/20 rounded-[32px] p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h5 className="text-lg font-black italic uppercase tracking-tighter text-white">Impacto Automático</h5>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                            Los cambios de horarios afectan a: Bar Online (Menú Digital) • Mozo App • Delivery App
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl">
                            <p className="text-[8px] font-black text-gold uppercase tracking-widest">Bar Online</p>
                        </div>
                        <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl">
                            <p className="text-[8px] font-black text-gold uppercase tracking-widest">Mozo</p>
                        </div>
                        <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl">
                            <p className="text-[8px] font-black text-gold uppercase tracking-widest">Delivery</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Save Success Toast */}
            {saved && (
                <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-4 font-black uppercase text-xs tracking-widest italic">
                    <CheckCircle2 size={20} />
                    Horarios guardados correctamente
                </div>
            )}
        </div>
    );
}
