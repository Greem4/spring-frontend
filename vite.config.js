import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: process.env.NODE_ENV === 'development',
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const lib = id.split('node_modules/')[1].split('/')[0];
            return lib === 'react' ? 'vendor-react' : `vendor-${lib}`;
          }
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  optimizeDeps: {
    include: [
      '@mui/x-date-pickers',
      '@mui/x-date-pickers/AdapterDateFns',
      'react',
      'react-dom'
    ],
    force: true
  }
});