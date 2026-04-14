import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download, Share2 } from 'lucide-react';

export default function QRCheckInCard({ reserva, onClose }) {
    // Generate a secure payload for the QR
    const qrValue = JSON.stringify({
        id: reserva.id,
        negocio: reserva.negocioId,
        v: 1 // versioning
    });

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/5 w-full max-w-sm rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-8 text-center bg-indigo-600 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <QrCode size={120} />
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>
                    
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-1">Pase de Acceso</h2>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">{reserva.cancha}</p>
                </div>

                {/* QR Body */}
                <div className="p-10 flex flex-col items-center gap-8">
                    <div className="bg-white p-6 rounded-[40px] shadow-2xl">
                        <QRCodeSVG 
                            value={qrValue} 
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm font-black uppercase italic tracking-tighter text-white">{reserva.fecha}</p>
                        <p className="text-2xl font-black italic tracking-tighter text-indigo-400 leading-none">{reserva.hora} HS</p>
                    </div>

                    <div className="w-full flex gap-3 mt-4">
                        <button className="flex-1 bg-slate-950 border border-white/5 text-slate-400 py-4 rounded-2xl flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <Download size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Guardar</span>
                        </button>
                        <button className="flex-1 bg-slate-950 border border-white/5 text-slate-400 py-4 rounded-2xl flex items-center justify-center gap-2 hover:text-white transition-colors">
                            <Share2 size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Compartir</span>
                        </button>
                    </div>
                </div>

                <div className="px-10 pb-10 text-center">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                        Muestra este código en el ingreso para desbloquear el acceso automáticamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
