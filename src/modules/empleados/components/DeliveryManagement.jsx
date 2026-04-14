import React from 'react';
import { Bike } from 'lucide-react';

export default function DeliveryManagement() {
    return (
        <div className="p-8 min-h-screen bg-slate-950 text-white">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <Bike size={20} />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Gestión de Delivery</h1>
            </div>
            <p className="text-slate-500 text-sm">Módulo de gestión de delivery en desarrollo.</p>
        </div>
    );
}
