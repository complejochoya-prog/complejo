import { db } from '../src/firebase/config.js';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

async function seedInitialBusiness() {
    const negocioId = 'complejo-giovanni';
    const negocioData = {
        nombre: 'Complejo Giovanni',
        logo: '',
        color_primario: '#3b82f6', // Example blue
        color_secundario: '#1e40af',
        direccion: 'Choya, Santiago del Estero',
        telefono: '3855374835',
        whatsapp: '3855374835',
        email: 'info@complejogiovanni.com',
        fecha_creacion: Timestamp.now(),
        estado: 'activo'
    };

    try {
        await setDoc(doc(db, 'negocios', negocioId), negocioData);
        console.log(`✅ Initial business '${negocioId}' created successfully.`);

        // Also create initial configuration for this business
        const configData = {
            horario_apertura: '09:00',
            horario_cierre: '02:00',
            moneda: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires',
            modo_reserva: 'confirmacion_automatica'
        };
        await setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'general'), configData);
        console.log(`✅ Default configuration for '${negocioId}' created.`);

    } catch (error) {
        console.error("Error seeding business:", error);
    }
}

seedInitialBusiness();
