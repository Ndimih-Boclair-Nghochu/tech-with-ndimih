import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/", // IMPORTANT for S3 root deployment
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      // Proxy /api calls to the Django backend during development to avoid CORS
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Proxy /media calls to Django backend for media files (PDFs, images, etc.)
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
