import React from 'react';
import { Video, Radio, Activity, ExternalLink, AlertTriangle } from 'lucide-react';

export default function CameraStatus({ camera }) {
    const isStreaming = camera.status === 'streaming';
    
    return (
        <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden group">
            {/* Camera View Area */}
            <div className="aspect-video bg-slate-950 relative overflow-hidden">
                {isStreaming ? (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
                        
                        {/* Static Overlay Simulation */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen bg-repeat" style={{ backgroundImage: 'url("https://media.giphy.com/media/oEI9uWUqWMrBK/giphy.gif")' }} />

                        {/* Camera Info Overlays */}
                        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-600/20">
                                <Radio size={10} className="text-white" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">LIVE</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 drop-shadow-md">
                                {camera.location} · {new Date().toLocaleTimeString()}
                            </span>
                        </div>

                        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                                <Activity size={16} />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                                <ExternalLink size={16} />
                            </div>
                        </div>

                        {/* Placeholder for real stream */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Video size={48} className="text-white/10" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Señal Pérdida</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-tighter text-white">{camera.name}</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">Bitrate: 4.2 Mbps · H.265</p>
                </div>
                <button className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    isStreaming 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-950 text-slate-500 border border-white/5'
                }`}>
                    {isStreaming ? 'En Línea' : 'Reconectar'}
                </button>
            </div>
        </div>
    );
}
