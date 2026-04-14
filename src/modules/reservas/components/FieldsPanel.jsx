import React, { useEffect, useState } from "react";
import { getFields, createField } from "../services/fieldsService";

/**
 * FieldsPanel allows administrators to manage courts and their properties.
 */
export default function FieldsPanel() {
    const [fields, setFields] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(10000);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFields();
    }, []);

    async function loadFields() {
        try {
            const data = await getFields();
            setFields(data);
        } catch (error) {
            console.error("Error loading fields:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!name) return alert("Ingresa un nombre");
        
        try {
            await createField({
                name,
                tipo: "futbol5",
                precio: price,
                apertura: "08:00",
                cierre: "02:00"
            });
            setName("");
            loadFields();
        } catch (error) {
            alert("Error al crear cancha");
        }
    }

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: '#2d3748', margin: 0 }}>Gestión de Canchas</h1>
                <p style={{ color: '#718096', marginTop: '5px' }}>Configura las canchas de tu complejo, sus precios y horarios.</p>
            </div>

            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                marginBottom: '40px',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2d3748' }}>Añadir Nueva Cancha</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <input
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', flex: 1, minWidth: '200px' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Cancha 1 (Sintético)"
                    />
                    <input
                        type="number"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '150px' }}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Precio"
                    />
                    <button 
                        onClick={handleCreate}
                        style={{
                            backgroundColor: '#3182ce',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        + Crear Cancha
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {fields.map(f => (
                    <div key={f._id} style={{ 
                        backgroundColor: 'white', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚽</div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>{f.name}</h4>
                        <div style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '15px' }}>{f.tipo}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#38a169', fontSize: '1.2rem' }}>
                                ${f.precio.toLocaleString()}
                            </span>
                            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                {f.apertura} - {f.cierre}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#a0aec0' }}>
                    No hay canchas configuradas. ¡Crea la primera arriba!
                </div>
            )}
        </div>
    );
}
