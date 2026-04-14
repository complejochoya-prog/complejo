import React from "react";
import { getModules } from "../../../core/modules/moduleRegistry";

/**
 * System monitor showing all registered modules.
 */
export default function SystemStats(){
    const modules = getModules();

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Estado del Sistema</h2>
            <p style={{ color: '#7f8c8d' }}>Monitor de módulos e infraestructura.</p>

            <div style={{ 
                marginTop: 30, 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                borderLeft: '4px solid #3498db'
            }}>
                <p style={{ fontSize: '1.2rem' }}>
                    <strong>Módulos cargados:</strong> {modules.length}
                </p>
            </div>

            <h3 style={{ marginTop: 40 }}>Lista de Módulos Registrados</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
                {modules.map(m => (
                    <li key={m.id} style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            backgroundColor: '#2ecc71' 
                        }}></span>
                        <strong>{m.id}</strong> - {m.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
