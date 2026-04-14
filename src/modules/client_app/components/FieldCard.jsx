import React from 'react';
import { MapPin, Calendar, Utensils } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function FieldCard({ field }) {
    const navigate = useNavigate();
    const { negocioId } = useParams();

    const handleReserve = (e) => {
        // Obsolete, keep for any external bindings but ideally unused now
    };

    // Support multiple field formats from the unified database
    const fieldType = field.tipo || field.type || field.desc || '';
    const fieldName = field.nombre || field.name || field.title || '';
    const fieldPrice = field.precio || field.precio_diurno || 0;
    const fieldImg = field.img || null;

    const isBar = fieldName.toLowerCase().includes('bar') || fieldType.toLowerCase().includes('bar') || fieldName.toLowerCase().includes('restaurante');
    const isFutbol = fieldType.toLowerCase().includes('fútbol') || fieldType.toLowerCase().includes('futbol');
    const color = isBar ? 'amber' : isFutbol ? 'orange' : 'indigo';

    const handleAction = (e) => {
        e.stopPropagation();
        const base = negocioId || 'giovanni';
        if (isBar) {
            navigate(`/${base}/menu`);
        } else {
            navigate(`/${base}/app/reservar/${field.id}`);
        }
    };

    return (
        <div 
            onClick={handleAction}
            className="bg-slate-900 border border-white/5 rounded-[40px] flex flex-col group active:scale-[0.98] transition-all cursor-pointer shadow-xl relative overflow-hidden h-full"
        >
            {/* Imagen de fondo si existe */}
            {fieldImg ? (
                <div className="h-28 relative overflow-hidden">
                    <img src={fieldImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" alt={fieldName} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
                        <span className="text-sm font-black italic tracking-tighter text-amber-500">
                            ${fieldPrice.toLocaleString()}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="p-5 flex items-center justify-between z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-${color}-500/20 text-${color}-400 flex items-center justify-center`}>
                        <MapPin size={24} />
                    </div>
                    {fieldPrice > 0 && (
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 text-right">
                            <span className="text-lg font-black italic tracking-tighter block leading-none text-white">
                                ${fieldPrice.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            )}
            
            <div className="p-5 pt-2 flex-col flex-1 z-10">
                <div className="mb-4">
                    <h4 className="text-[11px] font-black uppercase tracking-tight text-white mb-0.5 truncate leading-tight">{fieldName}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {fieldType}
                    </p>
                </div>

                <button
                    onClick={handleAction}
                    className={`mt-auto w-full bg-white text-slate-950 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all hover:bg-white/90 active:scale-95 shadow-lg shadow-white/5`}
                >
                    {isBar ? <Utensils size={14} /> : <Calendar size={14} />}
                    {isBar ? 'Ver Menú' : 'Reservar'}
                </button>
            </div>
        </div>
    );
}
