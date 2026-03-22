import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

const SITE_URL = 'https://cloudcompany.cc'

const staticRoutes = [
  '/',
  '/aboutus',
  '/ourteam',
  '/portfolio',
  '/career',
  '/signin',
  '/clientsignin',
  '/clientsignup',
  '/buypackage',
]

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: SITE_URL,
      dynamicRoutes: staticRoutes,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
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