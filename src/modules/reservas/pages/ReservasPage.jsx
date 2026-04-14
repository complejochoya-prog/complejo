import React, { useState } from 'react';

const instalaciones = [
    { id: 1, nombre: 'Fútbol 5', precio: 'Diurno: $5000 / Nocturno: $7000' },
    { id: 2, nombre: 'Vóley', precio: 'Diurno: $4000 / Nocturno: $6000' },
    { id: 3, nombre: 'Piscina', precio: '$1500 por persona/hora' },
    { id: 4, nombre: 'Quincho', precio: 'Turno: $15000' },
];

export default function SeccionReservas() {
    const [seleccion, setSeleccion] = useState(null);

    return (
        <div className="py-10 max-w-4xl mx-auto px-4">
            <h2 className="title-sport text-3xl text-giovanni-gold mb-8 text-center">Reservas Online</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instalaciones.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSeleccion(item)}
                        className={`glass p-8 text-left transition-all ${seleccion?.id === item.id
                                ? 'border-giovanni-gold bg-giovanni-gold/10'
                                : 'hover:bg-white/5'
                            }`}
                    >
                        <h3 className="title-sport text-xl mb-2">{item.nombre}</h3>
                        <p className="text-slate-400 text-sm">{item.precio}</p>
                    </button>
                ))}
            </div>

            {seleccion && (
                <div className="mt-10 glass p-8 border-giovanni-green/20 animate-in">
                    <h3 className="title-sport text-xl mb-6 italic text-giovanni-green">
                        Paso 2: Datos de Contacto
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-giovanni-green text-white"
                        />
                        <input
                            type="tel"
                            placeholder="WhatsApp (Ej: 385...)"
                            className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-giovanni-green text-white"
                        />
                        <button className="w-full bg-giovanni-green text-black font-bold py-4 rounded-3xl title-sport mt-4 hover:scale-105 transition-transform">
                            Confirmar por WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}