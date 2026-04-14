const STORAGE_KEY = 'complejo_torneos';

const DEFAULT_TOURNAMENTS = [
    { 
        id: 't1', 
        nombre: 'Liga de Verano Fútbol 5', 
        formato: 'Liga', 
        estado: 'en_curso', 
        equipos: 10, 
        premio: '$50.000', 
        createdAt: new Date().toISOString(),
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
        goleador: null
    },
    { id: 't2', nombre: 'Torneo Padel Amateur', formato: 'Grupos + Playoff', estado: 'inscripcion', equipos: 8, premio: 'Paletas + $20.000', createdAt: new Date().toISOString() },
    { 
        id: 't3', 
        nombre: 'Copa Relámpago', 
        formato: 'Eliminación directa', 
        estado: 'finalizado', 
        equipos: 16, 
        premio: '$100.000', 
        createdAt: new Date().toISOString(),
        campeon: 'Atlético Rápido',
        goleador: 'Juan Pérez',
        standings: [],
        matches: [
            { id: 'm3', fecha: '2026-01-15', hora: '21:00', local: 'Atlético Rápido', visitante: 'Sportivo Rayo', goles_local: 3, goles_visitante: 2, estado: 'finalizado' }
        ],
        scorers: [
            { jugador: 'Juan Pérez', equipo: 'Atlético Rápido', goles: 12 }
        ]
    }
];

export async function fetchTournaments(negocioId) {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOURNAMENTS));
                resolve(DEFAULT_TOURNAMENTS);
            } else {
                resolve(JSON.parse(data));
            }
        }, 300);
    });
}

export async function saveTournament(negocioId, tournamentData) {
    const data = localStorage.getItem(STORAGE_KEY);
    let tournaments = data ? JSON.parse(data) : [...DEFAULT_TOURNAMENTS];
    
    if (tournamentData.id) {
        tournaments = tournaments.map(t => t.id === tournamentData.id ? { ...t, ...tournamentData } : t);
    } else {
        const newTournament = {
            ...tournamentData,
            id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            createdAt: new Date().toISOString(),
            standings: [],
            matches: [],
            scorers: [],
            campeon: null,
            goleador: null
        };
        tournaments.push(newTournament);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
    return true;
}

export async function deleteTournament(negocioId, tournamentId) {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    let tournaments = JSON.parse(data);
    tournaments = tournaments.filter(t => t.id !== tournamentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
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
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    let tournaments = JSON.parse(data);
    tournaments = tournaments.map(t => 
        t.id === tournamentId ? { ...t, ...details } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
    return true;
}

