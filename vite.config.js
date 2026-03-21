import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Apify API calls to bypass CORS in development
      '/apify-proxy': {
        target: 'https://api.apify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apify-proxy/, ''),
        secure: true,
      },
      // Proxy Gemini API calls to bypass CORS
      '/gemini-proxy': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gemini-proxy/, ''),
        secure: true,
      },
    },
  },
})
