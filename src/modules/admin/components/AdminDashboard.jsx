import React from "react";
import { useAdmin } from "../services/AdminContext";

/**
 * High-level dashboard showing all businesses registered in the system.
 */
export default function AdminDashboard(){
    const { businesses } = useAdmin();

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#2c3e50' }}>Panel Administrador Global</h1>
            <p style={{ color: '#7f8c8d' }}>Resumen de negocios registrados en la plataforma.</p>
            
            <div style={{ marginTop: 30 }}>
                <h3>Negocios activos ({businesses.filter(b => b.active).length})</h3>
                <div style={{ display: 'grid', gap: '15px', marginTop: 20 }}>
                    {businesses.map(b => (
                        <div key={b.id} style={{
                            padding: '15px',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            backgroundColor: b.active ? '#f0fff4' : '#fff5f5'
                        }}>
                            <strong>{b.name}</strong> - {b.active ? "✅ Activo" : "❌ Desactivado"}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
