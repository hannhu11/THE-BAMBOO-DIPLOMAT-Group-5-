import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3082,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:8088',
      '/socket.io': {
        target: 'http://127.0.0.1:8088',
        ws: true,
      },
    },
  },
});
