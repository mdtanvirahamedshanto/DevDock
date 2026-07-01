import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    ssr: true,
    target: 'node20',
    outDir: 'dist/preload',
    lib: {
      entry: resolve(__dirname, 'src/preload/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron'],
    },
    minify: false,
    emptyOutDir: true,
  },
});
