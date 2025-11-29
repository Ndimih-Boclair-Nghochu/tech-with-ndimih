import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // bind explicitly to IPv4 0.0.0.0 to avoid IPv6-only binding on some Windows setups
    host: '0.0.0.0',
    port: 3000
  }
})
