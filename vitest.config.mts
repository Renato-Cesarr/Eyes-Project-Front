import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul', // Mudando para istanbul para maior estabilidade no reporte físico
      reporter: ['lcovonly', 'text', 'text-summary'],
      reportsDirectory: './coverage',
      all: true,
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
