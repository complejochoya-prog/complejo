import React from 'react';
import { Tag } from 'lucide-react';

export default function PromotionCard({ title, subtitle, badgeText = "PROMO ACTIVA", colorClass = "violet" }) {
    
    // Fallbacks for safe Tailwind compilation
    const bgColors = {
        violet: 'bg-violet-900/40 border-violet-500/30 text-violet-300',
        emerald: 'bg-emerald-900/40 border-emerald-500/30 text-emerald-300',
        amber: 'bg-amber-900/40 border-amber-500/30 text-amber-300'
    };
    
    const badgeColors = {
        violet: 'bg-violet-500 text-white',
        emerald: 'bg-emerald-500 text-white',
        amber: 'bg-amber-500 text-slate-900'
    };

    return (
        <div className={`${bgColors[colorClass]} border p-5 rounded-[32px] relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                <Tag size={80} />
            </div>
            
            <span className={`${badgeColors[colorClass]} text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg relative z-10 block w-fit mb-3`}>
                {badgeText}
            </span>
            
            <h4 className="text-xl font-black italic text-white relative z-10">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">{subtitle}</p>
        </div>
    );
}
