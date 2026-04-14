import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccessControl } from '../hooks/useAccessControl';
import QRScanner from '../components/QRScanner';
import AccessStatus from '../components/AccessStatus';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import { useEmployeeAuth } from '../../employee_app/hooks/useEmployeeAuth';

export default function QRCheckInPage() {
    const { negocioId } = useParams();
    const navigate = useNavigate();
    const { processQR, loading: accessLoading } = useAccessControl(negocioId);
    const { employeeUser, loading: authLoading } = useEmployeeAuth(negocioId);
    
    const [result, setResult] = useState({ status: 'idle', data: null, error: null });

    if (authLoading) return null;
    if (!employeeUser) return null;

    const handleScan = async (decodedText) => {
        if (accessLoading || result.status === 'success') return;
        
        const res = await processQR(decodedText);
        if (res.success) {
            setResult({ status: 'success', data: res.data, error: null });
            // Reset after 5 seconds to allow next scan
            setTimeout(() => setResult({ status: 'idle', data: null, error: null }), 5000);
        } else {
            setResult({ status: 'error', data: null, error: res.error });
            setTimeout(() => setResult({ status: 'idle', data: null, error: null }), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-lg mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest mb-6"
                >
                    <ChevronLeft size={16} /> Volver
                </button>

                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-2">
                    Auto <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Check-In</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escaneo de acceso rápido para clientes</p>
            </div>

            <div className="w-full max-w-lg space-y-8">
                {result.status === 'idle' ? (
                    <div className="space-y-6">
                        <QRScanner 
                            onScanSuccess={handleScan} 
                            onScanError={(err) => {}} 
                        />
                        {accessLoading && (
                            <div className="flex items-center justify-center gap-3 text-indigo-400">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Validando...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <AccessStatus 
                        status={result.status} 
                        data={result.data} 
                        error={result.error} 
                    />
                )}

                <div className="bg-slate-900 border border-white/5 p-6 rounded-[32px] flex items-start gap-4 shadow-xl">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">Instrucciones</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            Si el sistema no reconoce el código, verifique que la reserva esté PAGADA y dentro del margen de 15 minutos de su turno.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
