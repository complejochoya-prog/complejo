import { db } from '../../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, query, orderBy, onSnapshot, serverTimestamp 
} from 'firebase/firestore';

const LS_PREFIX = 'tournaments_db_';

export const DEFAULT_TOURNAMENTS = [
    { 
        id: 't1', 
        nombre: 'Liga de Verano Fútbol 5', 
        formato: 'Liga Todos contra Todos', 
        estado: 'en_curso', 
        equiposCount: 6, 
        premio: '$150.000 + Trofeos',
        sede: 'Cancha Sintética 1 y 2',
        reglamento: 'Partidos de dos tiempos de 25 minutos. 5 faltas acumulativas, penal a la 6ta.',
        teams: [
            { id: 'eq-1', nombre: 'Los Pibes FC', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&h=100&fit=crop&crop=faces', capitan: 'Nicolás Gómez', telefono: '11 2233-4455', color: '#3b82f6', jugadores: ['N. Gómez (C)', 'M. Ruben', 'F. Armani', 'L. Paredes', 'E. Buendía', 'G. Montiel'] },
            { id: 'eq-2', nombre: 'Real Bañil', logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100&h=100&fit=crop&crop=faces', capitan: 'Carlos Tevez', telefono: '11 5566-7788', color: '#ef4444', jugadores: ['C. Tevez (C)', 'M. Díaz', 'J. Schiavi', 'C. Delgado', 'R. Abbondanzieri', 'R. Cascini'] },
            { id: 'eq-3', nombre: 'Sportivo Rayo', logo: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=100&h=100&fit=crop&crop=faces', capitan: 'Esteban Paz', telefono: '11 9988-1122', color: '#10b981', jugadores: ['E. Paz (C)', 'S. Villa', 'A. Rossi', 'P. Pérez', 'F. Fabra', 'C. Izquierdoz'] },
            { id: 'eq-4', nombre: 'La 12 Choya', logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=100&h=100&fit=crop&crop=faces', capitan: 'Martín Palermo', telefono: '11 7788-9900', color: '#f59e0b', jugadores: ['M. Palermo (C)', 'G. Barros Schelotto', 'H. Ibarra', 'W. Samuel', 'O. Córdoba'] },
            { id: 'eq-5', nombre: 'Deportivo Catamarca', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop&crop=faces', capitan: 'Enzo Pérez', telefono: '11 3344-5566', color: '#8b5cf6', jugadores: ['E. Pérez (C)', 'J. Álvarez', 'G. Montiel', 'N. De la Cruz', 'M. Casco'] },
            { id: 'eq-6', nombre: 'Atlético Barrial', logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=100&h=100&fit=crop&crop=faces', capitan: 'Franco Armani', telefono: '11 1122-3344', color: '#06b6d4', jugadores: ['F. Armani (C)', 'L. Ponzio', 'I. Scocco', 'G. Martínez', 'M. Barovero'] },
        ],
        standings: [
            { pos: 1, equipo: 'Los Pibes FC', pj: 3, pg: 2, pe: 1, pp: 0, gf: 14, gc: 7, dg: 7, pts: 7 },
            { pos: 2, equipo: 'Real Bañil', pj: 3, pg: 2, pe: 0, pp: 1, gf: 11, gc: 8, dg: 3, pts: 6 },
            { pos: 3, equipo: 'Sportivo Rayo', pj: 3, pg: 1, pe: 2, pp: 0, gf: 9, gc: 7, dg: 2, pts: 5 },
            { pos: 4, equipo: 'La 12 Choya', pj: 3, pg: 1, pe: 1, pp: 1, gf: 8, gc: 9, dg: -1, pts: 4 },
            { pos: 5, equipo: 'Deportivo Catamarca', pj: 3, pg: 0, pe: 1, pp: 2, gf: 6, gc: 11, dg: -5, pts: 1 },
            { pos: 6, equipo: 'Atlético Barrial', pj: 3, pg: 0, pe: 1, pp: 2, gf: 5, gc: 11, dg: -6, pts: 1 },
        ],
        matches: [
            { 
                id: 'm1', 
                jornada: 'Fecha 1', 
                fecha: '2026-03-10', 
                hora: '20:00', 
                cancha: 'Cancha 1 (Fútbol 5)', 
                local: 'Los Pibes FC', 
                visitante: 'Real Bañil', 
                goles_local: 5, 
                goles_visitante: 3, 
                estado: 'finalizado',
                goleadores: [
                    { jugador: 'M. Ruben', equipo: 'Los Pibes FC', goles: 3 },
                    { jugador: 'N. Gómez', equipo: 'Los Pibes FC', goles: 2 },
                    { jugador: 'C. Tevez', equipo: 'Real Bañil', goles: 3 },
                ],
                amarillas: [
                    { jugador: 'L. Paredes', equipo: 'Los Pibes FC' },
                    { jugador: 'J. Schiavi', equipo: 'Real Bañil' }
                ],
                rojas: [],
                mvp: 'M. Ruben (Los Pibes FC)',
                mejorArquero: 'F. Armani (Los Pibes FC)',
                notas: 'Excelente partido inaugural con gran marco de público.'
            },
            { 
                id: 'm2', 
                jornada: 'Fecha 1', 
                fecha: '2026-03-10', 
                hora: '21:00', 
                cancha: 'Cancha 2 (Fútbol 5)', 
                local: 'Sportivo Rayo', 
                visitante: 'La 12 Choya', 
                goles_local: 3, 
                goles_visitante: 3, 
                estado: 'finalizado',
                goleadores: [
                    { jugador: 'S. Villa', equipo: 'Sportivo Rayo', goles: 2 },
                    { jugador: 'E. Paz', equipo: 'Sportivo Rayo', goles: 1 },
                    { jugador: 'M. Palermo', equipo: 'La 12 Choya', goles: 3 }
                ],
                amarillas: [{ jugador: 'P. Pérez', equipo: 'Sportivo Rayo' }],
                rojas: [],
                mvp: 'M. Palermo (La 12 Choya)',
                mejorArquero: 'A. Rossi (Sportivo Rayo)',
                notas: 'Empate agónico en el último minuto.'
            },
            { 
                id: 'm3', 
                jornada: 'Fecha 2', 
                fecha: '2026-03-17', 
                hora: '20:00', 
                cancha: 'Cancha 1 (Fútbol 5)', 
                local: 'Los Pibes FC', 
                visitante: 'Sportivo Rayo', 
                goles_local: 4, 
                goles_visitante: 4, 
                estado: 'finalizado',
                goleadores: [
                    { jugador: 'M. Ruben', equipo: 'Los Pibes FC', goles: 3 },
                    { jugador: 'S. Villa', equipo: 'Sportivo Rayo', goles: 3 },
                ],
                amarillas: [],
                rojas: [],
                mvp: 'S. Villa (Sportivo Rayo)',
                mejorArquero: 'F. Armani (Los Pibes FC)',
                notas: 'Partidazo con 8 goles.'
            },
            { 
                id: 'm4', 
                jornada: 'Fecha 2', 
                fecha: '2026-03-17', 
                hora: '21:00', 
                cancha: 'Cancha 2 (Fútbol 5)', 
                local: 'Real Bañil', 
                visitante: 'Deportivo Catamarca', 
                goles_local: 4, 
                goles_visitante: 2, 
                estado: 'finalizado',
                goleadores: [{ jugador: 'C. Tevez', equipo: 'Real Bañil', goles: 3 }],
                amarillas: [],
                rojas: [],
                mvp: 'C. Tevez (Real Bañil)',
                mejorArquero: 'R. Abbondanzieri (Real Bañil)',
                notas: ''
            },
            { 
                id: 'm5', 
                jornada: 'Fecha 3 (Próxima)', 
                fecha: '2026-03-24', 
                hora: '20:00', 
                cancha: 'Cancha 1 (Fútbol 5)', 
                local: 'Los Pibes FC', 
                visitante: 'La 12 Choya', 
                goles_local: null, 
                goles_visitante: null, 
                estado: 'pendiente',
                goleadores: [],
                amarillas: [],
                rojas: [],
                mvp: '',
                mejorArquero: '',
                notas: 'Clásico barrial de la fecha.'
            },
            { 
                id: 'm6', 
                jornada: 'Fecha 3 (Próxima)', 
                fecha: '2026-03-24', 
                hora: '21:00', 
                cancha: 'Cancha 2 (Fútbol 5)', 
                local: 'Real Bañil', 
                visitante: 'Atlético Barrial', 
                goles_local: null, 
                goles_visitante: null, 
                estado: 'pendiente',
                goleadores: [],
                amarillas: [],
                rojas: [],
                mvp: '',
                mejorArquero: '',
                notas: ''
            }
        ],
        scorers: [
            { jugador: 'M. Ruben', equipo: 'Los Pibes FC', goles: 6 },
            { jugador: 'C. Tevez', equipo: 'Real Bañil', goles: 6 },
            { jugador: 'S. Villa', equipo: 'Sportivo Rayo', goles: 5 },
            { jugador: 'M. Palermo', equipo: 'La 12 Choya', goles: 3 },
            { jugador: 'N. Gómez', equipo: 'Los Pibes FC', goles: 2 },
        ],
        tarjetas: [
            { jugador: 'L. Paredes', equipo: 'Los Pibes FC', amarillas: 1, rojas: 0 },
            { jugador: 'J. Schiavi', equipo: 'Real Bañil', amarillas: 1, rojas: 0 },
            { jugador: 'P. Pérez', equipo: 'Sportivo Rayo', amarillas: 1, rojas: 0 },
        ],
        campeon: '',
        subcampeon: '',
        goleador: 'M. Ruben / C. Tevez (6 goles)',
        mejorJugador: 'M. Ruben (Los Pibes FC)',
        mejorArquero: 'F. Armani (Los Pibes FC)',
        vallaMenosVencida: 'Los Pibes FC / Sportivo Rayo (7 GC)',
        abierto: true
    },
    { 
        id: 't2', 
        nombre: 'Torneo Nocturno de Campeones', 
        formato: 'Eliminación Directa', 
        estado: 'inscripcion', 
        equiposCount: 8, 
        premio: '$80.000 + Asado para el plantel', 
        sede: 'Cancha Principal Techada',
        reglamento: 'Fútbol 6. Dos tiempos de 20 minutos con definición por penales en caso de empate.',
        teams: [],
        standings: [],
        matches: [],
        scorers: [],
        tarjetas: [],
        campeon: '',
        goleador: '',
        abierto: true 
    }
];

function getLsKey(negocioId) {
    return `${LS_PREFIX}${negocioId || 'giovanni'}`;
}

export function readTournamentsLocal(negocioId) {
    try {
        const raw = localStorage.getItem(getLsKey(negocioId));
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error('Error leyendo torneos de localStorage:', e);
    }
    return DEFAULT_TOURNAMENTS;
}

export function writeTournamentsLocal(negocioId, list) {
    try {
        localStorage.setItem(getLsKey(negocioId), JSON.stringify(list));
    } catch (e) {
        console.error('Error guardando torneos en localStorage:', e);
    }
}

/**
 * Recalcula automáticamente la tabla de posiciones a partir de los partidos
 * y equipos cargados.
 */
export function recalculateStandingsFromMatches(teams = [], matches = []) {
    if (!teams || teams.length === 0) return [];

    const stats = {};
    teams.forEach(t => {
        const name = typeof t === 'string' ? t : t.nombre;
        stats[name] = {
            pos: 1,
            equipo: name,
            logo: t.logo || '',
            pj: 0,
            pg: 0,
            pe: 0,
            pp: 0,
            gf: 0,
            gc: 0,
            dg: 0,
            pts: 0
        };
    });

    matches.forEach(m => {
        if (m.estado === 'finalizado' && m.goles_local !== null && m.goles_visitante !== null && m.local && m.visitante) {
            if (!stats[m.local]) {
                stats[m.local] = { pos: 1, equipo: m.local, logo: m.localLogo || '', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
            }
            if (!stats[m.visitante]) {
                stats[m.visitante] = { pos: 1, equipo: m.visitante, logo: m.visitanteLogo || '', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
            }

            const gl = Number(m.goles_local);
            const gv = Number(m.goles_visitante);

            stats[m.local].pj += 1;
            stats[m.visitante].pj += 1;
            stats[m.local].gf += gl;
            stats[m.local].gc += gv;
            stats[m.visitante].gf += gv;
            stats[m.visitante].gc += gl;

            if (gl > gv) {
                stats[m.local].pg += 1;
                stats[m.local].pts += 3;
                stats[m.visitante].pp += 1;
            } else if (gl < gv) {
                stats[m.visitante].pg += 1;
                stats[m.visitante].pts += 3;
                stats[m.local].pp += 1;
            } else {
                stats[m.local].pe += 1;
                stats[m.local].pts += 1;
                stats[m.visitante].pe += 1;
                stats[m.visitante].pts += 1;
            }
        }
    });

    const list = Object.values(stats);
    list.forEach(item => {
        item.dg = item.gf - item.gc;
    });

    list.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.equipo.localeCompare(b.equipo);
    });

    list.forEach((item, idx) => {
        item.pos = idx + 1;
    });

    return list;
}

/**
 * Recalcula goleadores acumulados de los partidos
 */
export function recalculateScorersFromMatches(matches = []) {
    const map = {};
    matches.forEach(m => {
        if (Array.isArray(m.goleadores)) {
            m.goleadores.forEach(g => {
                const key = `${g.jugador}___${g.equipo || ''}`;
                if (!map[key]) {
                    map[key] = { jugador: g.jugador, equipo: g.equipo || '', goles: 0 };
                }
                map[key].goles += Number(g.goles || 1);
            });
        }
    });
    return Object.values(map).sort((a, b) => b.goles - a.goles);
}

/**
 * Recalcula tarjetas amarillas y rojas
 */
export function recalculateCardsFromMatches(matches = []) {
    const map = {};
    matches.forEach(m => {
        if (Array.isArray(m.amarillas)) {
            m.amarillas.forEach(a => {
                const key = `${a.jugador}___${a.equipo || ''}`;
                if (!map[key]) map[key] = { jugador: a.jugador, equipo: a.equipo || '', amarillas: 0, rojas: 0 };
                map[key].amarillas += 1;
            });
        }
        if (Array.isArray(m.rojas)) {
            m.rojas.forEach(r => {
                const key = `${r.jugador}___${r.equipo || ''}`;
                if (!map[key]) map[key] = { jugador: r.jugador, equipo: r.equipo || '', amarillas: 0, rojas: 0 };
                map[key].rojas += 1;
            });
        }
    });
    return Object.values(map).sort((a, b) => (b.rojas * 2 + b.amarillas) - (a.rojas * 2 + a.amarillas));
}

// ─── API Principal de Torneos ──────────────────────────────────────────────

export function subscribeTournaments(negocioId, onData) {
    const key = negocioId || 'giovanni';
    const local = readTournamentsLocal(key);
    onData(local);

    try {
        const colRef = collection(db, 'negocios', key, 'tournaments');
        const q = query(colRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snap) => {
            if (!snap.empty) {
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                writeTournamentsLocal(key, list);
                onData(list);
            } else {
                // Si Firestore está vacío, sembramos los torneos por defecto
                local.forEach(t => {
                    setDoc(doc(db, 'negocios', key, 'tournaments', t.id), t).catch(() => {});
                });
                onData(local);
            }
        }, (err) => {
            console.warn('Error en snapshot torneos, usando local:', err);
            onData(readTournamentsLocal(key));
        });
    } catch (err) {
        console.warn('Firestore torneos no disponible:', err);
        return () => {};
    }
}

export async function fetchTournaments(negocioId) {
    const key = negocioId || 'giovanni';
    return readTournamentsLocal(key);
}

export async function saveTournament(negocioId, tournamentData) {
    const key = negocioId || 'giovanni';
    const id = tournamentData.id || `t_${Date.now()}`;
    const payload = {
        ...tournamentData,
        id,
        updatedAt: new Date().toISOString()
    };

    // Actualizar local
    const current = readTournamentsLocal(key);
    const idx = current.findIndex(t => t.id === id);
    let next;
    if (idx >= 0) {
        next = current.map(t => t.id === id ? { ...t, ...payload } : t);
    } else {
        next = [payload, ...current];
    }
    writeTournamentsLocal(key, next);

    // Actualizar Firestore
    try {
        const ref = doc(db, 'negocios', key, 'tournaments', id);
        await setDoc(ref, {
            ...payload,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('Error guardando torneo en Firestore:', e);
    }

    return payload;
}

export async function saveTournamentDetails(negocioId, tournamentId, details) {
    const key = negocioId || 'giovanni';
    const current = readTournamentsLocal(key);
    const existing = current.find(t => t.id === tournamentId);
    if (!existing) return false;

    // Calcular tablas automáticamente si vienen equipos y partidos
    let finalStandings = details.standings;
    if ((!finalStandings || finalStandings.length === 0) && (details.teams || existing.teams) && (details.matches || existing.matches)) {
        finalStandings = recalculateStandingsFromMatches(
            details.teams || existing.teams, 
            details.matches || existing.matches
        );
    }

    const updated = {
        ...existing,
        ...details,
        standings: finalStandings || existing.standings || [],
        updatedAt: new Date().toISOString()
    };

    const next = current.map(t => t.id === tournamentId ? updated : t);
    writeTournamentsLocal(key, next);

    try {
        const ref = doc(db, 'negocios', key, 'tournaments', tournamentId);
        await updateDoc(ref, {
            ...details,
            standings: finalStandings || existing.standings || [],
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.warn('Error actualizando detalles en Firestore:', e);
    }

    return updated;
}

export async function deleteTournament(negocioId, tournamentId) {
    const key = negocioId || 'giovanni';
    const current = readTournamentsLocal(key);
    const next = current.filter(t => t.id !== tournamentId);
    writeTournamentsLocal(key, next);

    try {
        await deleteDoc(doc(db, 'negocios', key, 'tournaments', tournamentId));
    } catch (e) {
        console.warn('Error borrando torneo en Firestore:', e);
    }
    return true;
}

export async function fetchStandings(negocioId, tournamentId) {
    const list = readTournamentsLocal(negocioId);
    const t = list.find(x => x.id === tournamentId);
    return t?.standings || [];
}

export async function fetchMatches(negocioId, tournamentId) {
    const list = readTournamentsLocal(negocioId);
    const t = list.find(x => x.id === tournamentId);
    return t?.matches || [];
}

export async function fetchScorers(negocioId, tournamentId) {
    const list = readTournamentsLocal(negocioId);
    const t = list.find(x => x.id === tournamentId);
    return t?.scorers || [];
}
