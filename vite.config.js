import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SEO files (per-page HTML with meta + JSON-LD, sitemap.xml, llms.txt) are generated
// into dist/ after the build by scripts/seo-build.mjs (npm "postbuild").

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
