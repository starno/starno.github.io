import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This allows the app to continue using process.env.API_KEY
      // By mapping it to the VITE_API_KEY environment variable provided during build
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || process.env.API_KEY),
    },
    base: './', // Ensures assets load correctly on GitHub Pages
    build: {
      outDir: 'dist',
    }
  };
});