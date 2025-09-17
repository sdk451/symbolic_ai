import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  server: {
    port: 3000,
    host: true, // Allow external connections
    open: true, // Auto-open browser
    cors: true, // Enable CORS for API calls
    proxy: {
      // Proxy API calls to Netlify Functions during development
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  define: {
    // Define global constants for development
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
})