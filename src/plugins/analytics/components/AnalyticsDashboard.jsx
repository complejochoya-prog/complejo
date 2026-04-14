import React from "react";

/**
 * Analytics Dashboard component provided by the Analytics plugin.
 */
export default function AnalyticsDashboard() {
    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#2c3e50' }}>Analytics del Sistema</h1>
            <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                Este panel muestra métricas avanzadas sobre el rendimiento y uso de la plataforma.
            </p>
            
            <div style={{ 
                marginTop: 30, 
                padding: '30px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px dashed #cbd5e0',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#4a5568' }}>Próximamente: Gráficos de Ventas y Actividad</h3>
                <p style={{ color: '#718096' }}>El sistema de recolección de datos está en proceso de implementación.</p>
            </div>
        </div>
    );
}
