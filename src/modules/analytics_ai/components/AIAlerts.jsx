import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Zap } from 'lucide-react';

export default function AIAlerts({ alertas = [], promociones = [] }) {
    if (!alertas.length && !promociones.length) return null;

    return (
        <div className="space-y-4 w-full h-full flex flex-col pt-2">
            
            {alertas.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500/50 flex items-center gap-2">
                        <ShieldAlert size={14} /> Riesgos Activos
                    </h4>
                    {alertas.map(a => (
                        <div key={a.id} className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-[20px] flex items-start gap-4 hover:bg-red-500/20 transition-colors">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <span className="text-xs font-bold leading-relaxed">{a.mensaje}</span>
                        </div>
                    ))}
                </div>
            )}

            {promociones.length > 0 && (
                <div className="space-y-3 mt-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 flex items-center gap-2">
                        <Zap size={14} /> Acciones Recomendadas
                    </h4>
                    {promociones.map(p => (
                        <div key={p.id} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-4 rounded-[24px] flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-400/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap size={80} />
                            </div>
                            
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 w-fit px-2 py-1 rounded-md text-emerald-400">
                                Contexto: {p.contexto}
                            </span>
                            
                            <span className="text-sm font-black italic tracking-tight text-white z-10">{p.sugerencia}</span>
                            
                            <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400/80 z-10">
                                <span>Impacto Esperado:</span>
                                <span className="font-black text-emerald-400">{p.impacto_esperado}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
