import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Enable cache-friendly asset hashing
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Hash all assets for long-term caching
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          // Manual chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'query-vendor': ['@tanstack/react-query'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['lucide-react', 'motion'],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging
      sourcemap: false,
      // Minify output
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
