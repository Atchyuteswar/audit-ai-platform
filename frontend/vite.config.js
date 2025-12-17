import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React DOM into a separate chunk
          'react-vendor': ['react', 'react-dom'],
          // Split React Router into its own chunk
          'router-vendor': ['react-router-dom'],
          // Split Recharts (charting library) into its own chunk
          'charts-vendor': ['recharts'],
          // Split Framer Motion (animation library) into its own chunk
          'animation-vendor': ['framer-motion'],
          // Split Supabase into its own chunk
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit to 1000 kB
    chunkSizeWarningLimit: 1000,
  },
})
