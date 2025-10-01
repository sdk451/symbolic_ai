import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts', './src/__tests__/vitest-setup.ts'],
    silent: true,
    onConsoleLog(log, type) {
      if (type === 'stderr' && log.includes('Warning:')) {
        return false; // Suppress React warnings
      }
      if (log.includes('App component rendering') || 
          log.includes('Form data being sent') ||
          log.includes('Demo started:')) {
        return false; // Suppress debug logs
      }
      return true;
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
