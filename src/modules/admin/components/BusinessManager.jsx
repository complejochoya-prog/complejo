import React, { useState } from "react";
import { useAdmin } from "../services/AdminContext";

/**
 * Management interface for creating and toggling businesses.
 */
export default function BusinessManager(){
    const { businesses, addBusiness, toggleBusiness } = useAdmin();
    const [name, setName] = useState("");

    const handleAdd = () => {
        if (!name) return;
        addBusiness(name);
        setName("");
    };

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Gestión de Negocios</h2>
            
            <div style={{ marginBottom: 30, display: 'flex', gap: '10px' }}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del nuevo negocio"
                    style={{
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        flex: 1
                    }}
                />
                <button 
                    onClick={handleAdd}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Crear Negocio
                </button>
            </div>

            <hr style={{ borderColor: '#eee' }} />

            <div style={{ display: 'grid', gap: '10px', marginTop: 30 }}>
                {businesses.map(b => (
                    <div key={b.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        border: '1px solid #eee',
                        borderRadius: '8px'
                    }}>
                        <strong>{b.name}</strong>
                        <button
                            onClick={() => toggleBusiness(b.id)}
                            style={{
                                padding: '5px 15px',
                                backgroundColor: b.active ? '#e74c3c' : '#2ecc71',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {b.active ? "Desactivar" : "Activar"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
