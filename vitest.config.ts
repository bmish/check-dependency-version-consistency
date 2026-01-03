// eslint-disable-next-line import/extensions -- vitest doesn't export .js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*-test.ts'],
    coverage: {
      include: ['lib/**/*.ts'],
      exclude: ['lib/index.ts', 'lib/cli.ts'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
