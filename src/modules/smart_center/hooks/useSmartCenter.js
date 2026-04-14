import { useState, useEffect } from 'react';
import { fetchSmartDevices, toggleDevice, fetchEnergyUsage } from '../services/smartCenterService';

export function useSmartCenter(negocioId) {
    const [devices, setDevices] = useState([]);
    const [energyStats, setEnergyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!negocioId) return;
        loadSmartData();
    }, [negocioId]);

    const loadSmartData = async () => {
        setLoading(true);
        try {
            const [devicesData, energyData] = await Promise.all([
                fetchSmartDevices(negocioId),
                fetchEnergyUsage(negocioId)
            ]);
            setDevices(devicesData);
            setEnergyStats(energyData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (deviceId, currentStatus) => {
        try {
            const res = await toggleDevice(negocioId, deviceId, currentStatus);
            if (res.success) {
                setDevices(prev => prev.map(d => 
                    d.id === deviceId ? { ...d, status: res.status } : d
                ));
            }
        } catch (err) {
            setError('Error al comunicar con el dispositivo');
        }
    };

    return {
        devices,
        energyStats,
        loading,
        error,
        handleToggle,
        refresh: loadSmartData
    };
}
