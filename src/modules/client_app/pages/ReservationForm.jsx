import React from 'react';
import { User, Phone, Users } from 'lucide-react';

export default function ReservationForm({ formData, setFormData, cancha }) {
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
        
        {cancha?.capacidad && (
            <section className="space-y-4 mt-6">
                <h3 className="text-[10px] items-center text-slate-400 font-black uppercase tracking-widest mb-2 flex gap-2">
                    <Users size={14} className="text-emerald-500" /> Acompañantes
                </h3>
                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-1">Cantidad de personas (incluyéndote)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Users size={14} />
                        </div>
                        <input 
                            type="number"
                            placeholder="Ej: 3"
                            min="1"
                            value={formData.cantidadPersonas || 1}
                            onChange={(e) => setFormData({...formData, cantidadPersonas: parseInt(e.target.value) || 1})}
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
