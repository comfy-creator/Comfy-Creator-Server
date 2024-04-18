import * as fs from 'node:fs';
import { extname, relative, resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { glob } from 'glob';

const { dependencies, peerDependencies } = JSON.parse(fs.readFileSync(`./package.json`, 'utf8'));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2017',
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    },
    emptyOutDir: true,
    // sourcemap: true,
    minify: true,
    rollupOptions: {
      external: [
        // ...Object.keys(dependencies || {}),
        ...Object.keys(peerDependencies || {})
      ],
      input: Object.fromEntries(
        glob.sync('src/**/*.{ts,tsx}').map((file) => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          relative('src', file.slice(0, file.length - extname(file).length)),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        // Filenames outputted to dist
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js'
      }
    }
  },
  plugins: [react(), libInjectCss(), dts({ include: ['lib/**/*.tsx', 'lib/**/*.ts'] })]
});
