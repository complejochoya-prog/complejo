import { useState, useEffect } from 'react';
import { validateAccessCode, fetchAccessLogs, toggleSmartLock } from '../services/accessService';

export function useAccessControl(negocioId) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!negocioId) return;
        loadLogs();
    }, [negocioId]);

    const loadLogs = async () => {
        const data = await fetchAccessLogs(negocioId);
        setLogs(data);
    };

    const processQR = async (code) => {
        setLoading(true);
        try {
            const res = await validateAccessCode(negocioId, code);
            if (res.success) {
                // Auto-open lock simulation
                await toggleSmartLock(negocioId, res.data.cancha, 'OPEN');
                await loadLogs();
            }
            return res;
        } finally {
            setLoading(false);
        }
    };

    return { logs, loading, processQR, loadLogs };
}
