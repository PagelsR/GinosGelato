import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0a6d536a035e.ngrok-free.app'
    ],
  },
  build: {
    outDir: 'dist',
  },
});