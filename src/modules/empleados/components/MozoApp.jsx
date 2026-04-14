import React from 'react';
import { Smartphone } from 'lucide-react';

export default function MozoApp() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-lg mx-auto text-center py-20">
                <Smartphone size={48} className="mx-auto text-gold mb-4" />
                <h1 className="text-2xl font-black uppercase tracking-tighter italic mb-4">App Mozo</h1>
                <p className="text-slate-500 text-sm">Módulo de app mozo en desarrollo.</p>
            </div>
        </div>
    );
}
