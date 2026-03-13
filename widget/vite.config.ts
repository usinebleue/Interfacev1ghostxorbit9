import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist-widget',
    lib: {
      entry: 'src/widget-main.tsx',
      name: 'CarlosProspect',
      formats: ['iife'],
      fileName: () => 'carlos-prospect.js',
    },
    rollupOptions: {
      // Bundle everything — no external deps for the widget
    },
    cssCodeSplit: false,
    minify: 'terser',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
