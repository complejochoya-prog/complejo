import { db } from '../../../firebase/config';
import { 
    doc, getDoc, setDoc, updateDoc, 
    collection, getDocs, deleteDoc, 
    query, where, serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_CONFIG = {
    horaApertura: '08:00',
    horaCierre: '03:00',
    diasOperativos: {
        lun: true, mar: true, mie: true, jue: true, vie: true, sab: true, dom: true
    },
    espaciosHorarios: {},
};

export const fetchHorariosConfig = async (negocioId) => {
    if (!negocioId) return DEFAULT_CONFIG;
    try {
        const ref = doc(db, 'negocios', negocioId, 'configuracion', 'horarios');
        const snap = await getDoc(ref);
        return snap.exists() ? { ...DEFAULT_CONFIG, ...snap.data() } : DEFAULT_CONFIG;
    } catch (e) {
        console.error("Error fetching horarios config:", e);
        return DEFAULT_CONFIG;
    }
};

export const updateHorariosConfig = async (negocioId, updates) => {
    if (!negocioId) return;
    const ref = doc(db, 'negocios', negocioId, 'configuracion', 'horarios');
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
};

export const fetchBloqueos = async (negocioId, espacioId = null, fecha = null) => {
    if (!negocioId) return [];
    try {
        const ref = collection(db, 'negocios', negocioId, 'bloqueos');
        let q = query(ref);
        
        if (espacioId) q = query(ref, where('espacioId', '==', espacioId));
        if (fecha) q = query(ref, where('fecha', '==', fecha));
        
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching bloqueos:", e);
        return [];
    }
};

export const addBloqueo = async (negocioId, bloqueo) => {
    if (!negocioId) return;
    const id = `blk_${Date.now()}`;
    const ref = doc(db, 'negocios', negocioId, 'bloqueos', id);
    const nuevo = {
        ...bloqueo,
        id,
        createdAt: serverTimestamp()
    };
    await setDoc(ref, nuevo);
    return nuevo;
};

export const removeBloqueo = async (negocioId, bloqueoId) => {
    if (!negocioId) return;
    await deleteDoc(doc(db, 'negocios', negocioId, 'bloqueos', bloqueoId));
    return true;
};

export const getHorasDisponibles = () => {
    const horas = [];
    for (let i = 0; i < 24; i++) {
        horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
};

export const isHoraBloqueada = async (negocioId, espacioId, fecha, hora) => {
    const bloqueos = await fetchBloqueos(negocioId, espacioId, fecha);
    
    return bloqueos.some(b => {
        if (b.modo === 'dia_completo') return true;
        if (b.modo === 'franja') {
            const hNum = parseInt(hora.split(':')[0]);
            const startNum = parseInt(b.horaInicio.split(':')[0]);
            const endNum = parseInt(b.horaFin.split(':')[0]);
            if (startNum <= endNum) {
                return hNum >= startNum && hNum <= endNum;
            } else {
                return hNum >= startNum || hNum <= endNum;
            }
        }
        return false;
    });
};
