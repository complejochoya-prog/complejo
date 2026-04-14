import ReservasCalendar from "./ReservasCalendar";
import ShareLink from "./ShareLink";

/**
 * Main panel for court reservations management.
 */
export default function ReservasPanel() {
    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#2d3748', margin: 0 }}>Gestión de Reservas</h1>
                    <p style={{ color: '#718096', marginTop: '5px' }}>Organiza los horarios de tus canchas con el calendario visual.</p>
                </div>
                <button style={{
                    backgroundColor: '#38a169',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    + Nueva Reserva
                </button>
            </div>

            <ReservasCalendar />

            <ShareLink />

            <div style={{ marginTop: 20, display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#3182ce', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>Reserva Confirmada</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#e53e3e', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>Bloqueo de Cancha</span>
                </div>
            </div>
        </div>
    );
}
