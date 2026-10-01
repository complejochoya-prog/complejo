import { db } from '../../firebase/config';
import { 
    collection, doc, getDocs, setDoc, updateDoc, 
    deleteDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';

/**
 * Verifica si una notificación está vigente ahora (día + horario)
 */
export function isNotifVigente(notif) {
    if (!notif || !notif.activa) return false;

    // Día de la semana
    const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const currentDay = daysMap[new Date().getDay()];
    const dias = Array.isArray(notif.dias) ? notif.dias.map(d => d.toLowerCase()) : ['todos'];
    if (!dias.includes('todos') && !dias.includes(currentDay)) return false;

    // Ventana horaria
    if (notif.horaDesde && notif.horaHasta) {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const [fromH, fromM] = notif.horaDesde.split(':').map(Number);
        const [toH, toM] = notif.horaHasta.split(':').map(Number);
        const fromMins = (fromH || 0) * 60 + (fromM || 0);
        const toMins = (toH === 0 && toM === 0) ? 24 * 60 : (toH || 0) * 60 + (toM || 0);

        if (toMins < fromMins) {
            // Cruza medianoche (ej 20:00 a 02:00)
            if (currentMins < fromMins && currentMins > toMins) return false;
        } else {
            if (currentMins < fromMins || currentMins > toMins) return false;
        }
    }
    return true;
}

/**
 * Filtra las promos activas de un espacio y las devuelve como ítems de menú del bar
 */
export function getActivePromoItems(notificaciones, espacio = 'bar') {
    return notificaciones
        .filter(n => n.activa && (n.espacio || '').toLowerCase() === espacio && n.promoItem && isNotifVigente(n))
        .map(n => {
            const promoPrice = Number(n.promoItem.precio ?? n.promoItem.price ?? 0) || 0;
            return {
                id: `promo-${n.id}`,
                nombre: n.promoItem.nombre || n.titulo,
                descripcion: n.promoItem.descripcion || n.mensaje,
                precio: promoPrice,
                price: promoPrice,
                precioOriginal: Number(n.promoItem.precioOriginal ?? n.promoItem.originalPrice ?? 0) || 0,
                categoria: '🔥 Promo',
                stock: 999,
                img: n.promoItem.img || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400',
                isPromo: true,
                promoBadge: n.badge || 'PROMO',
                promoNotifId: n.id,
                horaDesde: n.horaDesde,
                horaHasta: n.horaHasta
            };
        });
}

export const DEFAULT_NOTIFICACIONES = [
    {
        id: 'notif-bar-2x1',
        titulo: '¡Promo 2x1 en Cervezas & Tragos!',
        mensaje: 'Aprovechá 2x1 en cervezas seleccionadas y picadas en el bar. ¡Ideal para el tercer tiempo!',
        espacio: 'bar',
        dias: ['todos'],
        horaDesde: '00:00',
        horaHasta: '23:59',
        duracion: 5,
        tema: 'amber',
        badge: 'PROMO BAR 2X1',
        link: 'menu',
        linkTexto: 'Ver Menú & Pedir',
        activa: true,
        promoItem: {
            nombre: 'Cerveza 2x1',
            descripcion: '2 cervezas artesanales por el precio de 1. ¡Aprovechá!',
            precio: 1500,
            precioOriginal: 3000,
            img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400'
        }
    },
    {
        id: 'notif-canchas-manana',
        titulo: '¡Super Promo Turnos Mañanas!',
        mensaje: 'Jugá 2 horas por $10.000 en Fútbol 5 y Pádel reservando de 08:00 a 12:00 hs.',
        espacio: 'reservas',
        dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
        horaDesde: '08:00',
        horaHasta: '12:00',
        duracion: 5,
        tema: 'emerald',
        badge: 'OFERTA DE LA MAÑANA',
        link: 'reservas',
        linkTexto: 'Reservar Cancha',
        activa: true
    },
    {
        id: 'notif-torneo-inscripcion',
        titulo: '¡Inscripciones Abiertas Torneo Nocturno!',
        mensaje: 'Sumá tu equipo a la nueva Liga Nocturna con premios en efectivo y trofeos.',
        espacio: 'torneos',
        dias: ['todos'],
        horaDesde: '00:00',
        horaHasta: '23:59',
        duracion: 5,
        tema: 'indigo',
        badge: 'NUEVO TORNEO',
        link: 'torneos',
        linkTexto: 'Ver Torneo & Inscribirme',
        activa: true
    }
];

export const notificacionesService = {
    // Escuchar notificaciones en tiempo real
    subscribeNotificaciones: (negocioId, onData, onError) => {
        if (!negocioId) {
            onData(DEFAULT_NOTIFICACIONES);
            return () => {};
        }

        const colRef = collection(db, 'negocios', negocioId, 'notificaciones');
        return onSnapshot(colRef, (snapshot) => {
            if (snapshot.empty) {
                onData(DEFAULT_NOTIFICACIONES);
            } else {
                const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                onData(list.length > 0 ? list : DEFAULT_NOTIFICACIONES);
            }
        }, (err) => {
            console.warn("Error leyendo notificaciones de Firestore:", err);
            onData(DEFAULT_NOTIFICACIONES);
            if (onError) onError(err);
        });
    },

    // Guardar o actualizar notificación
    saveNotificacion: async (negocioId, notificacion) => {
        if (!negocioId) return false;
        const id = notificacion.id || `notif-${Date.now()}`;
        const ref = doc(db, 'negocios', negocioId, 'notificaciones', id);
        
        await setDoc(ref, {
            ...notificacion,
            id,
            activa: notificacion.activa !== undefined ? notificacion.activa : true,
            duracion: Number(notificacion.duracion) || 5,
            updatedAt: serverTimestamp(),
            createdAt: notificacion.createdAt || serverTimestamp()
        }, { merge: true });

        return id;
    },

    // Alternar estado activo / inactivo
    toggleEstado: async (negocioId, id, currentEstado) => {
        if (!negocioId || !id) return false;
        const ref = doc(db, 'negocios', negocioId, 'notificaciones', id);
        await updateDoc(ref, {
            activa: !currentEstado,
            updatedAt: serverTimestamp()
        });
        return true;
    },

    // Eliminar notificación
    deleteNotificacion: async (negocioId, id) => {
        if (!negocioId || !id) return false;
        const ref = doc(db, 'negocios', negocioId, 'notificaciones', id);
        await deleteDoc(ref);
        return true;
    }
};
