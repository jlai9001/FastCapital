import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'fastcapital-client.onrender.com'
    ]
  },
  preview: {
    allowedHosts: [
      'fastcapital-client.onrender.com'
    ]
  }
})
