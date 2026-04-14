import { useState, useEffect } from 'react';
import { fetchAIAggregations } from '../services/aiAnalyticsService';

export function useAIAnalytics(negocioId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!negocioId) return;
        
        const loadIntelligence = async () => {
            setLoading(true);
            try {
                const intelligence = await fetchAIAggregations(negocioId);
                setData(intelligence);
                setError(null);
            } catch (err) {
                setError(err);
                console.error('AI Analytics Error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadIntelligence();
    }, [negocioId]);

    return { data, loading, error };
}
