import React, { useState, useEffect } from "react";
import { getFields } from "../services/fieldsService";
import { crearReserva } from "../services/reservasService";
import { pagarReserva } from "../services/pagosService";

/**
 * PublicReservas allows unauthenticated clients to request bookings via a public link.
 */
export default function PublicReservas() {
    const [fields, setFields] = useState([]);
    const [cliente, setCliente] = useState("");
    const [cancha, setCancha] = useState("");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadFields();
    }, []);

    async function loadFields() {
        try {
            const data = await getFields();
            setFields(data);
        } catch (error) {
            console.error("Error loading fields:", error);
        }
    }

    async function reservar() {
        if (!cliente || !cancha || !fecha || !hora) {
            alert("Por favor completa todos los datos para solicitar la reserva.");
            return;
        }

        try {
            setSending(true);
            
            // Request payment link
            const pago = await pagarReserva({
                cliente,
                cancha,
                fecha,
                hora
            });

            if (pago.init_point) {
                // Redirect to MercadoPago
                window.location.href = pago.init_point;
            } else {
                throw new Error("No se pudo generar el link de pago");
            }

        } catch (error) {
            alert("Error al procesar la reserva: " + error.message);
        } finally {
            setSending(false);
        }
    }

    return (
        <div style={{ 
            padding: '40px 20px', 
            fontFamily: 'sans-serif', 
            maxWidth: '500px', 
            margin: '0 auto',
            backgroundColor: '#f7fafc',
            minHeight: '100vh'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚽</div>
                <h1 style={{ color: '#2d3748', margin: 0 }}>Reservar Cancha</h1>
                <p style={{ color: '#718096' }}>Completa los datos para agendar tu turno.</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>Nombre del Cliente</label>
                    <input
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                        placeholder="Ej: Juan Pérez"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>Seleccionar Cancha</label>
                    <select
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                        value={cancha}
                        onChange={(e) => setCancha(e.target.value)}
                    >
                        <option value="">-- Elige una cancha --</option>
                        {fields.map(f => (
                            <option key={f._id} value={f.name}>
                                {f.name} (${f.precio})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>Fecha</label>
                        <input
                            type="date"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>Hora</label>
                        <input
                            type="time"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'box-sizing' }}
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    onClick={reservar}
                    disabled={sending}
                    style={{
                        width: '100%',
                        backgroundColor: '#38a169',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        opacity: sending ? 0.7 : 1
                    }}
                >
                    {sending ? "Enviando..." : "Confirmar Reserva"}
                </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '30px', color: '#a0aec0', fontSize: '0.8rem' }}>
                Al confirmar, se enviará una solicitud al complejo.
            </p>
        </div>
    );
}
