import { defineProject } from 'vitest/config';

export default [
  {
    test: {
      name: 'eyes-project-front',
      globals: true,
      environment: 'jsdom',
      coverage: {
        provider: 'istanbul',
        enabled: true,
        reporter: ['lcov', 'clover', 'text-summary'],
        reportsDirectory: './coverage/eyes-project-front',
        include: ['src/app/**/*.ts'],
      },
    },
  },
];
