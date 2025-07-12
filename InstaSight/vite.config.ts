import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '192.168.0.110',
    port: 4200,
    allowedHosts: true,
  },
});
