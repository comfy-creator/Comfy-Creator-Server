import * as fs from 'node:fs';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { glob } from 'glob';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Disable code splitting
      output: {
        manualChunks: undefined,
        // Name of bundle file
        entryFileNames: 'bundle.js',
      },
    },
    minify: true,
    emptyOutDir: true
  },
});
