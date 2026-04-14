import React from "react";
import { getPlugins } from "../../../core/plugins/pluginRegistry";

/**
 * Plugin Manager provides a UI to visualize all installed plugins in the system.
 */
export default function PluginManager() {
    const plugins = getPlugins();

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Plugins Instalados</h2>
            <p style={{ color: '#7f8c8d', marginBottom: 30 }}>
                Listado de extensiones y plugins activos en la plataforma.
            </p>

            <div style={{ display: 'grid', gap: '20px', marginTop: 20 }}>
                {plugins.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#95a5a6' }}>No hay plugins instalados.</p>
                ) : (
                    plugins.map(p => (
                        <div key={p.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#2d3748' }}>{p.name}</h4>
                                <code style={{ fontSize: '0.85rem', color: '#718096' }}>ID: {p.id}</code>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    backgroundColor: '#ebf8ff',
                                    color: '#3182ce',
                                    fontWeight: 'bold'
                                }}>
                                    Activo
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div style={{ 
                marginTop: 50, 
                padding: '20px', 
                backgroundColor: '#fffaf0', 
                border: '1px solid #feebc8', 
                borderRadius: '8px' 
            }}>
                <h4 style={{ margin: 0, color: '#c05621' }}>Marketplace (Próximamente)</h4>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#7b341e' }}>
                    En la Fase 8 podrás instalar plugins desde un repositorio central con un solo clic.
                </p>
            </div>
        </div>
    );
}
