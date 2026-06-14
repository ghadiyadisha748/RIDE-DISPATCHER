import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/'))
            return 'vendor';
          if (id.includes('leaflet'))
            return 'maps';
          if (id.includes('recharts'))
            return 'charts';
          if (id.includes('axios') || id.includes('socket.io-client') || id.includes('date-fns'))
            return 'utils';
        },
      },
    },
  },
});
