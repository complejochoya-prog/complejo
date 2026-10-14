import { useState, useEffect } from 'react';
import { 
    subscribeTournaments,
    fetchStandings, 
    fetchMatches, 
    fetchScorers, 
    saveTournament, 
    deleteTournament, 
    saveTournamentDetails,
    DEFAULT_TOURNAMENTS
} from '../services/tournamentService';

export function useTournament(negocioId) {
    const [tournaments, setTournaments] = useState(DEFAULT_TOURNAMENTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeTournaments(negocioId, (data) => {
            setTournaments(data || DEFAULT_TOURNAMENTS);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
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
        return await saveTournament(negocioId, tournamentData);
    };

    const remove = async (tournamentId) => {
        return await deleteTournament(negocioId, tournamentId);
    };

    const saveDetails = async (tournamentId, details) => {
        return await saveTournamentDetails(negocioId, tournamentId, details);
    };

    return { tournaments, loading, error, getStandings, getMatches, getScorers, save, remove, saveDetails };
}
