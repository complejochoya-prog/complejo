import { useState, useEffect } from 'react';
import { fetchTournaments, fetchStandings, fetchMatches, fetchScorers, saveTournament, deleteTournament, saveTournamentDetails } from '../services/tournamentService';

export function useTournament(negocioId) {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        if (!negocioId) return;
        try {
            const data = await fetchTournaments(negocioId);
            setTournaments(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        
        const handleNativeStorage = (e) => {
            if (e.key === 'complejo_torneos') loadData();
        };

        window.addEventListener('storage_torneos', loadData);
        window.addEventListener('storage', handleNativeStorage);
        
        return () => {
            window.removeEventListener('storage_torneos', loadData);
            window.removeEventListener('storage', handleNativeStorage);
        };
    }, [negocioId]);

    const getStandings = async (tournamentId) => {
        return await fetchStandings(negocioId, tournamentId);
    };

    const getMatches = async (tournamentId) => {
        return await fetchMatches(negocioId, tournamentId);
    };

    const getScorers = async (tournamentId) => {
        return await fetchScorers(negocioId, tournamentId);
    };

    const save = async (tournamentData) => {
        const success = await saveTournament(negocioId, tournamentData);
        if (success) {
            window.dispatchEvent(new Event('storage_torneos'));
            await loadData();
        }
        return success;
    };

    const remove = async (tournamentId) => {
        const success = await deleteTournament(negocioId, tournamentId);
        if (success) {
            window.dispatchEvent(new Event('storage_torneos'));
            await loadData();
        }
        return success;
    };

    const saveDetails = async (tournamentId, details) => {
        const success = await saveTournamentDetails(negocioId, tournamentId, details);
        if (success) {
            window.dispatchEvent(new Event('storage_torneos'));
            await loadData();
        }
        return success;
    };

    return { tournaments, loading, error, getStandings, getMatches, getScorers, save, remove, saveDetails };
}
