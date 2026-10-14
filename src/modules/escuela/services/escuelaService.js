import { db } from '../../../firebase/config';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Servicio de la Escuela de Fútbol.
 *
 * Colecciones (por negocio):
 *   negocios/{negocioId}/escuela_inscripciones  → alumnos
 *   negocios/{negocioId}/escuela_cursos         → cursos / categorías
 *   negocios/{negocioId}/escuela_profesores     → profesores
 *   negocios/{negocioId}/escuela_config         → configuración general de la escuela
 *
 * Todo se guarda primero en localStorage (funciona sin conexión) y se
 * sincroniza con Firestore cuando está disponible.
 */

const LS_KEYS = {
    alumnos: 'escuela_inscripciones_db',
    cursos: 'escuela_cursos_db',
    profesores: 'escuela_profesores_db',
    config: 'escuela_config_db'
};

export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ─── Helpers de formato (compartidos por admin y página pública) ───────────

export function formatPrice(n) {
    if (n === null || n === undefined || n === '' || isNaN(Number(n))) return '—';
    return `$${Number(n).toLocaleString('es-AR')}`;
}

export function formatDays(days) {
    if (!days) return '—';
    if (typeof days === 'string') return days;
    const list = DAYS.filter(d => days.includes(d)); // orden de semana
    if (list.length === 0) return '—';
    if (list.length === 1) return list[0];
    return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`;
}

export function formatTime(c) {
    if (!c?.timeStart && !c?.timeEnd) return '—';
    return `${c.timeStart || '?'} - ${c.timeEnd || '?'}`;
}

export function formatAgeRange(c) {
    const min = c?.ageMin, max = c?.ageMax;
    if (min !== '' && min != null && max !== '' && max != null) return `${min}-${max} años`;
    if (min !== '' && min != null) return `${min}+ años`;
    if (max !== '' && max != null) return `hasta ${max} años`;
    return 'Todas las edades';
}

/** Busca el curso de un alumno: por id y, si es un alumno viejo, por nombre. */
export function findCourseForStudent(student, courses) {
    if (!student) return null;
    return (
        courses.find(c => c.id === student.courseId) ||
        (!student.courseId ? courses.find(c => c.name === student.category) : null) ||
        null
    );
}

// ─── Normalizadores ────────────────────────────────────────────────────────

const toNum = (v, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
};

export const DEFAULT_ESCUELA_CONFIG = {
    nombre: 'GIOVANNI KIDS',
    lema: 'Escuela de Fútbol Infantil y Juvenil',
    badge: 'Inscripciones Abiertas 2026',
    descripcion: 'Formamos futbolistas, educamos personas. Entrenamientos especializados con profesionales de primer nivel en las mejores instalaciones del país.',
    telefono: '+5491122334455',
    whatsapp: '5491122334455',
    email: 'escuela@complejo.com',
    direccion: 'Predio Deportivo Complejo Choya, Canchas 1 y 2',
    portadaUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000',
    matricula: 10000,
    incluyeUniforme: true,
    notasPadres: 'Traer botines para césped sintético, canilleras obligatorias y botella de hidratación individual.',
    beneficio1Titulo: 'Seguridad Total',
    beneficio1Desc: 'Predio cerrado, servicio de emergencias médicas y coordinación permanente durante toda la jornada.',
    beneficio2Titulo: 'Grupos Reducidos',
    beneficio2Desc: 'Atención personalizada para cada niño, asegurando un aprendizaje técnico y táctico efectivo.',
    beneficio3Titulo: 'Competición',
    beneficio3Desc: 'Participación en ligas inter-complejos y torneos regionales para fomentar el espíritu deportivo.'
};

export function normalizeEscuelaConfig(data) {
    return {
        ...DEFAULT_ESCUELA_CONFIG,
        ...(data || {})
    };
}

function normalizeStudent(data, firestoreId) {
    return {
        id: firestoreId || data.id || `esc-${Date.now()}`,
        name: data.name || data.alumno || 'Alumno Sin Nombre',
        age: toNum(data.age ?? data.edad, 0),
        guardian: data.guardian || data.tutor || 'No especificado',
        phone: data.phone || data.telefono || 'Sin teléfono',
        courseId: data.courseId || null,
        category: data.category || data.categoria || '',
        status: data.status || 'active',
        payment: data.payment || 'pending',
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt || new Date().toISOString()),
    };
}

function normalizeCourse(data, firestoreId) {
    return {
        id: firestoreId || data.id || `curso-${Date.now()}`,
        name: data.name || 'Curso sin nombre',
        ageMin: data.ageMin === '' || data.ageMin == null ? '' : toNum(data.ageMin, ''),
        ageMax: data.ageMax === '' || data.ageMax == null ? '' : toNum(data.ageMax, ''),
        days: Array.isArray(data.days) ? data.days : (data.days ? [data.days] : []),
        timeStart: data.timeStart || '',
        timeEnd: data.timeEnd || '',
        price: toNum(data.price, 0),
        capacity: toNum(data.capacity, 0), // 0 = sin límite
        location: data.location || '',
        description: data.description || '',
        teacherIds: Array.isArray(data.teacherIds) ? data.teacherIds : [],
        status: data.status || 'active',
        order: typeof data.order === 'number' ? data.order : Date.now(),
        createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt || new Date().toISOString()),
    };
}

function normalizeTeacher(data, firestoreId) {
    return {
        id: firestoreId || data.id || `prof-${Date.now()}`,
        name: data.name || 'Profesor sin nombre',
        dni: data.dni || '',
        phone: data.phone || '',
        email: data.email || '',
        specialty: data.specialty || 'Director Técnico',
        avatar: data.avatar || '',
        certifications: data.certifications || '',
        schedule: data.schedule || '',
        salary: data.salary || '',
        notes: data.notes || '',
        status: data.status || 'active',
        order: typeof data.order === 'number' ? data.order : Date.now(),
        createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt || new Date().toISOString()),
    };
}

// ─── Datos de ejemplo iniciales ────────────────────────────────────────────

const DEFAULT_COURSES = [
    { id: 'curso-mini-cracks', name: 'Mini-Cracks', ageMin: 4, ageMax: 6, days: ['Mar', 'Jue'], timeStart: '17:00', timeEnd: '18:30', price: 15000, capacity: 20, order: 1 },
    { id: 'curso-pre-infantil', name: 'Pre-Infantil', ageMin: 7, ageMax: 9, days: ['Lun', 'Mié', 'Vie'], timeStart: '18:00', timeEnd: '19:30', price: 18000, capacity: 20, order: 2 },
    { id: 'curso-infantil', name: 'Infantil', ageMin: 10, ageMax: 12, days: ['Lun', 'Mié', 'Vie'], timeStart: '18:30', timeEnd: '20:00', price: 18000, capacity: 20, order: 3 },
    { id: 'curso-juveniles', name: 'Juveniles', ageMin: 13, ageMax: 15, days: ['Mar', 'Jue'], timeStart: '19:00', timeEnd: '21:00', price: 20000, capacity: 20, order: 4 },
].map(c => normalizeCourse(c));

const DEFAULT_TEACHERS = [
    { id: 'prof-1', name: 'Matías Silva', dni: '36.890.123', phone: '11 4455-6677', email: 'matias@complejo.com', specialty: 'Director Técnico FIFA / Infantil', certifications: 'Licencia PRO ATFA, Primeros Auxilios Cruz Roja', schedule: 'Lunes a Viernes 16:30 a 20:30', salary: '120.000', notes: 'A cargo de Mini-Cracks y Pre-Infantil.', status: 'active', order: 1 },
    { id: 'prof-2', name: 'Lucas Benítez', dni: '38.456.789', phone: '11 6677-8899', email: 'lucas.benitez@complejo.com', specialty: 'Preparador Físico / Juveniles', certifications: 'Profesorado Nacional de Educación Física', schedule: 'Martes y Jueves 18:00 a 21:00', salary: '95.000', notes: 'Especialista en coordinación y velocidad.', status: 'active', order: 2 },
    { id: 'prof-3', name: 'Gonzalo Navarro', dni: '39.112.233', phone: '11 8899-0011', email: 'gonzalo@complejo.com', specialty: 'Entrenador de Arqueros', certifications: 'Clínica de arqueros AFA', schedule: 'Miércoles y Sábados 17:00 a 19:00', salary: '80.000', notes: 'Entrenamiento específico de porteros.', status: 'active', order: 3 },
].map(t => normalizeTeacher(t));

const DEFAULT_STUDENTS = [
    { id: 'esc-1', name: 'Mateo González', courseId: 'curso-mini-cracks', category: 'Mini-Cracks', age: 5, guardian: 'Juan González', phone: '11 2233-4455', status: 'active', payment: 'paid' },
    { id: 'esc-2', name: 'Bautista Lopez', courseId: 'curso-pre-infantil', category: 'Pre-Infantil', age: 8, guardian: 'Maria Lopez', phone: '11 5566-7788', status: 'active', payment: 'pending' },
    { id: 'esc-3', name: 'Santino Rodriguez', courseId: 'curso-infantil', category: 'Infantil', age: 11, guardian: 'Pedro Rodriguez', phone: '11 9900-1122', status: 'inactive', payment: 'overdue' },
    { id: 'esc-4', name: 'Thiago Diaz', courseId: 'curso-juveniles', category: 'Juveniles', age: 14, guardian: 'Lucia Diaz', phone: '11 3344-5566', status: 'active', payment: 'paid' },
].map(s => normalizeStudent(s));

// ─── Configuración por colección ───────────────────────────────────────────

const CONFIGS = {
    alumnos: { lsKey: LS_KEYS.alumnos, col: 'escuela_inscripciones', normalize: normalizeStudent, defaults: DEFAULT_STUDENTS, seed: false },
    cursos: { lsKey: LS_KEYS.cursos, col: 'escuela_cursos', normalize: normalizeCourse, defaults: DEFAULT_COURSES, seed: true },
    profesores: { lsKey: LS_KEYS.profesores, col: 'escuela_profesores', normalize: normalizeTeacher, defaults: DEFAULT_TEACHERS, seed: true },
};

const sortList = (list) =>
    [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.name || '').localeCompare(b.name || ''));

function lsName(cfg, negocioId) {
    return `${cfg.lsKey}_${negocioId || 'giovanni'}`;
}

function readLocal(cfg, negocioId) {
    try {
        const raw = localStorage.getItem(lsName(cfg, negocioId));
        if (raw !== null) return JSON.parse(raw).map(x => cfg.normalize(x));
    } catch (e) {
        console.error('Error leyendo localStorage:', e);
    }
    return cfg.defaults;
}

function writeLocal(cfg, negocioId, list) {
    try {
        localStorage.setItem(lsName(cfg, negocioId), JSON.stringify(list));
    } catch (e) {
        console.error('Error guardando localStorage:', e);
    }
}

function subscribe(cfg, negocioId, onData, { sorted = false } = {}) {
    const key = negocioId || 'giovanni';
    const emit = (list) => onData(sorted ? sortList(list) : list);
    let seeded = false;

    emit(readLocal(cfg, key));

    try {
        const colRef = collection(db, 'negocios', key, cfg.col);
        const q = cfg === CONFIGS.alumnos ? query(colRef, orderBy('createdAt', 'desc')) : colRef;

        return onSnapshot(q, (snap) => {
            if (!snap.empty) {
                const list = snap.docs.map(d => cfg.normalize(d.data(), d.id));
                writeLocal(cfg, key, list);
                emit(list);
            } else {
                const local = readLocal(cfg, key);
                if (cfg.seed && !seeded && local.length) {
                    seeded = true;
                    local.forEach(item =>
                        setDoc(doc(db, 'negocios', key, cfg.col, item.id), item).catch(() => { })
                    );
                }
                emit(local);
            }
        }, (err) => {
            console.warn(`Firestore (${cfg.col}) → localStorage:`, err);
            emit(readLocal(cfg, key));
        });
    } catch (err) {
        console.warn('Firestore no disponible, usando localStorage:', err);
        return () => { };
    }
}

async function upsert(cfg, negocioId, item, { isNew = false } = {}) {
    const key = negocioId || 'giovanni';
    const current = readLocal(cfg, key);
    const exists = current.some(x => x.id === item.id);
    const next = exists ? current.map(x => (x.id === item.id ? { ...x, ...item } : x)) : [item, ...current];
    writeLocal(cfg, key, next);

    try {
        const ref = doc(db, 'negocios', key, cfg.col, item.id);
        const rest = { ...item };
        delete rest.createdAt;
        const payload = isNew ? { ...item, createdAt: serverTimestamp() } : rest;
        await setDoc(ref, payload, { merge: true });
    } catch (e) {
        console.warn(`Firestore (${cfg.col}) guardado → localStorage:`, e);
    }
    return item;
}

async function remove(cfg, negocioId, id) {
    const key = negocioId || 'giovanni';
    writeLocal(cfg, key, readLocal(cfg, key).filter(x => x.id !== id));
    try {
        await deleteDoc(doc(db, 'negocios', key, cfg.col, id));
    } catch (e) {
        console.warn(`Firestore (${cfg.col}) borrado → localStorage:`, e);
    }
}

// ─── API: Configuración de la Escuela ──────────────────────────────────────

export function readEscuelaConfigLocal(negocioId) {
    const key = negocioId || 'giovanni';
    try {
        const raw = localStorage.getItem(`${LS_KEYS.config}_${key}`);
        if (raw) return normalizeEscuelaConfig(JSON.parse(raw));
    } catch (e) {
        console.error('Error leyendo config de escuela:', e);
    }
    return { ...DEFAULT_ESCUELA_CONFIG };
}

export function subscribeEscuelaConfig(negocioId, onData) {
    const key = negocioId || 'giovanni';
    onData(readEscuelaConfigLocal(key));

    try {
        const docRef = doc(db, 'negocios', key, 'escuela_config', 'general');
        return onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                const conf = normalizeEscuelaConfig(snap.data());
                try {
                    localStorage.setItem(`${LS_KEYS.config}_${key}`, JSON.stringify(conf));
                } catch { }
                onData(conf);
            } else {
                const local = readEscuelaConfigLocal(key);
                setDoc(docRef, local, { merge: true }).catch(() => { });
                onData(local);
            }
        }, (err) => {
            console.warn('Error listener config escuela:', err);
            onData(readEscuelaConfigLocal(key));
        });
    } catch (e) {
        console.warn('Firestore config escuela no disponible:', e);
        return () => { };
    }
}

export async function saveEscuelaConfig(negocioId, configData) {
    const key = negocioId || 'giovanni';
    const normalized = normalizeEscuelaConfig(configData);
    try {
        localStorage.setItem(`${LS_KEYS.config}_${key}`, JSON.stringify(normalized));
    } catch (e) {
        console.error('Error guardando en localStorage:', e);
    }

    try {
        const docRef = doc(db, 'negocios', key, 'escuela_config', 'general');
        await setDoc(docRef, { ...normalized, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
        console.warn('Error guardando config escuela en Firestore:', err);
    }
    return normalized;
}

// ─── API: Alumnos ──────────────────────────────────────────────────────────

export const subscribeInscripciones = (negocioId, onData) => subscribe(CONFIGS.alumnos, negocioId, onData);

export async function submitInscripcion(negocioId, formData) {
    const student = normalizeStudent({ ...formData, id: `esc-${Date.now()}` });
    return upsert(CONFIGS.alumnos, negocioId, student, { isNew: true });
}

export async function updateInscripcionStatus(negocioId, studentId, updates) {
    const current = readLocal(CONFIGS.alumnos, negocioId || 'giovanni').find(s => s.id === studentId);
    return upsert(CONFIGS.alumnos, negocioId, normalizeStudent({ ...(current || {}), ...updates, id: studentId }, studentId));
}
export const updateInscripcion = updateInscripcionStatus;

export const deleteInscripcion = (negocioId, studentId) => remove(CONFIGS.alumnos, negocioId, studentId);

// ─── API: Cursos ───────────────────────────────────────────────────────────

export const subscribeCursos = (negocioId, onData) =>
    subscribe(CONFIGS.cursos, negocioId, onData, { sorted: true });

export async function saveCurso(negocioId, data) {
    const isNew = !data.id;
    const curso = normalizeCourse({ ...data, id: data.id || `curso-${Date.now()}`, order: data.order ?? Date.now() });
    return upsert(CONFIGS.cursos, negocioId, curso, { isNew });
}

export const deleteCurso = (negocioId, cursoId) => remove(CONFIGS.cursos, negocioId, cursoId);

// ─── API: Profesores ───────────────────────────────────────────────────────

export const subscribeProfesores = (negocioId, onData) =>
    subscribe(CONFIGS.profesores, negocioId, onData, { sorted: true });

export async function saveProfesor(negocioId, data) {
    const isNew = !data.id;
    const prof = normalizeTeacher({ ...data, id: data.id || `prof-${Date.now()}`, order: data.order ?? Date.now() });
    return upsert(CONFIGS.profesores, negocioId, prof, { isNew });
}

export const deleteProfesor = (negocioId, profId) => remove(CONFIGS.profesores, negocioId, profId);