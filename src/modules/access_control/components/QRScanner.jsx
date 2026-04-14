import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, AlertCircle } from 'lucide-react';

export default function QRScanner({ onScanSuccess, onScanError }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0
        });

        scanner.render(onScanSuccess, onScanError);

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                <div id="reader" className="w-full"></div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                   <div className="bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                        <Scan size={14} className="text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Escaneando...</span>
                   </div>
                </div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-2xl flex items-center gap-3 border border-white/5">
                <AlertCircle size={18} className="text-slate-500" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Apunta la cámara al código QR de la reserva para validar el ingreso automáticamente.
                </p>
            </div>
        </div>
    );
}
