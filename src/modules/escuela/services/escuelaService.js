import { db } from '../../../firebase/config';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'escuela_inscripciones_db';

export const CATEGORY_DETAILS = {
    'Mini-Cracks': { days: 'Mar y Jue', time: '17:00 - 18:30', price: '$15.000', ageRange: '4-6 años' },
    'Pre-Infantil': { days: 'Lun, Mie y Vie', time: '18:00 - 19:30', price: '$18.000', ageRange: '7-9 años' },
    'Infantil': { days: 'Lun, Mie y Vie', time: '18:30 - 20:00', price: '$18.000', ageRange: '10-12 años' },
    'Juveniles': { days: 'Mar y Jue', time: '19:00 - 21:00', price: '$20.000', ageRange: '13-15 años' }
};

/**
 * Normaliza cualquier objeto de alumno a los campos estándar,
 * sin importar si vino del formulario público (alumno/tutor/...)
 * o del panel admin (name/guardian/...).
 */
function normalizeStudent(data, firestoreId) {
    const category = data.category || data.categoria || 'Mini-Cracks';
    const cat = CATEGORY_DETAILS[category] || CATEGORY_DETAILS['Mini-Cracks'];

    return {
        id: firestoreId || data.id || `esc-${Date.now()}`,
        name: data.name || data.alumno || 'Alumno Sin Nombre',
        age: parseInt(data.age || data.edad) || 0,
        guardian: data.guardian || data.tutor || 'No especificado',
        phone: data.phone || data.telefono || 'Sin teléfono',
        category,
        scheduleDays: data.scheduleDays || cat.days,
        scheduleTime: data.scheduleTime || cat.time,
        monthlyFee: data.monthlyFee || cat.price,
        ageRange: data.ageRange || cat.ageRange,
        status: data.status || 'active',
        payment: data.payment || 'pending',
        createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt || new Date().toISOString()),
    };
}

const DEFAULT_STUDENTS = [
    { id: 'esc-1', name: 'Mateo González', category: 'Mini-Cracks', age: 5, guardian: 'Juan González', phone: '11 2233-4455', status: 'active', payment: 'paid', createdAt: new Date().toISOString() },
    { id: 'esc-2', name: 'Bautista Lopez', category: 'Pre-Infantil', age: 8, guardian: 'Maria Lopez', phone: '11 5566-7788', status: 'active', payment: 'pending', createdAt: new Date().toISOString() },
    { id: 'esc-3', name: 'Santino Rodriguez', category: 'Infantil', age: 11, guardian: 'Pedro Rodriguez', phone: '11 9900-1122', status: 'inactive', payment: 'overdue', createdAt: new Date().toISOString() },
    { id: 'esc-4', name: 'Thiago Diaz', category: 'Juveniles', age: 14, guardian: 'Lucia Diaz', phone: '11 3344-5566', status: 'active', payment: 'paid', createdAt: new Date().toISOString() },
].map(s => normalizeStudent(s));

// ─── LocalStorage helpers ──────────────────────────────────────────────────

function getLocalStorageInscripciones(negocioId) {
    try {
        const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${negocioId || 'default'}`);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Normaliza por si hay datos viejos con nombres distintos
            return parsed.map(s => normalizeStudent(s));
        }
    } catch (e) {
        console.error('Error reading localStorage:', e);
    }
    return DEFAULT_STUDENTS;
}

function saveLocalStorageInscripciones(negocioId, list) {
    try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${negocioId || 'default'}`, JSON.stringify(list));
    } catch (e) {
        console.error('Error saving localStorage:', e);
    }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Suscripción en tiempo real a las inscripciones.
 */
export function subscribeInscripciones(negocioId, onData) {
    const key = negocioId || 'giovanni';

    // Lectura inicial desde localStorage (ya normalizada)
    onData(getLocalStorageInscripciones(key));

    try {
        const q = query(
            collection(db, 'negocios', key, 'escuela_inscripciones'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            if (!snap.empty) {
                const list = snap.docs.map(d => normalizeStudent(d.data(), d.id));
                saveLocalStorageInscripciones(key, list);
                onData(list);
            } else {
                onData(getLocalStorageInscripciones(key));
            }
        }, (err) => {
            console.warn('Firestore snapshot fallback → localStorage:', err);
            onData(getLocalStorageInscripciones(key));
        });

        return unsubscribe;
    } catch (err) {
        console.warn('Firestore no disponible, usando localStorage:', err);
        return () => { };
    }
}

/**
 * Envía una nueva inscripción (desde el formulario público o el panel admin).
 */
export async function submitInscripcion(negocioId, formData) {
    const key = negocioId || 'giovanni';

    // normalizeStudent acepta tanto {alumno, tutor,...} como {name, guardian,...}
    const newStudent = normalizeStudent(
        { ...formData, id: `esc-${Date.now()}` }
    );

    // 1. Guardar en localStorage inmediatamente
    const currentLocal = getLocalStorageInscripciones(key);
    saveLocalStorageInscripciones(key, [newStudent, ...currentLocal]);

    // 2. Intentar guardar en Firestore
    try {
        const ref = doc(db, 'negocios', key, 'escuela_inscripciones', newStudent.id);
        await setDoc(ref, {
            ...newStudent,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.warn('Firestore save fallback → localStorage:', e);
    }

    return newStudent;
}

/**
 * Actualiza el estado de pago o cualquier campo de un alumno.
 */
export async function updateInscripcionStatus(negocioId, studentId, updates) {
    const key = negocioId || 'giovanni';

    const currentLocal = getLocalStorageInscripciones(key);
    const updated = currentLocal.map(s => s.id === studentId ? { ...s, ...updates } : s);
    saveLocalStorageInscripciones(key, updated);

    try {
        const ref = doc(db, 'negocios', key, 'escuela_inscripciones', studentId);
        await updateDoc(ref, updates);
    } catch (e) {
        console.warn('Firestore update fallback → localStorage:', e);
    }
}

/**
 * Elimina un alumno de la lista.
 */
export async function deleteInscripcion(negocioId, studentId) {
    const key = negocioId || 'giovanni';

    const currentLocal = getLocalStorageInscripciones(key);
    saveLocalStorageInscripciones(key, currentLocal.filter(s => s.id !== studentId));

    try {
        const ref = doc(db, 'negocios', key, 'escuela_inscripciones', studentId);
        await deleteDoc(ref);
    } catch (e) {
        console.warn('Firestore delete fallback → localStorage:', e);
    }
}