import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['lcovonly', 'clover', 'text-summary'],
      reportsDirectory: './coverage',
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/**/*.spec.ts',
        'src/app/**/*.model.ts',
        'src/main.ts',
        'src/app/app.config.ts',
        'src/environments/**'
      ]
    },
  },
});
