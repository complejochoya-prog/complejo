import React from 'react';

export default function AIInsightsCard({ title, icon, mainValue, subtext, highlightWords = [], gradient = 'from-emerald-500 to-teal-400' }) {
    
    // Highlight specific words to make it smarter looking
    const renderSubtext = () => {
        if (!highlightWords.length) return subtext;
        const words = subtext.split(' ');
        return words.map((w, i) => {
            const cleanWord = w.replace(/[.,]/g, '');
            if (highlightWords.includes(cleanWord)) {
                return <span key={i} className="text-white font-black"> {w} </span>;
            }
            return <span key={i}> {w} </span>;
        });
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[32px] p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform shadow-xl">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <div className="text-white drop-shadow-md">
                        {icon}
                    </div>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
            </div>

            <p className="text-3xl font-black italic tracking-tighter text-white mb-2 leading-tight">
                {mainValue}
            </p>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed max-w-xs">
                {renderSubtext()}
            </p>
        </div>
    );
}
