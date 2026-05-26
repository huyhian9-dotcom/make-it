import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'dist/**'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@makeit/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
