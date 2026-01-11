import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],

    // 👇 Silence large-chunk warning (in kB)
  build: {
    chunkSizeWarningLimit: 1000, // default is 500
  },

  // Local dev only (safe to keep)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // REQUIRED for Render (this fixes your error)
  preview: {
    allowedHosts: [
      'fastcapital-client.onrender.com',
    ],
  },
})
