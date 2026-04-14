import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import sharedStoragePlugin from './vite-shared-storage.js'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    sharedStoragePlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Complejo Giovanni",
        short_name: "Giovanni",
        description: "Sistema de reservas y bar para complejos deportivos",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services")
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false
      }
    },
    allowedHosts: true,
    watch: {
      ignored: ['**/.shared-storage.json']
    }
  }
})