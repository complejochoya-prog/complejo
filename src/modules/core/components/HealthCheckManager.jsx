import React, { useEffect } from 'react';
import { useHealthCheck } from '../../../hooks/useHealthCheck';

export default function HealthCheckManager() {
    const { runFullCheck } = useHealthCheck();

    useEffect(() => {
        // Run on startup
        runFullCheck().catch(err => console.error("Startup health check failed:", err));

        // Run every 24 hours (86,400,000 ms)
        const interval = setInterval(() => {
            runFullCheck().catch(err => console.error("Periodic health check failed:", err));
        }, 24 * 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [runFullCheck]);

    return null; // This component doesn't render anything
}
