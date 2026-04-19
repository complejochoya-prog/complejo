import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { fetchStandings, fetchMatches, fetchScorers, saveTournament, deleteTournament, saveTournamentDetails } from '../services/tournamentService';

export function useTournament(negocioId) {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!negocioId) return;

        setLoading(true);
        const q = query(collection(db, 'negocios', negocioId, 'tournaments'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTournaments(list);
            setLoading(false);
        }, (err) => {
            console.error("Error in tournament listener:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
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
