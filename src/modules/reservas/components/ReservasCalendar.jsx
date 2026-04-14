import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getReservas } from "../services/reservasService";

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

/**
 * Visual Calendar for managing court reservations.
 */
export default function ReservasCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const reservas = await getReservas();
                
                const formatted = reservas.map(r => ({
                    id: r._id,
                    title: `${r.cancha} - ${r.cliente}`,
                    start: new Date(`${r.fecha}T${r.hora}`),
                    end: new Date(`${r.fecha}T${r.hora}`), // Default to 1 hour or specific end time if available
                }));

                setEvents(formatted);
            } catch (error) {
                console.error("Error loading reservations:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) return <div>Cargando calendario...</div>;

    return (
        <div style={{ height: "700px", padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={(slot) => {
                    console.log("[Reservas] Seleccionado espacio:", slot);
                    alert(`Iniciando reserva para el: ${format(slot.start, 'dd/MM HH:mm')}`);
                    // Future Phase: Open Create Booking Modal
                }}
                messages={{
                    next: "Sig",
                    previous: "Ant",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento"
                }}
                style={{ height: '100%' }}
            />
        </div>
    );
}
