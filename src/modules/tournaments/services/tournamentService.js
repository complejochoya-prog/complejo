import { db } from '../../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_TOURNAMENTS = [
    { 
        id: 't1', 
        nombre: 'Liga de Verano Fútbol 5', 
        formato: 'Liga', 
        estado: 'en_curso', 
        equipos: 10, 
        premio: '$50.000', 
        standings: [
            { pos: 1, equipo: 'Los Pibes FC', pj: 5, pg: 4, pe: 1, pp: 0, gf: 15, gc: 3, pts: 13 },
            { pos: 2, equipo: 'Real Bañil', pj: 5, pg: 3, pe: 1, pp: 1, gf: 12, gc: 5, pts: 10 },
            { pos: 3, equipo: 'Sportivo', pj: 5, pg: 2, pe: 2, pp: 1, gf: 8, gc: 6, pts: 8 },
        ],
        matches: [
            { id: 'm1', fecha: '2026-03-20', hora: '20:00', local: 'Los Pibes FC', visitante: 'Real Bañil', goles_local: null, goles_visitante: null, estado: 'pendiente' },
            { id: 'm2', fecha: '2026-03-13', hora: '19:00', local: 'Sportivo', visitante: 'La 12', goles_local: 2, goles_visitante: 1, estado: 'finalizado' },
        ],
        scorers: [
            { jugador: 'M. Ruben', equipo: 'Los Pibes FC', goles: 8 },
            { jugador: 'C. Tevez', equipo: 'Real Bañil', goles: 6 },
        ],
        campeon: null,
        goleador: null,
        abierto: true
    },
    { id: 't2', nombre: 'Torneo Padel Amateur', formato: 'Grupos + Playoff', estado: 'inscripcion', equipos: 8, premio: 'Paletas + $20.000', abierto: true },
    { 
        id: 't3', 
        nombre: 'Copa Relámpago', 
        formato: 'Eliminación directa', 
        estado: 'finalizado', 
        equipos: 16, 
        premio: '$100.000', 
        campeon: 'Atlético Rápido',
        goleador: 'Juan Pérez',
        standings: [],
        matches: [
            { id: 'm3', fecha: '2026-01-15', hora: '21:00', local: 'Atlético Rápido', visitante: 'Sportivo Rayo', goles_local: 3, goles_visitante: 2, estado: 'finalizado' }
        ],
        scorers: [
            { jugador: 'Juan Pérez', equipo: 'Atlético Rápido', goles: 12 }
        ],
        abierto: false
    }
];

export async function fetchTournaments(negocioId) {
    if (!negocioId) return [];
    try {
        const q = query(collection(db, 'negocios', negocioId, 'tournaments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            // Initializing with defaults if none exist
            return DEFAULT_TOURNAMENTS;
        }
        
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching tournaments:", e);
        return DEFAULT_TOURNAMENTS;
    }
}

export async function saveTournament(negocioId, tournamentData) {
    if (!negocioId) return false;
    const id = tournamentData.id || `t_${Date.now()}`;
    const ref = doc(db, 'negocios', negocioId, 'tournaments', id);
    
    await setDoc(ref, {
        ...tournamentData,
        id,
        createdAt: serverTimestamp(),
        standings: tournamentData.standings || [],
        matches: tournamentData.matches || [],
        scorers: tournamentData.scorers || [],
        campeon: tournamentData.campeon || null,
        goleador: tournamentData.goleador || null
    }, { merge: true });
    
    return true;
}

export async function deleteTournament(negocioId, tournamentId) {
    if (!negocioId) return false;
    await deleteDoc(doc(db, 'negocios', negocioId, 'tournaments', tournamentId));
    return true;
}

export async function fetchStandings(negocioId, tournamentId) {
    const data = await fetchTournaments(negocioId);
    const tournament = data.find(t => t.id === tournamentId);
    return tournament?.standings || [];
}

export async function fetchMatches(negocioId, tournamentId) {
    const data = await fetchTournaments(negocioId);
    const tournament = data.find(t => t.id === tournamentId);
    return tournament?.matches || [];
}

export async function fetchScorers(negocioId, tournamentId) {
    const data = await fetchTournaments(negocioId);
    const tournament = data.find(t => t.id === tournamentId);
    return tournament?.scorers || [];
}

export async function saveTournamentDetails(negocioId, tournamentId, details) {
    if (!negocioId) return false;
    const ref = doc(db, 'negocios', negocioId, 'tournaments', tournamentId);
    await updateDoc(ref, {
        ...details,
        updatedAt: serverTimestamp()
    });
    return true;
}
