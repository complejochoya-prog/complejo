import { db } from '../../../firebase/config';
import {
    collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc, addDoc, getDoc, getDocs, limit, serverTimestamp, where
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConfig } from '../../core/services/ConfigContext';

/**
 * RESERVAS CONTEXT (FIRESTORE REALTIME)
 * Handles physical resources (canchas, quinchos) and online bookings.
 */
const ReservasContext = createContext({});

export function useReservas() {
    return useContext(ReservasContext);
}

export default function ReservasProvider({ children }) {
    const { negocioId } = useConfig();
    const [resources, setResources] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [timeSchedule, setTimeSchedule] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState({});
    const [scheduleBlocks, setScheduleBlocks] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [liveUsage, setLiveUsage] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        // 1. RESOURCES (Espacios)
        onSnapshot(collection(db, 'negocios', negocioId, 'espacios'), (snap) => {
            setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 2. ACTIVE BOOKINGS (Reservas Online)
        const qBookings = query(collection(db, 'negocios', negocioId, 'reservas'), where('status', '!=', 'Cancelado'), orderBy('timestamp', 'desc'));
        onSnapshot(qBookings, (snap) => {
            setBookings(snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                timestamp: d.data().timestamp?.toDate() || new Date()
            })));
        });

        // 3. LIVE USAGE (Presencial)
        const qLive = query(collection(db, 'negocios', negocioId, 'live_usage'), orderBy('slot', 'asc'));
        onSnapshot(qLive, (snap) => {
            setLiveUsage(snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                actualStartTime: d.data().actualStartTime?.toDate()
            })));
        });

        // 4. CONFIG GENERAL
        const DEFAULT_SCHEDULE = [];
        for (let h = 8; h <= 23; h++) {
            DEFAULT_SCHEDULE.push({ 
                hour: `${h}:00`, 
                type: h >= 19 ? 'nocturno' : 'diurno', 
                priceDiurno: 5000, 
                precioNocturno: 7000 
            });
        }

        onSnapshot(doc(db, 'negocios', negocioId, 'configuracion', 'general'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.timeSlots) setTimeSlots(data.timeSlots);
                setTimeSchedule(data.timeSchedule || DEFAULT_SCHEDULE);
                if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
            } else {
                setTimeSchedule(DEFAULT_SCHEDULE);
            }
        });

        // 5. BLOCKS
        onSnapshot(collection(db, 'negocios', negocioId, 'schedule_blocks'), (snap) => {
            setScheduleBlocks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {};
    }, [negocioId]);

    const addResource = async (resource) => {
        const id = `esp-${Date.now()}`;
        await setDoc(doc(db, 'negocios', negocioId, 'espacios', id), { ...resource, id, negocio_id: negocioId, active: true });
    };

    const updateResource = async (id, updates) => {
        await updateDoc(doc(db, 'negocios', negocioId, 'espacios', id), updates);
    };

    const removeResource = async (id) => {
        await deleteDoc(doc(db, 'negocios', negocioId, 'espacios', id));
    };

    const addBooking = async (bookingData, payment = null) => {
        const id = `res-${Date.now()}`;
        
        if (!negocioId) {
            console.error("Critical Error: negocioId is undefined in addBooking. Check ConfigContext.");
            throw new Error("No se pudo identificar el negocio para realizar la reserva.");
        }

        const payload = {
            ...bookingData,
            id,
            negocio_id: negocioId,
            timestamp: serverTimestamp(),
            status: 'Confirmado'
        };

        try {
            const reservaRef = doc(db, 'negocios', negocioId, 'reservas', id);
            await setDoc(reservaRef, payload);
        } catch (err) {
            console.error("Firestore Error in addBooking:", err);
            throw err;
        }

        if (payment) {
            const { cajaService } = await import('../../../core/services/cajaService');
            await cajaService.addMovement(negocioId, {
                tipo: 'entrada',
                categoria: 'Reserva Online',
                monto: payment.amount || bookingData.price || 0,
                descripcion: `Reserva: ${bookingData.resource?.name || 'Espacio'}`,
                origen: 'reserva'
            });
        }
    };

    const checkAvailability = (resourceId, date, slotTime) => {
        // Logic remains in-memory as state is already real-time
        const occupied = bookings.some(b => 
            b.resource?.id === resourceId && 
            b.fullDate === date && 
            (b.time === slotTime || (b.rentalMode === 'franja' && slotTime >= b.time && slotTime < b.endTime))
        );
        if (occupied) return false;

        const live = liveUsage.some(u => 
            u.resourceId === resourceId && 
            u.date === date && 
            u.status !== 'finished' && 
            u.slot === slotTime
        );
        return !live;
    };

    const getAvailableSlots = (date) => {
        // Simple implementation for now: return the base schedule
        // and let checkAvailability handle the "Occupied" status in the UI
        return timeSchedule;
    };

    const value = {
        resources,
        timeSlots,
        timeSchedule,
        blockedSlots,
        scheduleBlocks,
        bookings,
        liveUsage,
        addResource,
        updateResource,
        removeResource,
        addBooking,
        checkAvailability,
        getAvailableSlots,
        updateTimeSchedule: async (schedule) => {
            await updateDoc(doc(db, 'negocios', negocioId, 'configuracion', 'general'), {
                timeSchedule: schedule
            });
        }
    };

    return (
        <ReservasContext.Provider value={value}>
            {children}
        </ReservasContext.Provider>
    );
}
