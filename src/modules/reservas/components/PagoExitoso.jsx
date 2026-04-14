import React, { useEffect } from "react";

/**
 * Success page after a successful MercadoPago payment.
 */
export default function PagoExitoso() {
    useEffect(() => {
        console.log("[Pagos] Pago confirmado exitosamente.");
    }, []);

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'sans-serif',
            backgroundColor: '#f0fff4' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '50px', 
                borderRadius: '20px', 
                textAlign: 'center', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                maxWidth: '400px'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✅</div>
                <h1 style={{ color: '#276749', margin: '0 0 15px 0' }}>¡Reserva Confirmada!</h1>
                <p style={{ color: '#2f855a', lineHeight: '1.6', fontSize: '1.1rem' }}>
                    Tu pago ha sido procesado con éxito y tu turno ha sido agendado. 
                    Te esperamos en el complejo.
                </p>
                
                <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                        marginTop: '30px',
                        backgroundColor: '#38a169',
                        color: 'white',
                        padding: '12px 30px',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
}
