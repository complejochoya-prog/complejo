import React, { useState } from "react";
import { exportBackup, importBackup } from "../../../core/database/backupManager";

/**
 * BackupPanel provides a UI for system administrators to manage data backups.
 */
export default function BackupPanel() {
    const [importing, setImporting] = useState(false);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (window.confirm("¿Estás seguro de que deseas restaurar este backup? Se sobrescribirán todos los datos actuales y la aplicación se reiniciará.")) {
                setImporting(true);
                importBackup(file);
            }
        }
    };

    return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: '#2d3748', marginBottom: '10px' }}>Seguridad y Backups</h1>
                <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>
                    Protege tu información. Exporta tus datos a un archivo local o restaura una copia de seguridad anterior.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                {/* Export Card */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '30px', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>📤</div>
                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Exportar Datos</h3>
                    <p style={{ color: '#718096', lineHeight: '1.6', marginBottom: '25px' }}>
                        Descarga una copia completa de la configuración del sistema, incluyendo negocios instalados, 
                        configuración de módulos y preferencias. El archivo se guardará en formato JSON.
                    </p>
                    <button 
                        onClick={exportBackup}
                        style={{
                            backgroundColor: '#3182ce',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        Generar Backup
                    </button>
                </div>

                {/* Import Card */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '30px', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>📥</div>
                    <h3 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Restaurar Backup</h3>
                    <p style={{ color: '#718096', lineHeight: '1.6', marginBottom: '25px' }}>
                        Sube un archivo de backup previamente exportado para restaurar el estado del sistema. 
                        <strong>Atención:</strong> Esta acción borrará los datos actuales.
                    </p>
                    
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            id="backup-input"
                            accept="application/json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                            disabled={importing}
                        />
                        <label 
                            htmlFor="backup-input"
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#edf2f7',
                                color: '#4a5568',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: importing ? 'not-allowed' : 'pointer',
                                border: '1px solid #cbd5e0',
                                fontSize: '1rem'
                            }}
                        >
                            {importing ? "Restaurando..." : "Seleccionar Archivo"}
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ 
                marginTop: 50, 
                padding: '20px', 
                backgroundColor: '#fff5f5', 
                border: '1px solid #fed7d7', 
                borderRadius: '8px',
                color: '#c53030'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Nota Importante:</strong> Los backups contienen información sensible de configuración. 
                    Asegúrate de guardarlos en un lugar seguro.
                </p>
            </div>
        </div>
    );
}
