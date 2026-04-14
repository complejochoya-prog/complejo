import React, { useState } from "react";
import { pluginStore } from "../../../core/marketplace/pluginStore";
import { installPlugin, uninstallPlugin } from "../../../core/marketplace/pluginInstaller";

/**
 * Marketplace component allows users to discover, install, and manage plugins.
 */
export default function Marketplace() {
    const [plugins, setPlugins] = useState([...pluginStore]);

    const togglePlugin = (plugin) => {
        if (plugin.installed) {
            uninstallPlugin(plugin.id);
        } else {
            installPlugin(plugin.id);
        }
        // Force re-render to reflect changes in the simulated store
        setPlugins([...pluginStore]);
    };

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: '#1a202c', marginBottom: '10px' }}>Marketplace de Plugins</h1>
                <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>
                    Extiende las capacidades de tu ERP instalando nuevos módulos y funcionalidades.
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '25px' 
            }}>
                {plugins.map(plugin => (
                    <div
                        key={plugin.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '25px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: plugin.installed ? '2px solid #3182ce' : '1px solid #e2e8f0',
                            transition: 'transform 0.2s ease',
                            cursor: 'default'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{plugin.icon}</div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>{plugin.name}</h3>
                            <p style={{ color: '#718096', lineHeight: '1.5', marginBottom: '15px', fontSize: '0.95rem' }}>
                                {plugin.description}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>v{plugin.version}</span>
                                {plugin.installed && (
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        backgroundColor: '#ebf8ff', 
                                        color: '#3182ce', 
                                        padding: '2px 8px', 
                                        borderRadius: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        INSTALADO
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => togglePlugin(plugin)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: plugin.installed ? '#fed7d7' : '#3182ce',
                                color: plugin.installed ? '#c53030' : 'white'
                            }}
                        >
                            {plugin.installed ? "Desinstalar" : "Instalar Plugin"}
                        </button>
                    </div>
                ))}
            </div>
            
            <div style={{ 
                marginTop: 60, 
                padding: '25px', 
                backgroundColor: '#edf2f7', 
                borderRadius: '10px',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, color: '#4a5568' }}>
                    ¿Necesitas una funcionalidad personalizada? <strong>Contáctanos para desarrollar tu propio plugin.</strong>
                </p>
            </div>
        </div>
    );
}
