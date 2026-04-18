import { db } from '../../../firebase/config';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    setDoc, 
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';

const DEFAULT_ESPACIOS = [
    { id: 'esp-1', title: 'Fútbol 5 sintético', desc: 'Cesped PRO-FIFA', img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800', active: true, order: 1 },
    { id: 'esp-2', title: 'Fútbol 7 profesional', desc: 'Iluminación LED', img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800', active: true, order: 2 },
    { id: 'esp-3', title: 'Padel Glass Pro', desc: 'Canchas vidriadas', img: 'https://images.unsplash.com/photo-1626245917164-214273c248ca?q=80&w=800', active: true, order: 3 },
];

export async function fetchCanchasDisponibles(negocioId) {
    if (!negocioId) return DEFAULT_ESPACIOS;
    try {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'espacios'));
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length === 0) list = DEFAULT_ESPACIOS;
        
        return list
            .filter(e => e.active)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(e => ({
                id: e.id,
                nombre: e.title || e.name,
                tipo: e.desc || e.description,
                img: e.img,
                precio_diurno: 8000,
                precio_nocturno: 12000,
                disponible: true,
                capacidad: e.capacidad ? parseInt(e.capacidad, 10) : null
            }));
    } catch (e) {
        console.error("Error fetching canchas:", e);
        return DEFAULT_ESPACIOS;
    }
}

export async function fetchHorariosDisponibles(negocioId, canchaId, fecha) {
    if (!negocioId) return [];
    try {
        // 1. Horarios Config
        const hSnap = await getDoc(doc(db, 'negocios', negocioId, 'configuracion', 'horarios'));
        const config = hSnap.exists() ? hSnap.data() : { horaApertura: '08:00', horaCierre: '23:00' };
        
        // 2. Bloqueos
        const bSnap = await getDocs(query(
            collection(db, 'negocios', negocioId, 'bloqueos'),
            where('espacioId', '==', canchaId),
            where('fecha', '==', fecha)
        ));
        const bloqueos = bSnap.docs.map(d => d.data());

        // 3. Reservas Existentes
        const rSnap = await getDocs(query(
            collection(db, 'negocios', negocioId, 'reservas'),
            where('resource.id', '==', canchaId),
            where('fullDate', '==', fecha)
        ));
        const reservas = rSnap.docs.map(d => d.data()).filter(r => r.status !== 'cancelada');

        // Logic for timeline (simplified similar to previous implementation but using Firestore data)
        const horaApertura = config.espaciosHorarios?.[canchaId]?.horaApertura || config.horaApertura || '08:00';
        const horaCierre = config.espaciosHorarios?.[canchaId]?.horaCierre || config.horaCierre || '23:00';
        
        const start = parseInt(horaApertura.split(':')[0]);
        const end = parseInt(horaCierre.split(':')[0]);
        const hours = [];
        
        if (start <= end) {
            for (let i = start; i < end; i++) hours.push(`${i.toString().padStart(2, '0')}:00`);
        } else {
            for (let i = start; i <= 23; i++) hours.push(`${i.toString().padStart(2, '0')}:00`);
            for (let i = 0; i < end; i++) hours.push(`${i.toString().padStart(2, '0')}:00`);
        }

        const nocturnasSet = new Set(['20:00','21:00','22:00','23:00','00:00','01:00','02:00','03:00']);

        return hours.map(h => {
            const ocupada = reservas.some(r => r.time.includes(h));
            const bloqueada = bloqueos.some(b => {
                if (b.modo === 'dia_completo') return true;
                const hNum = parseInt(h.split(':')[0]);
                const s = parseInt(b.horaInicio.split(':')[0]);
                const e = parseInt(b.horaFin.split(':')[0]);
                return hNum >= s && hNum < e;
            });
            
            return {
                hora: h,
                disponible: !ocupada && !bloqueada,
                esNocturno: nocturnasSet.has(h)
            };
        });
    } catch (e) {
        console.error("Error fetching schedules:", e);
        return [];
    }
}

export async function submitReserva(negocioId, reservaData) {
    const id = `res_${Date.now()}`;
    const ref = doc(db, 'negocios', negocioId, 'reservas', id);
    const docData = {
        ...reservaData,
        id,
        status: 'confirmada',
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp()
    };
    await setDoc(ref, docData);
    return { success: true, reserva: docData };
}

export async function fetchHistorialReservas(negocioId, clienteId) {
    if (!negocioId || !clienteId) return [];
    try {
        const q = query(
            collection(db, 'negocios', negocioId, 'reservas'),
            where('cliente.telefono', '==', clienteId),
            orderBy('timestamp', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching history:", e);
        return [];
    }
}

export async function fetchBarMenu(negocioId) {
    if (!negocioId) return [];
    try {
        const snap = await getDocs(collection(db, 'negocios', negocioId, 'inventario'));
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const barItems = list.filter(i => i.sector === 'BAR' || i.sector === 'Cocina');
        
        if (barItems.length === 0) {
             return [
                { id: 'p1', nombre: 'Hamburguesa Complejo', descripcion: 'Doble carne, cheddar, bacon y fritas.', precio: 5000, categoria: 'Comidas', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
                { id: 'p2', nombre: 'Pizza Mozzarella', descripcion: '8 porciones', precio: 4500, categoria: 'Comidas', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
            ];
        }
        
        return barItems.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || `${item.categoria}`,
            precio: item.precio,
            categoria: item.categoria,
            img: item.img || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=400'
        }));
    } catch (e) {
        return [];
    }
}
