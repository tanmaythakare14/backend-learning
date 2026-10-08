import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  // Serve the feedback plugin as published instead of re-bundling it into the Vite cache: it loads
  // its screenshot library lazily, and the cache's hashed chunk names go stale when the cache is
  // rebuilt under a running dev server ("Failed to fetch dynamically imported module").
  optimizeDeps: {
    exclude: ['@mindbowser_inc/ui-feedback-plugin'],
  },
  plugins: [react(), nxViteTsPaths()],
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
});
