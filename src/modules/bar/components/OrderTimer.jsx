import React, { useState, useEffect } from 'react';

export default function OrderTimer({ startTime, label, active = true }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) return;
        const start = new Date(startTime).getTime();
        
        const update = () => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        };

        update();
        if (active) {
            const interval = setInterval(update, 1000);
            return () => clearInterval(interval);
        }
    }, [startTime, active]);

    const format = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            <span className="text-xl font-mono font-black text-white">{format(elapsed)}</span>
        </div>
    );
}
