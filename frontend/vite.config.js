import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  build: {
    // maplibre-gl is ~1 MB minified; it is lazy-loaded only on pages that render a map.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    // In dev, /api is proxied to your backend so the frontend never hardcodes hosts.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
