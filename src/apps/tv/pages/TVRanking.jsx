import React, { useState, useEffect } from 'react';
import { Trophy, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useConfig } from '../../../core/services/ConfigContext';

export default function TVRanking() {
    const { negocioId } = useConfig();
    const [ranking, setRanking] = useState([
        { id: 1, pos: 1, name: 'Martín Palermo', pts: 2150, trend: 'up' },
        { id: 2, pos: 2, name: 'Juan Riquelme', pts: 2010, trend: 'stable' },
        { id: 3, pos: 3, name: 'L. Messi', pts: 1980, trend: 'up' },
        { id: 4, pos: 4, name: 'Diego M.', pts: 1850, trend: 'down' },
        { id: 5, pos: 5, name: 'Kun Agüero', pts: 1720, trend: 'stable' },
        { id: 6, pos: 6, name: 'Dibu M.', pts: 1600, trend: 'up' },
        { id: 7, pos: 7, name: 'A. Di Maria', pts: 1540, trend: 'stable' },
        { id: 8, pos: 8, name: 'J. Álvarez', pts: 1420, trend: 'up' },
    ]);

    useEffect(() => {
        // Refresco cada 5 segundos simulando DB
        const timer = setInterval(() => {
            // fetchRankings().then(setRanking);
        }, 5000);
        return () => clearInterval(timer);
    }, [negocioId]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 pt-0 animate-in fade-in duration-1000">
            <div className="w-full max-w-6xl flex flex-col bg-slate-900 border border-white/10 rounded-[60px] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400" />
                
                <div className="p-16 pb-8 flex items-center justify-between border-b border-white/5">
                    <h1 className="text-8xl font-black uppercase tracking-tighter italic text-white flex items-center gap-8">
                        <Trophy size={80} className="text-amber-400 drop-shadow-lg shadow-amber-500" />
                        RANKING GENERAL
                    </h1>
                    <div className="px-8 py-4 bg-white/5 rounded-full border border-white/10 text-white/50 text-2xl font-black uppercase tracking-widest">
                        TOP 8 LOCAL
                    </div>
                </div>

                <div className="p-10 space-y-6">
                    {ranking.map((r, i) => (
                        <div key={r.id} className="flex items-center justify-between bg-slate-950 p-6 rounded-[30px] border border-white/5 hover:border-white/10 transition-all shadow-inner">
                            <div className="flex items-center gap-8">
                                <span className={`text-6xl font-black italic w-16 text-center ${
                                    r.pos === 1 ? 'text-amber-400' :
                                    r.pos === 2 ? 'text-slate-300' :
                                    r.pos === 3 ? 'text-amber-700' :
                                    'text-white/20'
                                }`}>
                                    {r.pos}
                                </span>
                                
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                    r.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                                    r.trend === 'down' ? 'bg-red-500/10 text-red-500' :
                                    'bg-slate-500/10 text-slate-500'
                                }`}>
                                    {r.trend === 'up' && <ChevronUp size={28} strokeWidth={4} />}
                                    {r.trend === 'down' && <ChevronDown size={28} strokeWidth={4} />}
                                    {r.trend === 'stable' && <Minus size={28} strokeWidth={4} />}
                                </div>
                                
                                <span className="text-5xl font-black uppercase tracking-tighter">{r.name}</span>
                            </div>
                            
                            <div className="px-8 py-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl flex items-center gap-4">
                                <span className="text-6xl font-black italic text-cyan-400 tracking-tighter shadow-cyan-500/20 drop-shadow">{r.pts}</span>
                                <span className="text-xl font-bold uppercase tracking-widest text-blue-500">PTS</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
