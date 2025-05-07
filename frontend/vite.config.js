import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Externe modules die problemen veroorzaken kunnen hier worden toegevoegd
      external: [],
      onwarn(warning, warn) {
        // Negeer bepaalde waarschuwingen tijdens de build
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            warning.code === 'CIRCULAR_DEPENDENCY' ||
            warning.message.includes('This is most likely unintended')) {
          return;
        }
        warn(warning);
      },
    },
    // Zorg ervoor dat de build niet faalt bij waarschuwingen
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
