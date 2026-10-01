import { useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
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
        if (!negocioId) {
            setTournaments(DEFAULT_TOURNAMENTS);
            setLoading(false);
            return;
        }

        setLoading(true);
        const colRef = collection(db, 'negocios', negocioId, 'tournaments');
        
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            if (snapshot.empty) {
                setTournaments(DEFAULT_TOURNAMENTS);
            } else {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Safe in-memory sorting
                list.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (new Date(a.createdAt || 0).getTime() || 0);
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (new Date(b.createdAt || 0).getTime() || 0);
                    return timeB - timeA;
                });
                setTournaments(list.length > 0 ? list : DEFAULT_TOURNAMENTS);
            }
            setLoading(false);
        }, (err) => {
            console.warn("Error in tournament listener, using defaults:", err);
            setTournaments(DEFAULT_TOURNAMENTS);
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
