import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// sitemap.xml is served dynamically by the backend (see
// cloudcompanyserver/controllers/seo.controller.js) so it can include
// package/portfolio IDs. A static build-time sitemap here would land in
// dist/ and shadow that dynamic route in production (per .htaccess's
// "serve existing file before falling back to index.html" rule) — so this
// project intentionally does NOT generate its own sitemap.xml.

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          helmet: ['react-helmet-async'],
        },
      },
    },
  },
})
