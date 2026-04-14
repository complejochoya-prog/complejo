import React from "react";

/**
 * ShareLink provides a quick way for admins to share the public booking link.
 */
export default function ShareLink() {
    // In a real environment, this logic would detect the correct business ID
    const businessId = "1"; 
    const bookingUrl = `${window.location.origin}/${businessId}/reservar`;

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(`¡Hola! Ya puedes reservar tu turno online aquí: ${bookingUrl}`)}`;

    return (
        <div style={{ 
            backgroundColor: '#fffaf0', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #feebc8',
            marginTop: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
        }}>
            <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#9c4221' }}>📲 Link de Reserva para Clientes</h4>
                <p style={{ margin: 0, color: '#c05621', fontSize: '0.9rem' }}>Comparte este enlace por WhatsApp para recibir reservas automáticas.</p>
                <code style={{ display: 'block', marginTop: '10px', color: '#dd6b20', fontSize: '0.8rem' }}>{bookingUrl}</code>
            </div>
            
            <a 
                href={shareUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                    backgroundColor: '#ed8936',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                }}
            >
                Compartir por WhatsApp
            </a>
        </div>
    );
}
