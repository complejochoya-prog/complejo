import React, { useState, useEffect } from 'react';

/**
 * OrderTimer — FIX: Invalid Date guard
 *
 * Problema anterior: new Date(startTime).getTime() podía devolver NaN si
 * startTime era un objeto Firestore Timestamp no convertido (porque llegaba
 * directo de localStorage como { seconds, nanoseconds }).
 * Aunque no crasheaba (NaN produce 'NaN:NaN'), generaba advertencias y
 * un timer visualmente roto.
 *
 * Fix: función toStartMs() que maneja todos los casos posibles de startTime.
 */

function toStartMs(startTime) {
    if (!startTime) return null;

    // Firestore Timestamp SDK (tiene .toDate())
    if (typeof startTime?.toDate === 'function') {
        try {
            const d = startTime.toDate();
            return isNaN(d.getTime()) ? null : d.getTime();
        } catch { return null; }
    }

    // Ya es un Date
    if (startTime instanceof Date) {
        return isNaN(startTime.getTime()) ? null : startTime.getTime();
    }

    // Objeto plano { seconds, nanoseconds } — resultado de JSON.stringify(Timestamp)
    if (typeof startTime === 'object' && typeof startTime.seconds === 'number') {
        return startTime.seconds * 1000 + Math.floor((startTime.nanoseconds || 0) / 1e6);
    }

    // Número (unix ms)
    if (typeof startTime === 'number') {
        return startTime > 1_000_000_000_000 ? startTime : startTime * 1000;
    }

    // String (ISO o numérico)
    if (typeof startTime === 'string') {
        // ID tipo "ORD-1717000000000"
        const numericId = parseInt(startTime.replace(/\D/g, ''), 10);
        if (!isNaN(numericId) && numericId > 1_000_000_000_000) return numericId;

        const d = new Date(startTime);
        return isNaN(d.getTime()) ? null : d.getTime();
    }

    return null;
}

function formatElapsed(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function OrderTimer({ startTime, label, active = true }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = toStartMs(startTime);
        if (start === null) return; // No hay timestamp válido, no arrancar timer

        const update = () => {
            const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
            setElapsed(diff);
        };

        update(); // tick inmediato

        if (active) {
            const interval = setInterval(update, 1000);
            return () => clearInterval(interval);
        }
    }, [startTime, active]);

    return (
        <div className="flex flex-col">
            {label ? (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {label}
                </span>
            ) : null}
            <span className="text-xl font-mono font-black text-white">
                {formatElapsed(elapsed)}
            </span>
        </div>
    );
}
