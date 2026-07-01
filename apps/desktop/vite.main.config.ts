import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    ssr: true,
    target: 'node20',
    outDir: 'dist/main',
    lib: {
      entry: resolve(__dirname, 'src/main/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron', 'fs', 'path', 'crypto'],
    },
    minify: false,
    emptyOutDir: true,
  },
});
