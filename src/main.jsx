import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css' 
import { registerSW } from 'virtual:pwa-register'
import { initStorageSync } from './core/services/storageSync.js'

registerSW({
  immediate: true
})

// Iniciar sincronización de datos entre navegadores
initStorageSync();

// MOCK SEEDING FOR DEV
if (localStorage.getItem('complejo_empleados') === null) {
  localStorage.setItem('complejo_empleados', JSON.stringify([
    { id: 'm1', nombre: 'Mozo de Prueba', usuario: 'mozo', password: '123', rol: 'mozo', estado: 'activo' }
  ]));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)