import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  {
    test: {
      name: 'apps/desktop',
      root: './apps/desktop',
      environment: 'jsdom',
      setupFiles: ['./src/renderer/test/setup.ts'],
    },
  },
]);
