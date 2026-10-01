import React from 'react';
import { User, Phone, Users } from 'lucide-react';

export default function ReservationForm({ formData, setFormData, cancha, maxCapacity }) {
    const requiresPeopleCount = Boolean(cancha?.requiereCantidad);
    const hasExplicitCapacity = cancha?.capacidad && parseInt(cancha.capacidad) > 1;
    const limit = hasExplicitCapacity ? (maxCapacity !== undefined && maxCapacity !== null ? maxCapacity : parseInt(cancha.capacidad)) : null;

    return (
        <>
        <section className="space-y-4">
            <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-2 flex gap-2">
                <User size={14} className="text-indigo-500" /> Tus datos
            </h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-1">Nombre</label>
                    <input 
                        type="text"
                        placeholder="Ej: Juan"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-1">Apellido</label>
                    <input 
                        type="text"
                        placeholder="Ej: Perez"
                        value={formData.apellido}
                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-1">Teléfono</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Phone size={14} />
                    </div>
                    <input 
                        type="tel"
                        placeholder="11 2233 4455"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 pl-10 text-white text-sm focus:outline-none focus:border-indigo-500"
                        required
                    />
                </div>
            </div>
        </section>
        
        {/* Solo mostrar cantidad de personas si el espacio lo requiere explícitamente */}
        {requiresPeopleCount && (
            <section className="space-y-4 mt-6 animate-in fade-in duration-300">
                <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-2 flex gap-2">
                    <Users size={14} className="text-emerald-500" /> Cantidad de Personas / Asistentes
                </h3>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Cantidad de personas (incluyéndote)</label>
                        {limit !== null && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                {limit} {limit === 1 ? 'lugar disponible' : 'lugares disponibles'} {cancha?.capacidad ? `(Cap. Max: ${cancha.capacidad})` : ''}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Users size={14} />
                        </div>
                        <input 
                            type="number"
                            placeholder="Ej: 10"
                            min="1"
                            max={limit || undefined}
                            value={formData.cantidadPersonas !== undefined ? formData.cantidadPersonas : 1}
                            onChange={(e) => {
                                const rawVal = e.target.value;
                                if (rawVal === '') {
                                    setFormData({...formData, cantidadPersonas: ''});
                                    return;
                                }
                                const val = parseInt(rawVal, 10);
                                if (isNaN(val)) return;
                                if (limit !== null && val > limit) {
                                    setFormData({...formData, cantidadPersonas: limit});
                                } else {
                                    setFormData({...formData, cantidadPersonas: val});
                                }
                            }}
                            onBlur={() => {
                                if (!formData.cantidadPersonas || formData.cantidadPersonas < 1) {
                                    setFormData({...formData, cantidadPersonas: 1});
                                }
                            }}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 pl-10 text-white text-sm focus:outline-none focus:border-emerald-500"
                            required
                        />
                    </div>
                </div>
            </section>
        )}
        </>
    );
}
